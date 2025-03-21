# @ialopezg/db

![NPM Version](https://img.shields.io/npm/v/@ialopezg/db)
![License](https://img.shields.io/github/license/ialopezg/db)
![Codecov](https://codecov.io/gh/ialopezg/db/branch/main/graph/badge.svg)

This library provides a simple and flexible query builder for generating SQL queries.
It supports multiple join types and includes support for `INNER`, `LEFT`, `RIGHT`,
`CROSS`, and `NATURAL` joins, as well as condition types like `ON`, `USING`, and `NATURAL`.
---

## 🚀 Features

- **✅ Flexible Join Clauses**: Supports multiple types of joins: `INNER`, `LEFT`, `RIGHT`, `CROSS`, `NATURAL`.
- **✅ Condition Types**: Supports `ON`, `USING`, and `NATURAL` join conditions.
- **✅ Custom Aliases**: Supports aliases for tables in joins.

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

```ts
import { QueryBuilder } from '@ialopezg/db';

const queryBuilder = new QueryBuilder();

// Building a query with INNER JOIN
const query = queryBuilder
  .from('users')
  .innerJoin('orders', 'o')
  .on('users.id = orders.user_id')
  .getQuery();

console.log(query); // Output: SELECT * FROM users INNER JOIN orders o ON users.id = orders.user_id

// Building a query with LEFT JOIN
const query = queryBuilder
  .from('users')
  .leftJoin('orders', 'o')
  .on('users.id = orders.user_id')
  .getQuery();

console.log(query); // Output: SELECT * FROM users LEFT JOIN orders o ON users.id = orders.user_id

// Using USING for a JOIN condition
const query = queryBuilder
  .from('orders')
  .innerJoin('products', 'p')
  .using('product_id')
  .getQuery();

console.log(query); // Output: SELECT * FROM orders INNER JOIN products p USING (product_id)

// CROSS JOIN with USING
const query = queryBuilder
  .from('sessions')
  .crossJoin('users')
  .using('session_id')
  .getQuery();

console.log(query); // Output: SELECT * FROM sessions CROSS JOIN users USING (session_id)
```

### 🐛 Error Handling

If a required condition type or criteria is missing, the library throws an error.

#### Example:
```ts
// Throws error because criteria is missing
queryBuilder
  .leftJoin('users', 'u')
  .using('')
  .getQuery(); // Error: LEFT JOIN requires a condition type (ON or USING) and criteria
```

---

### Changelog
For details on changes and version updates, refer to the [CHANGELOG.md](./CHANGELOG.md).

---

## 📜 License

This project is licensed under the MIT License. See LICENSE for details.
