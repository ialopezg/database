import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../builders/metadata';
import { ColumnType } from '../../builders/options';
import { QueryResult } from '../../query';
import { MySQLDriver } from '../mysql.driver';
import {
  ChangedColumn,
  ColumnIntrospection,
  ForeignKeyIntrospection,
  IndexIntrospection,
  TableColumn,
  UniqueConstraintIntrospection,
} from '../schema/introspection';
import { BaseSchemaBuilder } from './base-schema.builder';
import { QueryBuilder } from './query.builder';

/**
 * MySQL-specific schema builder.
 * Implements schema detection and change detection logic for MySQL.
 */
export class MySQLSchemaBuilder extends BaseSchemaBuilder {
  /** @inheritdoc */
  constructor(protected readonly driver: MySQLDriver) {
    super(driver);
  }

  /**
   * Creates a new table with the specified columns.
   *
   * @param table - The table metadata, including the table name.
   * @param columns - An array of column metadata to define the table structure.
   * @throws Error if any column has an invalid length, the column array is empty, or the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async createTable(table: TableMetadata, columns: ColumnMetadata[]): Promise<void> {
    this.ensureValidColumns(columns, table.name);

    const columnDefs = columns.map((column) => this.createColumnDefinition(column));
    const constraintDefs: string[] = [];

    // 🔐 PRIMARY KEY
    const primaryColumns = columns.filter((col) => col.isPrimary);
    if (primaryColumns.length) {
      const keys = primaryColumns.map((col) => this.escapeIdentifier(col.name)).join(', ');
      constraintDefs.push(`PRIMARY KEY (${keys})`);
    }

    // 🔑 UNIQUE CONSTRAINTS
    const uniqueColumns = columns.filter((col) => col.isUnique);
    for (const col of uniqueColumns) {
      constraintDefs.push(`UNIQUE (${this.escapeIdentifier(col.name)})`);
    }

    const lines = [...columnDefs, ...constraintDefs];
    const sql = `CREATE TABLE ${this.escapeIdentifier(table.name)} (${lines.join(', ')}) ENGINE=InnoDB;`;

    await this.query(sql);
  }

  /**
   * Drops a table from the database.
   * Uses `IF EXISTS` when supported by the MySQL version (>= 5.7.0).
   *
   * @param tableName - The name of the table to drop.
   * @returns True if the table was dropped, false otherwise.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async dropTable(tableName: string): Promise<boolean> {
    this.validateName(tableName, 'table name');

    const versionResult = await this.query<{ version: string }>('SELECT VERSION() AS version');
    const mysqlVersion = versionResult.rows[0].version;
    const supportsIfExists = this.checkMySQLVersion(mysqlVersion, '5.7.0');

    const queryStr = supportsIfExists
      ? `DROP TABLE IF EXISTS ${this.escapeIdentifier(tableName)}`
      : `DROP TABLE ${this.escapeIdentifier(tableName)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query<{ affectedRows: number }>(queryStr);

      return (result.rows as any).affectedRows > 0;
    }, `Failed to drop table '${tableName}'`);
  }

  /**
   * Adds a new column to an existing table.
   *
   * @param tableName - The name of the table to modify.
   * @param column - Metadata describing the column to add.
   * @returns True if the query executed successfully.
   * @throws Error if the query fails or the table name or column name is invalid.
   */
  async addColumn(tableName: string, column: ColumnMetadata): Promise<boolean> {
    this.validateName(tableName, 'table name');
    this.validateName(column.name, 'column name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)}
        ADD ${this.createColumnDefinition(column, false)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query(queryStr);
      return !!result;
    }, `Failed to add column to ${tableName}`);
  }

