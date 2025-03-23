/**
 * Defines a naming strategy for database entities, columns, and relations.
 *
 * This interface allows customization of table names, column names, and relation names
 * to match specific database conventions or standards.
 */
export interface NamingStrategy {
  /**
   * Generates a table name based on the given class name.
   *
   * @param {string} className - The name of the entity class.
   * @returns {string} The transformed table name.
   */
  tableName(className: string): string;

  /**
   * Generates a column name based on the given property name.
   *
   * @param {string} propertyName - The name of the property in the entity class.
   * @returns {string} The transformed column name.
   */
  columnName(propertyName: string): string;

  /**
   * Generates a relation name for a given property, typically for foreign keys.
   *
   * @param {string} propertyName - The name of the property representing the relation.
   * @returns {string} The transformed relation name.
   */
  relationName(propertyName: string): string;
}
