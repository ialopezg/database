# Schema Builder System
 
A modular, extensible system for managing and introspecting database schemas across SQL engines. Built with clean
architecture principles, test-driven development, and designed for multi-engine support.

---

## 📦 Overview

This project provides a structured schema management layer composed of:

- **SchemaBuilder Interface** — A contract all schema builders must implement.
- **BaseSchemaBuilder (Abstract)** — Shared logic and helper utilities.
- **MySQLSchemaBuilder** — Concrete implementation for MySQL.

---

## 🧱 Architecture

```text
SchemaBuilder (interface)
   └── BaseSchemaBuilder (abstract class)
           └── MySQLSchemaBuilder (concrete implementation)
```

- Interface defines features (createTable, getColumns, etc.)
- Abstract class implements shared behavior (wrapQuery, validation, etc.)
- MySQLSchemaBuilder customizes for MySQL engine specifics

> Note: `escapeIdentifier` and `escapeLiteral` are abstract in BaseSchemaBuilder and currently implemented in
> MySQLSchemaBuilder.

---

## ✅ Features

### Table Management

- `createTable`
- `dropTable`

### Column Management

- `addColumn`
- `dropColumn`
- `renameColumn`
- `alterColumn`
- `getChangedColumns`

### Index Management

- `createIndex`
- `dropIndex`

### Constraint Management

- `addUniqueKey`
- `dropUniqueKey`
- `addForeignKey`
- `dropForeignKey`

### Introspection

- `getTables`
- `getTableColumns`
- `getColumnDefinition`
- `getPrimaryKey`
- `getForeignKeys`
- `getTableIndexes`
- `getUniqueConstraints`
- `getUniqueConstraintNames`
- `getDatabaseVersion`

---

## 🧪 Test Coverage

- ✅ 100% line and branch coverage
- Extensive unit tests for every method
- Edge cases, errors, and fallbacks included

---

## 🛠 Helper Functions

All reusable logic is grouped under a dedicated **Helper Functions** section in each builder:

- `normalizeType`
- `compareLength`
- `checkMySQLVersion`
- `buildColumnDefinition`
- `isColumnChanged`
- `isPrimaryKeyColumn`
- `getSchemaQuery`

---

## 🧩 Type Safety & Docs

- All public methods have complete JSDoc with inferred parameter and return types
- Shared introspection types live in:
  ```
  src/driver/schema/introspection/
  ```

---

## 🧠 Next Steps

- **Review** whether `escapeIdentifier` and `escapeLiteral` should remain engine-specific or be abstracted.
- **PostgreSQLBuilder** implementation using the same interface/base.
- Optional: CLI, migration engine, visual schema viewer.

---

## 🤝 Contribution Guidelines

- Follow feature grouping: Table, Column, Index, Constraint, Introspection, Helpers
- Add JSDoc to all public methods
- Cover every method and helper with isolated tests
- Use `InvalidNameError` for safe identifier validation

---

## 🏁 Conclusion

You now have a fully modular, testable, extensible schema builder framework with driver-specific customizations and a
shared base of utilities. Ideal for building advanced schema tools and migrations in multi-DB environments.

> Maintainer Note: This project uses flow-based grouping and clear documentation for long-term scalability.
