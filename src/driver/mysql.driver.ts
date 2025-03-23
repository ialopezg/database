import { ConnectionOptions } from '../connection';
import { MysqlSchemaBuilder, QueryBuilder, SchemaBuilder } from './builders';
import { DatabaseDriver } from './database.driver';

/**
 * MySQL Driver Implementation.
 * Handles connection management, query execution, and schema building for MySQL.
 */
export class MySQLDriver extends DatabaseDriver {
  /**
   * MySQL database engine instance (e.g., MySQL library or a connection pool).
   */
  private readonly _engine: any;

  /**
   * Constructor for the MySQLDriver.
   *
   * @param engine - The MySQL database engine instance.
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
    return new MysqlSchemaBuilder(this);
  }

  /** @inheritdoc */
  public async connect(options: ConnectionOptions): Promise<void> {
    this._options = options;
    this._connection = this._engine.createConnection({
      host: options.host,
      user: options.username,
      password: options.password,
      database: options.database,
    });

    return new Promise<void>((resolve, reject) => {
      this._connection.connect((err: any | null) => {
        if (err) {
          return reject(new Error(`⛔️ Failed to connect: ${err.message}`));
        }
        resolve();
      });
    });
  }

  /** @inheritdoc */
  public async disconnect(): Promise<void> {
    if (!this._connection) {
      throw new Error('⛔️ Connection is not established, cannot disconnect!');
    }

    return new Promise<void>((resolve, reject) => {
      this._connection.end((err: any | null) => {
        if (err) {
          return reject(new Error(`⛔️ Disconnection failed: ${err.message}`));
        }
        resolve();
      });
    });
  }

  /** @inheritdoc */
  public async query<T>(query: string): Promise<T> {
    if (!this._connection) {
      throw new Error('⛔️ Connection is not established, cannot execute a query!');
    }

    return new Promise<T>((resolve, reject) => {
      this._connection.query(query, (err: any | null, result: any) => {
        if (err) {
          return reject(new Error(`❌ Query execution failed: ${err.message}`));
        }
        resolve(result);
      });
    });
  }
}
