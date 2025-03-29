/**
 * Represents metadata returned from the database when introspecting a table's columns.
 */
export interface ColumnIntrospection {
  /** The column name */
  name: string;

  /** The column's SQL type as a raw string (e.g., varchar(255), int(11), etc.) */
  type: string;

  /** Whether the column is nullable */
  nullable: boolean;

  /** The column's default value, if any */
  default: string | null;

  /** Whether the column is part of the primary key */
  isPrimary: boolean;

  /** Whether the column has a UNIQUE constraint */
  isUnique: boolean;

  /** Whether the column auto-increments */
  isAutoIncrement: boolean;
}
