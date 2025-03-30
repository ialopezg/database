# RelationMetadata

`RelationMetadata` is a metadata structure used internally to represent relationships between entities in the ORM layer. It supports all common relation types (`one-to-one`, `one-to-many`, `many-to-one`, `many-to-many`) and provides flags for ownership, cascading, and join behavior.

---

## 🧱 Constructor

```ts
new RelationMetadata(
  target: Function,
  propertyName: string,
  type: RelationType,
  related: RelatedEntityResolver,
  relatedPropertyName: PropertyResolver<any>,
  isOwner: boolean,
  options?: RelationOptions
)
```

### Parameters

| Name                 | Type                          | Description |
|----------------------|-------------------------------|-------------|
| `target`             | `Function`                    | Class where the relation is declared |
| `propertyName`       | `string`                      | Property name on the declaring entity |
| `type`               | `RelationType`                | Type of relation (e.g., `'one-to-many'`) |
| `related`            | `RelatedEntityResolver`       | Function returning the constructor of the related entity |
| `relatedPropertyName`| `PropertyResolver<any>`       | Resolver for the inverse property name |
| `isOwner`            | `boolean`                     | Whether this side owns the relation |
| `options`            | `RelationOptions` *(optional)*| Additional settings like `cascade`, `nullable`, etc. |

---

## 🔧 Properties

| Getter | Type | Description |
|--------|------|-------------|
| `name` | `string` | The resolved name of the relation, optionally transformed by the naming strategy |
| `type` | `RelationType` | The type of the relation |
| `related` | `RelatedEntityResolver<T>` | Function returning the related entity’s constructor |
| `relatedPropertyName` | `string` | Resolved name of the property on the related entity |
| `relatedEntity` | `EntityMetadata` | Metadata of the related entity (set externally) |
| `isOwner` | `boolean` | Whether this side is the owner |
| `isCascadeInsert` | `boolean` | Whether inserts should cascade |
| `isCascadeUpdate` | `boolean` | Whether updates should cascade |
| `isCascadeRemove` | `boolean` | Whether removals should cascade |
| `isAlwaysInnerJoin` | `boolean` | Whether to always use INNER JOIN |
| `isAlwaysLeftJoin` | `boolean` | Whether to always use LEFT JOIN |
| `isNullable` | `boolean` | Whether the foreign key allows null values |
| `oldColumnName` | `string` | Previous column name (used for renames) |
| `isOneToOne` | `boolean` | Whether relation type is `one-to-one` |
| `isOneToMany` | `boolean` | Whether relation type is `one-to-many` |
| `isManyToOne` | `boolean` | Whether relation type is `many-to-one` |
| `isManyToMany` | `boolean` | Whether relation type is `many-to-many` |

---

## 🧠 Example

```ts
@OneToMany(() => Post, post => post.author, { isCascadeRemove: true })
posts: Post[];
```

Internally, this creates a `RelationMetadata` with:
- `type`: `'one-to-many'`
- `related`: `() => Post`
- `relatedPropertyName`: `post => post.author`
- `isCascadeRemove`: `true`

---

## 📚 Related Types

- `RelationType`: `'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'`
- `RelationOptions`: `{ isCascadeInsert?, isCascadeRemove?, ... }`
- `RelatedEntityResolver<T>`: `() => Constructor<T>`
- `PropertyResolver<T>`: `string | ((entity: T) => string)`

---

## 🧪 Test Coverage

All functionality is fully covered by the unit test suite including:
- Default values
- Option application
- Relation type flags
- Cascade flags
- `relatedPropertyName` resolution
- Naming strategy support
