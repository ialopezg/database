import { CompoundIndexMetadata } from '../../../builders/metadata';

class TestEntity {}

describe('CompoundIndexMetadata', () => {
  it('should store target and fields correctly', () => {
    const metadata = new CompoundIndexMetadata(TestEntity, ['firstName', 'lastName']);

    expect(metadata.target).toBe(TestEntity);
    expect(metadata.fields).toEqual(['firstName', 'lastName']);
  });

  it('should throw if target is not a constructor', () => {
    expect(() => new CompoundIndexMetadata({} as any, ['field'])).toThrow(
      'CompoundIndexMetadata requires a valid constructor function as target.'
    );
  });

  it('should throw if fields is an empty array', () => {
    expect(() => new CompoundIndexMetadata(TestEntity, [])).toThrow(
      'CompoundIndexMetadata requires a non-empty array of field names (strings).'
    );
  });

  it('should throw if fields is not an array', () => {
    expect(() => new CompoundIndexMetadata(TestEntity, 'not-an-array' as any)).toThrow(
      'CompoundIndexMetadata requires a non-empty array of field names (strings).'
    );
  });
});
