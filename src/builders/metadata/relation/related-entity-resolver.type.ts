import { Constructor } from '../../../types';

/**
 * A function that returns the constructor of the related entity.
 *
 * Used to define the target entity in relationships.
 *
 * @template T - The related entity type.
 */
export type RelatedEntityResolver<T = any> = () => Constructor<T>;