  /**
   * Drops a column from a table, using IF EXISTS is supported by the MySQL version.
   *
   * @param tableName - The table to alter.
   * @param columnName - The column to drop.
   * @returns True if the column was dropped, false otherwise.
   */
  async dropColumn(tableName: string, columnName: string): Promise<boolean> {
    this.validateName(tableName, 'table name');
    this.validateName(columnName, 'column name');

    const versionResult = await this.query<{ version: string }>('SELECT VERSION() AS version');
    const mysqlVersion = versionResult.rows[0].version;
    const supportsIfExists = this.checkMySQLVersion(mysqlVersion, '5.7.0');

    const queryStr = supportsIfExists
      ? `ALTER TABLE ${this.escapeIdentifier(tableName)}
                DROP COLUMN IF EXISTS ${this.escapeIdentifier(columnName)}`
      : `ALTER TABLE ${this.escapeIdentifier(tableName)}
                DROP COLUMN ${this.escapeIdentifier(columnName)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query<{ affectedRows: number }>(queryStr);
      return (result.rows as any).affectedRows > 0;
    }, `Failed to drop column '${columnName}' from '${tableName}'`);
  }

  /**
   * Renames a column and optionally redefines its type and constraints.
   *
   * @param tableName - The name of the table containing the column.
   * @param columnName - The current name of the column.
   * @param newColumn - Metadata for the new column definition.
   * @param skipPrimary - If true, avoids setting primary key in the definition.
   * @throws Error if the table or column name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async renameColumn(
    tableName: string,
    columnName: string,
    newColumn: ColumnMetadata,
    skipPrimary: boolean = false
  ): Promise<void> {
    this.validateName(tableName, 'table name');
    this.validateName(columnName, 'column name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)} CHANGE ${this.escapeIdentifier(columnName)} ${this.createColumnDefinition(newColumn, skipPrimary)}`;

    await this.wrapQuery(
      () => this.query(queryStr),
      `Failed to rename column '${columnName}' in '${tableName}'`
    );
  }

  /**
   * Compares the current table definition in the database against
   * a provided list of column metadata, returning a list of changed columns.
   *
   * @param tableName - The name of the table to compare.
   * @param columns - The expected column definitions (usually from entity metadata).
   * @returns A list of column names and primary key flags that differ from the current schema.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getChangedColumns(tableName: string, columns: ColumnMetadata[]): Promise<ChangedColumn[]> {
    this.validateName(tableName, 'table name');

    const queryStr: string = this.buildQuery(
      this.driver.database,
      ['COLUMN_NAME', 'COLUMN_TYPE', 'COLUMN_COMMENT', 'IS_NULLABLE', 'EXTRA', 'COLUMN_KEY'],
      'INFORMATION_SCHEMA.COLUMNS',
      [`TABLE_NAME = ${this.escapeLiteral(tableName)}`]
    );

    const result = await this.wrapQuery(
      async () => {
        return await this.query<TableColumn>(queryStr);
      },
      `Failed to get changed columns from ${this.escapeIdentifier(tableName)}`
    );

    const dbColumnMap: Map<string, any> = new Map(result.rows.map((c) => [c.COLUMN_NAME, c]));

    return columns
      .filter((column) => {
        const dbData = dbColumnMap.get(column.name);
        return dbData ? this.isColumnChanged(dbData, column) : false;
      })
      .map((column) => {
        const dbData = dbColumnMap.get(column.name);
        return {
          columnName: column.name,
          hasPrimaryKey: this.isPrimaryKeyColumn(dbData),
        };
      });
  }

  /**
   * Alters a column's properties, such as its type, nullability, and constraints.
   *
   * @param tableName - The name of the table containing the column.
   * @param columnName - The current name of the column.
   * @param newColumn - The new column metadata with updated properties.
   * @param skipPrimary - If true, avoids setting primary key in the definition.
   * @throws Error if the table or column name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async alterColumn(
    tableName: string,
    columnName: string,
    newColumn: ColumnMetadata,
    skipPrimary: boolean = false
  ): Promise<void> {
    this.validateName(tableName, 'table name');
    this.validateName(columnName, 'column name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)} CHANGE ${this.escapeIdentifier(columnName)} ${this.createColumnDefinition(newColumn, skipPrimary)}`;

    await this.wrapQuery(async () => {
      return this.query(queryStr);
    }, `Failed to alter column '${columnName}' in '${tableName}'`);
  }

  /**
   * Creates an index on the specified table and columns.
   *
   * @param tableName - The name of the table to add the index to.
   * @param indexName - Name for the index.
   * If not provided, a name will be auto-generated.
   * @param columns - The column(s) to include in the index.
   * @param indexType - Optional index type (e.g., UNIQUE, FULLTEXT, SPATIAL).
   * @throws Error if table or column names are invalid or empty.
   * @throws DatabaseQueryError if the query fails.
   */
  async createIndex(
    tableName: string,
    indexName: string,
    columns: string[],
    indexType?: 'UNIQUE' | 'FULLTEXT' | 'SPATIAL'
  ): Promise<void> {
    this.validateName(tableName, 'table name');
    if (!columns.length) throw new Error('At least one column must be specified for indexing');
    columns.forEach((col) => this.validateName(col, 'column name'));

    const escapedColumns = columns.map((col) => this.escapeIdentifier(col)).join(', ');
    const name = indexName ?? `idx_${columns.join('_')}`;
    const escapedName = this.escapeIdentifier(name);
    const typeClause = indexType ? `${indexType} ` : '';

    const queryStr = `CREATE ${typeClause}INDEX ${escapedName} ON ${this.escapeIdentifier(tableName)} (${escapedColumns})`;

    await this.wrapQuery(
      () => this.query(queryStr),
      `Failed to create index '${name}' on table '${tableName}'`
    );
  }

