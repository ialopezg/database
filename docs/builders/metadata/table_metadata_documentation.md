
# `TableMetadata` Documentation

## Overview

The `TableMetadata` class encapsulates metadata for a database table. It stores details about the class representing the table, its name, and whether it is abstract. It also supports an optional custom `NamingStrategy` for resolving the table's name.

## Properties

### Instance Properties

* `target: Function`

  The target class (constructor function) that represents the table.

* `name: string`

  The name of the table. It is either derived from the `name` parameter passed to the constructor or resolved via the `NamingStrategy` if provided.

* `isAbstract: boolean`

  A flag indicating whether the table is abstract (i.e., it shouldn't be directly mapped to a table in the database).

* `namingStrategy?: NamingStrategy`

  An optional `NamingStrategy` instance that can be used to customize how the table name is derived.

## Constructor

`constructor(target: Function, name: string, isAbstract: boolean)`

The constructor initializes the `TableMetadata` instance with the provided values.

### Parameters:

* `target: Function`

  The class constructor function representing the table. This should be a valid function (class).

* `name: string`

  The name of the table. This name can be customized using the `NamingStrategy`.

* `isAbstract: boolean`

  Indicates whether the table is abstract.

### Throws:

* Throws an error if the `target` parameter is not a function.

## Methods

### `get target(): Function`

Returns the target class (constructor function) for the table.

### `get name(): string`

Returns the name of the table. If a `NamingStrategy` is provided, it will resolve the name using the strategy; otherwise, it returns the original `name` passed to the constructor.

### `getIsAbstract(): boolean`

Returns whether the table is abstract.

## Example Usage

```typescript
import { TableMetadata } from './path/to/table.metadata';
import { NamingStrategy } from '../../strategies';

class User {}

const namingStrategy: NamingStrategy = {
  tableName: (className: string) => `${className.toLowerCase()}_table`
};

const tableMetadata = new TableMetadata(User, 'user_table', false);
tableMetadata.namingStrategy = namingStrategy;

console.log(tableMetadata.target);  // Function
console.log(tableMetadata.name);    // 'user_table'
console.log(tableMetadata.getIsAbstract());  // false
```

## Notes

* The `target` is the class constructor function, which is typically the class representing the table in an ORM.
* The `namingStrategy` can be used to modify the table name, allowing custom naming conventions.
* This class is often used in ORM systems to manage the metadata of database tables in a structured manner.
