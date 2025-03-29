/**
 * Represents the result of a raw database query.
 */
export interface QueryResult<T = any> {
  /**
   * The rows returned by the query.
   */
  rows: T[];

  /**
   * Number of rows affected (for INSERT, UPDATE, DELETE).
   */
  affectedRows?: number;

  /**
   * The raw SQL that was executed.
   */
  rawQuery?: string;

  /**
   * The first row returned (if applicable).
   */
  first?: T;

  /**
   * Optional metadata returned by the driver.
   */
  metadata?: Record<string, any>;
}
