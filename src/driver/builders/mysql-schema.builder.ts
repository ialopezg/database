/* eslint-disable */
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../builders/metadata';
import { ColumnType } from '../../builders/options';
import { DatabaseQueryError, InvalidTableNameError } from '../../errors';
import { MySQLDriver } from '../mysql.driver';
import { BaseSchemaBuilder } from './base-schema.builder';

/**
 * MySQL-specific schema builder.
 * Implements schema detection and change detection logic for MySQL.
 */
export class MySQLSchemaBuilder extends BaseSchemaBuilder {
  /**
   * Initializes the schema builder with a MySQL driver.
   *
   * @param driver - The MySQL database driver instance.
   */
  constructor(protected readonly driver: MySQLDriver) {
    super(driver);
  }

  /** @inheritdoc */
  async addColumn(tableName: string, column: ColumnMetadata): Promise<boolean> {
    try {
      const queryStr = `ALTER TABLE ${tableName}
          ADD ${this.buildColumnsDefinitionClause(column, false)}`;
      const result = await this.query(queryStr);

      return !!result;
    } catch (error: unknown) {
      const message = (error as Error).message;
      throw new DatabaseQueryError(
        `Failed to add column to ${tableName}: ${message}`,
        error as Error
      );
    }
  }

  /** @inheritdoc */
  async addForeignKey(foreignKey: ForeignKeyMetadata): Promise<boolean> {
    if (!foreignKey || !foreignKey.table || !foreignKey.relatedTable) {
      throw new Error('Invalid foreign key metadata');
    }

    // Validate column lengths
    if (foreignKey.columns.length === 0 || foreignKey.relatedColumnNames.length === 0) {
      throw new Error('Foreign key must have at least one column.');
    }

    // Validate the column and relatedColumn length match
    if (foreignKey.columns.length !== foreignKey.relatedColumnNames.length) {
      throw new Error('Number of columns must match number of related columns');
    }

    try {
      const queryStr = `ALTER TABLE \`${foreignKey.table.name}\`
          ADD CONSTRAINT \`${foreignKey.name}\`
              FOREIGN KEY (\`${foreignKey.columns.join('`, `')}\`)
                  REFERENCES \`${foreignKey.relatedTable.name}\` (\`${foreignKey.relatedColumnNames.join('`, `')}\`)`;

      const result = await this.query(queryStr);

      return !!result;
    } catch (error: unknown) {
      throw new DatabaseQueryError(
        `Failed to add foreign key ${foreignKey.name} from ${foreignKey.table.name} to ${foreignKey.relatedTable.name}: ${(error as Error).message}`,
        error as Error
      );
    }
  }

  addUniqueKey(tableName: string, columnName: string, keyName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  changeColumn(tableName: string, columnName: string, newColumn: ColumnMetadata, skipPrimary?: boolean): Promise<void> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  async checkIfTableExists(tableName: string): Promise<boolean> {
    if (!tableName.trim()) {
      throw new InvalidTableNameError('Table name is missing or invalid');
    }

    try {
      const result = await this.query<any>(`SHOW TABLES LIKE '${tableName}'`);

      return !!(result && result.length);
    } catch (error: unknown) {
      throw new DatabaseQueryError(`Failed to check if table exists: ${tableName}`, error as Error);
    }
  }

  createTable(table: TableMetadata, columns: ColumnMetadata[]): Promise<void> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  async dropColumn(tableName: string, columnName: string): Promise<boolean> {
    try {
      // Check MySQL version to determine whether "IF EXISTS" is supported
      const versionResult = await this.query<{ version: string }>('SELECT VERSION() AS version');
      const mysqlVersion = versionResult?.[0]?.version || '';
      const supportsIfExists = this.checkMySQLVersion(mysqlVersion, '5.7.0');

      // Construct the query based on MySQL version
      const queryStr = supportsIfExists
        ? `ALTER TABLE \`${tableName}\` DROP COLUMN IF EXISTS \`${columnName}\``
        : `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``;

      const result = await this.query(queryStr);
      return !!result;
    } catch (error: unknown) {
      throw new DatabaseQueryError(
        `Failed to drop column '${columnName}' from '${tableName}': ${(error as Error).message}`,
        error as Error
      );
    }
  }

  dropForeignKey(tableNameOrForeignKey: ForeignKeyMetadata | string, foreignKeyName?: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  dropIndex(tableName: string, indexName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  getForeignKeys(table: TableMetadata): Promise<string[]> {
    return Promise.resolve([]);
  }

  getPrimaryConstraintName(tableName: string): Promise<string> {
    return Promise.resolve('');
  }

  getTableColumns(tableName: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  getTableUniqueKeys(tableName: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  protected isColumnChanged(dbData: any, column: ColumnMetadata): boolean {
    const newType: string = this.normalizeType(column.type, column.length);
    const isNullable: string = column.isNullable ? 'YES' : 'NO';

    return (
      dbData.COLUMN_TYPE !== newType ||
      dbData.COLUMN_COMMENT !== column.comment ||
      dbData.IS_NULLABLE !== isNullable ||
      (dbData.EXTRA === 'auto_increment') !== column.isAutoIncrement ||
      dbData.COLUMN_KEY?.includes('PRIMARY_KEY') !== column.isPrimary
    );
  }

  /** @inheritdoc */
  protected getPrimaryKeyStatus(dbData: any): boolean {
    return dbData.COLUMN_KEY.includes('PRI');
  }

  /** @inheritdoc */
  protected getSchemaQuery(tableName: string): string {
    const queryBuilder = this.driver.createQueryBuilder();

    return queryBuilder
      .select('COLUMN_NAME', 'COLUMN_TYPE', 'COLUMN_COMMENT', 'IS_NULLABLE', 'EXTRA', 'COLUMN_KEY')
      .from('INFORMATION_SCHEMA.COLUMNS')
      .where(`TABLE_SCHEMA = :schema`)
      .andWhere(`TABLE_NAME = :table`)
      .setParameters([
        { name: 'schema', value: this.driver.database },
        { name: 'table', value: tableName },
      ])
      .getQuery();
  }

  /** @inheritdoc */
  protected normalizeType(type: ColumnType, length?: number, precision?: number): string {
    switch (type) {
      case ColumnType.INTEGER:
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

  private buildColumnsDefinitionClause(column: ColumnMetadata, skipPrimary: boolean): string {
    let c = `${column.name} ${this.normalizeType(column.type, column.length)}`;

    if (!column.isNullable) c += ' NOT NULL';
    if (column.isPrimary && !skipPrimary) c += ' PRIMARY KEY';
    if (column.isAutoIncrement && !skipPrimary) c += ' AUTO_INCREMENT';
    if (column.comment) c += ` COMMENT '${column.comment}'`;
    if (column.columnDefinition) c += ` ${column.columnDefinition}`;

    return c;
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
    if (major === reqMajor && minor === reqMinor && patch >= reqPatch) return true;

    return false;
  }
}
