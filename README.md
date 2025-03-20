# @ialopezg/db

![NPM Version](https://img.shields.io/npm/v/@ialopezg/db)
![License](https://img.shields.io/github/license/ialopezg/db)
![Codecov](https://codecov.io/gh/ialopezg/db/branch/main/graph/badge.svg)

**@ialopezg/db** is a lightweight and flexible database query builder designed for TypeScript and JavaScript
environments.
It provides an intuitive API for constructing SQL queries dynamically with method chaining.

---

## 🚀 Features

- **✅ Fluent Query Builder** – Easily construct SQL queries with a chainable API.
- **✅ Automatic Column Deduplication** – Ensures no duplicate column selections.
- **✅ TypeScript Support** – Fully typed for enhanced development experience.
- **✅ Supports CommonJS, ESM, and UMD** – Flexible module compatibility.
- **✅ Zero Dependencies** – Optimized for performance.

---

## 📝 TODO

- **⚡ ORM Support** – Define and manage models with an object-oriented approach.
- **⚡ Database Management** – Handle migrations and schema updates.
- **⚡ CLI Utilities**: Automate database-related tasks.

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

### Basic Example

```ts
import { QueryBuilder } from "@ialopezg/db";

const query = new QueryBuilder()
  .select('id', 'name')
  .from('users')
  .where('id = 1')
  .getQuery();

console.log(query); // "SELECT id, name FROM users WHERE id = 1"
```

### Selecting Columns

```ts
const query = new QueryBuilder()
  .select('id', 'name')
  .from('users');

console.log(query.getQuery()); // "SELECT id, name FROM users"
```

### Adding Columns with `addColumns`

```ts
const query = new QueryBuilder()
  .select('id')
  .from('users')
  .addColumns('name', 'email');

console.log(query.getQuery()); // "SELECT id, name, email FROM users"
```

### Avoiding Duplicate Columns

```ts
const query = new QueryBuilder()
  .select('id')
  .from('users')
  .addColumns('id');

console.log(query.getQuery()); // "SELECT id FROM users"
```

### Using Table Aliases

```ts
const query = new QueryBuilder()
  .select('id', 'name')
  .from('users', 'u');

console.log(query.getQuery()); // "SELECT id, name FROM users u"
```

### Adding Where Conditions

```ts
const query = new QueryBuilder()
  .select('id', 'name')
  .from('users')
  .where('id = 1');

console.log(query.getQuery()); // "SELECT id, name FROM users WHERE id = 1"
```

### Using andWhere and orWhere

```ts
const query = new QueryBuilder()
  .select('id', 'name')
  .from('users')
  .where('id = 1')
  .andWhere('status = "active"')
  .orWhere('role = "admin"');

console.log(query.getQuery()); // "SELECT id, name FROM users WHERE id = 1 AND status = "active" OR role = "admin""
```

---

## 📜 License

This project is licensed under the MIT License. See LICENSE for details.
