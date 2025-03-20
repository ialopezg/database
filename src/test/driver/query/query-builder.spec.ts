import { QueryBuilder } from '../../../driver';

describe('QueryBuilder', () => {
  describe('select', () => {
    it('should set columns when passed', () => {
      const query = new QueryBuilder().select('id').from('users');
      expect(query.getQuery()).toEqual('SELECT id FROM users');
    });

    it('should support multiple columns', () => {
      const query = new QueryBuilder().select('id', 'name').from('users');
      expect(query.getQuery()).toEqual('SELECT id, name FROM users');
    });

    it('should default to * when no columns are specified', () => {
      const query = new QueryBuilder().from('users');
      expect(query.getQuery()).toEqual('SELECT * FROM users');
    });

    describe('addColumns', () => {
      it('should add a single column to the existing selection', () => {
        const query = new QueryBuilder().select('id').from('users').addColumns('name');
        expect(query.getQuery()).toEqual('SELECT id, name FROM users');
      });

      it('should add multiple columns to the existing selection', () => {
        const query = new QueryBuilder().select('id').from('users').addColumns('name', 'email');
        expect(query.getQuery()).toEqual('SELECT id, name, email FROM users');
      });

      it('should not add duplicate columns', () => {
        const query = new QueryBuilder().select('id').from('users').addColumns('id');
        expect(query.getQuery()).toEqual('SELECT id FROM users');
      });

      it('should work when addColumns is called before from', () => {
        const query = new QueryBuilder().addColumns('id').from('users');
        expect(query.getQuery()).toEqual('SELECT id FROM users');
      });

      it('should handle multiple calls to addColumns correctly', () => {
        const query = new QueryBuilder().select('id').from('users').addColumns('name').addColumns('email');
        expect(query.getQuery()).toEqual('SELECT id, name, email FROM users');
      });

      it('should throw an error if no from() is called', () => {
        const query = new QueryBuilder().addColumns('id');
        expect(() => query.getQuery()).toThrow('Table name must be specified using from()');
      });
    });
  });

  describe('from', () => {
    it('should set the table name', () => {
      const query = new QueryBuilder().select('id').from('users');
      expect(query.getQuery()).toEqual('SELECT id FROM users');
    });

    it('should set the table alias', () => {
      const query = new QueryBuilder().select('id').from('users', 'u');
      expect(query.getQuery()).toEqual('SELECT id FROM users u');
    });

    it('should throw an error if from() is not called', () => {
      const query = new QueryBuilder().select('id');
      expect(() => query.getQuery()).toThrow('Table name must be specified using from()');
    });
  });

  describe('where conditions', () => {
    it('should add a simple where condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1');
      expect(query.getQuery()).toEqual('SELECT id FROM users WHERE id = 1');
    });

    it('should add an andWhere condition', () => {
      const query = new QueryBuilder()
        .select('id')
        .from('users')
        .where('id = 1')
        .andWhere('name = "John"');
      expect(query.getQuery()).toEqual('SELECT id FROM users WHERE id = 1 AND name = "John"');
    });

    it('should add an orWhere condition', () => {
      const query = new QueryBuilder()
        .select('id')
        .from('users')
        .where('id = 1')
        .orWhere('name = "John"');
      expect(query.getQuery()).toEqual('SELECT id FROM users WHERE id = 1 OR name = "John"');
    });

    it('should handle multiple where conditions correctly', () => {
      const query = new QueryBuilder()
        .select('id')
        .from('users')
        .where('id = 1')
        .andWhere('status = "active"')
        .orWhere('role = "admin"');
      expect(query.getQuery()).toEqual('SELECT id FROM users WHERE id = 1 AND status = "active" OR role = "admin"');
    });

    it('should ignore empty where conditions', () => {
      const query = new QueryBuilder().select('id').from('users').where('');
      expect(query.getQuery()).toEqual('SELECT id FROM users');
    });
  });
});

describe('QueryBuilder with Entity', () => {
  class User {
    id!: number;
    name!: string;
  }

  const tableNameResolver = (entity: Function) => entity.name.toLowerCase();

  it('should resolve table name using QueryBuilder', () => {
    const queryBuilder = new QueryBuilder(tableNameResolver);
    queryBuilder.from(User);

    expect(queryBuilder.getQuery()).toEqual('SELECT * FROM user');
  });

  it('should support table aliasing', () => {
    const queryBuilder = new QueryBuilder(tableNameResolver);
    queryBuilder.from(User, 'u');

    expect(queryBuilder.getQuery()).toEqual('SELECT * FROM user u');
  });

  it('should generate a valid query with selected columns', () => {
    const queryBuilder = new QueryBuilder(tableNameResolver)
      .select('id', 'name')
      .from(User);

    expect(queryBuilder.getQuery()).toEqual('SELECT id, name FROM user');
  });

  it('should generate a query with WHERE condition', () => {
    const queryBuilder = new QueryBuilder(tableNameResolver)
      .select('id', 'name')
      .from(User)
      .where('id = 1');

    expect(queryBuilder.getQuery()).toEqual('SELECT id, name FROM user WHERE id = 1');
  });

  it('should generate a query with multiple WHERE conditions', () => {
    const queryBuilder = new QueryBuilder(tableNameResolver)
      .select('id', 'name')
      .from(User)
      .where('id = 1')
      .andWhere('name = "John"');

    expect(queryBuilder.getQuery()).toEqual('SELECT id, name FROM user WHERE id = 1 AND name = "John"');
  });

  describe('Handling missing table name resolver function', () => {
    it('should throw an error when using an entity without a resolver function', () => {
      const queryBuilder = new QueryBuilder();

      expect(() => queryBuilder.from(User).getQuery()).toThrow(
        'getTableNameCallback is required to resolve entity names',
      );
    });

    it('should throw an error when resolver function is undefined', () => {
      const queryBuilder = new QueryBuilder(undefined);

      expect(() => queryBuilder.from(User).getQuery()).toThrow(
        'getTableNameCallback is required to resolve entity names',
      );
    });

    it('should throw an error when resolver function is null', () => {
      const queryBuilder = new QueryBuilder(null as unknown as (entity: Function) => string);

      expect(() => queryBuilder.from(User).getQuery()).toThrow(
        'getTableNameCallback is required to resolve entity names',
      );
    });
  });
});
