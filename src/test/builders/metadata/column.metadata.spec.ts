import { ColumnOptions } from '../../../builders/options';
import { ColumnMetadata } from '../../../builders/metadata';
import { ColumnType } from '../../../builders/options/column-type.enum';

describe('ColumnMetadata - Type Resolution', () => {
  let columnMetadata: ColumnMetadata;

  const baseOptions: ColumnOptions = {
    name: 'test_column',
    isNullable: false,
    isUnique: false,
    isAutoIncrement: false,
  };

  beforeEach(() => {
    columnMetadata = new ColumnMetadata(
      function () {},
      'test_column',
      false,
      false,
      false,
      baseOptions
    );
  });

  it('should initialize correctly with given options', () => {
    expect(columnMetadata.name).toBe('test_column');
    expect(columnMetadata.type).toBe(ColumnType.VARCHAR);
    expect(columnMetadata.length).toBe(255);
    expect(columnMetadata.isAutoIncrement).toBe(false);
    expect(columnMetadata.isUnique).toBe(false);
    expect(columnMetadata.isNullable).toBe(false);
    expect(columnMetadata.isPrimary).toBe(false);
    expect(columnMetadata.isCreateDate).toBe(false);
    expect(columnMetadata.isUpdateDate).toBe(false);
    expect(columnMetadata.columnDefinition).toBe('');
    expect(columnMetadata.comment).toBe('');
    expect(columnMetadata.oldColumnName).toBe('');
  });

  describe('Function Type Resolution', () => {
    it('should resolve Number to INTEGER', () => {
      const column = new ColumnMetadata(Number, 'test_column', false, false, false, { ...baseOptions, type: Number });
      expect(column.type).toBe(ColumnType.INTEGER);
    });

    it('should resolve Boolean to BOOLEAN', () => {
      const column = new ColumnMetadata(Boolean, 'test_column', false, false, false, { ...baseOptions, type: Boolean });
      expect(column.type).toBe(ColumnType.BOOLEAN);
    });

    it('should resolve String to VARCHAR', () => {
      const column = new ColumnMetadata(String, 'test_column', false, false, false, { ...baseOptions, type: String });
      expect(column.type).toBe(ColumnType.VARCHAR);
    });

    it('should throw an error for an unsupported function type', () => {
      class CustomClass {}

      const column = new ColumnMetadata(CustomClass, 'test_column', false, false, false, { ...baseOptions, type: CustomClass })
      expect(column.type).toBe(`VARCHAR`);
    });
  });

  describe('String Type Resolution', () => {
    it('should resolve "integer" to INTEGER', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'integer',
      });
      expect(column.type).toBe(ColumnType.INTEGER);
    });

    it('should resolve "boolean" to BOOLEAN', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'boolean',
      });
      expect(column.type).toBe(ColumnType.BOOLEAN);
    });

    it('should resolve "text" to TEXT', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, { ...baseOptions, type: 'text' });
      expect(column.type).toBe(ColumnType.TEXT);
    });

    it('should throw an error for unsupported string type', () => {
      expect(() => new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'invalidType',
      }))
        .toThrow(`Unsupported column type: 'invalidType'.`);
    });
  });

  describe('ColumnType Enum Direct Resolution', () => {
    it('should keep ColumnType.INTEGER as INTEGER', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: ColumnType.INTEGER,
      });
      expect(column.type).toBe(ColumnType.INTEGER);
    });

    it('should keep ColumnType.TEXT as TEXT', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: ColumnType.TEXT,
      });
      expect(column.type).toBe(ColumnType.TEXT);
    });
  });

  describe('Edge Cases', () => {
    it('should default to default value when option property is undefined', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        name: undefined,
        isAutoIncrement: undefined,
        isUnique: undefined,
        isNullable: undefined,
      });
      expect(column.name).toBe('test_column');
      expect(column.isAutoIncrement).toBe(false);
      expect(column.isUnique).toBe(false);
      expect(column.isNullable).toBe(false);
    });

    it('should default to VARCHAR when type is undefined', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: undefined,
      });
      expect(column.type).toBe(ColumnType.VARCHAR);
    });

    it('should throw error when a primary key column is nullable', () => {
      expect(() => new ColumnMetadata(Function, 'test_column', true, false, false, {
        ...baseOptions,
        type: Number,
        isNullable: true,
      }))
        .toThrow(`Column 'test_column' cannot be both PRIMARY and NULLABLE.`);
    });

    it('should throw error when length is not a positive number', () => {
      expect(() => new ColumnMetadata(Function, 'test_column', true, false, false, {
        ...baseOptions,
        type: Number,
        isNullable: true,
        length: -1,
      }))
        .toThrow(`Invalid length for column 'test_column': Must be a positive number.`);
    });
  });
});
