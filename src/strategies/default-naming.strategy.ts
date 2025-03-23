import { NamingStrategy } from './naming.strategy';

/**
 * Default naming strategy for database entities, columns, and relations.
 *
 * This strategy returns names as they are defined in the entity class
 * without applying any transformations.
 *
 * It serves as the base implementation of the `NamingStrategy` interface and can be
 * extended to customize naming conventions as needed.
 */
export class DefaultNamingStrategy implements NamingStrategy {
  /**
   * Returns the table name without modification.
   *
   * @param {string} className - The name of the entity class.
   * @returns {string} The unmodified table name.
   */
  tableName(className: string): string {
    return className;
  }

  /**
   * Returns the column name without modification.
   *
   * @param {string} propertyName - The name of the property in the entity class.
   * @returns {string} The unmodified column name.
   */
  columnName(propertyName: string): string {
    return propertyName;
  }

  /**
   * Returns the relation name without modification.
   *
   * @param {string} propertyName - The name of the property representing the relation.
   * @returns {string} The unmodified relation name.
   */
  relationName(propertyName: string): string {
    return propertyName;
  }
}
