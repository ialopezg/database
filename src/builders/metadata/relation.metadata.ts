import { NamingStrategy } from '../../strategies';
import { EntityMetadata } from './entity.metadata';
import { PropertyMetadata } from './property.metadata';
import {
  PropertyResolver,
  RelatedEntityResolver,
  RELATION_TYPES,
  RelationOptions,
  RelationType,
} from './relation';

/**
 * Metadata that describes the relationship between two entities.
 *
 * @template T The expected entity type to relate to.
 */
export class RelationMetadata<T = any> extends PropertyMetadata {
  private readonly _name: string;
  private readonly _type: RelationType;
  private readonly _related: RelatedEntityResolver<T>;
  private readonly _relatedPropertyName: PropertyResolver<any>;
  private readonly _isOwner: boolean;

  private readonly _isCascadeInsert: boolean;
  private readonly _isCascadeRemove: boolean;
  private readonly _isCascadeUpdate: boolean;
  private readonly _isAlwaysInnerJoin: boolean;
  private readonly _isAlwaysLeftJoin: boolean;
  private readonly _isNullable: boolean;
  private readonly _oldColumnName: string;

  private _relatedEntity!: EntityMetadata;

  namingStrategy!: NamingStrategy;
  ownerProperties!: object;

  /**
   * Creates metadata for a relation between two entities.
   *
   * @param {Function} target - The class where the relation is declared.
   * @param {string} propertyName - The property name on the source entity.
   * @param {RelationType} type - The type of the relation.
   * @param {RelatedEntityResolver} related - Function that returns the related entity constructor.
   * @param {PropertyResolver<any>} relatedPropertyName - Inverse property reference or resolver.
   * @param {boolean} isOwner - Whether this side owns the relation.
   * @param {RelationOptions} [options={}] - Additional configuration options.
   */
  constructor(
    target: Function,
    propertyName: string,
    type: RelationType,
    related: RelatedEntityResolver<T>,
    relatedPropertyName: PropertyResolver<any>,
    isOwner: boolean,
    options: RelationOptions = {},
  ) {
    super(target, propertyName);

    this._type = type;
    this._related = related;
    this._relatedPropertyName = relatedPropertyName;
    this._isOwner = isOwner;

    this._name = options.name ?? propertyName;
    this._isCascadeInsert = options.isCascadeInsert ?? false;
    this._isCascadeRemove = options.isCascadeRemove ?? false;
    this._isCascadeUpdate = options.isCascadeUpdate ?? false;
    this._isAlwaysInnerJoin = options.isAlwaysInnerJoin ?? false;
    this._isAlwaysLeftJoin = options.isAlwaysLeftJoin ?? false;
    this._isNullable = options.isNullable ?? true;
    this._oldColumnName = options.oldColumnName ?? '';
  }

  /**
   * The resolved relation name, transformed by the naming strategy if provided.
   *
   * @type {string}
   */
  get name(): string {
    return this.namingStrategy ? this.namingStrategy.relationName(this._name) : this._name;
  }

  /**
   * The type of the relation.
   *
   * @type {RelationType}
   */
  get type(): RelationType {
    return this._type;
  }

  /**
   * The function that resolves the constructor of the related entity.
   *
   * @type {RelatedEntityResolver<T>}
   */
  get related(): RelatedEntityResolver<T> {
    return this._related;
  }

  /**
   * Inverse property name or resolver function.
   *
   * @type {PropertyResolver<any>}
   */
  get relatedPropertyName(): PropertyResolver<any> {
    return this.computeRelatedPropertyName(this._relatedPropertyName);
  }

  /**
   * The related entity’s metadata.
   *
   * @type {EntityMetadata}
   */
  get relatedEntity(): EntityMetadata {
    return this._relatedEntity;
  }

  set relatedEntity(value: EntityMetadata) {
    this._relatedEntity = value;
  }

  /**
   * Whether this side owns the relation (controls foreign keys, join columns).
   *
   * @type {boolean}
   * @default false
   */
  get isOwner(): boolean {
    return this._isOwner;
  }

  /**
   * Whether related entities are inserted automatically.
   *
   * @type {boolean}
   * @default false
   */
  get isCascadeInsert(): boolean {
    return this._isCascadeInsert;
  }

  /**
   * Whether related entities are removed automatically.
   *
   * @type {boolean}
   * @default false
   */
  get isCascadeRemove(): boolean {
    return this._isCascadeRemove;
  }

  /**
   * Whether related entities are updated automatically.
   *
   * @type {boolean}
   * @default false
   */
  get isCascadeUpdate(): boolean {
    return this._isCascadeUpdate;
  }

  /**
   * Whether INNER JOIN is enforced for this relation.
   *
   * @type {boolean}
   * @default false
   */
  get isAlwaysInnerJoin(): boolean {
    return this._isAlwaysInnerJoin;
  }

  /**
   * Whether LEFT JOIN is enforced for this relation.
   *
   * @type {boolean}
   * @default false
   */
  get isAlwaysLeftJoin(): boolean {
    return this._isAlwaysLeftJoin;
  }

  /**
   * Whether this relation can be null.
   *
   * @type {boolean}
   * @default true
   */
  get isNullable(): boolean {
    return this._isNullable;
  }

  /**
   * Name of the old column (used for rename tracking).
   *
   * @type {string}
   * @default ""
   */
  get oldColumnName(): string {
    return this._oldColumnName;
  }

  /**
   * Whether this is a one-to-one relation.
   *
   * @type {boolean}
   */
  get isOneToOne(): boolean {
    return this._type === RELATION_TYPES.OneToOne;
  }

  /**
   * Whether this is a one-to-many relation.
   *
   * @type {boolean}
   */
  get isOneToMany(): boolean {
    return this._type === RELATION_TYPES.OneToMany;
  }

  /**
   * Whether this is a many-to-one relation.
   *
   * @type {boolean}
   */
  get isManyToOne(): boolean {
    return this._type === RELATION_TYPES.ManyToOne;
  }

  /**
   * Whether this is a many-to-many relation.
   *
   * @type {boolean}
   */
  get isManyToMany(): boolean {
    return this._type === RELATION_TYPES.ManyToMany;
  }

  /**
   * Resolves the name of the property on the related entity.
   *
   * @private
   * @param {PropertyResolver<any>} resolver - The property resolver or string.
   * @returns {string} - The resolved property name.
   */
  private computeRelatedPropertyName(resolver: PropertyResolver<any>): string {
    return typeof resolver === 'function' ? resolver(this.ownerProperties) : resolver;
  }
}
