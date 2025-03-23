import { ConnectionOptions } from '../connection';
import { PostgresSchemaBuilder, QueryBuilder, SchemaBuilder } from './builders';
import { DatabaseDriver } from './database.driver';

/**
 * PostgreSQL Driver Implementation.
 * Handles connection management, query execution, and schema building for PostgreSQL.
 */
export class PostgresDriver extends DatabaseDriver {
  /**
   * PostgreSQL database engine instance (e.g., `pg` library).
   */
  private readonly _engine: any;

  /**
   * Constructor for the PostgresDriver.
   *
   * @param engine - The PostgreSQL database engine instance.
   */
  public constructor(engine: any) {
    super();
    this._engine = engine;
  }

  /** @inheritdoc */
  public get engine(): any {
    return this._engine;
  }

  /** @inheritdoc */
  public createQueryBuilder(): QueryBuilder {
    return new QueryBuilder();
  }

  /** @inheritdoc */
  public createSchemaBuilder(): SchemaBuilder {
    return new PostgresSchemaBuilder(this);
  }

  /** @inheritdoc */
  public async connect(options: ConnectionOptions): Promise<void> {
    this._options = options;
    this._connection = new this._engine.Client({
      host: options.host,
      user: options.username,
      password: options.password,
      database: options.database,
    });

    return this._connection.connect();
  }

  /** @inheritdoc */
  public async disconnect(): Promise<void> {
    if (!this._connection) {
      throw new Error('⛔️ Connection is not established, cannot disconnect!');
    }

    return this._connection.end();
  }

  /** @inheritdoc */
  public async query<T>(query: string): Promise<T> {
    if (!this._connection) {
      throw new Error('⛔️ Connection is not established, cannot execute a query!');
    }

    try {
      const result = await this._connection.query(query);
      return result.rows as T;
    } catch (error: any) {
      throw new Error(`⛔️ Query failed: ${error.message}!`);
    }
  }
}
