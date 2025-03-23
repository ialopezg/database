# Database Driver Interface

The `Driver` interface defines the contract for database drivers, allowing the implementation of various database engines while maintaining a consistent API for connection management, query execution, and schema operations.

## Properties

### `engine`
- **Type:** `unknown`
- **Description:** Represents the native database engine instance, such as a database client or connection pool.

### `database`
- **Type:** `string`
- **Description:** The name of the database to which this driver is connected.

## Methods

### `connect`
- **Description:** Establishes a connection to the database using the provided configuration options.
- **Parameters:**
    - `options: ConnectionOptions` - The configuration options for the database connection.
- **Returns:** `Promise<void>` - A promise that resolves when the connection is successfully established.

### `createQueryBuilder`
- **Description:** Creates a new query builder instance for constructing SQL queries.
- **Returns:** `QueryBuilder` - An instance of the query builder.

### `createSchemaBuilder`
- **Description:** Creates a schema builder for managing database schema operations.
- **Returns:** `SchemaBuilder` - An instance of the schema builder.

### `disconnect`
- **Description:** Closes the connection to the database.
- **Returns:** `Promise<void>` - A promise that resolves when the connection is successfully closed.

### `query`
- **Description:** Executes a raw SQL query and returns the result.
- **Type Parameter:** `T` - The expected result type.
- **Parameters:**
    - `query: string` - The SQL query to execute.
- **Returns:** `Promise<T>` - A promise that resolves with the query result.

## Usage Example

```typescript
class MySQLDriver implements Driver {
  engine: unknown;
  database: string;

  async connect(options: ConnectionOptions): Promise<void> {
    // Implementation here
  }

  createQueryBuilder(): QueryBuilder {
    // Implementation here
    return new QueryBuilder();
  }

  createSchemaBuilder(): SchemaBuilder {
    // Implementation here
    return new SchemaBuilder();
  }

  async disconnect(): Promise<void> {
    // Implementation here
  }

  async query<T>(query: string): Promise<T> {
    // Implementation here
    return {} as T;
  }
}
```

This interface serves as a foundation for building database drivers that can be extended for various database technologies while ensuring consistency in database interactions.

