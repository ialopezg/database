import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - Having Conditions', () => {
  test('should generate HAVING condition query', () => {
    const query = new QueryBuilder()
      .select('category_name', 'COUNT(category_name) AS counter')
      .from('users').groupBy('category_name')
      .having('COUNT(category_name) >= 2');

    expect(
      query.getQuery()
    ).toBe('SELECT category_name, COUNT(category_name) AS counter FROM users GROUP BY category_name HAVING COUNT(category_name) >= 2');
  });

  test('should generate AND HAVING condition query', () => {
    const query = new QueryBuilder()
      .select('order_id', 'product_item', 'SUM(order_qty) AS qty, AVG(order_price) AS price')
      .from('users')
      .groupBy('order_id', 'product_item')
      .having('SUM(order_qty) >= 2')
      .andHaving('AVG(order_price) > 10');

    expect(query.getQuery()).toContain('HAVING SUM(order_qty) >= 2 AND AVG(order_price) > 10');
  });

  test('should generate OR HAVING condition query', () => {
    const query = new QueryBuilder()
      .select('order_id', 'product_item', 'SUM(order_qty) AS qty, AVG(order_price) AS price')
      .from('users')
      .groupBy('order_id', 'product_item')
      .having('SUM(order_qty) >= 2')
      .orHaving('AVG(order_price) > 10');

    expect(query.getQuery()).toContain('HAVING SUM(order_qty) >= 2 OR AVG(order_price) > 10');
  });

  test('should throw an error if HAVING called with empty string', () => {
    const queryBuilder = new QueryBuilder().select('id').from('users');

    expect(() => queryBuilder.having('')).toThrow('HAVING condition cannot be empty');
  });
});
