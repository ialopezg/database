# 📘 `CompoundIndexMetadata`

The `CompoundIndexMetadata` class represents a **multi-column (compound) index** applied to an entity/table. This metadata is used internally to define, track, and generate SQL for indexes that span multiple fields.

---

## 🧱 Constructor

```ts
new CompoundIndexMetadata(target: Constructor, fields: string[])
```

### Parameters:
- `target` — The class constructor of the entity this index applies to.
- `fields` — A **non-empty array** of property names that form the index.

### Throws:
- If `target` is not a constructor function.
- If `fields` is empty or not an array.

---

## 🧪 Example

```ts
import { CompoundIndexMetadata } from '@/builders/metadata/compound-index.metadata';

class User {}

const index = new CompoundIndexMetadata(User, ['email', 'status']);

console.log(index.target); // → User
console.log(index.fields); // → ['email', 'status']
```

---

## ✅ Use Case

Compound indexes improve query performance for fields that are frequently queried together. For example:

```sql
-- SQL output generated later from metadata
CREATE INDEX IDX_user_email_status ON user (email, status);
```

This metadata object can later be consumed by a schema builder or introspection engine.
