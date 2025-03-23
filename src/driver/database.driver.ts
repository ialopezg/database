import { ConnectionOptions } from '../connection';
import { QueryBuilder, SchemaBuilder } from './builders';
import { Driver } from './driver';

/**
 * Abstract base class for database drivers.
 * Provides common functionality and enforces the contract for database operations.
 */
export abstract class DatabaseDriver implements Driver {
  /**
   * Holds the current database connection instance.
   */
  protected _connection: any = null;

  /**
   * Stores the database connection options.
   */
  protected _options: ConnectionOptions | null = null;

  /**
   * Gets the database engine used by the driver.
   *
   * @returns The database engine instance.
   */
  public abstract get engine(): any;

  /**
   * Retrieves the name of the connected database.
   *
   * @throws {Error} If no active connection exists.
   * @returns The name of the currently connected database.
   */
  public get database(): string {
    if (!this._options?.database) {
      throw new Error('⛔️ No active connection or database not set.');
    }

    return this._options.database;
  }

  /**
   * Establishes a connection to the database.
   *
   * @param options - The connection options.
   * @returns A promise that resolves when the connection is successfully established.
   */
  public abstract connect(options: ConnectionOptions): Promise<void>;

  /**
   * Disconnects from the database.
   *
   * @returns A promise that resolves when the disconnection is complete.
   * @throws {Error} If no active connection exists.
   */
  public abstract disconnect(): Promise<void>;

  /**
   * Executes an SQL query.
   *
   * @template T - The expected return type of the query result.
   * @param query - The SQL query string to execute.
   * @returns A promise resolving with the query result.
   * @throws {Error} If the connection is not established or the query execution fails.
   */
  public abstract query<T>(query: string): Promise<T>;

  /**
   * Creates a query builder instance.
   *
   * @returns A new instance of `QueryBuilder` for constructing SQL queries.
   */
  public abstract createQueryBuilder(): QueryBuilder;

  /**
   * Creates a schema builder instance.
   *
   * @returns A new instance of `SchemaBuilder` for schema-related operations.
   */
  public abstract createSchemaBuilder(): SchemaBuilder;
}
