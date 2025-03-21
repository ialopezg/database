import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - GROUP BY', () => {
  let qb: QueryBuilder;

  beforeEach(() => {
    qb = new QueryBuilder();
  });

  test('should generate a GROUP BY clause with one column', () => {
    const query = qb.select('category').from('products').groupBy('category').getQuery();
    expect(query).toContain('GROUP BY category');
  });

  test('should generate a GROUP BY clause with multiple columns', () => {
    const query = qb
      .select('category', 'brand')
      .from('products')
      .groupBy('category', 'brand')
      .getQuery();

    expect(query).toContain('GROUP BY category, brand');
  });

  test('should append additional GROUP BY columns using addGroupBy', () => {
    const query = qb
      .select('category', 'brand')
      .from('products')
      .groupBy('category')
      .addGroupBy('brand')
      .getQuery();

    expect(query).toContain('GROUP BY category, brand');
  });

  test('should allow aggregate functions without being in GROUP BY', () => {
    const query = qb
      .select('category', 'SUM(price)')
      .from('products')
      .groupBy('category')
      .getQuery();

    expect(query).toContain('GROUP BY category');
    expect(query).toContain('SUM(price)');
  });

  test('should throw error if non-aggregated column is missing from GROUP BY', () => {
    qb.select('category', 'price', 'SUM(price)').from('products').groupBy('category');

    expect(() => qb.getQuery()).toThrowError(
      'Column "price" must be included in GROUP BY clause or used in an aggregate function.',
    );
  });

  test('should not throw error if all selected columns are aggregated or in GROUP BY', () => {
    const query = qb
      .select('category', 'SUM(price)', 'AVG(price)')
      .from('products')
      .groupBy('category')
      .getQuery();

    expect(query).toContain('GROUP BY category');
  });

  test('should allow adding GROUP BY even if none were initially set', () => {
    const query = qb.select('category').from('products').addGroupBy('category').getQuery();
    expect(query).toContain('GROUP BY category');
  });

  test('should not duplicate columns in GROUP BY', () => {
    const query = qb
      .select('category', 'brand')
      .from('products')
      .groupBy('category', 'brand')
      .addGroupBy('category')
      .getQuery();

    expect(query).toContain('GROUP BY category, brand'); // No duplicate "category"
  });

  test('should allow chaining addGroupBy multiple times', () => {
    const query = qb
      .select('category', 'brand', 'supplier')
      .from('products')
      .groupBy('category')
      .addGroupBy('brand')
      .addGroupBy('supplier')
      .getQuery();

    expect(query).toContain('GROUP BY category, brand, supplier');
  });
});
