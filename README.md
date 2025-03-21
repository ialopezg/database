# @ialopezg/db

![NPM Version](https://img.shields.io/npm/v/@ialopezg/db)
![License](https://img.shields.io/github/license/ialopezg/db)
![Codecov](https://codecov.io/gh/ialopezg/db/branch/main/graph/badge.svg)

This library provides a simple and flexible query builder for generating SQL queries.
It supports multiple join types and includes support for `INNER`, `LEFT`, `RIGHT`,
`CROSS`, and `NATURAL` joins, as well as condition types like `ON` and `USING`.

---

## 🚀 Features

- **✅ Flexible Query Building**: Supports various SQL clauses including `SELECT`, `WHERE`, `ORDER BY`, and joins.
- **✅ Multiple Join Types**: `INNER`, `LEFT`, `RIGHT`, `CROSS` joins with conditions (`ON` and `USING`).
- **✅ Dynamic Column Selection**: Add or update selected columns dynamically.
- **✅ Advanced Filtering**: Supports `WHERE`, `AND WHERE`, `OR WHERE` for complex conditions.
- **✅ Sorting Support**: Allows sorting with `ORDER BY`.

---

## 📦 Installation

> ⚠️ Note: This package is under active development.

Once released, you’ll be able to install it via **npm** or **yarn**:

### NPM

```sh
npm install @ialopezg/db
```

### Yarn

```sh
yarn add @ialopezg/db
```

---

## 🔧 Usage

### Selecting Columns

```ts
import { QueryBuilder } from '@ialopezg/db';

const queryBuilder = new QueryBuilder();

// Selecting columns from a table
const query = queryBuilder
  .select('id', 'name')
  .from('users')
  .getQuery();

console.log(query); // Output: SELECT id, name FROM users
```

### Adding More Columns

```ts
queryBuilder.addColumns('email', 'created_at');

console.log(queryBuilder.getQuery()); // Output: SELECT id, name, email, created_at FROM users
```

### Joining Tables

```ts
// INNER JOIN with USING
const query = queryBuilder
  .from('orders')
  .innerJoin('products', 'p', 'using', 'product_id')
  .getQuery();

console.log(query); // Output: SELECT * FROM orders INNER JOIN products p USING (product_id)

// LEFT JOIN with ON condition
const query = queryBuilder
  .from('users')
  .leftJoin('orders', 'o', 'on', 'users.id = orders.user_id')
  .getQuery();

console.log(query); // Output: SELECT * FROM users LEFT JOIN orders o ON users.id = orders.user_id
```

### Filtering Data with WHERE

```ts
const query = queryBuilder
  .from('users')
  .where('age > 18')
  .andWhere('status = "active"')
  .orWhere('role = "admin"')
  .getQuery();

console.log(query); // Output: SELECT * FROM users WHERE age > 18 AND status = "active" OR role = "admin"
```

### Sorting Data

```ts
const query = queryBuilder
  .from('users')
  .orderBy({ column: 'name', order: 'asc' })
  .getQuery();

console.log(query); // Output: SELECT * FROM users ORDER BY name ASC
```

---

### 🐛 Error Handling

If a required condition or criteria is missing, the library throws an error.

#### Example:
```ts
// Throws error because criteria is missing
queryBuilder
  .leftJoin('users', 'u', 'using', '')
  .getQuery(); // Error: JOIN requires a valid condition type (ON or USING) and criteria.
```

---

### Changelog
For details on changes and version updates, refer to the [CHANGELOG.md](./CHANGELOG.md).

---

## 📜 License

This project is licensed under the MIT License. See LICENSE for details.

