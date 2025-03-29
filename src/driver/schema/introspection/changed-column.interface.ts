/**
 * Represents a column that has been detected as changed
 * when comparing the expected schema with the actual database schema.
 */
export interface ChangedColumn {
  /**
   * The name of the column that differs.
   */
  columnName: string;

  /**
   * Indicates whether the column is defined as a primary key in the database.
   */
  hasPrimaryKey: boolean;
}
