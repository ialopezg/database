
# `ColumnOptions` Interface

Defines options for configuring a database column.

## Properties

### `name` (optional)
- **Type**: `string`
- **Description**: The name of the column in the database. If not provided, the property name will be used.
- **Default**: `undefined`
- **Example**: `"user_id"`

### `type` (optional)
- **Type**: `Function | ColumnType | string`
- **Description**: The data type of the column (e.g., `VARCHAR`, `INT`, `TEXT`).
- **Default**: `undefined`
- **Example**: `ColumnType.VARCHAR`

### `length` (optional)
- **Type**: `number`
- **Description**: The length of the column (only applicable for certain types like `VARCHAR`).
- **Default**: `undefined`
- **Example**: `255`

### `isAutoIncrement` (optional)
- **Type**: `boolean`
- **Description**: Specifies if the column should auto-increment. This is typically used for primary key columns.
- **Default**: `false`
- **Example**: `true`

### `isUnique` (optional)
- **Type**: `boolean`
- **Description**: Specifies if the column should have a unique constraint.
- **Default**: `false`
- **Example**: `true`

### `isNullable` (optional)
- **Type**: `boolean`
- **Description**: Determines if the column allows `NULL` values.
- **Default**: `false`
- **Example**: `false`

### `columnDefinition` (optional)
- **Type**: `string`
- **Description**: Custom column definition to override default behavior. Example: `"VARCHAR(255) NOT NULL"`.
- **Default**: `undefined`
- **Example**: `"VARCHAR(100) DEFAULT 'guest'"`

### `comment` (optional)
- **Type**: `string`
- **Description**: A comment describing the purpose of this column.
- **Default**: `undefined`
- **Example**: `"Stores the user's email address"`

### `oldColumnName` (optional)
- **Type**: `string`
- **Description**: The previous column name (useful for migrations).
- **Default**: `undefined`
- **Example**: `"old_email"`

