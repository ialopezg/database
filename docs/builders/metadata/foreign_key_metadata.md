## ForeignKeyMetadata

`ForeignKeyMetadata` is a core utility class used to define foreign key relationships between two database tables in the metadata layer of the ORM.

### Features
- Validates foreign key relationships between tables.
- Supports multiple-column foreign keys.
- Automatically generates a unique foreign key name using a hash-based strategy.
- Allows optional custom foreign key names.
- **(Planned)**: `onDelete` and `onUpdate` actions (currently stored but not used).

### Constructor
```ts
new ForeignKeyMetadata(
  table: TableMetadata,
  columns: ColumnMetadata[],
  referencedTable: TableMetadata,
  referencedColumns: ColumnMetadata[],
  customName?: string,
  onDelete?: string,
  onUpdate?: string
)
```

### Parameters
| Name               | Type                | Description |
|--------------------|---------------------|-------------|
| `table`            | `TableMetadata`     | The table where the foreign key is defined. |
| `columns`          | `ColumnMetadata[]`  | The columns that form the foreign key. |
| `referencedTable`  | `TableMetadata`     | The table being referenced. |
| `referencedColumns`| `ColumnMetadata[]`  | The columns being referenced. |
| `customName`       | `string` (optional) | A custom name to use instead of auto-generated one. |
| `onDelete`         | `string` (optional) | *(Planned)* ON DELETE action (e.g., `CASCADE`). Currently stored only. |
| `onUpdate`         | `string` (optional) | *(Planned)* ON UPDATE action (e.g., `RESTRICT`). Currently stored only. |

### Validation
Throws errors when:
- Either table has no valid name.
- Columns or referencedColumns are empty.
- The column count does not match between `columns` and `referencedColumns`.

### Properties

#### `name: string`
Returns either the custom name or an auto-generated one based on a SHA-256 hash of table and column names.

#### `columnNames: string[]`
Returns an array of the foreign key's column names.

#### `referencedColumnNames: string[]`
Returns an array of the referenced column names.

#### `onDelete?: string`
Returns the delete action if defined. *(Reserved for future use)*

#### `onUpdate?: string`
Returns the update action if defined. *(Reserved for future use)*

### Example
```ts
const fk = new ForeignKeyMetadata(
  userTable,
  [userIdColumn],
  accountTable,
  [accountIdColumn],
  undefined,
  'CASCADE',
  'SET NULL'
);

console.log(fk.name); // e.g., 'fk_ab12cd34'
console.log(fk.onDelete); // 'CASCADE'
console.log(fk.onUpdate); // 'SET NULL'
```

### Related Classes
- `TableMetadata`
- `ColumnMetadata`
- `InvalidNameError`

---
Generated and validated automatically with full test coverage.
