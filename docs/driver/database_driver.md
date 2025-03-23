# DatabaseDriver Documentation

## Overview

The `DatabaseDriver` class serves as an abstract base class for database drivers. It provides common functionality and enforces the contract for database operations. Concrete implementations of this class should provide specific database connectivity and query execution logic.

## Properties

### `_connection`
- **Type:** `any`
- **Access:** `protected`
- **Description:** Holds the current database connection instance.

### `_options`
- **Type:** `ConnectionOptions | null`
- **Access:** `protected`
- **Description:** Stores the database connection options.

## Getters

### `engine`
- **Access:** `public`
- **Type:** `any`
- **Abstract:** Yes
- **Description:**
    - Retrieves the database engine instance used by the driver.

### `database`
- **Access:** `public`
- **Type:** `string`
- **Description:**
    - Retrieves the name of the connected database.
    - **Throws:**
        - `Error` if no active connection exists.

## Methods

### `connect(options: ConnectionOptions): Promise<void>`
- **Access:** `public`
- **Abstract:** Yes
- **Description:**
    - Establishes a connection to the database.
    - **Parameters:**
        - `options`: `ConnectionOptions` - The connection options.
    - **Returns:**
        - `Promise<void>` - Resolves when the connection is successfully established.

### `disconnect(): Promise<void>`
- **Access:** `public`
- **Abstract:** Yes
- **Description:**
    - Disconnects from the database.
    - **Returns:**
        - `Promise<void>` - Resolves when the disconnection is complete.
    - **Throws:**
        - `Error` if no active connection exists.

### `query<T>(query: string): Promise<T>`
- **Access:** `public`
- **Abstract:** Yes
- **Description:**
    - Executes an SQL query.
    - **Parameters:**
        - `query`: `string` - The SQL query string to execute.
    - **Returns:**
        - `Promise<T>` - Resolves with the query result.
    - **Throws:**
        - `Error` if the connection is not established or the query execution fails.

### `createQueryBuilder(): QueryBuilder`
- **Access:** `public`
- **Abstract:** Yes
- **Description:**
    - Creates a new instance of `QueryBuilder` for constructing SQL queries.
    - **Returns:**
        - `QueryBuilder`

### `createSchemaBuilder(): SchemaBuilder`
- **Access:** `public`
- **Abstract:** Yes
- **Description:**
    - Creates a new instance of `SchemaBuilder` for schema-related operations.
    - **Returns:**
        - `SchemaBuilder`

## Usage Example

Since `DatabaseDriver` is an abstract class, it cannot be instantiated directly. Instead, a concrete subclass should implement its methods:

```typescript
class MySQLDriver extends DatabaseDriver {
  public get engine(): any {
    return this._connection;
  }
  
  public async connect(options: ConnectionOptions): Promise<void> {
    this._options = options;
    this._connection = {}; // Simulated connection
  }

  public async disconnect(): Promise<void> {
    if (!this._connection) {
      throw new Error("⛔️ No active connection to disconnect.");
    }
    this._connection = null;
  }

  public async query<T>(query: string): Promise<T> {
    if (!this._connection) {
      throw new Error("⛔️ No active connection to execute query.");
    }
    return {} as T; // Simulated query result
  }

  public createQueryBuilder(): QueryBuilder {
    return new QueryBuilder();
  }

  public createSchemaBuilder(): SchemaBuilder {
    return new SchemaBuilder();
  }
}
```

## Conclusion

The `DatabaseDriver` class provides an essential abstraction for database connectivity and operations. Implementing this class ensures a consistent and structured approach to managing database connections, executing queries, and handling schema-related tasks.

