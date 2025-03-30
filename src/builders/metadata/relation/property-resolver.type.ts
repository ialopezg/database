/**
 * Represents a property on an entity as either:
 * - a string literal (e.g. "user") or
 * - a function that returns the property name dynamically.
 *
 * @template T - Entity type
 */
export type PropertyResolver<T> = string | ((entity: T) => string | any);
