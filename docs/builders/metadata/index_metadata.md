### 📘 `IndexMetadata`

The `IndexMetadata` class represents metadata about a database index applied to a specific property within an entity. It extends the base `PropertyMetadata` class, inheriting support for target validation, property naming, and type resolution.

#### ✅ Purpose

`IndexMetadata` is used internally to:

- Track indexed properties in entity definitions.
- Customize or infer the index name.
- Support schema generation features such as `CREATE INDEX`.

---

#### 🏗️ Constructor

```ts
new IndexMetadata();
```

Creates a new `IndexMetadata` instance.

---

#### 📌 Properties

| Property        | Type     | Description                                                                 |
|-----------------|----------|-----------------------------------------------------------------------------|
| `name`          | `string` | The name of the index. Can be auto-generated or manually specified.         |
| *(inherited)*   | `target` | The class this index is defined on. Inherited from `PropertyMetadata`.      |
| *(inherited)*   | `propertyName` | `string` | The name of the property this metadata applies to.         |
| *(inherited)*   | `type`   | `unknown` | The resolved type of the property.                                 |

---

#### 🧪 Example

```ts
const index = new IndexMetadata();
index.name = 'idx_user_email';
index.target = User;
index.propertyName = 'email';
```

---

#### 🧪 Test Coverage

Tests can be found in:

```
src/test/builders/metadata/index.metadata.spec.ts
```

These tests cover:

- Inheritance from `PropertyMetadata`
- Proper setting of the `name` field