  /**
   * Drops an index from the specified table.
   *
   * @param tableName - The name of the table.
   * @param indexName - The name of the index to drop.
   * @returns True if the index was dropped, false otherwise.
   * @throws Error if table or index names are invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async dropIndex(tableName: string, indexName: string): Promise<boolean> {
    this.validateName(tableName, 'table name');
    this.validateName(indexName, 'index name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)}
        DROP INDEX ${this.escapeIdentifier(indexName)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query<{ affectedRows: number }>(queryStr);

      return (result.rows as any)?.affectedRows > 0;
    }, `Failed to drop index '${indexName}' from table '${tableName}'`);
  }

  /**
   * Adds a unique constraint to a column in the specified table.
   *
   * @param tableName - The name of the table to alter.
   * @param columnName - The name of the column to apply the unique constraint to.
   * @param keyName - The name of the unique key constraint.
   * @throws Error if any of the names are invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async addUniqueKey(tableName: string, columnName: string, keyName: string): Promise<void> {
    this.validateName(tableName, 'table name');
    this.validateName(columnName, 'column name');
    this.validateName(keyName, 'key name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)}
        ADD CONSTRAINT ${this.escapeIdentifier(keyName)} UNIQUE (${this.escapeIdentifier(columnName)})`;

    await this.wrapQuery(
      () => this.query(queryStr),
      `Failed to add unique key ${keyName} on column ${columnName}`
    );
  }

  /**
   * Drops a unique key (index) from the specified table.
   *
   * @param tableName - The name of the table.
   * @param constraintName - The name of the unique key (index) to drop.
   * @returns A promise that resolves to true if dropped successfully.
   * @throws Error if table or constraint name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async dropUniqueKey(tableName: string, constraintName: string): Promise<boolean> {
    this.validateName(tableName, 'table name');
    this.validateName(constraintName, 'unique key name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)}
        DROP INDEX ${this.escapeIdentifier(constraintName)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query(queryStr);

      return !!result;
    }, `Failed to drop unique key '${constraintName}' from table '${tableName}'`);
  }

  /**
   * Adds a foreign key constraint to a table.
   *
   * @param foreignKey - Metadata describing the foreign key.
   * @returns True if the foreign key was added successfully.
   * @throws Error if validation fails or the query execution fails.
   */
  async addForeignKey(foreignKey: ForeignKeyMetadata): Promise<boolean> {
    if (!foreignKey.table || !foreignKey.relatedTable) {
      throw new Error('Invalid foreign key metadata.');
    }

    if (foreignKey.columnNames.length === 0 || foreignKey.relatedColumnNames.length === 0) {
      throw new Error('Foreign key must have at least one column.');
    }

    if (foreignKey.columnNames.length !== foreignKey.relatedColumnNames.length) {
      throw new Error('Number of columns must match number of related columns');
    }

    this.validateName(foreignKey.table.name, 'table name');
    this.validateName(foreignKey.relatedTable.name, 'related table name');
    this.validateName(foreignKey.name, 'foreign key name');
    foreignKey.columnNames.forEach((col) => this.validateName(col, 'column name'));
    foreignKey.relatedColumnNames.forEach((col) => this.validateName(col, 'related column name'));

    const columnList = foreignKey.columnNames.map((col) => this.escapeIdentifier(col)).join(', ');
    const relatedColumnList = foreignKey.relatedColumnNames
      .map((col) => this.escapeIdentifier(col))
      .join(', ');

    const queryStr =
      `ALTER TABLE ${this.escapeIdentifier(foreignKey.table.name)} ` +
      `ADD CONSTRAINT ${this.escapeIdentifier(foreignKey.name)} ` +
      `FOREIGN KEY (${columnList}) ` +
      `REFERENCES ${this.escapeIdentifier(foreignKey.relatedTable.name)} (${relatedColumnList})`;

    return await this.wrapQuery(async () => {
      const result = await this.query(queryStr);
      return !!result;
    }, `Failed to add foreign key ${foreignKey.name} from ${foreignKey.table.name} to ${foreignKey.relatedTable.name}`);
  }

