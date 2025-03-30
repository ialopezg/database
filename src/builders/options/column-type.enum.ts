/**
 * Enum for different SQL column types supported by the database.
 * This enum helps identify the data type for columns in table definitions.
 */
export enum ColumnType {
  /**
   * Represents an integer column type.
   * Used for whole numbers without decimals.
   */
  INT = 'INT',

  /**
   * Represents a large integer column type.
   * Used for very large whole numbers.
   */
  BIGINT = 'BIGINT',

  /**
   * Represents a decimal column type.
   * Used for numbers with fixed precision and scale.
   */
  DECIMAL = 'DECIMAL',

  /**
   * Represents a floating-point column type.
   * Used for numbers with a decimal point, but less precision than DECIMAL.
   */
  FLOAT = 'FLOAT',

  /**
   * Represents a double-precision floating-point column type.
   * Used for larger numbers with higher precision.
   */
  DOUBLE = 'DOUBLE',

  /**
   * Represents a variable-length character column type.
   * Typically used for strings with varying lengths (e.g., names, descriptions).
   * Requires length validation.
   */
  VARCHAR = 'VARCHAR',

  /**
   * Represents a fixed-length character column type.
   * Used for strings with a fixed length (e.g., ISO codes).
   * Requires length validation.
   */
  CHAR = 'CHAR',

  /**
   * Represents a text column type.
   * Used for large strings, such as descriptions or paragraphs.
   * It Does not require length validation.
   */
  TEXT = 'TEXT',

  /**
   * Represents a date column type.
   * Used for storing date values (YYYY-MM-DD).
   */
  DATE = 'DATE',

  /**
   * Represents a datetime column type.
   * Used for storing date and time values (YYYY-MM-DD HH:MM:SS).
   */
  DATETIME = 'DATETIME',

  /**
   * Represents a timestamp column type.
   * Used for storing a timestamp value (seconds since the Unix epoch).
   */
  TIMESTAMP = 'TIMESTAMP',

  /**
   * Represents a boolean column type.
   * Used for storing TRUE or FALSE values.
   */
  BOOLEAN = 'BOOLEAN',

  /**
   * Represents a binary large object (BLOB) column type.
   * Used for storing binary data, such as images or files.
   */
  BLOB = 'BLOB',

  /**
   * Represents a JSON column type.
   * Used for storing JSON data.
   */
  JSON = 'JSON',

  /**
   * Represents a UUID (universally unique identifier) column type.
   * Commonly used to uniquely identify rows.
   */
  UUID = 'UUID',
}
