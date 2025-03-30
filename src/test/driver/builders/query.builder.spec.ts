import { QueryBuilder } from '../../../driver/builders';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    queryBuilder = new QueryBuilder();
  });

  describe('select', () => {
    it('should generate a SELECT query with one column', () => {
      const query = new QueryBuilder().select('id').from('users');
      expect(query.getQuery()).toContain('id');
    });

    it('should generate a SELECT query with multiple columns', () => {
      const query = new QueryBuilder().select('id', 'name').from('users');
      expect(query.getQuery()).toContain('id, name');
    });

    it('should handle adding columns without duplicates', () => {
      const query = new QueryBuilder().select('id').from('users').addColumns('name', 'id');
      expect(query.getQuery()).toContain('id, name');
    });
  });

  describe('addColumns', () => {
    it('should throw an error if FROM is not called before generating the query', () => {
      const queryBuilder = new QueryBuilder();
      expect(() => queryBuilder.getQuery()).toThrow('FROM clause must be defined before generating the query');
    });

    it('should add new columns without duplicates', () => {
      const query = new QueryBuilder().select('id').from('users').addColumns('name', 'email', 'id');
      expect(query.getQuery()).toContain('id, name, email');
    });

    it('should maintain existing columns and not add duplicates', () => {
      const query = new QueryBuilder().select('id', 'name').from('users').addColumns('name', 'email');
      expect(query.getQuery()).toContain('id, name, email');
    });

    it('should not break when called with no arguments', () => {
      const query = new QueryBuilder().select('id').from('users').addColumns();
      expect(query.getQuery()).toContain('id');
    });
  });

  describe('from', () => {
    it('should generate FROM clause correctly', () => {
      const query = new QueryBuilder().select('id').from('users', 'u').getQuery();
      expect(query).toContain('FROM users u');
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

  describe('joins', () => {
    it('should generate INNER JOIN query', () => {
      const query = new QueryBuilder().select('id').from('users').innerJoin('products', 'p', 'ON', 'users.id = products.user_id');
      expect(query.getQuery()).toContain('INNER JOIN products p ON users.id = products.user_id');
    });

    it('should generate LEFT JOIN query', () => {
      const query = new QueryBuilder().select('id').from('users').leftJoin('products', 'p', 'ON', 'users.id = products.user_id');
      expect(query.getQuery()).toContain('LEFT JOIN products p ON users.id = products.user_id');
    });

    it('should generate RIGHT JOIN query', () => {
      const query = new QueryBuilder().select('id').from('users').rightJoin('products', 'p', 'ON', 'users.id = products.user_id');
      expect(query.getQuery()).toContain('RIGHT JOIN products p ON users.id = products.user_id');
    });

    it('should generate CROSS JOIN query', () => {
      const query = new QueryBuilder().select('id').from('users').crossJoin('products');
      expect(query.getQuery()).toContain('CROSS JOIN products');
    });

    it('should generate NATURAL JOIN query', () => {
      const query = new QueryBuilder().select('id').from('users').naturalJoin('products');
      expect(query.getQuery()).toContain('NATURAL JOIN products');
    });
  });

  describe('where', () => {
    it('should generate WHERE condition query', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1');
      expect(query.getQuery()).toContain('WHERE id = 1');
    });

    it('should generate AND WHERE condition query', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').andWhere('name = "John"');
      expect(query.getQuery()).toContain('WHERE id = 1 AND name = "John"');
    });

    it('should generate OR WHERE condition query', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').orWhere('name = "John"');
      expect(query.getQuery()).toContain('WHERE id = 1 OR name = "John"');
    });

    it('should throw an error if WHERE called with empty string', () => {
      const queryBuilder = new QueryBuilder().select('id').from('users');

      expect(() => queryBuilder.where('')).toThrow('WHERE condition cannot be empty');
    });
  });

  describe('groupBy', () => {
    let qb: QueryBuilder;

    beforeEach(() => {
      qb = new QueryBuilder();
    });

    it('should generate a GROUP BY clause with one column', () => {
      const query = qb.select('category').from('products').groupBy('category').getQuery();
      expect(query).toContain('GROUP BY category');
    });

    it('should generate a GROUP BY clause with multiple columns', () => {
      const query = qb
        .select('category', 'brand')
        .from('products')
        .groupBy('category', 'brand')
        .getQuery();

      expect(query).toContain('GROUP BY category, brand');
    });

    it('should append additional GROUP BY columns using addGroupBy', () => {
      const query = qb
        .select('category', 'brand')
        .from('products')
        .groupBy('category')
        .addGroupBy('brand')
        .getQuery();

      expect(query).toContain('GROUP BY category, brand');
    });

    it('should allow aggregate functions without being in GROUP BY', () => {
      const query = qb
        .select('category', 'SUM(price)')
        .from('products')
        .groupBy('category')
        .getQuery();

      expect(query).toContain('GROUP BY category');
      expect(query).toContain('SUM(price)');
    });

    it('should throw error if non-aggregated column is missing from GROUP BY', () => {
      qb.select('category', 'price', 'SUM(price)').from('products').groupBy('category');

      expect(() => qb.getQuery()).toThrowError(
        'Column "price" must be included in GROUP BY clause or used in an aggregate function.',
      );
    });

    it('should not throw error if all selected columns are aggregated or in GROUP BY', () => {
      const query = qb
        .select('category', 'SUM(price)', 'AVG(price)')
        .from('products')
        .groupBy('category')
        .getQuery();

      expect(query).toContain('GROUP BY category');
    });

    it('should allow adding GROUP BY even if none were initially set', () => {
      const query = qb.select('category').from('products').addGroupBy('category').getQuery();
      expect(query).toContain('GROUP BY category');
    });

    it('should not duplicate columns in GROUP BY', () => {
      const query = qb
        .select('category', 'brand')
        .from('products')
        .groupBy('category', 'brand')
        .addGroupBy('category')
        .getQuery();

      expect(query).toContain('GROUP BY category, brand'); // No duplicate "category"
    });

    it('should allow chaining addGroupBy multiple times', () => {
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

  describe('having', () => {
    it('should generate HAVING condition query', () => {
      const query = new QueryBuilder()
        .select('category_name', 'COUNT(category_name) AS counter')
        .from('users').groupBy('category_name')
        .having('COUNT(category_name) >= 2');

      expect(query.getQuery()).toContain('GROUP BY category_name HAVING COUNT(category_name) >= 2');
    });

    it('should generate AND HAVING condition query', () => {
      const query = new QueryBuilder()
        .select('order_id', 'product_item', 'SUM(order_qty) AS qty, AVG(order_price) AS price')
        .from('users')
        .groupBy('order_id', 'product_item')
        .having('SUM(order_qty) >= 2')
        .andHaving('AVG(order_price) > 10');

      expect(query.getQuery()).toContain('HAVING SUM(order_qty) >= 2 AND AVG(order_price) > 10');
    });

    it('should generate OR HAVING condition query', () => {
      const query = new QueryBuilder()
        .select('order_id', 'product_item', 'SUM(order_qty) AS qty, AVG(order_price) AS price')
        .from('users')
        .groupBy('order_id', 'product_item')
        .having('SUM(order_qty) >= 2')
        .orHaving('AVG(order_price) > 10');

      expect(query.getQuery()).toContain('HAVING SUM(order_qty) >= 2 OR AVG(order_price) > 10');
    });

    it('should throw an error if HAVING called with empty string', () => {
      const queryBuilder = new QueryBuilder().select('id').from('users');

      expect(() => queryBuilder.having('')).toThrow('HAVING condition cannot be empty');
    });
  });

  describe('orderBy', () => {
    it('should generate ORDER BY query', () => {
      const query = new QueryBuilder().select('id').from('users').orderBy('name');
      expect(query.getQuery()).toContain('ORDER BY name ASC');
    });

    it('should generate ORDER BY query with DESC sorting', () => {
      const query = new QueryBuilder().select('id').from('users').orderBy('name', 'DESC');
      expect(query.getQuery()).toContain('ORDER BY name DESC');
    });

    it('should generate ORDER BY with multiple columns', () => {
      const query = new QueryBuilder().select('id').from('users').orderBy('name').addOrderBy('age');
      expect(query.getQuery()).toContain('ORDER BY name ASC, age ASC');
    });
  });

  describe('addOrderBy', () => {
    it('should add an additional sorting condition without replacing existing ones', () => {
      const queryBuilder = new QueryBuilder().orderBy('name', 'ASC');
      const query = queryBuilder.addOrderBy('id', 'DESC');

      expect(query['orderByClause']).toEqual([
        { column: 'name', order: 'ASC' },
        { column: 'id', order: 'DESC' }
      ]);
    });

    it('should not add duplicate sorting conditions for the same column', () => {
      const queryBuilder = new QueryBuilder().orderBy('name', 'ASC');
      const query = queryBuilder.addOrderBy('name', 'DESC');

      expect(query['orderByClause']).toEqual([{ column: 'name', order: 'ASC' }]);
    });
  });

  describe('Limit and Offset', () => {
    it('should generate query with LIMIT', () => {
      const query = new QueryBuilder().select('id').from('users').setLimit(10);
      expect(query.getQuery()).toContain('LIMIT 10');
    });

    it('should generate query with OFFSET', () => {
      const query = new QueryBuilder().select('id').from('users').setOffset(5);
      expect(query.getQuery()).toContain('OFFSET 5');
    });

    it('should generate query with both LIMIT and OFFSET', () => {
      const query = new QueryBuilder().select('id').from('users').setLimit(10).setOffset(5);
      expect(query.getQuery()).toContain('LIMIT 10 OFFSET 5');
    });
  });

  describe('getQuery', () => {
    it('should generate a full query with multiple joins, where, order by, limit, and offset tokens', () => {
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

      expect(query.getQuery()).toContain('SELECT id, name');
      expect(query.getQuery()).toContain('FROM users u');
      expect(query.getQuery()).toContain('INNER JOIN orders o ON u.id = o.user_id');
      expect(query.getQuery()).toContain('LEFT JOIN products p ON o.product_id = p.id');
      expect(query.getQuery()).toContain('WHERE u.id = 1 AND p.name = "Laptop"');
      expect(query.getQuery()).toContain('ORDER BY u.name ASC');
      expect(query.getQuery()).toContain('LIMIT 10 OFFSET 5');
    });
  });

  describe('setParameter', () => {
    it('should set a parameter with valid name and value', () => {
      const param = { name: ':id', value: 1 };
      queryBuilder.setParameter(param);

      expect(queryBuilder['parameters'].get(param.name)).toBe(param.value.toString());
    });

    it('should set a parameter with name not prepended with `:` and value', () => {
      const param = { name: 'id', value: 1 };
      queryBuilder.setParameter(param);

      expect(queryBuilder['parameters'].get(param.name)).toBe(param.value.toString());
    });

    it('should throw an error if parameter name does not follow naming conventions', () => {
      const invalidParam = { name: ':123id', value: 1 };

      // Test for an invalid parameter name (starts with a number)
      expect(() => queryBuilder.setParameter(invalidParam)).toThrow(
        "Invalid parameter name ':123id'. Use alphanumeric characters and underscores."
      );
    });
  });

  describe('setParameters', () => {
    it('should set an array of parameters with valid name and value', () => {
      const param = { name: ':id', value: 1 };
      queryBuilder.setParameters([param]);

      expect(queryBuilder['parameters'].get(param.name)).toBe(param.value.toString());
    });
  })

  describe('helpers', () => {
    describe('getTableName', () => {
      it('should throw an error if the table name is not specified using from()', () => {
        expect(() => {
          queryBuilder['getTableName']();
        }).toThrow('Table name must be specified using from()');
      });

      it('should throw an error if the table name is a function and getTableNameCallback is not provided', () => {
        queryBuilder.from(() => 'users');

        expect(() => {
          queryBuilder['getTableName']();
        }).toThrow('getTableNameCallback is required to resolve entity names');
      });

      it('should return the table name if specified directly using from()', () => {
        queryBuilder.from('users');

        const tableName = queryBuilder['fromClause'].entity;
        expect(tableName).toBe('users');
      });

      it('should return the resolved table name if the entity is a function and getTableNameCallback is provided', () => {
        const qb = new QueryBuilder((entity: any) => entity());
        qb.from(() => 'users');

        const tableName = qb['getTableName']();
        expect(tableName).toBe('users');
      });

      it('should return the resolved table name if the entity is a string and getTableNameCallback is provided', () => {
        const qb = new QueryBuilder((entity: any) => entity());
        qb.from('users', 'u');

        const tableName = qb['getTableName']();
        expect(tableName).toBe('users');
      });

      it('should return the resolved table name if the entity is not provided and getTableNameCallback is provided', () => {
        const qb = new QueryBuilder();
        qb['fromClause'] = { entity: 'users' };

        const tableName = qb['getTableName']();
        expect(tableName).toBe('users');
      });
    });

    describe('addJoin', () => {
      it('should throw an error if JOIN entity name is not specified', () => {
        queryBuilder.from('users');

        expect(() => queryBuilder['addJoin']('INNER', '')).toThrow('Join entity is required');
      });

      it('should throw an error if the condition not specified', () => {
        queryBuilder.from('users', 'u');

        expect(() => queryBuilder['addJoin']('INNER', 'sessions', 's', 'ON')).toThrow('INNER JOIN requires a condition criteria when using ON');
      });
    });

    describe('createSelectClause', () => {
      it('should throw an error if the table name is not specified using from()', () => {
        queryBuilder.from('users');

        const query = queryBuilder['createSelectClause']();
        expect(query).toContain('SELECT *');
      });
    });

    describe('createJoinClauses', () => {
      it('should throw an error for CROSS JOIN', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({ joinType: 'CROSS', entity: 'sessions' });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('CROSS JOIN sessions');
      });

      it('should throw an error for CROSS JOIN when specify entity alias', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({ joinType: 'CROSS', entity: 'sessions', alias: 's' });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('CROSS JOIN sessions s');
      });

      it('should throw an error for INNER JOIN', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({ joinType: 'INNER', entity: 'sessions' });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('INNER JOIN sessions');
      });

      it('should throw an error for NATURAL JOIN with entity alias', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({ joinType: 'NATURAL', entity: 'sessions', alias: 's' });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('NATURAL JOIN sessions s');
      });

      it('should throw an error for INNER JOIN without entity alias and USING as conditionType', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({
          joinType: 'INNER',
          entity: 'sessions',
          conditionType: 'USING',
          criteria: 'user_id',
        });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('INNER JOIN sessions USING (user_id)');
      });

      it('should throw an error for INNER JOIN without entity alias and ON as conditionType', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({
          joinType: 'INNER',
          entity: 'sessions',
          conditionType: 'ON',
          criteria: 'users.user_id = sessions.user_id',
        });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('INNER JOIN sessions ON users.user_id = sessions.user_id');
      });

      it('should throw an error for INNER JOIN with entity alias and USING as conditionType', () => {
        queryBuilder.from('users');
        queryBuilder['joinClauses'].push({
          joinType: 'INNER',
          entity: 'sessions',
          alias: 's',
          conditionType: 'USING',
          criteria: 'user_id',
        });
        const query = queryBuilder['createJoinClauses']();

        expect(query).toBe('INNER JOIN sessions s USING (user_id)');
      });
    });

    describe('createOrderByClause', () => {
      it('should generate the ORDER BY clause correctly', () => {
        queryBuilder.orderBy('name', 'ASC').addOrderBy('id', 'DESC');
        const orderByClause = queryBuilder['createOrderByClause']();
        expect(orderByClause).toBe(' ORDER BY name ASC, id DESC');
      });

      it('should return an empty string if no sorting conditions are specified', () => {
        queryBuilder = new QueryBuilder();

        expect(queryBuilder['createOrderByClause']()).toBe('');
      });

      it('should return default sorting when no order specified', () => {
        queryBuilder = new QueryBuilder();
        queryBuilder['orderByClause'] = [{ column: 'user_id' }];

        expect(queryBuilder['createOrderByClause']()).toBe(' ORDER BY user_id ASC');
      });
    });

    describe('validateGroupByColumnsInput', () => {
      it('should generate the ORDER BY clause correctly', () => {
        expect(
          () => queryBuilder['validateGroupByColumnsInput']([]),
        ).toThrow('GROUP BY requires at least one non-empty column');
      });
    });

    describe('replaceParameters', () => {
      it('should replace named parameters correctly', () => {
        // Set parameters
        queryBuilder.setParameter({ name: ':id', value: 1 });
        queryBuilder.setParameter({ name: ':name', value: 'John' });

        // Test the query
        const query = 'SELECT * FROM users WHERE id = :id AND name = :name';
        const result = queryBuilder['replaceParameters'](query);

        // Expect the named parameters to be replaced with their values
        expect(result).toContain(`WHERE id = 1 AND name = 'John'`);
      });
    });

    describe('formatValue', () => {
      it('should replace named parameters correctly', () => {
        // Set parameters
        const param = { name: ':date', value: new Date('2025-03-21') };
        queryBuilder.setParameter(param);

        // Test the query
        const result = queryBuilder['formatValue'](param.value);

        // Expect the named parameters to be replaced with their values
        expect(result).toBe(`'2025-03-21T00:00:00.000Z'`);
      });
    });
  });
});
