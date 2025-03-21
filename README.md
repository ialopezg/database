# @ialopezg/db

![NPM Version](https://img.shields.io/npm/v/@ialopezg/db)
![License](https://img.shields.io/github/license/ialopezg/db)
![Codecov](https://codecov.io/gh/ialopezg/db/branch/main/graph/badge.svg)

This library provides a simple and flexible query builder for generating SQL queries.
It supports multiple join types and includes support for `INNER`, `LEFT`, `RIGHT`,
`CROSS`, and `NATURAL` joins, as well as condition types like `ON` and `USING`.

## QueryBuilder

A simple and flexible SQL query builder for constructing `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries.
It supports joins, conditions, sorting, limits, and offsets, allowing you to easily build and customize SQL queries in a
clean and intuitive manner.

## 🚀 Features

- **Select**: Define the columns to be selected.
- **From**: Specify the table or entity to query from.
- **Joins**: Support for various types of joins (`INNER`, `LEFT`, `RIGHT`, `CROSS`, `NATURAL`).
- **Where**: Add conditions using `AND` or `OR`.
- **Order By**: Specify sorting conditions.
- **Limit & Offset**: Define limits and offsets for pagination.
- **Method Chaining**: All methods return the `QueryBuilder` instance for fluent chaining.

## 📦 Installation

```bash
npm install @ialopezg/db
```

## 🔧 Usage

### Select Columns

```typescript
const query = new QueryBuilder().select("id", "name");
console.log(query.getQuery()); // SELECT id, name FROM table
```

### From Table

```typescript
const query = new QueryBuilder().from("users");
console.log(query.getQuery()); // SELECT * FROM users
```

### Joins

```typescript
const query = new QueryBuilder()
  .select("id", "name")
  .from("users")
  .innerJoin("products", "p", "on", "users.id = products.user_id");

console.log(query.getQuery()); // SELECT id, name FROM users INNER JOIN products p ON users.id = products.user_id
```

### Where Conditions

```typescript
const query = new QueryBuilder()
  .select("id", "name")
  .from("users")
  .where("age > 30");

console.log(query.getQuery()); // SELECT id, name FROM users WHERE age > 30
```

### AND / OR Conditions

```typescript
const query = new QueryBuilder()
  .select("id", "name")
  .from("users")
  .where("age > 30")
  .andWhere("status = 'active'");

console.log(query.getQuery()); // SELECT id, name FROM users WHERE age > 30 AND status = 'active'
```

### Order By

```typescript
const query = new QueryBuilder()
  .select("id", "name")
  .from("users")
  .orderBy("age", "ASC");

console.log(query.getQuery()); // SELECT id, name FROM users ORDER BY age ASC
```

### Limit and Offset

```typescript
const query = new QueryBuilder()
  .select("id", "name")
  .from("users")
  .setLimit(10)
  .setOffset(20);

console.log(query.getQuery()); // SELECT id, name FROM users LIMIT 10 OFFSET 20
```

## 🔥 API

### `select(...columns: string[]): this`

Select the columns to retrieve. If no columns are provided, it defaults to `*`.

### `from(entity: Function | string, alias?: string): this`

Specify the table or entity to query from.
You can pass either a string (table name) or a class (entity).
Optionally, you can provide an alias.

### `innerJoin(entity: string, alias?: string, conditionType?: JoinConditionType, criteria?: string): this`

Adds an `INNER JOIN` to the query. The condition can be specified with `ON`, `USING`, or `NATURAL`.

### `leftJoin(entity: string, alias?: string, conditionType?: JoinConditionType, criteria?: string): this`

Adds a `LEFT JOIN` to the query. The condition can be specified with `ON`, `USING`, or `NATURAL`.

### `rightJoin(entity: string, alias?: string, conditionType?: JoinConditionType, criteria?: string): this`

Adds a `RIGHT JOIN` to the query. The condition can be specified with `ON`, `USING`, or `NATURAL`.

### `crossJoin(entity: string): this`

Adds a `CROSS JOIN` to the query.

### `naturalJoin(entity: string, alias?: string): this`

Adds a `NATURAL JOIN` to the query.

### `where(condition: string): this`

Adds a `WHERE` condition to the query.

### `andWhere(condition: string): this`

Adds an `AND` condition to the query.

### `orWhere(condition: string): this`

Adds an `OR` condition to the query.

### `orderBy(column: string, order: SortType = 'ASC'): this`

Adds an `ORDER BY` clause to the query, specifying the column and sort order (`ASC` or `DESC`).

### `addOrderBy(column: string, order: SortType = 'ASC'): this`

Adds an additional `ORDER BY` clause, avoiding duplicates.

### `setLimit(value: number): this`

Sets the `LIMIT` for the query, restricting the number of rows returned.

### `setOffset(value: number): this`

Sets the `OFFSET` for the query, allowing for pagination.

### `getQuery(): string`

Generate the SQL query based on the specified conditions.

#### Example: Full Query

```typescript
const query = new QueryBuilder()
  .select("id", "name")
  .from("users", "u")
  .innerJoin("orders", "o", "on", "u.id = o.user_id")
  .where("u.status = 'active'")
  .andWhere("o.date > '2025-01-01'")
  .orderBy("u.name")
  .setLimit(10)
  .setOffset(20);

console.log(query.getQuery()); // SELECT id, name FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.date > '2025-01-01' ORDER BY u.name LIMIT 10 OFFSET 20
```

## 🐛 Error Handling

If a required condition or criteria is missing, the library throws an error.

#### Example:

```ts
// Throws error because criteria is missing
queryBuilder
  .leftJoin('users', 'u', 'ON', '')
  .getQuery(); // Error: INNER JOIN requires a condition criteria when using ON
```

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
