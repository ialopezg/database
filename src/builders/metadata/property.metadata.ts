/**
 * Represents metadata information associated with a specific property within a target class.
 *
 * This abstract class serves as a base for storing metadata about a property, including its owning
 * class and name.
 */
export abstract class PropertyMetadata {
  /**
   * The class or constructor function to which the property belongs.
   *
   * @readonly
   */
  public readonly target: NewableFunction;

  /**
   * The name of the property within the target class.
   *
   * @readonly
   */
  public readonly propertyName: string;

  /**
   * Creates an instance of `PropertyMetadata`.
   *
   * @param {NewableFunction} target - The constructor function of the class
   *                                   containing the property.
   * @param {string} propertyName - The name of the property.
   */
  protected constructor(target: NewableFunction, propertyName: string) {
    this.target = target;
    this.propertyName = propertyName;
  }
}
