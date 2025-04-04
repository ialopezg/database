import { InvalidTargetError } from '../../errors';
import { NamingStrategy } from '../../strategies';
import { Constructor } from '../../types';

/**
 * Represents metadata for a database table, including its name, target entity, and abstraction status.
 */
export class TableMetadata {
  private readonly _target: Function;
  private readonly _isAbstract: boolean;
  namingStrategy?: NamingStrategy;

  /**
   * Creates a new `TableMetadata` instance.
   *
   * @param target - The target class representing the entity.
   *                Should be a function (class constructor).
   * @param isAbstract - Whether the table is abstract (not mapped to a physical table).
   *                     Should be a boolean value.
   * @throws Error if `target` is not a function.
   */
  constructor(target: Constructor, isAbstract?: boolean) {
    if (!target || typeof target !== 'function') {
      throw new InvalidTargetError('TableMetadata', target);
    }

    this._target = target;
    this._isAbstract = isAbstract ?? false;
  }

  /**
   * Returns the target entity class.
   *
   * @returns The class constructor of the target entity.
   */
  get target(): Function {
    return this._target;
  }

  /**
   * Returns the resolved table name based on the class name and the naming strategy.
   * Falls back to the class name if no naming strategy is provided.
   *
   * @returns The table name as a string.
   */
  get name(): string {
    return this.namingStrategy
      ? this.namingStrategy.tableName(this._target.name)
      : this._target.name;
  }

  /**
   * Returns whether the table is abstract.
   *
   * @returns A boolean indicating if the table is abstract.
   */
  get isAbstract(): boolean {
    return this._isAbstract;
  }
}
