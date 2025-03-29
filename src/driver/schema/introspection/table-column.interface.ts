/**
 * Represents raw column metadata retrieved from information_schema.columns.
 * Used for low-level column introspection and comparison.
 */
export interface TableColumn {
  /**
   * The name of the column.
   */
  COLUMN_NAME: string;

  /**
   * The full data type (with precision/length if applicable).
   */
  COLUMN_TYPE: string;

  /**
   * The comment/description associated with the column.
   */
  COLUMN_COMMENT: string;

  /**
   * Whether the column allows NULL values ("YES" or "NO").
   */
  IS_NULLABLE: string;

  /**
   * Extra options for the column, such as "auto_increment".
   */
  EXTRA: string;

  /**
   * Key type for the column (e.g., "PRI" for primary key).
   */
  COLUMN_KEY: string;
}
