import { QueryBuilder } from '../../../../driver';

describe('QueryBuilder - Select', () => {
  describe('select', () => {
    test('should generate a SELECT query with one column', () => {
      const query = new QueryBuilder().select('id').from('users');
      expect(query.getQuery()).toBe('SELECT id FROM users');
    });

    test('should generate a SELECT query with multiple columns', () => {
      const query = new QueryBuilder().select('id', 'name').from('users');
      expect(query.getQuery()).toBe('SELECT id, name FROM users');
    });

    test('should handle adding columns without duplicates', () => {
      const query = new QueryBuilder().select('id').from('users').addColumns('name', 'id');
      expect(query.getQuery()).toBe('SELECT id, name FROM users');
    });
  });

  describe('addColumns', () => {
    it('should throw an error if FROM is not called before generating the query', () => {
      const queryBuilder = new QueryBuilder();
      expect(() => queryBuilder.getQuery()).toThrow('FROM clause must be defined before generating the query');
    });

    it('should add new columns without duplicates', () => {
      const query = new QueryBuilder().select('id').from('users').addColumns('name', 'email', 'id');
      expect(query.getQuery()).toBe('SELECT id, name, email FROM users');
    });

    it('should maintain existing columns and not add duplicates', () => {
      const query = new QueryBuilder().select('id', 'name').from('users').addColumns('name', 'email');
      expect(query.getQuery()).toBe('SELECT id, name, email FROM users');
    });

    it('should not break when called with no arguments', () => {
      const query = new QueryBuilder().select('id').from('users').addColumns();
      expect(query.getQuery()).toBe('SELECT id FROM users');
    });
  });
});
