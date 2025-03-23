# `ColumnMetadata` Documentation

## Overview

The `ColumnMetadata` class represents metadata for a database column. It encapsulates various properties such as the
column's name, type, length, and additional options such as whether it is a primary key, auto-increment, or unique. It
is part of a larger ORM (Object-Relational Mapping) system that allows you to define and manage database columns.

## Inheritance

`ColumnMetadata` extends the `PropertyMetadata` class, which provides basic metadata functionality for properties within
a class.

## Properties

### Static Properties

* `typeMap`

  A Map that associates JavaScript types (e.g., number, boolean, string) to `ColumnType` enums.

### Instance Properties

* `_name: string`

  The name of the column. This can either be derived from the property name or provided explicitly in the
  `ColumnOptions`.

* `_type: `ColumnType`

  The type of the column, resolved from the provided options or inferred from the property's type.

* `_length: number | undefined`

  The length of the column, applicable for certain column types (e.g., `VARCHAR`).

* `_isPrimary: boolean`

  Whether the column is a primary key.

* `_isAutoIncrement: boolean`

  Whether the column is auto-incrementing.

* `_isUnique: boolean`

  Whether the column enforces uniqueness.

* `_isNullable: boolean`

  Whether the column allows `NULL` values.

* `_isCreateDate: boolean`

  Whether the column is used to track the creation timestamp.

* `_isUpdateDate: boolean`

  Whether the column is used to track the update timestamp.

* `_columnDefinition: string`

  The raw SQL column definition, if provided.

* `_comment: string`

  The comment associated with the column, if any.

* `_oldColumnName: string`

  The previous column name before renaming, if applicable.

## Constructor

`constructor(target: Function, propertyName: string, isPrimary = false, isCreateDate = false, isUpdateDate = false,
options: ColumnOptions)`

The constructor initializes a `ColumnMetadata` instance with the provided options.

### Parameters:

* `target: Function`

  The target class where this property is defined.

* `propertyName: string`

  The name of the property (column).

* `isPrimary: boolean = false`

  Whether the column is a primary key (default: `false`).

* `isCreateDate: boolean = false`

  Whether the column stores creation timestamps (default: `false`).

* `isUpdateDate: boolean = false`

  Whether the column stores update timestamps (default: `false`).

* `options: ColumnOptions`

  Column-specific options containing properties like `name`, `type`, `length`, and others.

### Throws:

* Throws an error if the column options are invalid.

## Methods

### `resolveColumnType(type?: Function | string): ColumnType`

Resolves the appropriate column type from the provided type.

#### Parameters:

* `type?: Function | string`

  The type provided in `ColumnOptions`. It can be a constructor function or a string representation of the type.

#### Returns:

* A `ColumnType` value representing the resolved column type.

#### Throws:

* Throws an error if the type is unsupported.

### `getDefaultLength(type: ColumnType): number | undefined`

Determines the default length for certain column types.

#### Parameters:

* `type: ColumnType`

  The column type for which the default length should be determined.

#### Returns:

* A number representing the default length for the column type, or `undefined` if no default length is applicable.

### `validateColumnOptions(): void`

Validates the column options to ensure consistency and correctness.

#### Throws:

* Throws an error if the validation fails (e.g., if a column is both `PRIMARY` and `NULLABLE`).

## Getters

* `name: string`
  Returns the column's name.

* `type: ColumnType`
  Returns the column's type.

* `length: number | undefined`
  Returns the column's length, if applicable.

* `isPrimary: boolean`
  Returns whether the column is a primary key.

* `isAutoIncrement: boolean`
  Returns whether the column is auto-incrementing.

* `isUnique: boolean`
  Returns whether the column enforces uniqueness.

* `isNullable: boolean`
  Returns whether the column allows NULL values.

* `isCreateDate: boolean`
  Returns whether the column tracks creation timestamps.

* `isUpdateDate: boolean`
  Returns whether the column tracks update timestamps.

* `columnDefinition: string`
  Returns the raw SQL column definition, if provided.

* `comment: string`
  Returns the column's comment, if any.

* `oldColumnName: string`
  Returns the previous column name before renaming, if applicable.

## Example Usage

```typescript
import { ColumnMetadata } from './column.metadata';
import { ColumnType } from '../options/column-type.enum';

class User {
  @ColumnMetadata({
    name: 'user_id',
    type: ColumnType.INTEGER,
    isPrimary: true,
    isAutoIncrement: true,
    isNullable: false
  })
  userId: number;

  @ColumnMetadata({
    name: 'user_name',
    type: ColumnType.VARCHAR,
    length: 255,
    isUnique: true
  })
  userName: string;
}
```

## Notes

* The `ColumnMetadata` class is designed for use within an ORM or database abstraction layer.
* The `ColumnOptions` interface provides various settings for each column, allowing for customization of database
  schemas.
