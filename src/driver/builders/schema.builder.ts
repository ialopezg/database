import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../builders/metadata';

/**
 * SchemaBuilder defines methods for interacting with a database schema, including operations
 * such as adding columns, foreign keys, and creating tables. These operations map to DDL queries
 * to modify the database schema.
 */
export abstract class SchemaBuilder {
  /**
   * Adds a column to a table.
   *
   * @param tableName The name of the tableName (table) to which the column will be added.
   * @param column The column metadata to be added.
   * @returns A promise that resolves when the column has been added to the table.
   * @throws Error if the operation fails.
   */
  abstract addColumn(tableName: string, column: ColumnMetadata): Promise<boolean>;

  /**
   * Adds a foreign key constraint between tables.
   *
   * @param foreignKey The foreign key metadata containing the relationship details.
   * @returns A promise that resolves when the foreign key has been added to the table.
   * @throws Error if the operation fails.
   */
  abstract addForeignKey(foreignKey: ForeignKeyMetadata): Promise<boolean>;

  /**
   * Adds a unique key constraint to a table.
   *
   * @param tableName The name of the table to which the unique key will be added.
   * @param columnName The name of the column that will have the unique key.
   * @param keyName The name of the unique key constraint.
   * @returns A promise that resolves when the unique key has been added to the table.
   * @throws Error if the operation fails.
   */
  abstract addUniqueKey(tableName: string, columnName: string, keyName: string): Promise<void>;

  /**
   * Modifies an existing column in a table.
   *
   * @param tableName The name of the table containing the column to be changed.
   * @param columnName The name of the column to be changed.
   * @param newColumn The new column metadata with updated properties.
   * @param skipPrimary Whether to skip changing the primary key constraint.
   * Defaults to `false`.
   *
   * @returns A promise that resolves when the column has been modified.
   * @throws Error if the operation fails.
   */
  abstract changeColumn(
    tableName: string,
    columnName: string,
    newColumn: ColumnMetadata,
    skipPrimary?: boolean
  ): Promise<void>;

  /**
   * Checks if a table exists in the database.
   *
   * @param tableName The name of the tableName (table) to check.
   * @returns A promise that resolves to `true` if the table exists, otherwise `false`.
   * @throws {DatabaseQueryError} If the query fails.
   * @throws {InvalidTableNameError} If the table name is invalid or missing.
   */
  abstract checkIfTableExists(tableName: string): Promise<boolean>;

  /**
   * Creates a new table in the database with specified columns.
   *
   * @param table The table metadata containing the table name and other details.
   * @param columns An array of column metadata for the columns to be created in the table.
   * @returns A promise that resolves when the table has been created.
   * @throws Error if the operation fails.
   */
  abstract createTable(table: TableMetadata, columns: ColumnMetadata[]): Promise<void>;

  /**
   * Drops a column from a table.
   *
   * @param tableName The name of the tableName (table) from which the column will be dropped.
   * @param columnName The name of the column to be dropped.
   * @returns A promise that resolves when the column has been dropped from the table.
   * @throws Error if the operation fails.
   */
  abstract dropColumn(tableName: string, columnName: string): Promise<boolean>;

  /**
   * Drops a foreign key constraint from a table.
   *
   * This method supports two-parameter formats:
   * - **(foreignKey: ForeignKeyMetadata)**: Drops a foreign key using metadata.
   * - **(tableName: string, foreignKeyName: string)**: Drops a foreign key using table and key names.
   *
   * @param tableNameOrForeignKey - The table name as a string or a `ForeignKeyMetadata` object.
   * @param foreignKeyName - (Optional) The foreign key constraint name, required if the first parameter is a string.
   * @throws {Error} If the foreign key name is missing.
   * @throws {DatabaseQueryError} If the query execution fails.
   * @returns A promise that resolves when the foreign key is successfully dropped.
   */
  abstract dropForeignKey(
    tableNameOrForeignKey: ForeignKeyMetadata | string,
    foreignKeyName?: string
  ): Promise<void>;

  /**
   * Drops an index from a table.
   *
   * @param tableName The name of the table from which the index will be dropped.
   * @param indexName The name of the index to be dropped.
   * @returns A promise that resolves when the index has been dropped from the table.
   * @throws Error if the operation fails.
   */
  abstract dropIndex(tableName: string, indexName: string): Promise<void>;

  /**
   * Retrieves the columns that have been changed in a table compared to the provided list.
   *
   * @param entity The name of the entity (table) to check for column changes.
   * @param columns The list of column metadata to compare against.
   * @returns A promise that resolves to an array of changed columns, with information on primary key status.
   * @throws Error if the operation fails.
   */
  abstract getChangedColumns(
    entity: string,
    columns: ColumnMetadata[]
  ): Promise<{ columnName: string; hasPrimaryKey: boolean }[]>;

  /**
   * Retrieves the foreign keys associated with a table.
   *
   * @param table The table metadata to get the foreign keys for.
   * @returns A promise that resolves to a list of foreign key names.
   * @throws Error if the operation fails.
   */
  abstract getForeignKeys(table: TableMetadata): Promise<string[]>;

  /**
   * Retrieves the primary constraint name for a table.
   *
   * @param tableName The name of the table to get the primary constraint name for.
   * @returns A promise that resolves to the primary constraint name.
   * @throws Error if the operation fails.
   */
  abstract getPrimaryConstraintName(tableName: string): Promise<string>;

  /**
   * Retrieves the column names for a table.
   *
   * @param tableName The name of the table to get the columns for.
   * @returns A promise that resolves to a list of column names.
   * @throws Error if the operation fails.
   */
  abstract getTableColumns(tableName: string): Promise<string[]>;

  /**
   * Retrieves the unique keys associated with a table.
   *
   * @param tableName The name of the table to get the unique keys for.
   * @returns A promise that resolves to a list of unique key names.
   * @throws Error if the operation fails.
   */
  abstract getTableUniqueKeys(tableName: string): Promise<string[]>;
}
