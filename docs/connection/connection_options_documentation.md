# ConnectionOptions

The `ConnectionOptions` interface defines the configuration settings required to establish a connection to a database. It includes authentication details, connection properties, and optional settings for database schema management.

## Properties

### `url` (optional)
- **Type:** `string`
- **Description:** A full connection URL containing all necessary details to connect to the database.
- **Note:** If a URL is provided, individual properties such as `host`, `port`, and `username` may be ignored.

### `host` (optional)
- **Type:** `string`
- **Description:** The database host address (IP or domain name).

### `port` (optional)
- **Type:** `number`
- **Description:** The port number on which the database server is listening.

### `username` (optional)
- **Type:** `string`
- **Description:** The username used for database authentication.

### `password` (optional)
- **Type:** `string`
- **Description:** The password associated with the database user.

### `database` (optional)
- **Type:** `string`
- **Description:** The name of the target database to connect to.

### `autoSchemaCreate` (optional)
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Determines whether the database schema should be automatically created upon connection.

## Usage Example

```typescript
const connectionOptions: ConnectionOptions = {
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'secret',
  database: 'my_database',
  autoSchemaCreate: true,
};
```

This configuration will connect to a PostgreSQL database running on `localhost:5432` using the provided authentication details. The `autoSchemaCreate` flag ensures that the schema is automatically created if necessary.

