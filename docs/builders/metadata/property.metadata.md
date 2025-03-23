
# `PropertyMetadata` Class

## Overview

The `PropertyMetadata` class serves as an abstract base class for storing metadata about a specific property within a target class. It provides foundational information such as the owning class (target) and the name of the property.

## Class: `PropertyMetadata`

### Description

This abstract class holds metadata related to properties within a class. It includes the class the property belongs to (`target`) and the property’s name (`propertyName`). This class can be extended to add more specific metadata for properties.

### Properties

- **`target`**: `NewableFunction`  
  The class or constructor function to which the property belongs.  
  _Readonly_.

- **`propertyName`**: `string`  
  The name of the property within the target class.  
  _Readonly_.

### Constructor

#### `constructor(target: NewableFunction, propertyName: string)`

Creates an instance of `PropertyMetadata`.

- **`target`** (`NewableFunction`):  
  The constructor function of the class containing the property.
  
- **`propertyName`** (`string`):  
  The name of the property.

### Usage Example

```ts
// Example usage of PropertyMetadata (for a class and property)
class ExampleClass {
  @SomeDecorator()
  public exampleProperty: string;
}

const metadata = new PropertyMetadata(ExampleClass, 'exampleProperty');
console.log(metadata.target);        // Logs: ExampleClass
console.log(metadata.propertyName); // Logs: exampleProperty
```

---

## Notes

- This class is **abstract** and cannot be instantiated directly. It is designed to be extended by other classes that require property metadata.
- It is used as a foundation for creating more specific metadata for properties, such as column metadata in database entities.
