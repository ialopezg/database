/**
 * Defines the supported column data types for database columns.
 * This enum ensures type safety when defining column types.
 */
export enum ColumnType {
  /**
   * An integer data type.
   * Commonly used for numeric values without decimal precision (e.g., primary keys, counters).
   *
   * @example 42
   */
  INTEGER = 'INTEGER',

  /**
   * A fixed-precision numeric data type.
   * Used for financial calculations or cases requiring exact decimal precision.
   *
   * @example 9999.99
   */
  DECIMAL = 'DECIMAL',

  /**
   * A variable-length character string.
   * Typically used for names, titles, or short text-based data.
   *
   * @example "John Doe"
   */
  VARCHAR = 'VARCHAR',

  /**
   * A text data type with no predefined length limit.
   * Ideal for long-form content such as descriptions, comments, or articles.
   */
  TEXT = 'TEXT',

  /**
   * A boolean data type (`true` or `false`).
   * Used for binary states like flags or toggles.
   *
   * @example true
   */
  BOOLEAN = 'BOOLEAN',

  /**
   * A universally unique identifier (UUID) data type.
   * Commonly used for primary keys or unique references.
   *
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  UUID = 'UUID',

  /**
   * A date-only data type.
   * Stores dates without time components (format: `YYYY-MM-DD`).
   *
   * @example "2025-03-22"
   */
  DATE = 'DATE',

  /**
   * A timestamp with both date and time components.
   * Typically used for tracking events or records with precise timing.
   *
   * @example "2025-03-22 14:30:00"
   */
  TIMESTAMP = 'TIMESTAMP',

  /**
   * A floating-point numeric data type.
   * Used for values that require decimal precision.
   *
   * @example 3.14159
   */
  FLOAT = 'FLOAT',

  /**
   * A binary large object (BLOB) data type.
   * Used for storing images, files, or other binary data.
   */
  BLOB = 'BLOB',

  /**
   * A JSON data type for storing structured objects or arrays.
   * Useful for dynamic data structures.
   *
   * @example {"user": "Alice", "roles": ["admin", "editor"]}
   */
  JSON = 'JSON',
}