  /**
   * Drops a foreign key constraint from the specified table.
   *
   * @param tableName - The name of the table.
   * @param foreignKeyName - The name of the foreign key to drop.
   * @returns True if the foreign key was dropped, false otherwise.
   * @throws Error if the names are invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async dropForeignKey(tableName: string, foreignKeyName: string): Promise<boolean> {
    this.validateName(tableName, 'table name');
    this.validateName(foreignKeyName, 'foreign key name');

    const queryStr = `ALTER TABLE ${this.escapeIdentifier(tableName)}
        DROP FOREIGN KEY ${this.escapeIdentifier(foreignKeyName)}`;

    return this.wrapQuery(async () => {
      const result = await this.query<{ affectedRows: number }>(queryStr);

      return (result.rows as any).affectedRows > 0;
    }, `Failed to drop foreign key '${foreignKeyName}' from table '${tableName}'`);
  }

  /**
   * Checks whether a table exists in the current database.
   *
   * @param tableName - The name of the table to check.
   * @returns True if the table exists, false otherwise.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async hasTable(tableName: string): Promise<boolean> {
    this.validateName(tableName, 'table name');

    const queryStr = `SHOW TABLES LIKE '${tableName}'`;

    return await this.wrapQuery(async () => {
      const result = await this.query<QueryResult<any[]>>(queryStr);

      return result.rows.length > 0;
    }, `Failed to check if table exists: ${tableName}`);
  }

  /**
   * Returns column metadata for the given table.
   *
   * @param tableName - The name of the table.
   * @returns An array of column metadata for the specified table.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getTableColumns(tableName: string): Promise<ColumnIntrospection[]> {
    this.validateName(tableName, 'table name');

    const queryStr = `SHOW COLUMNS FROM ${this.escapeIdentifier(tableName)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query(queryStr);

      return result.rows.map(
        (row: any) =>
          ({
            name: row.Field,
            type: row.Type,
            nullable: row.Null === 'YES',
            default: row.Default ?? null,
            isPrimary: row.Key === 'PRI',
            isUnique: row.Key === 'UNI',
            isAutoIncrement: row.Extra?.includes('auto_increment') ?? false,
          }) satisfies ColumnIntrospection
      );
    }, `Failed to retrieve columns for table '${tableName}'`);
  }

  /**
   * Retrieves all foreign key constraints for a given table.
   *
   * @param tableName - The name of the table to inspect.
   * @returns An array of foreign key definitions.
   * @throws Error if table name is invalid.
   * @throws DatabaseQueryError if query fails.
   */
  async getForeignKeys(tableName: string): Promise<ForeignKeyIntrospection[]> {
    this.validateName(tableName, 'table name');

    const queryStr = this.buildQuery(
      this.driver.database,
      ['CONSTRAINT_NAME', 'COLUMN_NAME', 'REFERENCED_TABLE_NAME', 'REFERENCED_COLUMN_NAME'],
      'INFORMATION_SCHEMA.KEY_COLUMN_USAGE',
      [`TABLE_NAME = '${tableName}'`, 'REFERENCED_TABLE_NAME IS NOT NULL']
    );

    type ForeignConstraintRow = {
      CONSTRAINT_NAME: string;
      COLUMN_NAME: string;
      REFERENCED_TABLE_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    };

    return await this.wrapQuery(async () => {
      const result = await this.query<ForeignConstraintRow>(queryStr);

      return result.rows.map((row: any) => ({
        constraintName: row.CONSTRAINT_NAME,
        columnName: row.COLUMN_NAME,
        referencedTable: row.REFERENCED_TABLE_NAME,
        referencedColumn: row.REFERENCED_COLUMN_NAME,
      }));
    }, `Failed to retrieve foreign keys for table '${tableName}'`);
  }

