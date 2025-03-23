
# `ForeignKeyMetadata` Class

The `ForeignKeyMetadata` class represents the metadata for a foreign key relationship between two tables in a database.

## Constructor

### `constructor(table: TableMetadata, columns: ColumnMetadata[], relatedTable: TableMetadata, relatedColumns: ColumnMetadata[])`

Creates a new instance of the `ForeignKeyMetadata` class.

#### Parameters:
- `table` (**TableMetadata**): The table where the foreign key is defined.
- `columns` (**ColumnMetadata[]**): The columns that are part of the foreign key.
- `relatedTable` (**TableMetadata**): The table that the foreign key references.
- `relatedColumns` (**ColumnMetadata[]**): The columns in the related table that the foreign key references.

#### Throws:
- Throws an error if the table or related table name is invalid, or if the columns or related columns arrays are empty.
- Throws an error if the number of columns in the foreign key does not match the number of related columns.

## Properties

### `name`

Generates a unique name for the foreign key by hashing a combination of the table and column names, and the related table and columns.

#### Returns:
- A string representing the unique name of the foreign key, prefixed with `fk_`.

### `table`

Returns the table associated with the foreign key.

#### Returns:
- The `TableMetadata` object representing the table.

### `columns`

Returns the columns in the foreign key.

#### Returns:
- An array of `ColumnMetadata` objects representing the columns in the foreign key.

### `columnNames`

Returns the names of the columns in the foreign key.

#### Returns:
- An array of strings representing the names of the columns.

### `relatedTable`

Returns the related table that the foreign key references.

#### Returns:
- The `TableMetadata` object representing the related table.

### `relatedColumns`

Returns the related columns in the foreign key relationship.

#### Returns:
- An array of `ColumnMetadata` objects representing the related columns.

### `relatedColumnNames`

Returns the names of the related columns in the foreign key relationship.

#### Returns:
- An array of strings representing the names of the related columns.

## Methods

### `validate()`

Validates the foreign key relationship by ensuring that:
- The number of columns in the foreign key matches the number of related columns.
- Both the table and related table have valid names.
- Columns and related columns are not empty.

#### Throws:
- Throws an error if validation fails.

## Example

```typescript
const tableMetadata = new TableMetadata('users');
const relatedTableMetadata = new TableMetadata('orders');
const userIdColumn = new ColumnMetadata(tableMetadata, 'user_id', false, false, false, {});
const orderUserIdColumn = new ColumnMetadata(relatedTableMetadata, 'user_id', false, false, false, {});

const foreignKey = new ForeignKeyMetadata(tableMetadata, [userIdColumn], relatedTableMetadata, [orderUserIdColumn]);

console.log(foreignKey.name);  // Output: fk_<hashed_value>
console.log(foreignKey.table.name);  // Output: users
console.log(foreignKey.relatedTable.name);  // Output: orders
```

## Error Handling

- **Invalid Table Names**: If either the `table` or `relatedTable` has no name, an error will be thrown.
- **Empty Columns**: If either `columns` or `relatedColumns` is empty, an error will be thrown.
- **Mismatched Columns**: If the number of columns in `columns` does not match the number of related columns in `relatedColumns`, an error will be thrown.

## Notes

- The generated foreign key name (`name`) is unique and based on the `sha256` hash of the concatenated table and column names.
- The `validate()` method can be called explicitly to ensure the foreign key setup is valid before further operations.
