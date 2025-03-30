/* eslint-disable */
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../builders/metadata';
import { BaseSchemaBuilder } from './base-schema.builder';
import { ColumnType } from '../../builders/options';
import { MySQLDriver } from '../mysql.driver';
import { PostgresDriver } from '../postgres.driver';
import {
  ChangedColumn,
  ColumnIntrospection,
  ForeignKeyIntrospection,
  IndexIntrospection, TableColumn,
  UniqueConstraintIntrospection,
} from '../schema/introspection';

/**
 * PostgresSQL-specific implementation of the SchemaBuilder for handling schema DDL operations.
 * This class implements methods to create and modify PostgreSQL database schemas.
 */
export class PostgresSchemaBuilder extends BaseSchemaBuilder {
  /** @inheritdoc */
  constructor(protected readonly driver: PostgresDriver) {
    super(driver);
  }

  /** @inheritdoc */
  createTable(table: TableMetadata, columns: ColumnMetadata[]): Promise<void> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  dropTable(tableName: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  addColumn(tableName: string, column: ColumnMetadata): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  renameColumn(tableName: string, columnName: string, newColumn: ColumnMetadata, skipPrimary?: boolean): Promise<void> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  dropColumn(tableName: string, columnName: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  alterColumn(tableName: string, columnName: string, newColumn: ColumnMetadata): Promise<void> {
    return Promise.resolve();
  }

  /** @inheritdoc */
  getChangedColumns(tableName: string, columns: ColumnMetadata[]): Promise<ChangedColumn[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  createIndex(tableName: string, indexName: string, columns: string[], indexType?: 'UNIQUE' | 'FULLTEXT' | 'SPATIAL'): Promise<void> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  dropIndex(tableName: string, indexName: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  addUniqueKey(tableName: string, columnName: string, keyName: string): Promise<void> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  dropUniqueKey(tableName: string, constraintName: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  addForeignKey(foreignKey: ForeignKeyMetadata): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  dropForeignKey(tableNameOrForeignKey: ForeignKeyMetadata | string, foreignKeyName?: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  hasTable(tableName: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  getTableColumns(tableName: string): Promise<ColumnIntrospection[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  getForeignKeys(table: string): Promise<ForeignKeyIntrospection[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  getTableIndexes(tableName: string): Promise<IndexIntrospection[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  getUniqueConstraints(tableName: string): Promise<UniqueConstraintIntrospection[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  getUniqueConstraintNames(tableName: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  getTables(): Promise<string[]> {
    return Promise.resolve([]);
  }

  /** @inheritdoc */
  getTableDefinition(tableName: string): Promise<string> {
    return Promise.resolve('');
  }

  /** @inheritdoc */
  getPrimaryKey(tableName: string): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  getColumnDefinition(tableName: string, columnName: string): Promise<TableColumn | undefined> {
    return Promise.resolve(undefined);
  }

  /** @inheritdoc */
  getDatabaseVersion(): Promise<string> {
    return Promise.resolve('');
  }

  /**
   * Escapes an identifier (e.g., table name, column name) for PostgreSQL.
   * PostgreSQL uses double quotes
   *
   * @param identifier - The identifier to escape.
   * @returns The escaped identifier.
   */
  protected escapeIdentifier(identifier: string): string {
    if (!identifier.trim()) {
      throw new Error('Identifier must not be empty.');
    }
    return `"${identifier.replace(/"/g, '""')}"`; // Escape double quotes
  }

  protected getPrimaryKeyStatus(dbData: any): boolean {
    return false;
  }

  protected getSchemaQuery(entity: string): string {
    return '';
  }

  protected isColumnChanged(dbData: any, column: ColumnMetadata): boolean {
    return false;
  }

  protected normalizeType(type: ColumnType, length?: number): string {
    return '';
  }
}
