import { QueryBuilder } from '../../../../driver';

describe('FROM Clause', () => {
  it('should generate FROM clause correctly', () => {
    const query = new QueryBuilder().select('id').from('users', 'u').getQuery();
    expect(query).toBe('SELECT id FROM users u');
  });

  it('should throw an error if no entity is provided', () => {
    const queryBuilder = new QueryBuilder();

    // Test for no entity
    expect(() => {
      queryBuilder.from('');
    }).toThrow('FROM clause requires a valid table name or entity');

    // Test for null entity
    expect(() => {
      queryBuilder.from(null as any); // null as an invalid entity type
    }).toThrow('FROM clause requires a valid table name or entity');

    // Test for undefined entity
    expect(() => {
      queryBuilder.from(undefined as any); // undefined as an invalid entity type
    }).toThrow('FROM clause requires a valid table name or entity');
  });

  it('should not throw an error if a valid entity is provided', () => {
    const queryBuilder = new QueryBuilder();

    // Test with a valid string entity
    expect(() => {
      queryBuilder.from('users');
    }).not.toThrow();

    // Test with a valid function entity
    const UserEntity = class {
    };
    expect(() => {
      queryBuilder.from(UserEntity);
    }).not.toThrow();
  });
});
