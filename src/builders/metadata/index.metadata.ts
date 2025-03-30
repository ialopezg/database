import { Constructor } from '../../types';
import { PropertyMetadata } from './property.metadata';

/**
 * Represents metadata for a database index on an entity property.
 *
 * This metadata is used to describe index definitions at the property level,
 * including custom naming strategies and decorators.
 *
 * @category Metadata
 * @extends PropertyMetadata
 */
export class IndexMetadata extends PropertyMetadata {
  /**
   * The name of the index. If not provided explicitly, a default
   * naming strategy may be used during schema generation.
   */
  name!: string;

  constructor() {
    super({} as Constructor, '');
  }
}
