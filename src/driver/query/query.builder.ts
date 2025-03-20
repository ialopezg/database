type QueryType = 'select' | 'insert' | 'update' | 'delete';
type ConditionType = 'simple' | 'and' | 'or';

interface FromClause {
  entity: Function | string;
  alias?: string;
}

interface WhereClause {
  type: ConditionType;
  condition: string;
}

export class QueryBuilder {
  private queryType: QueryType = 'select';
  private columns: string[] = [];
  private fromClause: FromClause;
  private conditions: WhereClause[] = [];

  constructor(public readonly getTableNameCallback?: (entity: Function) => string) {
    this.fromClause = { entity: '', alias: undefined };
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
  select(columns: string[] | string): this {
    this.queryType = 'select';

    this.columns = Array.isArray(columns) ? [...columns] : [columns];

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
    this.fromClause = { entity, alias };

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
    this.conditions.push({ type: 'simple', condition });

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
    const selectClause = this.createSelectClause();
    const whereClause = this.createWhereClause();

    return `${selectClause}${whereClause}`;
  }

  /**
   * Creates the SELECT clause of the query.
   */
  protected createSelectClause(): string {
    const tableName = this.getTableName();

    if (this.columns.length === 0) {
      this.columns = ['*'];
    }

    let query = `SELECT ${this.columns.join(', ')} FROM ${tableName}`;
    if (this.fromClause?.alias) {
      query += ` ${this.fromClause.alias}`;
    }

    return query.trim();
  }

  /**
   * Creates the WHERE clause of the query.
   */
  protected createWhereClause(): string {
    if (this.conditions.length === 0) {
      return '';
    }

    return ` WHERE ${this.conditions
      .map((c) => {
        // For the first condition, return it as is
        if (c.type === 'simple') {
          return c.condition;
        }

        // For the next conditions, prepend the appropriate AND/OR
        return `${c.type.toUpperCase()} ${c.condition}`;
      })
      .join(' ')}`;
  }

  /**
   * Retrieves the table name from the entity class or string.
   */
  protected getTableName(): string {
    if (!this.fromClause?.entity) {
      throw new Error('Table name must be specified using from()');
    }

    if (typeof this.fromClause?.entity === 'function') {
      if (!this.getTableNameCallback) {
        throw new Error('getTableNameCallback is required to resolve entity names');
      }
      return this.getTableNameCallback(this.fromClause.entity);
    }
    return this.fromClause?.entity ?? '';
  }
}
