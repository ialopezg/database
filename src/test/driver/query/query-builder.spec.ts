import { QueryBuilder } from '../../../driver';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    queryBuilder = new QueryBuilder();
  });

  describe('SELECT Clause', () => {
    it('should generate SELECT query with specified columns', () => {
      const query = new QueryBuilder().select('id', 'name').from('users').getQuery();
      expect(query).toBe('SELECT id, name FROM users');
    });

    it('should default to SELECT * when no columns specified', () => {
      const query = new QueryBuilder().select().from('users').getQuery();
      expect(query).toBe('SELECT * FROM users');
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

  describe('FROM Clause', () => {
    it('should generate FROM clause correctly', () => {
      const query = new QueryBuilder().select('id').from('users', 'u').getQuery();
      expect(query).toBe('SELECT id FROM users u');
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

      const tableName = queryBuilder['fromBlock'].entity;
      expect(tableName).toBe('users');
    });

    it('should return the resolved table name if the entity is a function and getTableNameCallback is provided', () => {
      const qb = new QueryBuilder((entity: any) => entity())
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
      qb['fromBlock'] = { entity: 'users' };

      const tableName = qb['getTableName']();
      expect(tableName).toBe('users');
    });
  });

  describe('createJoinClauses', () => {
    it('should generate a correct CROSS JOIN clause without conditionType or criteria', () => {
      queryBuilder.from('users').crossJoin('sessions');

      const query = queryBuilder['createJoinClauses']();
      expect(query).toContain('CROSS JOIN sessions');
    });

    it('should throw an error for INNER JOIN when conditionType or criteria are missing', () => {
      queryBuilder.from('users');
      queryBuilder['joinBlocks'].push({ type: 'INNER', entity: 'sessions' })

      expect(() => {
        queryBuilder['createJoinClauses']();
      }).toThrow('INNER JOIN requires a condition type (ON or USING) and criteria');
    });
  });

  describe('JOINs', () => {
    describe('INNER', () => {
      it('should throw an error if no entity is provided', () => {
        expect(() => {
          queryBuilder.innerJoin('');
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.innerJoin(null as any); // null as an invalid entity type
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.innerJoin(undefined as any); // undefined as an invalid entity type
        }).toThrow('Join entity is required.');
      });

      it('should throw an error if conditionType or criteria is missing', () => {
        expect(() => {
          queryBuilder.innerJoin('products');
        }).toThrow('INNER JOIN requires a condition type (ON, USING, or NATURAL)');

        expect(() => {
          queryBuilder.innerJoin('products', 'p');
        }).toThrow('INNER JOIN requires a condition type (ON, USING, or NATURAL)');

        expect(() => {
          queryBuilder.innerJoin('products', 'p', 'ON');
        }).toThrow('INNER JOIN with ON requires criteria');
      });

      it('should not throw an error if valid parameters are provided', () => {
        const entity = 'products';
        const alias = 'p';
        const conditionType = 'ON';
        const criteria = 'users.id = products.user_id';

        expect(() => {
          queryBuilder.innerJoin(entity, alias, conditionType, criteria);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'INNER',
          entity: 'products',
          alias: 'p',
          conditionType: 'ON',
          criteria: 'users.id = products.user_id',
        });
      });

      it('should handle innerJoin with missing alias', () => {
        const entity = 'products';
        const conditionType = 'ON';
        const criteria = 'users.id = products.user_id';

        expect(() => {
          queryBuilder.innerJoin(entity, undefined, conditionType, criteria);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'INNER',
          entity: 'products',
          alias: undefined,
          conditionType: 'ON',
          criteria: 'users.id = products.user_id',
        });
      });

      it('should handle innerJoin with valid parameters and without alias', () => {
        const entity = 'products';
        const conditionType = 'USING';
        const criteria = '(id, user_id)';

        expect(() => {
          queryBuilder.innerJoin(entity, undefined, conditionType, criteria);
        }).not.toThrow();

        // Verify the join block
        const joinBlock = queryBuilder['joinBlocks'][0];
        expect(joinBlock).toEqual({
          type: 'INNER',
          entity: 'products',
          alias: undefined,
          conditionType: 'USING',
          criteria: '(id, user_id)',
        });
      });
    });

    describe('LEFT', () => {
      it('should throw an error if no entity is provided', () => {
        expect(() => {
          queryBuilder.leftJoin('');
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.leftJoin(null as any); // null as an invalid entity type
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.leftJoin(undefined as any); // undefined as an invalid entity type
        }).toThrow('Join entity is required.');
      });

      it('should throw an error if conditionType or criteria is missing', () => {
        expect(() => {
          queryBuilder.leftJoin('products');
        }).toThrow('LEFT JOIN requires a condition type (ON, USING, or NATURAL)');

        expect(() => {
          queryBuilder.leftJoin('products', 'p');
        }).toThrow('LEFT JOIN requires a condition type (ON, USING, or NATURAL)');

        expect(() => {
          queryBuilder.leftJoin('products', 'p', 'ON');
        }).toThrow('LEFT JOIN with ON requires criteria');
      });

      it('should not throw an error if valid parameters are provided', () => {
        const entity = 'products';
        const alias = 'p';
        const conditionType = 'ON';
        const criteria = 'users.id = products.user_id';

        expect(() => {
          queryBuilder.leftJoin(entity, alias, conditionType, criteria);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'LEFT',
          entity: 'products',
          alias: 'p',
          conditionType: 'ON',
          criteria: 'users.id = products.user_id',
        });
      });

      it('should handle leftJoin with missing alias', () => {
        const entity = 'products';
        const conditionType = 'ON';
        const criteria = 'users.id = products.user_id';

        expect(() => {
          queryBuilder.leftJoin(entity, undefined, conditionType, criteria);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'LEFT',
          entity: 'products',
          alias: undefined,
          conditionType: 'ON',
          criteria: 'users.id = products.user_id',
        });
      });

      it('should handle leftJoin with valid parameters and without alias', () => {
        const entity = 'products';
        const conditionType = 'USING';
        const criteria = '(id, user_id)';

        expect(() => {
          queryBuilder.leftJoin(entity, undefined, conditionType, criteria);
        }).not.toThrow();

        // Verify the join block
        const joinBlock = queryBuilder['joinBlocks'][0];
        expect(joinBlock).toEqual({
          type: 'LEFT',
          entity: 'products',
          alias: undefined,
          conditionType: 'USING',
          criteria: '(id, user_id)',
        });
      });
    });

    describe('RIGHT', () => {
      it('should throw an error if no entity is provided', () => {
        expect(() => {
          queryBuilder.rightJoin('');
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.rightJoin(null as any); // null as an invalid entity type
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.rightJoin(undefined as any); // undefined as an invalid entity type
        }).toThrow('Join entity is required.');
      });

      it('should throw an error if conditionType or criteria is missing', () => {
        expect(() => {
          queryBuilder.rightJoin('products');
        }).toThrow('RIGHT JOIN requires a condition type (ON, USING, or NATURAL)');

        expect(() => {
          queryBuilder.rightJoin('products', 'p');
        }).toThrow('RIGHT JOIN requires a condition type (ON, USING, or NATURAL)');

        expect(() => {
          queryBuilder.rightJoin('products', 'p', 'ON');
        }).toThrow('RIGHT JOIN with ON requires criteria');
      });

      it('should not throw an error if valid parameters are provided', () => {
        const entity = 'products';
        const alias = 'p';
        const conditionType = 'ON';
        const criteria = 'users.id = products.user_id';

        expect(() => {
          queryBuilder.rightJoin(entity, alias, conditionType, criteria);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'RIGHT',
          entity: 'products',
          alias: 'p',
          conditionType: 'ON',
          criteria: 'users.id = products.user_id',
        });
      });

      it('should handle rightJoin with missing alias', () => {
        const entity = 'products';
        const conditionType = 'ON';
        const criteria = 'users.id = products.user_id';

        expect(() => {
          queryBuilder.rightJoin(entity, undefined, conditionType, criteria);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'RIGHT',
          entity: 'products',
          alias: undefined,
          conditionType: 'ON',
          criteria: 'users.id = products.user_id',
        });
      });

      it('should handle rightJoin with valid parameters and without alias', () => {
        const entity = 'products';
        const conditionType = 'USING';
        const criteria = '(id, user_id)';

        expect(() => {
          queryBuilder.rightJoin(entity, undefined, conditionType, criteria);
        }).not.toThrow();

        // Verify the join block
        const joinBlock = queryBuilder['joinBlocks'][0];
        expect(joinBlock).toEqual({
          type: 'RIGHT',
          entity: 'products',
          alias: undefined,
          conditionType: 'USING',
          criteria: '(id, user_id)',
        });
      });
    });

    describe('CROSS', () => {
      it('should throw an error if no entity is provided', () => {
        expect(() => {
          queryBuilder.crossJoin('');
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.crossJoin(null as any); // null as an invalid entity type
        }).toThrow('Join entity is required.');

        expect(() => {
          queryBuilder.crossJoin(undefined as any); // undefined as an invalid entity type
        }).toThrow('Join entity is required.');
      });

      it('should not throw an error if a valid entity is provided', () => {
        const entity = 'orders';

        expect(() => {
          queryBuilder.crossJoin(entity);
        }).not.toThrow();

        // Verify that the join block was added to the joinBlocks array
        const joinBlock = queryBuilder['joinBlocks'][0]; // Access private property for test
        expect(joinBlock).toEqual({
          type: 'CROSS',
          entity: 'orders',
        });
      });

      it('should generate a correct CROSS JOIN clause', () => {
        queryBuilder.from('users').crossJoin('sessions');

        const query = queryBuilder.getQuery();
        expect(query).toContain('CROSS JOIN sessions'); // No alias expected
      });
    });

    describe('NATURAL Join Handling', () => {
      it('should generate a correct NATURAL JOIN clause', () => {
        queryBuilder.from('users').innerJoin('orders', 'o', 'NATURAL');

        const query = queryBuilder.getQuery();
        expect(query).toContain('INNER NATURAL JOIN orders o');
      });

      it('should generate a correct NATURAL LEFT JOIN clause', () => {
        queryBuilder.from('users').leftJoin('customers', 'c', 'NATURAL');

        const query = queryBuilder.getQuery();
        expect(query).toContain('LEFT NATURAL JOIN customers c');
      });

      it('should generate a correct NATURAL RIGHT JOIN clause', () => {
        queryBuilder.from('users').rightJoin('products', 'p', 'NATURAL');

        const query = queryBuilder.getQuery();
        expect(query).toContain('RIGHT NATURAL JOIN products p');
      });
    });

    describe('QueryBuilder createJoinClauses with USING', () => {
      it('should generate a correct JOIN clause with USING condition', () => {
        queryBuilder
          .from('categories', 'c')
          .innerJoin('orders', 'o', 'USING', 'user_id');

        const query = queryBuilder.getQuery();
        expect(query).toContain('INNER JOIN orders o USING (user_id)');
      });

      it('should generate a correct LEFT JOIN clause with USING condition', () => {
        queryBuilder
          .from('categories', 'c')
          .leftJoin('products', 'p', 'USING', 'product_id');

        const query = queryBuilder.getQuery();
        expect(query).toContain('LEFT JOIN products p USING (product_id)');
      });

      it('should generate a correct RIGHT JOIN clause with USING condition', () => {
        queryBuilder
          .from('product', 'p')
          .rightJoin('categories', 'c', 'USING', 'category_id');

        const query = queryBuilder.getQuery();
        expect(query).toContain('RIGHT JOIN categories c USING (category_id)');
      });
    });
  });

  describe('WHERE Clause', () => {
    it('should add simple WHERE condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').getQuery();
      expect(query).toBe('SELECT id FROM users WHERE id = 1');
    });

    it('should add AND condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').andWhere('name = "John"').getQuery();
      expect(query).toBe('SELECT id FROM users WHERE id = 1 AND name = "John"');
    });

    it('should add OR condition', () => {
      const query = new QueryBuilder().select('id').from('users').where('id = 1').orWhere('name = "John"').getQuery();
      expect(query).toBe('SELECT id FROM users WHERE id = 1 OR name = "John"');
    });
  });

  describe('orderBy', () => {
    it('should initialize ORDER BY with a single column and order', () => {
      const query = queryBuilder.orderBy('name', 'ASC');
      expect(query['sorting']).toEqual([{ column: 'name', order: 'ASC' }]);
    });

    it('should replace existing ORDER BY with new column and order', () => {
      queryBuilder.orderBy('name', 'ASC');
      const query = queryBuilder.orderBy('id', 'DESC');
      expect(query['sorting']).toEqual([{ column: 'id', order: 'DESC' }]);
    });

    it('should default to ASC if no order is specified', () => {
      const query = queryBuilder.orderBy('name');
      expect(query['sorting']).toEqual([{ column: 'name', order: 'ASC' }]);
    });

    it('should handle values correctly', () => {
      const query = queryBuilder.orderBy('name', 'DESC');
      expect(query['sorting']).toEqual([{ column: 'name', order: 'DESC' }]);
    });
  });

  describe('addOrderBy', () => {
    it('should add an additional sorting condition without replacing existing ones', () => {
      queryBuilder.orderBy('name', 'ASC');
      const query = queryBuilder.addOrderBy('id', 'DESC');
      expect(query['sorting']).toEqual([
        { column: 'name', order: 'ASC' },
        { column: 'id', order: 'DESC' }
      ]);
    });

    it('should not add duplicate sorting conditions for the same column', () => {
      queryBuilder.orderBy('name', 'ASC');
      const query = queryBuilder.addOrderBy('name', 'DESC');
      expect(query['sorting']).toEqual([{ column: 'name', order: 'ASC' }]);
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
  });
});
