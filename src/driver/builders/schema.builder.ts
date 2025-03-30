import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../builders/metadata';
import {
  ChangedColumn,
  ColumnIntrospection,
  ForeignKeyIntrospection,
  IndexIntrospection,
  TableColumn,
  UniqueConstraintIntrospection,
} from '../schema/introspection';

/**
 * A modular, type-safe contract for schema manipulation across database engines.
 */
export interface SchemaBuilder {
  /**
   * Creates a new table.
   * @param {TableMetadata} table - The table metadata object.
   * @param {ColumnMetadata[]} columns - The list of columns to create.
   * @returns {Promise<void>} Resolves once the table is created.
   */
  createTable(table: TableMetadata, columns: ColumnMetadata[]): Promise<void>;

  /**
   * Drops an existing table.
   * @param {string} tableName - Name of the table to drop.
   * @returns {Promise<void>} Resolves once the table is dropped.
   */
  dropTable(tableName: string): Promise<boolean>;

  /**
   * Adds a column to a table.
   * @param {string} tableName - Name of the table.
   * @param {ColumnMetadata} column - Column definition.
   * @returns {Promise<boolean>} Resolves true if column is added.
   */
  addColumn(tableName: string, column: ColumnMetadata): Promise<boolean>;

  /**
   * Drops a column from a table.
   * @param {string} tableName - The name of the table.
   * @param {string} columnName - The name of the column to drop.
   * @returns {Promise<boolean>} Resolves true if column is dropped.
   */
  dropColumn(tableName: string, columnName: string): Promise<boolean>;

  /**
   * Renames a column.
   * @param {string} tableName - Name of the table.
   * @param {string} columnName - Current column name.
   * @param {ColumnMetadata} newColumn - New column metadata.
   * @param {boolean} [skipPrimary=false] - Whether to skip primary key constraint.
   * @returns {Promise<void>} Resolves once renamed.
   */
  renameColumn(
    tableName: string,
    columnName: string,
    newColumn: ColumnMetadata,
    skipPrimary?: boolean
  ): Promise<void>;

  /**
   * Alters an existing column.
   * @param {string} tableName - Name of the table.
   * @param {string} columnName - The column name to be updated.
   * @param {ColumnMetadata} column - Column definition.
   * @param {boolean} [skipPrimary=false] - Whether to skip a primary key.
   * @returns {Promise<void>} Resolves once altered.
   */
  alterColumn(
    tableName: string,
    columnName: string,
    column: ColumnMetadata,
    skipPrimary?: boolean
  ): Promise<void>;

  /**
   * Detects columns that differ between code and database.
   * @param {string} tableName - Table name.
   * @param {ColumnMetadata[]} columns - Column metadata to compare.
   * @returns {Promise<ChangedColumn[]>} Array of changed column results.
   */
  getChangedColumns(tableName: string, columns: ColumnMetadata[]): Promise<ChangedColumn[]>;

  /**
   * Creates an index on specified columns.
   * @param {string} tableName - Table name.
   * @param {string} indexName - Optional index name.
   * @param {string[]} columns - Columns to index.
   * @param {'UNIQUE' | 'FULLTEXT' | 'SPATIAL'} [indexType] - Index type.
   * @returns {Promise<void>} Resolves once created.
   */
  createIndex(
    tableName: string,
    indexName: string,
    columns: string[],
    indexType?: 'UNIQUE' | 'FULLTEXT' | 'SPATIAL'
  ): Promise<void>;

  /**
   * Drops an index.
   * @param {string} tableName - Table name.
   * @param {string} indexName - Index name.
   * @returns {Promise<void>} Resolves once dropped.
   */
  dropIndex(tableName: string, indexName: string): Promise<boolean>;

  /**
   * Adds a unique key to a table.
   * @param {string} tableName - Table name.
   * @param {string} constraintName - Constraint name.
   * @param {string} keyName - Unique columns.
   * @returns {Promise<void>} Resolves once added.
   */
  addUniqueKey(tableName: string, constraintName: string, keyName: string): Promise<void>;

  /**
   * Drops a unique key.
   * @param {string} tableName - Table name.
   * @param {string} constraintName - Unique constraint name.
   * @returns {Promise<boolean>} Resolves true if dropped.
   */
  dropUniqueKey(tableName: string, constraintName: string): Promise<boolean>;

  /**
   * Adds a foreign key to a table.
   * @param {ForeignKeyMetadata} foreignKey - The foreign key metadata.
   * @returns {Promise<boolean>} Resolves once added.
   */
  addForeignKey(foreignKey: ForeignKeyMetadata): Promise<boolean>;

  /**
   * Drops a foreign key constraint.
   * @param {string} tableName - Table name.
   * @param {string} constraintName - FK constraint name.
   * @returns {Promise<void>} Resolves once dropped.
   */
  dropForeignKey(tableName: string, constraintName: string): Promise<boolean>;

  /**
   * Gets the list of tables in the database.
   * @returns {Promise<string[]>} Resolves with table names.
   */
  getTables(): Promise<string[]>;

  /**
   * Gets metadata of a table's columns.
   * @param {string} tableName - Name of the table.
   * @returns {Promise<ColumnIntrospection[]>} Array of column metadata.
   */
  getTableColumns(tableName: string): Promise<ColumnIntrospection[]>;

  /**
   * Gets a specific column's metadata.
   * @param {string} tableName - Table name.
   * @param {string} columnName - Column name.
   * @returns {Promise<TableColumn | undefined>} Metadata or undefined.
   */
  getColumnDefinition(tableName: string, columnName: string): Promise<TableColumn | undefined>;

  /**
   * Gets all indexes of a table.
   * @param {string} tableName - Table name.
   * @returns {Promise<IndexIntrospection[]>} Array of index metadata.
   */
  getTableIndexes(tableName: string): Promise<IndexIntrospection[]>;

  /**
   * Gets all foreign keys of a table.
   * @param {string} tableName - Table name.
   * @returns {Promise<ForeignKeyIntrospection[]>} Array of foreign key metadata.
   */
  getForeignKeys(tableName: string): Promise<ForeignKeyIntrospection[]>;

  /**
   * Gets all unique constraints of a table.
   * @param {string} tableName - Table name.
   * @returns {Promise<UniqueConstraintIntrospection[]>} Array of unique constraints.
   */
  getUniqueConstraints(tableName: string): Promise<UniqueConstraintIntrospection[]>;

  /**
   * Gets names of all unique constraints.
   * @param {string} tableName - Table name.
   * @returns {Promise<string[]>} Array of constraint names.
   */
  getUniqueConstraintNames(tableName: string): Promise<string[]>;

  /**
   * Returns true if table exists.
   * @param {string} tableName - Table name.
   * @returns {Promise<boolean>} Whether the table exists.
   */
  hasTable(tableName: string): Promise<boolean>;

  /**
   * Gets the database version string.
   * @returns {Promise<string>} Version string.
   */
  getDatabaseVersion(): Promise<string>;

  /**
   * Gets the name of the primary key constraint.
   * @param {string} tableName - Table name.
   * @returns {Promise<string | undefined>} Name of PK constraint.
   */
  getPrimaryKey(tableName: string): Promise<string | undefined>;
}
