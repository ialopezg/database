import { ColumnOptions, ColumnType } from '../../../builders/options';
import { ColumnMetadata } from '../../../builders/metadata';
import { DefaultNamingStrategy } from '../../../strategies';

describe('ColumnMetadata', () => {
  let columnMetadata: ColumnMetadata;

  const baseOptions: ColumnOptions = {
    name: 'test_column',
    isNullable: false,
    isUnique: false,
    isAutoIncrement: false,
  };

  class User {}

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

  describe('General', () => {
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
  });

  describe('String Type Resolution', () => {
    it('should resolve "integer" to INT', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'integer',
      });
      expect(column.type).toBe(ColumnType.INT);
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
        .toThrow(`Invalid column type for 'invalidType': 'test_column' is not a supported type.`);
    });
  });

  describe('Function Type Resolution', () => {
    it('should resolve Number to INT', () => {
      const column = new ColumnMetadata(Number, 'test_column', false, false, false, { ...baseOptions, type: Number });
      expect(column.type).toBe(ColumnType.INT);
    });

    it('should resolve Boolean to BOOLEAN', () => {
      const column = new ColumnMetadata(Boolean, 'test_column', false, false, false, { ...baseOptions, type: Boolean });
      expect(column.type).toBe(ColumnType.BOOLEAN);
    });

    it('should resolve String to VARCHAR', () => {
      const column = new ColumnMetadata(String, 'test_column', false, false, false, { ...baseOptions, type: String });
      expect(column.type).toBe(ColumnType.VARCHAR);
    });

    it('should default to VARCHAR for unsupported function types', () => {
      class CustomClass {}
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, { ...baseOptions, type: CustomClass });
      expect(column.type).toBe(ColumnType.VARCHAR);
    });
  });

  describe('ColumnType Enum Direct Resolution', () => {
    it('should resolve "number" to INT', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'number',
      });
      expect(column.type).toBe(ColumnType.INT);
    });

    it('should resolve "text" to TEXT', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'text',
      });
      expect(column.type).toBe(ColumnType.TEXT);
    });
  });

  describe('Edge Cases', () => {
    it('should default values when optional properties are undefined', () => {
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
      expect(column.default).toBe(undefined);
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
        .toThrow(`Invalid length for column 'test_column': Length must be a positive number greater than zero. Provided length: -1`);
    });

    it('should throw error for invalid column name', () => {
      expect(() => {
        new ColumnMetadata(Function, '123invalid-name', false, false, false, {} as ColumnOptions);
      }).toThrow(`Invalid column name: "123invalid-name". Column names must start with a letter or underscore and contain only alphanumeric characters or underscores.`);
    });

    it('should normalize column name by trimming whitespace', () => {
      const column = new ColumnMetadata(Function, '  test_column  ', false, false, false, baseOptions);
      expect(column.name).toBe('test_column');
    });

    it('should resolve raw enum string "uuid" from ColumnType', () => {
      const column = new ColumnMetadata(Function, 'test_column', false, false, false, {
        ...baseOptions,
        type: 'uuid',
      });

      expect(column.type).toBe(ColumnType.UUID);
    });

    it('should throw InvalidColumnTypeError for completely unknown type', () => {
      expect(() =>
        new ColumnMetadata(Function, 'test_column', false, false, false, {
          ...baseOptions,
          type: 'not-a-real-type',
        })
      ).toThrow(`Invalid column type for 'not-a-real-type': 'test_column' is not a supported type.`);
    });

    it('should fallback to VARCHAR when function type is not in typeMap', () => {
      class Unknown {}

      const column = new ColumnMetadata(Unknown, 'test_column', false, false, false, {
        ...baseOptions,
        type: Unknown,
      });

      expect(column.type).toBe(ColumnType.VARCHAR);
    });

    it('should throw when ColumnType.VARCHAR has length set to 0', () => {
      expect(() =>
        new ColumnMetadata(Function, 'test_column', false, false, false, {
          name: 'test_column',
          type: ColumnType.VARCHAR,
          isNullable: false,
          isUnique: false,
          isAutoIncrement: false,
          length: 0,
        })
      ).toThrow(`Invalid length for column 'test_column': Length must be a positive number greater than zero. Provided length: 0`);
    });
  });

  describe('Validation', () => {
    it('should throw when CHAR column has invalid length', () => {
      expect(() => {
        new ColumnMetadata(User, 'code', false, false, false, {
          type: ColumnType.CHAR,
          length: 0,
        });
      }).toThrow(
        "Invalid length for column 'code': Length must be a positive number greater than zero. Provided length: 0"
      );
    });

    it('should throw if FLOAT has invalid length <= 0', () => {
      expect(() => {
        new ColumnMetadata(User, 'balance', false, false, false, {
          type: ColumnType.FLOAT,
          length: 0,
        });
      }).toThrow(
        "Invalid length for column 'balance': Length must be a positive number greater than zero. Provided length: 0"
      );
    });

    it('should throw if primary key column is nullable', () => {
      expect(() => {
        new ColumnMetadata(User, 'id', true, false, false, {
          type: ColumnType.INT,
          isNullable: true,
        });
      }).toThrow(
        "Column 'id' cannot be both PRIMARY and NULLABLE."
      );
    });

    it('should pass if all options are valid (VARCHAR)', () => {
      const column = new ColumnMetadata(User, 'name', false, false, false, {
        type: ColumnType.VARCHAR,
        length: 100,
        isNullable: false,
      });

      expect(column.length).toBe(100);
    });

    it('should pass if CHAR has valid length', () => {
      const column = new ColumnMetadata(User, 'code', false, false, false, {
        type: ColumnType.CHAR,
        length: 1,
      });

      expect(column.length).toBe(1);
    });

    it('should pass if non-length-requiring type has no length', () => {
      const column = new ColumnMetadata(User, 'meta', false, false, false, {
        type: ColumnType.JSON,
      });

      expect(column.length).toBeUndefined();
    });
  });

  describe('Default Length Inference', () => {
    it('should default to length 255 for VARCHAR', () => {
      const column = new ColumnMetadata(User, 'name', false, false, false, {
        type: ColumnType.VARCHAR,
      });
      expect(column.length).toBe(255);
    });

    it('should default to length 1 for CHAR', () => {
      const column = new ColumnMetadata(User, 'code', false, false, false, {
        type: ColumnType.CHAR,
      });
      expect(column.length).toBe(1);
    });

    it('should default to length 11 for INT', () => {
      const column = new ColumnMetadata(User, 'age', false, false, false, {
        type: ColumnType.INT,
      });
      expect(column.length).toBe(11);
    });

    it('should default to length 10 for FLOAT', () => {
      const column = new ColumnMetadata(User, 'balance', false, false, false, {
        type: ColumnType.FLOAT,
      });
      expect(column.length).toBe(10);
    });

    it('should default to length 1 for BOOLEAN', () => {
      const column = new ColumnMetadata(User, 'active', false, false, false, {
        type: ColumnType.BOOLEAN,
      });
      expect(column.length).toBe(1);
    });

    it('should return undefined length for TEXT', () => {
      const column = new ColumnMetadata(User, 'bio', false, false, false, {
        type: ColumnType.TEXT,
      });
      expect(column.length).toBeUndefined();
    });

    it('should return undefined length for JSON', () => {
      const column = new ColumnMetadata(User, 'meta', false, false, false, {
        type: ColumnType.JSON,
      });
      expect(column.length).toBeUndefined();
    });

    it('should return undefined length for DATE', () => {
      const column = new ColumnMetadata(User, 'birthday', false, false, false, {
        type: ColumnType.DATE,
      });
      expect(column.length).toBeUndefined();
    });

    it('should return undefined length for TIMESTAMP', () => {
      const column = new ColumnMetadata(User, 'created_at', false, false, false, {
        type: ColumnType.TIMESTAMP,
      });
      expect(column.length).toBeUndefined();
    });

    it('should return undefined for unknown type (BLOB)', () => {
      const column = new ColumnMetadata(User, 'avatar', false, false, false, {
        type: ColumnType.BLOB,
      });
      expect(column.length).toBeUndefined();
    });
  });

  describe('NamingStrategy', () => {
    class User {
      format: string;

      constructor(name: string) {
        this.format = name;
      }
    }

    it('should resolve the column name with naming strategy', () => {
      const column = new ColumnMetadata(User, 'format', false, false, false, {});
      column.namingStrategy = new DefaultNamingStrategy();

      expect(column.name).toBe('format');
    });

    it('should resolve the column name without naming strategy', () => {
      const column = new ColumnMetadata(User, 'format', false, false, false, {});
      expect(column.name).toBe('format');
    });
  });
});
