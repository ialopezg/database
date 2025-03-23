
# Error Handling Classes

This section provides the custom error classes used for error handling within the project. These classes provide specialized error messages to help debug and manage issues effectively.

## Overview

The error handling classes are based on a base error class (`BaseError`) and are used to throw specific errors related to invalid column types, lengths, or options in the context of database schema management.

### Error Classes

#### 1. `BaseError`

The `BaseError` class is the base class for all custom errors in the application. It extends the native `Error` class and provides a mechanism to capture the stack trace and set a consistent error name based on the class name.

##### Constructor

```typescript
constructor(message: string)
```

- **message**: The error message that describes the error.

#### 2. `InvalidColumnTypeError`

The `InvalidColumnTypeError` class is thrown when an invalid column type is encountered. It helps identify cases where an unsupported column type is provided.

##### Constructor

```typescript
constructor(columnName: string, type: string)
```

- **columnName**: The name of the column with the invalid type.
- **type**: The invalid column type.

##### Example

```typescript
throw new InvalidColumnTypeError('user_email', 'UNKNOWN_TYPE');
```

#### 3. `InvalidColumnLengthError`

The `InvalidColumnLengthError` class is thrown when the length of a column is invalid. This typically occurs when the provided length is not a positive number.

##### Constructor

```typescript
constructor(columnName: string, length: number)
```

- **columnName**: The name of the column with the invalid length.
- **length**: The invalid length provided.

##### Example

```typescript
throw new InvalidColumnLengthError('username', -255);
```

#### 4. `InvalidColumnOptionsError`

The `InvalidColumnOptionsError` class is thrown when any column option is invalid. This can include invalid combinations of constraints like primary key and nullable, among other column properties.

##### Constructor

```typescript
constructor(message: string)
```

- **message**: The error message describing the invalid column options.

##### Example

```typescript
throw new InvalidColumnOptionsError('Column cannot be both PRIMARY and NULLABLE');
```

---

## Error Handling Usage

To make use of the error classes:

1. **Throwing Errors**: 
   When encountering invalid column types, lengths, or options during schema generation or migrations, the appropriate error class should be thrown to provide clear and specific error messages.

2. **Catching Errors**: 
   You can catch these errors with `try-catch` blocks to handle them gracefully or log them for debugging purposes.

```typescript
try {
  // Schema generation logic that may throw errors
} catch (error) {
  if (error instanceof InvalidColumnTypeError) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error(`Unexpected error: ${error.message}`);
  }
}
```

---

## Example Code

```typescript
import { InvalidColumnTypeError, InvalidColumnLengthError, InvalidColumnOptionsError } from './errors';

try {
  // Example: Handling an invalid column type error
  throw new InvalidColumnTypeError('user_email', 'UNKNOWN_TYPE');
} catch (error) {
  if (error instanceof InvalidColumnTypeError) {
    console.error(`Error: ${error.message}`);
  }
}
```

---

## Conclusion

By using these error classes, the application will throw specific, descriptive errors when invalid column configurations are encountered. This improves the maintainability and debugging experience by making error messages clearer and more specific to the context.
