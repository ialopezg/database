import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../builders/metadata';
import { ColumnType } from '../../builders/options';
import { DatabaseQueryError, InvalidNameError } from '../../errors';
import { QueryResult } from '../../query';
import { Driver } from '../driver';
import {
  ChangedColumn,
  ColumnIntrospection,
  ForeignKeyIntrospection,
  IndexIntrospection,
  TableColumn,
  UniqueConstraintIntrospection,
} from '../schema/introspection';
import { SchemaBuilder } from './schema.builder';

/**
 * Abstract base class for schema builders.
 * Provides common logic for detecting schema changes across different database engines.
 */
export abstract class BaseSchemaBuilder implements SchemaBuilder {
  /**
   * Initializes the schema builder with a database driver.
   * This constructor is protected to enforce subclassing.
   *
   * @param driver - The database driver instance.
   */
  protected constructor(protected readonly driver: Driver) {}

  /**
   * Escapes an identifier (e.g., table name, column name) to prevent SQL injection.
   *
   * @param identifier - The string to be escaped.
   * @returns The escaped identifier wrapped in backticks.
   */
  protected abstract escapeIdentifier(identifier: string): string;

  /**
   * Executes a raw SQL query using the database driver.
   *
   * @template T - The expected return type of the query result.
   * @param queryStr - The SQL query string to execute.
   * @returns A QueryResult object.
   */
  public async query<T extends Record<string, any>>(queryStr: string): Promise<QueryResult<T>> {
    const rows = (await this.driver.query<T[]>(queryStr)) ?? [];

    return {
      rows,
      first: rows[0],
      affectedRows: rows.length,
      rawQuery: queryStr,
    };
  }

  /**
   * Normalizes a column type to match the database engine's type system.
   *
   * @param type - The column data type.
   * @param length - The optional length of the column.
   * @param precision - The optional precision.
   * @returns The normalized database type.
   */
  protected abstract normalizeType(type: ColumnType, length?: number, precision?: number): string;

  /** @inheritdoc */
  abstract createTable(tableName: TableMetadata, columns: ColumnMetadata[]): Promise<void>;

  /** @inheritdoc */
  abstract dropTable(tableName: string): Promise<boolean>;

  /** @inheritdoc */
  abstract hasTable(tableName: string): Promise<boolean>;

  /** @inheritdoc */
  abstract addColumn(tableName: string, column: ColumnMetadata): Promise<boolean>;

  /** @inheritdoc */
  abstract dropColumn(tableName: string, columnName: string): Promise<boolean>;

  /** @inheritdoc */
  abstract renameColumn(
    tableName: string,
    columnName: string,
    newColumn: ColumnMetadata
  ): Promise<void>;

  /** @inheritdoc */
  abstract alterColumn(
    tableName: string,
    columnName: string,
    newDefinition: ColumnMetadata,
    skipPrimary?: boolean
  ): Promise<void>;

  /** @inheritdoc */
  abstract getChangedColumns(
    tableName: string,
    columns: ColumnMetadata[]
  ): Promise<ChangedColumn[]>;

  /** @inheritdoc */
  abstract createIndex(
    tableName: string,
    indexName: string,
    columns: string[],
    indexType?: 'UNIQUE' | 'FULLTEXT' | 'SPATIAL'
  ): Promise<void>;

  /** @inheritdoc */
  abstract dropIndex(tableName: string, indexName: string): Promise<boolean>;

  /** @inheritdoc */
  abstract addUniqueKey(tableName: string, columnName: string, keyName: string): Promise<void>;

  /** @inheritdoc */
  abstract dropUniqueKey(tableName: string, constraintName: string): Promise<boolean>;

  /** @inheritdoc */
  abstract addForeignKey(foreignKey: ForeignKeyMetadata): Promise<boolean>;

  /** @inheritdoc */
  abstract dropForeignKey(tableName: string, foreignKeyName: string): Promise<boolean>;

  /** @inheritdoc */
  abstract getTableColumns(tableName: string): Promise<ColumnIntrospection[]>;

  /** @inheritdoc */
  abstract getForeignKeys(tableName: string): Promise<ForeignKeyIntrospection[]>;

  /** @inheritdoc */
  abstract getTableIndexes(tableName: string): Promise<IndexIntrospection[]>;

  /** @inheritdoc */
  abstract getUniqueConstraints(tableName: string): Promise<UniqueConstraintIntrospection[]>;

  /** @inheritdoc */
  abstract getUniqueConstraintNames(tableName: string): Promise<string[]>;

  /** @inheritdoc */
  abstract getTables(): Promise<string[]>;

  /** @inheritdoc */
  abstract getTableDefinition(tableName: string): Promise<string>;

  /** @inheritdoc */
  abstract getPrimaryKey(tableName: string): Promise<string | undefined>;

  /** @inheritdoc */
  abstract getColumnDefinition(
    tableName: string,
    columnName: string
  ): Promise<TableColumn | undefined>;

  /** @inheritdoc */
  abstract getDatabaseVersion(): Promise<string>;

  /**
   * Validates that a given name (table, column, etc.) is non-empty.
   *
   * @param name - The name to validate.
   * @param kind - Optional label to customize the error message.
   */
  protected validateName(name: string, kind: string): void {
    if (!name?.trim()) {
      throw new InvalidNameError(kind);
    }
  }

  /**
   * Executes a query-wrapped function and throws a consistent error message if it fails.
   *
   * @param callback - Function that returns a Promise to be wrapped.
   * @param errorMessage - Base error message to prepend.
   * @returns The resolved result of the callback.
   */
  protected async wrapQuery<T>(callback: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await callback();
    } catch (error: unknown) {
      throw new DatabaseQueryError(errorMessage, error as Error);
    }
  }

  /**
   * Escapes an SQL string literal to prevent syntax errors or injection.
   *
   * @param value - The literal value to escape.
   * @returns A safely quoted SQL string.
   */
  protected escapeLiteral(value: string): string {
    const escaped = value.replace(/'/g, "''"); // escape single quotes
    return `'${escaped}'`;
  }

  /**
   * Ensures that the provided column list is valid before executing
   * SQL schema operations like CREATE TABLE.
   *
   * @param {ColumnMetadata[]} columns - The list of column definitions to validate.
   * @param {string} tableName - The name of the table being created (used in the error message).
   * @throws {Error} If the column array is missing, not an array, or empty.
   */
  protected ensureValidColumns(columns: ColumnMetadata[], tableName: string): void {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error(`Columns cannot be empty when creating table "${tableName}"`);
    }
  }
}
