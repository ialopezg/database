import { Constructor } from '../../types';

/**
 * Represents a compound index defined on an entity class.
 */
export class CompoundIndexMetadata {
  private readonly _target: Constructor;
  private readonly _fields: string[];

  /**
   * Creates a new instance of CompoundIndexMetadata.
   *
   * @param target - The class constructor of the entity.
   * @param fields - The property names (fields) included in the index.
   *
   * @throws Will throw an error if target is not a constructor function.
   * @throws Will throw an error if fields is not a non-empty array of strings.
   */
  constructor(target: Constructor, fields: string[]) {
    if (typeof target !== 'function' || !target.prototype) {
      throw new Error('CompoundIndexMetadata requires a valid constructor function as target.');
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      throw new Error('CompoundIndexMetadata requires a non-empty array of field names (strings).');
    }

    this._target = target;
    this._fields = fields;
  }

  /** Returns the entity constructor this index is associated with. */
  get target(): Constructor {
    return this._target;
  }

  /** Return the fields involved in the compound index. */
  get fields(): string[] {
    return this._fields;
  }
}
