/**
 * Describes a foreign key relationship found in the database.
 */
export interface ForeignKeyIntrospection {
  constraintName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}