  /**
   * Retrieves all index definitions for a given table.
   *
   * @param tableName - The name of the table to inspect.
   * @returns An array of index metadata objects.
   * @throws Error if table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getTableIndexes(tableName: string): Promise<IndexIntrospection[]> {
    this.validateName(tableName, 'table name');

    const queryStr = `SHOW INDEX FROM ${this.escapeIdentifier(tableName)}`;

    return await this.wrapQuery(async () => {
      const result = await this.query(queryStr);

      return result.rows.map((row: any) => ({
        name: row.Key_name,
        column: row.Column_name,
        isUnique: row.Non_unique === 0,
        type: row.Index_type,
      }));
    }, `Failed to retrieve indexes for table '${tableName}'`);
  }

  /**
   * Retrieves all unique constraints defined on a given table.
   *
   * @param tableName - The name of the table to inspect.
   * @returns An array of unique constraint definitions.
   * @throws Error if table name is invalid.
   * @throws DatabaseQueryError if query fails.
   */
  async getUniqueConstraints(tableName: string): Promise<UniqueConstraintIntrospection[]> {
    this.validateName(tableName, 'table name');

    const schema = this.driver.database;
    const queryStr = this.buildQuery(
      schema,
      ['tc.CONSTRAINT_NAME', 'kcu.COLUMN_NAME'],
      `information_schema.TABLE_CONSTRAINTS tc
      JOIN information_schema.KEY_COLUMN_USAGE kcu
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
       AND tc.TABLE_NAME = kcu.TABLE_NAME
       AND tc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
    `,
      [
        `tc.CONSTRAINT_TYPE = 'UNIQUE'`,
        `tc.TABLE_NAME = '${tableName}'`,
        `tc.CONSTRAINT_SCHEMA = '${schema}'`,
      ]
    );

    type UniqueConstraintRow = { CONSTRAINT_NAME: string; COLUMN_NAME: string };

    return await this.wrapQuery(async () => {
      const result = await this.query<UniqueConstraintRow>(queryStr);

      return result.rows.map((row) => ({
        constraintName: row.CONSTRAINT_NAME,
        columnName: row.COLUMN_NAME,
      }));
    }, `Failed to retrieve unique constraints for table '${tableName}'`);
  }

  /**
   * Retrieves the names of all unique constraints defined on the given table.
   *
   * @param tableName - The name of the table.
   * @returns An array of unique constraint names.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getUniqueConstraintNames(tableName: string): Promise<string[]> {
    this.validateName(tableName, 'table name');

    const schema = this.driver.database;
    const queryStr = this.buildQuery(
      schema,
      ['CONSTRAINT_NAME'],
      'information_schema.TABLE_CONSTRAINTS',
      [`CONSTRAINT_TYPE = 'UNIQUE'`, `TABLE_NAME = '${tableName}'`, `TABLE_SCHEMA = '${schema}'`]
    );

    return await this.wrapQuery(async () => {
      const result = await this.query<{ CONSTRAINT_NAME: string }>(queryStr);
      return result.rows.map((row) => row.CONSTRAINT_NAME);
    }, `Failed to retrieve unique constraint names for table '${tableName}'`);
  }

  /**
   * Retrieves the list of all table names in the current database.
   *
   * @returns An array of table names as strings.
   * @throws DatabaseQueryError if the query fails.
   */
  async getTables(): Promise<string[]> {
    const schema = this.driver.database;

    const queryStr = this.buildQuery(schema, ['TABLE_NAME'], 'INFORMATION_SCHEMA.TABLES', [
      `TABLE_TYPE = 'BASE TABLE'`,
    ]);

    return await this.wrapQuery(async () => {
      const result = await this.query<{ TABLE_NAME: string }>(queryStr);

      return result.rows.map((row) => row.TABLE_NAME);
    }, `Failed to retrieve table list from schema '${schema}'`);
  }

