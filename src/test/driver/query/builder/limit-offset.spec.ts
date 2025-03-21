import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - Limit and Offset', () => {
  test('should generate query with LIMIT', () => {
    const query = new QueryBuilder().select('id').from('users').setLimit(10);
    expect(query.getQuery()).toBe('SELECT id FROM users LIMIT 10');
  });

  test('should generate query with OFFSET', () => {
    const query = new QueryBuilder().select('id').from('users').setOffset(5);
    expect(query.getQuery()).toBe('SELECT id FROM users OFFSET 5');
  });

  test('should generate query with both LIMIT and OFFSET', () => {
    const query = new QueryBuilder().select('id').from('users').setLimit(10).setOffset(5);
    expect(query.getQuery()).toBe('SELECT id FROM users LIMIT 10 OFFSET 5');
  });
});
