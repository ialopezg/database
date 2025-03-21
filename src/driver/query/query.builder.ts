type QueryType = 'select' | 'insert' | 'update' | 'delete';
type JoinType = 'inner' | 'left' | 'right' | 'cross';
type JoinConditionType = 'on' | 'using' | 'natural';
type ConditionType = 'simple' | 'and' | 'or';

interface FromBlock {
  entity: Function | string;
  alias?: string;
}

interface JoinBlock {
  type: JoinType;
  entity: string;
  alias?: string;
  conditionType?: JoinConditionType;
  criteria?: string;
}

interface WhereBlock {
  type: ConditionType;
  condition: string;
}

/**
 * @class QueryBuilder
 * A query builder class that facilitates the construction of SQL queries.
 */
export class QueryBuilder {
  private queryType: QueryType = 'select';
  private columns: string[] = [];
  private fromBlock: FromBlock;
  private joinBlocks: JoinBlock[] = [];
  private conditions: WhereBlock[] = [];

  constructor(public readonly getTableNameCallback?: (entity: Function) => string) {
    this.fromBlock = { entity: '', alias: undefined };
  }

  /**
   * Sets the query type to `SELECT` and specifies the columns to retrieve.
   *
   * @param {string | string[]} columns - The column name(s) to select.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @example
   * const query = new QueryBuilder().select("id");
   * const query = new QueryBuilder().select(["id", "name"]);
   */
  select(...columns: string[]): this {
    this.queryType = 'select';

    this.columns = Array.isArray(columns) ? [...columns] : [columns];

    return this;
  }

  /**
   * Adds additional columns to the selection while ensuring no duplicates.
   *
   * @param {...string[]} columns - The columns to be added to the selection.
   * @returns {this} The current QueryBuilder instance for method chaining.
   *
   * @example
   * const query = new QueryBuilder().select('id').from('users').addColumns('name', 'email');
   * console.log(query.getQuery()); // SELECT id, name, email FROM users
   *
   * @example
   * const query = new QueryBuilder().select('id').from('users').addColumns('id');
   * console.log(query.getQuery()); // SELECT id FROM users (avoiding duplicates)
   */
  addColumns(...columns: string[]): this {
    this.columns.push(...columns.filter((col) => !this.columns.includes(col)));

    return this;
  }

  /**
   * Specifies the table or entity to query from.
   *
   * @param {string | Function} entity - The table name (string) or entity class (Function).
   * @param {string} [alias] - The optional alias for the table or entity.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @example
   * const query = new QueryBuilder().from("users", "u");
   * const query = new QueryBuilder().from(UserEntity, "u");
   */
  from(entity: Function | string, alias?: string): this {
    if (!entity || (typeof entity === 'string' && entity.trim() === '')) {
      throw new Error('FROM clause requires a valid table name or entity');
    }

    this.fromBlock = { entity, alias };

    return this;
  }

  /**
   * Adds an INNER JOIN to the query.
   *
   * @param {string} entity - The entity (or table) to join.
   * @param {string} [alias] - The optional alias for the join entity.
   * @param {JoinConditionType} [conditionType] - The type of condition ('on', 'using', 'natural').
   * @param {string} [criteria] - The condition criteria (optional).
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @throws {Error} If the join entity is missing.
   * @throws {Error} If the condition requires criteria but none is provided.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users").innerJoin("products",
   * "p", "on", "users.id = products.user_id");
   */
  innerJoin(
    entity: string,
    alias?: string,
    conditionType?: JoinConditionType,
    criteria?: string
  ): this {
    if (!entity || entity.trim() === '') {
      throw new Error('Join entity is required.');
    }
    if (!conditionType) {
      throw new Error('INNER JOIN requires a condition type (ON, USING, or NATURAL)');
    }
    if (conditionType !== 'natural' && !criteria) {
      throw new Error(`INNER JOIN with ${conditionType.toUpperCase()} requires criteria`);
    }

    this.joinBlocks.push({ type: 'inner', entity, alias, conditionType, criteria });

    return this;
  }

  /**
   * Adds a LEFT JOIN to the query.
   *
   * @param {string} entity - The entity (or table) to join.
   * @param {string} [alias] - The optional alias for the join entity.
   * @param {JoinConditionType} [conditionType] - The type of condition ('on', 'using', 'natural').
   * @param {string} [criteria] - The condition criteria (optional).
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @throws {Error} If the join entity is missing.
   * @throws {Error} If the condition requires criteria but none is provided.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users").leftJoin("products",
   * "p", "on", "users.id = products.user_id");
   */
  leftJoin(
    entity: string,
    alias?: string,
    conditionType?: JoinConditionType,
    criteria?: string
  ): this {
    if (!entity || entity.trim() === '') {
      throw new Error('Join entity is required.');
    }
    if (!conditionType) {
      throw new Error('LEFT JOIN requires a condition type (ON, USING, or NATURAL)');
    }
    if (conditionType !== 'natural' && !criteria) {
      throw new Error(`LEFT JOIN with ${conditionType.toUpperCase()} requires criteria`);
    }

    this.joinBlocks.push({ type: 'left', entity, alias, conditionType, criteria });

    return this;
  }

