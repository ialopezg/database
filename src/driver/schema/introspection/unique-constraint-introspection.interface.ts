/**
 * Represents a unique constraint definition on a table.
 */
export interface UniqueConstraintIntrospection {
  /** The name of the unique constraint */
  constraintName: string;

  /** The name of the column the constraint is applied to */
  columnName: string;
}
