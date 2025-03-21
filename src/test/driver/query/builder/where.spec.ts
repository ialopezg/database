import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - Where Conditions', () => {
  test('should generate WHERE condition query', () => {
    const query = new QueryBuilder().select('id').from('users').where('id = 1');
    expect(query.getQuery()).toBe('SELECT id FROM users WHERE id = 1');
  });

  test('should generate AND WHERE condition query', () => {
    const query = new QueryBuilder().select('id').from('users').where('id = 1').andWhere('name = "John"');
    expect(query.getQuery()).toBe('SELECT id FROM users WHERE id = 1 AND name = "John"');
  });

  test('should generate OR WHERE condition query', () => {
    const query = new QueryBuilder().select('id').from('users').where('id = 1').orWhere('name = "John"');
    expect(query.getQuery()).toBe('SELECT id FROM users WHERE id = 1 OR name = "John"');
  });

  test('should throw an error if WHERE called with empty string', () => {
    const queryBuilder = new QueryBuilder().select('id').from('users');

    expect(() => queryBuilder.where('')).toThrow('WHERE condition cannot be empty');
  });
});
