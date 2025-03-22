# @ialopezg/db

![NPM Version](https://img.shields.io/npm/v/@ialopezg/db)
![License](https://img.shields.io/github/license/ialopezg/db)
![Codecov](https://codecov.io/gh/ialopezg/db/branch/main/graph/badge.svg)

This library provides a simple and flexible query builder for generating SQL queries.
It supports multiple join types and includes support for INNER, LEFT, RIGHT, CROSS, and NATURAL joins, as well as
condition types like ON and USING.

## QueryBuilder

A simple and flexible SQL query builder for constructing SELECT, INSERT, UPDATE, and DELETE queries.
It supports joins, conditions, sorting, limits, offsets, and grouping, allowing you to easily build and customize SQL
queries in a clean and intuitive manner.

## 🚀 Features

- **Select**: Define the columns to be selected.
- **From**: Specify the table or entity to query from.
- **Joins**: Support for various types of joins (`INNER`, `LEFT`, `RIGHT`, `CROSS`, `NATURAL`).
- **Where**: Add conditions using `AND` or `OR`.
- **Group By**: Group results based on one or more columns.
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

### Group By

```typescript
const query = new QueryBuilder()
  .select("category", "COUNT(id)")
  .from("products")
  .groupBy("category");

console.log(query.getQuery()); // SELECT category, COUNT(id) FROM products GROUP BY category
```

#### Adding Group By Columns

```typescript
const query = new QueryBuilder()
  .select('category', 'sub_category', 'COUNT(id)')
  .from('products')
  .groupBy('category')
  .addGroupBy('sub_category');

console.log(query.getQuery()); // SELECT category, sub_category, COUNT(id) FROM products GROUP BY category, sub_category
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

Select the columns to retrieve.

> If no columns are provided, it defaults to `*`.

> Replace any existing `SELECT` columns.

### `addColumns(...columns: string[]): this`

Adds additional columns to the SELECT clause, ensuring no duplicates.

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

> Replace any existing `WHERE` columns.

### `andWhere(condition: string): this`

Adds an `AND` condition to the WHERE clause of the query.

### `orWhere(condition: string): this`

Adds an `OR` condition to the WHERE clause of the query.

### `groupBy(columns: string | string[]): this`

Define the GROUP BY clause with one or more columns.

> Replace any existing `GROUP BY` columns.

### `addGroupBy(columns: string | string[]): this`

Adds additional columns to the GROUP BY clause, ensuring no duplicates.

### `having(condition: string): this`

Adds a `HAVING` condition to the query.

> Replace any existing `HAVING` columns.

### `andHaving(columns: string | string[]): this`

Adds an `AND` condition to the HAVING clause of the query.

### `orHaving(columns: string | string[]): this`

Adds an `OR` condition to the HAVING clause of the query.

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
  .groupBy("u.name")
  .orderBy("u.name")
  .setLimit(10)
  .setOffset(20);

console.log(query.getQuery()); // SELECT id, name FROM users u INNER JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.date > '2025-01-01' GROUP BY u.name ORDER BY u.name LIMIT 10 OFFSET 20
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
