/**
 * Configuration options for defining a relationship between entities.
 */
export interface RelationOptions {
  /**
   * Custom name to use for the relation.
   *
   * @type {string}
   * @default ""
   */
  name?: string;

  /**
   * Whether to cascade insert operations to related entities.
   *
   * @type {boolean}
   * @default false
   */
  isCascadeInsert?: boolean;

  /**
   * Whether to cascade update operations to related entities.
   *
   * @type {boolean}
   * @default false
   */
  isCascadeUpdate?: boolean;

  /**
   * Whether to cascade remove operations to related entities.
   *
   * @type {boolean}
   * @default false
   */
  isCascadeRemove?: boolean;

  /**
   * Whether to always use LEFT JOIN when querying this relation.
   *
   * @type {boolean}
   * @default false
   */
  isAlwaysLeftJoin?: boolean;

  /**
   * Whether to always use INNER JOIN when querying this relation.
   *
   * @type {boolean}
   * @default false
   */
  isAlwaysInnerJoin?: boolean;

  /**
   * Previous column name, useful for rename tracking or migrations.
   *
   * @type {string}
   * @default ""
   */
  oldColumnName?: string;

  /**
   * Whether the column is allowed to have null values.
   *
   * @type {boolean}
   * @default true
   */
  isNullable?: boolean;
}
