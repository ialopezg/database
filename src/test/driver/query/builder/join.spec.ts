import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - Joins', () => {
  test('should generate INNER JOIN query', () => {
    const query = new QueryBuilder().select('id').from('users').innerJoin('products', 'p', 'ON', 'users.id = products.user_id');
    expect(query.getQuery()).toBe('SELECT id FROM users INNER JOIN products p ON users.id = products.user_id');
  });

  test('should generate LEFT JOIN query', () => {
    const query = new QueryBuilder().select('id').from('users').leftJoin('products', 'p', 'ON', 'users.id = products.user_id');
    expect(query.getQuery()).toBe('SELECT id FROM users LEFT JOIN products p ON users.id = products.user_id');
  });

  test('should generate RIGHT JOIN query', () => {
    const query = new QueryBuilder().select('id').from('users').rightJoin('products', 'p', 'ON', 'users.id = products.user_id');
    expect(query.getQuery()).toBe('SELECT id FROM users RIGHT JOIN products p ON users.id = products.user_id');
  });

  test('should generate CROSS JOIN query', () => {
    const query = new QueryBuilder().select('id').from('users').crossJoin('products');
    expect(query.getQuery()).toBe('SELECT id FROM users CROSS JOIN products');
  });

  test('should generate NATURAL JOIN query', () => {
    const query = new QueryBuilder().select('id').from('users').naturalJoin('products');
    expect(query.getQuery()).toBe('SELECT id FROM users NATURAL JOIN products');
  });
});
