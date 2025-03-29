/**
 * Represents index metadata introspected from the database.
 */
export interface IndexIntrospection {
  /** The index name */
  name: string;

  /** The column name associated with the index */
  column: string;

  /** Whether the index is unique */
  isUnique: boolean;

  /** The type of the index (e.g., BTREE, FULLTEXT, SPATIAL) */
  type: string;
}
