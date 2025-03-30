import { RELATION_TYPES, RelationOptions } from '../../../builders/metadata/relation';
import { EntityMetadata, RelationMetadata } from '../../../builders/metadata';
import { NamingStrategy } from '../../../strategies';

describe('RelationMetadata', () => {
  const DummyTarget = function () {};
  const propertyName = 'profile';
  const relatedFn = () => class RelatedEntity {};
  const relatedPropFn = () => 'user';

  const defaultOptions: RelationOptions = {
    isCascadeInsert: true,
    isCascadeRemove: true,
    isCascadeUpdate: false,
    isAlwaysInnerJoin: true,
    isAlwaysLeftJoin: false,
    isNullable: false,
    oldColumnName: 'previous_profile',
    name: 'custom_profile'
  };

  it('should construct with defaults', () => {
    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.OneToMany,
      relatedFn,
      relatedPropFn,
      true
    );

    expect(metadata.name).toBe(propertyName);
    expect(metadata.isCascadeInsert).toBe(false);
    expect(metadata.isCascadeRemove).toBe(false);
    expect(metadata.isCascadeUpdate).toBe(false);
    expect(metadata.isAlwaysInnerJoin).toBe(false);
    expect(metadata.isAlwaysLeftJoin).toBe(false);
    expect(metadata.isNullable).toBe(true);
    expect(metadata.oldColumnName).toBe('');
    expect(metadata.isOwner).toBe(true);
  });

  it('should apply full options correctly', () => {
    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.ManyToOne,
      relatedFn,
      relatedPropFn,
      false,
      defaultOptions
    );

    expect(metadata.name).toBe('custom_profile');
    expect(metadata.isCascadeInsert).toBe(true);
    expect(metadata.isCascadeRemove).toBe(true);
    expect(metadata.isCascadeUpdate).toBe(false);
    expect(metadata.isAlwaysInnerJoin).toBe(true);
    expect(metadata.isAlwaysLeftJoin).toBe(false);
    expect(metadata.isNullable).toBe(false);
    expect(metadata.oldColumnName).toBe('previous_profile');
    expect(metadata.isOwner).toBe(false);
  });

  it('should apply naming strategy if provided', () => {
    const mockStrategy: NamingStrategy = {
      relationName: jest.fn((name) => `ns_${name}`)
    } as any;

    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.OneToOne,
      relatedFn,
      relatedPropFn,
      true
    );

    metadata.namingStrategy = mockStrategy;

    expect(metadata.name).toBe('ns_profile');
    expect(mockStrategy.relationName).toHaveBeenCalledWith('profile');
  });

  it('should resolve relatedPropertyName using a function', () => {
    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.OneToMany,
      relatedFn,
      (_: any) => 'user',
      true
    );

    metadata.ownerProperties = { user: 'value' };

    expect(metadata.relatedPropertyName).toBe('user');
  });

  it('should resolve relatedPropertyName using a string', () => {
    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.OneToMany,
      relatedFn,
      'user',
      true
    );

    expect(metadata.relatedPropertyName).toBe('user');
  });

  it('should assign and retrieve relatedEntity', () => {
    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.ManyToMany,
      relatedFn,
      'user',
      true
    );

    const related = new EntityMetadata();
    metadata.relatedEntity = related;

    expect(metadata.relatedEntity).toBe(related);
  });

  it('should reflect correct relation type flags', () => {
    const oneToOne = new RelationMetadata(DummyTarget, propertyName, RELATION_TYPES.OneToOne, relatedFn, 'a', true);
    const oneToMany = new RelationMetadata(DummyTarget, propertyName, RELATION_TYPES.OneToMany, relatedFn, 'a', true);
    const manyToOne = new RelationMetadata(DummyTarget, propertyName, RELATION_TYPES.ManyToOne, relatedFn, 'a', true);
    const manyToMany = new RelationMetadata(DummyTarget, propertyName, RELATION_TYPES.ManyToMany, relatedFn, 'a', true);

    expect(oneToOne.isOneToOne).toBe(true);
    expect(oneToMany.isOneToMany).toBe(true);
    expect(manyToOne.isManyToOne).toBe(true);
    expect(manyToMany.isManyToMany).toBe(true);
  });

  it('should return the original related entity resolver', () => {
    const resolver = () => class Post {};
    const metadata = new RelationMetadata(
      DummyTarget,
      propertyName,
      RELATION_TYPES.OneToMany,
      resolver,
      'author',
      true
    );

    expect(metadata.related).toBe(resolver);
  });

  describe('relation type', () => {
    it('should return correct raw relation type', () => {
      const metadata = new RelationMetadata(
        DummyTarget,
        propertyName,
        RELATION_TYPES.OneToOne,
        relatedFn,
        'author',
        true
      );

      expect(metadata.type).toBe(RELATION_TYPES.OneToOne);
    });
  });
});
