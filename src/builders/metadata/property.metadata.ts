/**
 * Represents metadata associated with a specific property within a target class.
 *
 * This abstract class serves as the base structure for storing metadata related to a class property,
 * such as the owning class (constructor) and the property's name. It is typically used in scenarios
 * like decorators, reflection, or ORM systems.
 */
export abstract class PropertyMetadata {
  /**
   * The constructor function of the class that declares the property.
   * This is typically used for reflection or type resolution.
   *
   * @type {NewableFunction}
   */
  public readonly target: NewableFunction;

  /**
   * The name of the property in the target class.
   *
   * @type {string}
   */
  public readonly propertyName: string;

  /**
   * Creates a new instance of `PropertyMetadata`.
   *
   * @param {NewableFunction} target - The constructor function of the class containing the property.
   * @param {string} propertyName - The name of the property within the target class.
   */
  protected constructor(target: NewableFunction, propertyName: string) {
    this.target = target;
    this.propertyName = propertyName;
  }
}
