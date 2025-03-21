type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'CROSS' | 'NATURAL';
type JoinConditionType = 'ON' | 'USING' | 'NATURAL';
type ConditionType = 'SIMPLE' | 'AND' | 'OR';
type SortType = 'ASC' | 'DESC';

interface FromBlock {
  entity: Function | string;
  alias?: string;
}

interface JoinBlock {
  joinType: JoinType;
  entity: string;
  alias?: string;
  conditionType?: JoinConditionType;
  criteria?: string;
}

interface WhereBlock {
  type: ConditionType;
  condition: string;
}

interface OrderByBlock {
  column: string;
  order?: SortType;
}

/**
 * @class QueryBuilder
 * A query builder class that facilitates the construction of SQL queries.
 */
export class QueryBuilder {
  private queryType: QueryType = 'SELECT';
  private columns: string[] = [];
  private fromBlock: FromBlock;
  private joinBlocks: JoinBlock[] = [];
  private conditions: WhereBlock[] = [];
  private sorting: OrderByBlock[] = [];
  private limit: number = -1;
  private offset: number = -1;

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
    this.queryType = 'SELECT';

    this.columns = columns;

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
    return this.addJoin('INNER', entity, alias, conditionType, criteria);
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
    return this.addJoin('LEFT', entity, alias, conditionType, criteria);
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
    return this.addJoin('RIGHT', entity, alias, conditionType, criteria);
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
    return this.addJoin('CROSS', entity);
  }

  /**
   * Adds a NATURAL JOIN to the query.
   *
   * @param {string} entity - The entity (or table) to join.
   * @param {string} [alias] - The optional alias for the join entity.
   * @returns {this} The instance of `QueryBuilder` for method chaining.
   *
   * @example
   * const query = new QueryBuilder().select("id").from("users").naturalJoin("products");
   */
  naturalJoin(entity: string, alias?: string): this {
    return this.addJoin('NATURAL', entity, alias);
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
    return this.addWhereCondition(condition);
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
    return this.addWhereCondition(condition, 'AND');
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
    return this.addWhereCondition(condition, 'OR');
  }

  /**
   * Initializes or replaces the ORDER BY clause with a new array of sorting conditions.
   *
   * @param {string} column - The name of the column to sort by.
   * @param {SortType} [order='ASC'] - The sorting order, either 'ASC' or 'DESC'.
   * @returns {this} The current QueryBuilder instance for method chaining.
   */
  orderBy(column: string, order: SortType = 'ASC'): this {
    this.sorting = [{ column, order }];

    return this;
  }

  /**
   * Adds an ORDER BY clause to the query.
   * If the column already exists, it won't be added again.
   *
   * @param {string} column - The name of the column to sort by.
   * @param {SortType} [order='ASC'] - The sorting order, either 'ASC' or 'DESC'.
   * @returns {this} The current QueryBuilder instance for method chaining.
   */
  addOrderBy(column: string, order: SortType = 'ASC'): this {
    if (!this.sorting.some((s) => s.column === column)) {
      this.sorting.push({ column, order });
    }

    return this;
  }

  /**
   * Sets the limit of rows returned by the query.
   *
   * @param {number} value - The limit to apply to the query.
   * @returns {this} The current QueryBuilder instance for method chaining.
   */
  setLimit(value: number): this {
    this.limit = value;

    return this;
  }

  /**
   * Sets the offset of rows returned by the query.
   *
   * @param {number} value - The offset to apply to the query.
   * @returns {this} The current QueryBuilder instance for method chaining.
   */
  setOffset(value: number): this {
    this.offset = value;

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
    const orderByClause = this.createOrderByClause();
    const limitClause = this.createLimitClause();
    const offsetClause = this.createOffsetClause();

    return `${selectClause}${joinClauses ? ` ${joinClauses}` : ''}${whereClause}${orderByClause}${limitClause}${offsetClause}`.trim();
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
        if (join.joinType === 'CROSS') {
          return `${join.joinType} JOIN ${join.entity}${join.alias ? ` ${join.alias}` : ''}`;
        }

        if (join.joinType === 'NATURAL') {
          return `${join.joinType} JOIN ${join.entity}${join.alias ? ` ${join.alias}` : ''}`;
        }

        const formattedCriteria =
          join.conditionType === 'USING' ? `(${join.criteria})` : join.criteria;

        return `${join.joinType} JOIN ${join.entity}${join.alias ? ` ${join.alias}` : ''} ${
          join.conditionType ? join.conditionType : ''
        } ${formattedCriteria ? formattedCriteria : ''}`.trim();
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
        return index === 0 ? c.condition : `${c.type} ${c.condition}`;
      })
      .join(' ')}`;
  }

  /**
   * Generates the ORDER BY clause for the SQL query.
   *
   * @returns {string} The formatted ORDER BY clause.
   * @throws {Error} If no sorting conditions are specified.
   */
  protected createOrderByClause(): string {
    if (this.sorting.length === 0) {
      return '';
    }

    return ` ORDER BY ${this.sorting.map((o) => `${o.column} ${o.order ?? 'ASC'}`).join(', ')}`;
  }

  /**
   * @protected
   * Creates the LIMIT clause for the query, if a limit is set.
   *
   * @returns {string} The LIMIT clause of the query, or undefined if no limit is set.
   */
  protected createLimitClause(): string {
    if (this.limit === -1) {
      return '';
    }
    return ` LIMIT ${this.limit}`;
  }

  /**
   * @protected
   * Creates the OFFSET clause for the query, if an offset is set.
   *
   * @returns {string} The OFFSET clause of the query, or undefined if no offset is set.
   */
  protected createOffsetClause(): string {
    if (this.offset === -1) {
      return '';
    }
    return ` OFFSET ${this.offset}`;
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

    if (typeof this.fromBlock.entity === 'function') {
      if (!this.getTableNameCallback) {
        throw new Error('getTableNameCallback is required to resolve entity names');
      }
      return this.getTableNameCallback(this.fromBlock.entity);
    }

    return this.fromBlock.entity;
  }

  private addJoin(
    joinType: JoinType,
    entity: string,
    alias?: string,
    conditionType?: JoinConditionType,
    criteria?: string
  ): this {
    if (!entity || entity.trim() === '') {
      throw new Error('Join entity is required');
    }
    if (conditionType && ['ON', 'USING'].includes(conditionType) && !criteria) {
      throw new Error(`${joinType} JOIN requires a condition criteria when using ${conditionType}`);
    }

    this.joinBlocks.push({ joinType, entity, alias, conditionType, criteria });

    return this;
  }

  private addWhereCondition(condition: string, type: ConditionType = 'SIMPLE'): this {
    if (!condition.trim()) {
      throw new Error('WHERE condition cannot be empty');
    }

    this.conditions.push({ type, condition });

    return this;
  }
}