  /**
   * Adds a RIGHT JOIN to the query.
   *
   * @param {string} entity - The entity (or table) to join.
   * @param {string} [alias] - The optional alias for the join entity.
   * @param {JoinConditionType} [conditionType] - The type of condition ('on', 'using', 'natural').
   * @param {string} [criteria] - The condition criteria (optional).
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @throws {Error} If the join entity is missing.
   * @throws {Error} If the condition requires criteria but none is provided.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users").rightJoin("products",
   * "p", "on", "users.id = products.user_id");
   */
  rightJoin(
    entity: string,
    alias?: string,
    conditionType?: JoinConditionType,
    criteria?: string
  ): this {
    if (!entity || entity.trim() === '') {
      throw new Error('Join entity is required.');
    }
    if (!conditionType) {
      throw new Error('RIGHT JOIN requires a condition type (ON, USING, or NATURAL)');
    }
    if (conditionType !== 'natural' && !criteria) {
      throw new Error(`RIGHT JOIN with ${conditionType.toUpperCase()} requires criteria`);
    }

    this.joinBlocks.push({ type: 'right', entity, alias, conditionType, criteria });

    return this;
  }

  /**
   * Adds a CROSS JOIN to the query.
   *
   * @param {string} entity - The entity (or table) to join.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @throws {Error} If the join entity is missing.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users").crossJoin("products");
   */
  crossJoin(entity: string): this {
    if (!entity || entity.trim() === '') {
      throw new Error('Join entity is required.');
    }

    this.joinBlocks.push({ type: 'cross', entity });

    return this;
  }

  /**
   * Adds a WHERE condition to the query.
   *
   * @param {string} condition - The condition to apply.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users", "u").where("u.id = 1");
   */
  where(condition: string): this {
    if (condition?.trim()) {
      this.conditions.push({ type: 'simple', condition });
    }
    return this;
  }

  /**
   * Adds an AND WHERE condition to the query.
   *
   * @param {string} condition - The condition to apply.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users", "u").andWhere("u.id = 1");
   */
  andWhere(condition: string): this {
    this.conditions.push({ type: 'and', condition });

    return this;
  }

  /**
   * Adds an OR WHERE condition to the query.
   *
   * @param {string} condition - The condition to apply.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users", "u").orWhere("u.id = 1");
   */
  orWhere(condition: string): this {
    this.conditions.push({ type: 'or', condition });

    return this;
  }

  /**
   * Generates the SQL query based on the selected query type.
   *
   * @returns {string} The generated SQL query.
   *
   * @throws {Error} If the table name or selected columns are missing.
   *
   * @example
   * const query = new QueryBuilder().select(["id", "name"]).from("users", "u").getQuery();
   * console.log(query); // SELECT id, name FROM users u;
   */
  getQuery(): string {
    if (!this.fromBlock.entity) {
      throw new Error('FROM clause must be defined before generating the query');
    }

    const selectClause = this.createSelectClause();
    const joinClauses = this.createJoinClauses();
    const whereClause = this.createWhereClause();

    return `${selectClause}${joinClauses}${whereClause}`;
  }

  /**
   * Creates the SELECT clause of the query.
   *
   * @returns {string} The SELECT clause of the query.
   */
  protected createSelectClause(): string {
    const tableName = this.getTableName();
    if (this.columns.length === 0) {
      this.columns = ['*'];
    }

    let query = `SELECT ${this.columns.join(', ')} FROM ${tableName}`;
    if (this.fromBlock?.alias) {
      query += ` ${this.fromBlock.alias}`;
    }

    return query.trim();
  }

  /**
   * Creates the JOIN clauses of the query.
   *
   * @returns {string} The JOIN clauses of the query.
   */
  protected createJoinClauses(): string {
    return this.joinBlocks
      .map((join) => {
        if (join.type === 'cross') {
          return ` CROSS JOIN ${join.entity}${join.alias ? ` ${join.alias}` : ''}`;
        }

        if (join.conditionType === 'natural') {
          return ` ${join.type.toUpperCase()} NATURAL JOIN ${join.entity}${join.alias ? ` ${join.alias}` : ''}`;
        }

        if (!join.conditionType || !join.criteria) {
          throw new Error(
            `${join.type.toUpperCase()} JOIN requires a condition type (ON or USING) and criteria`
          );
        }

        const formattedCriteria =
          join.conditionType === 'using' ? `(${join.criteria})` : join.criteria;

        return ` ${join.type.toUpperCase()} JOIN ${join.entity}${join.alias ? ` ${join.alias}` : ''} ${join.conditionType.toUpperCase()} ${formattedCriteria}`;
      })
      .join(' ');
  }

  /**
   * Creates the WHERE clause of the query.
   *
   * @returns {string} The WHERE clause of the query.
   */
  protected createWhereClause(): string {
    if (this.conditions.length === 0) {
      return '';
    }

    return ` WHERE ${this.conditions
      .map((c, index) => {
        return index === 0 ? c.condition : `${c.type.toUpperCase()} ${c.condition}`;
      })
      .join(' ')}`;
  }

  /**
   * Retrieves the table name from the entity class or string.
   *
   * @returns {string} The table name.
   *
   * @throws {Error} If the table name is not specified.
   */
  protected getTableName(): string {
    if (!this.fromBlock?.entity) {
      throw new Error('Table name must be specified using from()');
    }

    if (typeof this.fromBlock?.entity === 'function') {
      if (!this.getTableNameCallback) {
        throw new Error('getTableNameCallback is required to resolve entity names');
      }
      return this.getTableNameCallback(this.fromBlock.entity);
    }

    return this.fromBlock?.entity ?? '';
  }
}
