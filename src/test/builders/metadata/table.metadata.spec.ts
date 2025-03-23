import { TableMetadata } from '../../../builders/metadata';
import { NamingStrategy } from '../../../strategies';

// Mock the NamingStrategy class
class MockNamingStrategy implements NamingStrategy {
  tableName(className: string): string {
    return `table_${className.toLowerCase()}`;
  }

  columnName(propertyName: string): string {
    return `column_${propertyName.toLowerCase()}`;
  }

  relationName(propertyName: string): string {
    return `relation_${propertyName.toLowerCase()}`;
  }
}

describe('TableMetadata', () => {
  let tableMetadata: TableMetadata;

  beforeEach(() => {
    tableMetadata = new TableMetadata(function User() {}, true); // Example target class, set abstract to true
  });

  it('should throw an error if target is not a function', () => {
    expect(() => new TableMetadata(<any>'not a function', true)).toThrow(
      'TableMetadata target must be a function.'
    );
  });

  it('should correctly set the target class', () => {
    expect(typeof tableMetadata.target).toBe('function');
  });

  it('should return the correct table name without naming strategy', () => {
    const tableName = tableMetadata.name;
    expect(tableName).toBe('User');
  });

  it('should return the correct table name with naming strategy', () => {
    tableMetadata.namingStrategy = new MockNamingStrategy();
    const tableName = tableMetadata.name;
    expect(tableName).toBe('table_user');
  });

  it('should correctly identify if the table is abstract', () => {
    expect(tableMetadata.isAbstract).toBe(true);
  });

  it('should allow updating the naming strategy', () => {
    tableMetadata.namingStrategy = new MockNamingStrategy();
    expect(tableMetadata.name).toBe('table_user');
  });
});