  /**
   * Retrieves the CREATE TABLE statement for a given table.
   *
   * @param tableName - The name of the table.
   * @returns The SQL string used to create the table.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getTableDefinition(tableName: string): Promise<string> {
    this.validateName(tableName, 'table name');

    return await this.wrapQuery(async () => {
      const result = await this.query<{ 'Create Table': string }>(
        `SHOW CREATE TABLE ${this.escapeIdentifier(tableName)}`
      );

      return result.rows[0]['Create Table'];
    }, `Failed to get CREATE TABLE definition for '${tableName}'`);
  }

  /**
   * Retrieves metadata for a specific column from the given table.
   *
   * @param tableName - The name of the table.
   * @param columnName - The name of the column.
   * @returns A promise that resolves to column metadata, or undefined if not found.
   * @throws Error if the table or column name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getColumnDefinition(
    tableName: string,
    columnName: string
  ): Promise<TableColumn | undefined> {
    this.validateName(tableName, 'table name');
    this.validateName(columnName, 'column name');

    const queryStr = this.buildQuery(this.driver.database, ['*'], 'INFORMATION_SCHEMA.COLUMNS', [
      `TABLE_NAME = ${this.escapeLiteral(tableName)}`,
      `COLUMN_NAME = ${this.escapeLiteral(columnName)}`,
    ]);

    return await this.wrapQuery(async () => {
      const result = await this.query<TableColumn>(queryStr);
      return result.rows[0];
    }, `Failed to retrieve definition for column '${columnName}' in table '${tableName}'`);
  }

  /** @inheritdoc */
  /**
   * Retrieves the name of the primary key constraint for the given table.
   *
   * @param tableName - The name of the table.
   * @returns The primary key constraint name, or undefined if not found.
   * @throws Error if the table name is invalid.
   * @throws DatabaseQueryError if the query fails.
   */
  async getPrimaryKey(tableName: string): Promise<string | undefined> {
    this.validateName(tableName, 'table name');

    const queryStr = this.buildQuery(
      this.driver.database,
      ['CONSTRAINT_NAME'],
      'INFORMATION_SCHEMA.TABLE_CONSTRAINTS',
      [`TABLE_NAME = ${this.escapeLiteral(tableName)}`, `CONSTRAINT_TYPE = 'PRIMARY KEY'`]
    );

    return await this.wrapQuery(async () => {
      const result = await this.query<{ CONSTRAINT_NAME: string }>(queryStr);
      return result.rows[0]?.CONSTRAINT_NAME;
    }, `Failed to retrieve primary key constraint for '${tableName}'`);
  }

  /**
   * Retrieves the version string of the connected database engine.
   *
   * @returns A promise that resolves to the database version string.
   * @throws DatabaseQueryError if the query fails.
   */
  async getDatabaseVersion(): Promise<string> {
    return await this.wrapQuery(async () => {
      const result = await this.query<{ version: string }>('SELECT VERSION() AS version');

      return result.rows[0].version;
    }, 'Failed to retrieve database version');
  }

