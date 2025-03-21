import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - orderBy', () => {
  test('should generate ORDER BY query', () => {
    const query = new QueryBuilder().select('id').from('users').orderBy('name');
    expect(query.getQuery()).toBe('SELECT id FROM users ORDER BY name ASC');
  });

  test('should generate ORDER BY query with DESC sorting', () => {
    const query = new QueryBuilder().select('id').from('users').orderBy('name', 'DESC');
    expect(query.getQuery()).toBe('SELECT id FROM users ORDER BY name DESC');
  });

  test('should generate ORDER BY with multiple columns', () => {
    const query = new QueryBuilder().select('id').from('users').orderBy('name').addOrderBy('age');
    expect(query.getQuery()).toBe('SELECT id FROM users ORDER BY name ASC, age ASC');
  });
});

describe('QueryBuilder- addOrderBy', () => {
  it('should add an additional sorting condition without replacing existing ones', () => {
    const queryBuilder = new QueryBuilder().orderBy('name', 'ASC');
    const query = queryBuilder.addOrderBy('id', 'DESC');

    expect(query['sorting']).toEqual([
      { column: 'name', order: 'ASC' },
      { column: 'id', order: 'DESC' }
    ]);
  });

  it('should not add duplicate sorting conditions for the same column', () => {
    const queryBuilder = new QueryBuilder().orderBy('name', 'ASC');
    const query = queryBuilder.addOrderBy('name', 'DESC');

    expect(query['sorting']).toEqual([{ column: 'name', order: 'ASC' }]);
  });
});
