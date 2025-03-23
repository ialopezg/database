
# `ColumnType` Enum Documentation

## Overview

The `ColumnType` enum defines the supported column data types for database columns. It ensures type safety when defining column types, preventing errors from invalid type assignments.

## Enum Values

### `ColumnType.INTEGER`
- **Description**: An integer data type. Commonly used for numeric values without decimal precision (e.g., primary keys, counters).
- **Example**: `42`

### `ColumnType.DECIMAL`
- **Description**: A fixed-precision numeric data type. Used for financial calculations or cases requiring exact decimal precision.
- **Example**: `9999.99`

### `ColumnType.VARCHAR`
- **Description**: A variable-length character string. Typically used for names, titles, or short text-based data.
- **Example**: `"John Doe"`

### `ColumnType.TEXT`
- **Description**: A text data type with no predefined length limit. Ideal for long-form content such as descriptions, comments, or articles.
- **Example**: `Lorem ipsum dolor sit amet...`

### `ColumnType.BOOLEAN`
- **Description**: A boolean data type (`true` or `false`). Used for binary states like flags or toggles.
- **Example**: `true`

### `ColumnType.UUID`
- **Description**: A universally unique identifier (UUID) data type. Commonly used for primary keys or unique references.
- **Example**: `"550e8400-e29b-41d4-a716-446655440000"`

### `ColumnType.DATE`
- **Description**: A date-only data type. Stores dates without time components (format: `YYYY-MM-DD`).
- **Example**: `"2025-03-22"`

### `ColumnType.TIMESTAMP`
- **Description**: A timestamp with both date and time components. Typically used for tracking events or records with precise timing.
- **Example**: `"2025-03-22 14:30:00"`

### `ColumnType.FLOAT`
- **Description**: A floating-point numeric data type. Used for values that require decimal precision.
- **Example**: `3.14159`

### `ColumnType.BLOB`
- **Description**: A binary large object (BLOB) data type. Used for storing images, files, or other binary data.
- **Example**: `[image data]`

### `ColumnType.JSON`
- **Description**: A JSON data type for storing structured objects or arrays. Useful for dynamic data structures.
- **Example**: `{"user": "Alice", "roles": ["admin", "editor"]}`
