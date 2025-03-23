import { ColumnType } from './column-type.enum';

/**
 * Defines options for configuring a database column.
 */
export interface ColumnOptions {
  /**
   * The name of the column in the database.
   * If not provided, the property name will be used.
   *
   * @example "user_id"
   * @default undefined
   */
  name?: string;

  /**
   * The data type of the column (e.g., `VARCHAR`, `INT`, `TEXT`).
   *
   * @example ColumnType.VARCHAR
   * @default undefined
   */
  type?: Function | ColumnType | string;

  /**
   * The length of the column (only applicable for certain types like `VARCHAR`).
   *
   * @example 255
   * @default undefined
   */
  length?: number;

  /**
   * Specifies if the column should auto-increment.
   * This is typically used for primary key columns.
   *
   * @example true
   * @default false
   */
  isAutoIncrement?: boolean;

  /**
   * Specifies if the column should have a unique constraint.
   *
   * @example true
   * @default false
   */
  isUnique?: boolean;

  /**
   * Determines if the column allows `NULL` values.
   *
   * @example false
   * @default false
   */
  isNullable?: boolean;

  /**
   * Custom column definition to override default behavior.
   * Example: `"VARCHAR(255) NOT NULL"`
   *
   * @example "VARCHAR(100) DEFAULT 'guest'"
   * @default undefined
   */
  columnDefinition?: string;

  /**
   * A comment describing the purpose of this column.
   *
   * @example "Stores the user's email address"
   * @default undefined
   */
  comment?: string;

  /**
   * The previous column name (useful for migrations).
   *
   * @example "old_email"
   * @default undefined
   */
  oldColumnName?: string;
}
