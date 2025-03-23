# DefaultNamingStrategy Documentation

## Overview

The `DefaultNamingStrategy` class provides a basic implementation of the `NamingStrategy` interface.  
It defines methods for naming database tables, columns, and relations by returning the input values unchanged.

## Implementation

`DefaultNamingStrategy` implements the `NamingStrategy` interface, which includes:
- `tableName(className: string): string`
- `columnName(propertyName: string): string`
- `relationName(propertyName: string): string`

This class is useful when a direct mapping between class properties and database fields is desired, without transformations.

## Methods

### `tableName(className: string): string`
Returns the same class name as the table name.

#### Parameters:
- `className: string` — The name of the class.

#### Returns:
- `string` — The table name, identical to the class name.

#### Example:
```typescript
const namingStrategy = new DefaultNamingStrategy();
console.log(namingStrategy.tableName('User')); // Output: 'User'
```

---

### `columnName(propertyName: string): string`
Returns the same property name as the column name.

#### Parameters:
- `propertyName: string` — The name of the property.

#### Returns:
- `string` — The column name, identical to the property name.

#### Example:
```typescript
console.log(namingStrategy.columnName('firstName')); // Output: 'firstName'
```

---

### `relationName(propertyName: string): string`
Returns the same property name as the relation name.

#### Parameters:
- `propertyName: string` — The name of the relation property.

#### Returns:
- `string` — The relation name, identical to the property name.

#### Example:
```typescript
console.log(namingStrategy.relationName('userOrders')); // Output: 'userOrders'
```

---

## Example Usage

```typescript
import { DefaultNamingStrategy } from './default-naming-strategy';

const namingStrategy = new DefaultNamingStrategy();

console.log(namingStrategy.tableName('Order')); // 'Order'
console.log(namingStrategy.columnName('createdAt')); // 'createdAt'
console.log(namingStrategy.relationName('userProfile')); // 'userProfile'
```

## Notes

- This strategy provides a direct 1:1 mapping without modifications.
- Use it when no naming convention transformations are needed.
- For more complex naming strategies, consider extending `NamingStrategy` and overriding these methods.
