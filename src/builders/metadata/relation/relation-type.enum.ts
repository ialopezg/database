/**
 * Constants representing all valid relation types.
 *
 * These are used to declare how two entities are related.
 */
export const RELATION_TYPES = {
  OneToOne: 'one-to-one',
  OneToMany: 'one-to-many',
  ManyToOne: 'many-to-one',
  ManyToMany: 'many-to-many',
} as const;

/**
 * Type representing all possible relation type values.
 */
export type RelationType = (typeof RELATION_TYPES)[keyof typeof RELATION_TYPES];
