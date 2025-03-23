import { ColumnMetadata } from '../../builders/metadata';
import { ColumnType } from '../../builders/options';
import { Driver } from '../driver';
import { SchemaBuilder } from './schema.builder';

/**
 * Abstract base class for schema builders.
 * Provides common logic for detecting schema changes across different database engines.
 */
export abstract class BaseSchemaBuilder extends SchemaBuilder {
  /**
   * Initializes the schema builder with a database driver.
   * This constructor is protected to enforce subclassing.
   *
   * @param driver - The database driver instance.
   */
  protected constructor(protected readonly driver: Driver) {
    super();
  }

  /** @inheritdoc */
  async getChangedColumns(
    tableName: string,
    columns: ColumnMetadata[]
  ): Promise<{ columnName: string; hasPrimaryKey: boolean }[]> {
    const queryStr: string = this.getSchemaQuery(tableName);
    const result: any[] = await this.query<any[]>(queryStr);

    const dbColumnMap: Map<string, any> = new Map(result.map((c) => [c.COLUMN_NAME, c]));

    return columns
      .filter((column) => {
        const dbData = dbColumnMap.get(column.name);
        return dbData ? this.isColumnChanged(dbData, column) : false;
      })
      .map((column) => {
        const dbData = dbColumnMap.get(column.name);
        return {
          columnName: column.name,
          hasPrimaryKey: this.getPrimaryKeyStatus(dbData),
        };
      });
  }

  /**
   * Executes a raw SQL query using the database driver.
   *
   * @template T - The expected return type of the query result.
   * @param queryStr - The SQL query string to execute.
   * @returns A promise resolving with the query result.
   */
  protected async query<T extends Record<string, any>>(queryStr: string): Promise<T[]> {
    return this.driver.query<T[]>(queryStr);
  }

  /**
   * Extract primary key status from the database column data.
   *
   * @param dbData - The database column metadata.
   * @returns True if the column is a primary key, otherwise false.
   */
  protected abstract getPrimaryKeyStatus(dbData: any): boolean;

  /**
   * Abstract method to determine if a column has changed compared to the database schema.
   *
   * @param dbData - The database column metadata.
   * @param column - The column metadata from the entity definition.
   * @returns True if the column has changed, otherwise false.
   */
  protected abstract isColumnChanged(dbData: any, column: ColumnMetadata): boolean;

  /**
   * Returns the SQL query to retrieve schema information for a given entity.
   *
   * @param entity - The name of the database table.
   * @returns The SQL query string.
   */
  protected abstract getSchemaQuery(entity: string): string;

  /**
   * Normalizes a column type to match the database engine's type system.
   *
   * @param {ColumnType} type - The column data type.
   * @param {number} length - The optional length of the column.
   * @returns The normalized database type.
   */
  protected abstract normalizeType(type: ColumnType, length?: number): string;
}
