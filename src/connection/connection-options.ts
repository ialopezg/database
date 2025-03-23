/**
 * Defines the options required to establish a database connection, including authentication and
 * connection details.
 */
export interface ConnectionOptions {
  /**
   * A connection URL containing all necessary details to connect to the database.
   * If provided, individual properties such as `host`, `port`, and `username` may be ignored.
   *
   * @type {string}
   */
  url?: string;

  /**
   * The database host address (IP or domain name).
   *
   * @type {string}
   */
  host?: string;

  /**
   * The port number on which the database server is listening to.
   *
   * @type {number}
   */
  port?: number;

  /**
   * The username for database authentication.
   *
   * @type {string}
   */
  username?: string;

  /**
   * The password associated with the database user.
   *
   * @type {string}
   */
  password?: string;

  /**
   * The name of the target database.
   *
   * @type {string}
   */
  database?: string;

  /**
   * Determines whether the database schema should be created automatically.
   *
   * @type {boolean}
   * @default false
   */
  autoSchemaCreate?: boolean;
}