  /**
   * Escapes an identifier (e.g., table name, column name) for MySQL.
   * MySQL uses backticks (`) for escaping.
   *
   * @param identifier - The identifier to escape.
   * @returns The escaped identifier.
   */
  protected escapeIdentifier(identifier: string): string {
    if (!identifier) {
      throw new Error('Identifier must not be empty.');
    }

    return `\`${identifier.replace(/`/g, '``')}\``; // Escape backticks
  }

  /** @inheritdoc */
  protected normalizeType(type: ColumnType, length?: number, precision?: number): string {
    switch (type) {
      case ColumnType.INT:
        return `INT(${length || 11})`;
      case ColumnType.DECIMAL:
        return `DECIMAL(${precision || 10}, ${length || 2})`;
      case ColumnType.VARCHAR:
        return `VARCHAR(${length || 255})`;
      case ColumnType.TEXT:
        return 'TEXT';
      case ColumnType.BOOLEAN:
        return 'BOOLEAN';
      case ColumnType.UUID:
        return 'CHAR(36)';
      case ColumnType.DATE:
        return 'DATE';
      case ColumnType.TIMESTAMP:
        return 'TIMESTAMP';
      case ColumnType.FLOAT:
        return 'FLOAT';
      case ColumnType.BLOB:
        return 'BLOB';
      case ColumnType.JSON:
        return 'JSON';
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  /**
   * Generates the full SQL definition for a single column.
   *
   * @param {ColumnMetadata} column - The metadata for the column to define.
   * @param {boolean} skipPrimary - Whether to skip including PRIMARY KEY and AUTO_INCREMENT.
   * @returns {string} The SQL string for the column definition.
   */
  protected createColumnDefinition(column: ColumnMetadata, skipPrimary: boolean = true): string {
    const parts: string[] = [];

    // Name and type
    parts.push(
      `${this.escapeIdentifier(column.name)} ${this.normalizeType(column.type, column.length)}`
    );

    // NULL / NOT NULL
    parts.push(column.isNullable ? 'NULL' : 'NOT NULL');

    // DEFAULT value
    if (column.default !== undefined) {
      parts.push(`DEFAULT ${this.escapeLiteral(column.default)}`);
    }

    // PRIMARY KEY and AUTO_INCREMENT
    if (column.isPrimary && !skipPrimary) {
      parts.push('PRIMARY KEY');
    }

    if (column.isAutoIncrement) {
      parts.push('AUTO_INCREMENT');
    }

    // COMMENT
    if (column.comment) {
      parts.push(`COMMENT ${this.escapeLiteral(column.comment)}`);
    }

    // Raw SQL override
    if (column.columnDefinition) {
      parts.push(column.columnDefinition);
    }

    return parts.join(' ');
  }

  /**
   * Compares the current MySQL version with a required minimum version.
   * @param currentVersion - The MySQL version retrieved from the database.
   * @param requiredVersion - The minimum version required (e.g., "5.7.0").
   * @returns `true` if the current MySQL version is greater than or equal to the required version.
   */
  private checkMySQLVersion(currentVersion: string, requiredVersion: string): boolean {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    const [reqMajor, reqMinor, reqPatch] = requiredVersion.split('.').map(Number);

    if (major > reqMajor) return true;
    if (major === reqMajor && minor > reqMinor) return true;

    return major === reqMajor && minor === reqMinor && patch >= reqPatch;
  }

  /**
   * Builds a query for retrieving metadata from information_schema.
   *
   * @param schema - The schema name to query.
   * @param from - The metadata source (e.g., 'information_schema.KEY_COLUMN_USAGE').
   * @param columns - Columns to select in the query.
   * Defaults to '*'.
   * @param conditions - Optional additional WHERE conditions.
   * @returns A valid SQL string.
   */
  private buildQuery(
    schema: string,
    columns: string[] = ['*'],
    from: string,
    conditions?: string[]
  ): string {
    this.validateName(schema, 'schema name');

    const queryBuilder = new QueryBuilder()
      .select(columns.map((c) => this.escapeLiteral(c)).join(', '))
      .from(from)
      .where(`TABLE_SCHEMA = ${this.escapeLiteral(schema)}`);

    if (conditions?.length) {
      const conditionStr = conditions.map((cond) => `(${cond})`).join(' AND ');
      queryBuilder.andWhere(conditionStr);
    }

    return queryBuilder.getQuery();
  }

  /**
   * Determines whether a column has changed by comparing database metadata
   * with the local column metadata.
   *
   * @param dbData - The column definition from the database.
   * @param column - The column metadata in the model.
   * @returns True if the column has changed, false otherwise.
   */
  private isColumnChanged(dbData: Record<string, any>, column: ColumnMetadata): boolean {
    const normalizedDbType = dbData.DATA_TYPE?.toLowerCase();
    const normalizedColumnType = column.type?.toLowerCase();

    const isNullableChanged = (dbData.IS_NULLABLE === 'YES') !== column.isNullable;
    const isTypeChanged = normalizedDbType !== normalizedColumnType;
    const isLengthChanged = this.compareLength(column.length, dbData.CHARACTER_MAXIMUM_LENGTH);

    return isTypeChanged || isNullableChanged || isLengthChanged;
  }

  /**
   * Checks whether the provided database column is part of a primary key.
   *
   * @param dbData - The column metadata from the database.
   * @returns True if the column is a primary key, false otherwise.
   */
  private isPrimaryKeyColumn(dbData: Record<string, any>): boolean {
    return dbData.COLUMN_KEY === 'PRI';
  }

  /**
   * Compares the expected column length with the database-defined length.
   *
   * @param columnLength - The length defined in the entity metadata.
   * @param dbLength - The raw CHARACTER_MAXIMUM_LENGTH from the database.
   * @returns True if the lengths differ, false otherwise.
   */
  private compareLength(columnLength?: number, dbLength?: string): boolean {
    return !!(columnLength && parseInt(dbLength ?? '') !== columnLength);
  }
}
