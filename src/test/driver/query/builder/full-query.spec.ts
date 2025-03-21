import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - Full Query', () => {
  test('should generate a full query with multiple joins, where, order by, limit, and offset', () => {
    const query = new QueryBuilder()
      .select('id', 'name')
      .from('users', 'u')
      .innerJoin('orders', 'o', 'ON', 'u.id = o.user_id')
      .leftJoin('products', 'p', 'ON', 'o.product_id = p.id')
      .where('u.id = 1')
      .andWhere('p.name = "Laptop"')
      .orderBy('u.name')
      .setLimit(10)
      .setOffset(5);
    expect(query.getQuery()).toBe(
      `SELECT id, name FROM users u INNER JOIN orders o ON u.id = o.user_id LEFT JOIN products p ON o.product_id = p.id WHERE u.id = 1 AND p.name = "Laptop" ORDER BY u.name ASC LIMIT 10 OFFSET 5`
    );
  });
});
