import { ConnectionOptions } from '../connection';
import { QueryBuilder, SchemaBuilder } from './builders';

/**
 * Represents a database driver responsible for managing database connections, executing queries,
 * and providing utilities such as query and schema builders.
 */
export interface Driver {
  /**
   * The native database engine instance.
   *
   * This is typically a database client or connection pool instance, depending on the specific
   * database technology used.
   *
   * @type {unknown}
   */
  engine: unknown;

  /**
   * The name of the database to which this driver is connected.
   *
   * @type {string}
   */
  database: string;

  /**
   * Establishes a connection to the database using the provided options.
   *
   * @param {ConnectionOptions} options - Configuration options for the database connection.
   * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
   */
  connect(options: ConnectionOptions): Promise<void>;

  /**
   * Creates a new query builder instance for constructing SQL queries.
   *
   * @returns {QueryBuilder} A query builder instance.
   */
  createQueryBuilder(): QueryBuilder;

  /**
   * Creates a schema builder for managing database schema operations.
   *
   * @returns {SchemaBuilder} A schema builder instance.
   */
  createSchemaBuilder(): SchemaBuilder;

  /**
   * Closes the connection to the database.
   *
   * @returns {Promise<void>} A promise that resolves when the connection is successfully closed.
   */
  disconnect(): Promise<void>;

  /**
   * Executes a raw SQL query and returns the result.
   *
   * @template T The expected result type.
   * @param {string} query - The SQL query to execute.
   * @returns {Promise<T>} A promise that resolves with the query result.
   */
  query<T>(query: string): Promise<T>;
}
