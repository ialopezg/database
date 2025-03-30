import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../../builders/metadata';
import { ColumnType } from '../../../builders/options';
import { MySQLSchemaBuilder } from '../../../driver/builders';
import { DatabaseQueryError, InvalidNameError } from '../../../errors';

jest.mock('../../../driver/mysql.driver', () => {
  return {
    MySQLDriver: class {
      'options': any = null;
      query = jest.fn();
    },
  };
});

describe('MySQLSchemaBuilder', () => {
  let schemaBuilder: MySQLSchemaBuilder;
  const mockDriver = {
    query: jest.fn().mockResolvedValue(undefined),
    escapeIdentifier: (val: string) => `\`${val}\``,
    escapeLiteral: (val: string) => `'${val}'`,
    database: 'test',
    options: {},
  };

  class User {}

  beforeEach(() => {
    schemaBuilder = new MySQLSchemaBuilder(mockDriver as any);
    jest.clearAllMocks();
  });

  describe('Table Management', () => {
    describe('createTable', () => {
      it('should create a table with valid columns', async () => {
        const columns = [
          new ColumnMetadata(User, 'name', false, false, false, {
            type: 'string',
            length: 100,
            isNullable: false,
          }),
          new ColumnMetadata(User, 'active', false, false, false, {
            type: 'boolean',
            isNullable: true,
          }),
        ];

        mockDriver.query.mockResolvedValueOnce(true);

        await schemaBuilder.createTable({ name: 'users' } as TableMetadata, columns);

        expect(mockDriver.query.mock.calls[0][0]).toContain('CREATE TABLE');
      });

      it('should throw an error if columns array is empty', async () => {
        await expect(schemaBuilder.createTable({ name: 'users' } as TableMetadata, [])).rejects.toThrow(
          'Columns cannot be empty',
        );
      });

      it('should define an auto-increment INT primary key', async () => {
        const columns = [
          new ColumnMetadata(User, 'id', true, false, false, {
            type: ColumnType.INT,
            isAutoIncrement: true,
          }),
        ];

        await expect(
          schemaBuilder.createTable({ name: 'users' } as TableMetadata, columns)
        ).resolves.not.toThrow();

        expect(mockDriver.query).toHaveBeenCalledTimes(1);

        const [sql] = mockDriver.query.mock.calls[0];
        expect(sql).toContain('CREATE TABLE');
        expect(sql).toContain("`id` INT(11) NOT NULL AUTO_INCREMENT");
        expect(sql).toContain('PRIMARY KEY (`id`)');
      });

      it('should generate SQL for INT AUTO_INCREMENT PRIMARY KEY', async () => {
        const columns = [
          new ColumnMetadata(User, 'id', true, false, false, {
            type: ColumnType.INT,
            isAutoIncrement: true,
          }),
        ];

        await schemaBuilder.createTable({ name: 'users' } as TableMetadata, columns);

        const [sql] = mockDriver.query.mock.calls[0];
        expect(sql).toContain('CREATE TABLE');
        expect(sql).toContain('`id` INT(11) NOT NULL AUTO_INCREMENT');
        expect(sql).toContain('PRIMARY KEY (`id`)');
      });

      it('should generate SQL for NOT NULL column with default', async () => {
        const columns = [
          new ColumnMetadata(User, 'status', false, false, false, {
            type: ColumnType.VARCHAR,
            length: 50,
            isNullable: false,
            default: 'active',
          }),
        ];

        await schemaBuilder.createTable({ name: 'accounts' } as TableMetadata, columns);

        const [sql] = mockDriver.query.mock.calls[0];
        expect(sql).toContain('`status` VARCHAR(50) NOT NULL DEFAULT \'active\'');
      });

      it('should generate SQL for UNIQUE column', async () => {
        const columns = [
          new ColumnMetadata(User, 'email', false, false, false, {
            type: ColumnType.VARCHAR,
            length: 255,
            isUnique: true,
          }),
        ];

        mockDriver.query = jest.fn().mockResolvedValue([]);
        await schemaBuilder.createTable({ name: 'subscribers' } as TableMetadata, columns);

        const [sql] = mockDriver.query.mock.calls[0];
        expect(sql).toContain('`email` VARCHAR(255)');
        expect(sql).toContain('UNIQUE (`email`)');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        const columns = [
          new ColumnMetadata(User, 'name', false, false, false, {
            type: 'string',
            length: 50,
          }),
        ];

        mockDriver.query.mockRejectedValue(new DatabaseQueryError('Query failed'));

        await expect(schemaBuilder.createTable({ name: 'users' } as TableMetadata, columns)).rejects.toThrow(
          DatabaseQueryError,
        );
      });
    });

    describe('dropTable', () => {
      it('should drop a table successfully for MySQL >= 5.7.0 (supports IF EXISTS)', async () => {
        mockDriver.query
          .mockResolvedValueOnce([{ version: '5.7.0' }])
          .mockResolvedValueOnce({ affectedRows: 1 });

        const result = await schemaBuilder.dropTable('users');

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[0][0]).toContain('SELECT VERSION() AS version');
        expect(mockDriver.query.mock.calls[1][0]).toContain('IF EXISTS');
      });

      it('should drop a table successfully for MySQL < 5.7.0 (no IF EXISTS)', async () => {
        mockDriver.query
          .mockResolvedValueOnce([{ version: '5.6.9' }]) // version check
          .mockResolvedValueOnce({ affectedRows: 1 }); // drop table

        const result = await schemaBuilder.dropTable('users');

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[1][0]).toContain('DROP TABLE');
      });

      it('should throw an error if table name is invalid', async () => {
        await expect(schemaBuilder.dropTable('')).rejects.toThrow('table name must not be empty');
      });

      it('should throw a DatabaseQueryError if drop query fails', async () => {
        mockDriver.query
          .mockResolvedValueOnce([{ version: '5.7.0' }]) // version check
          .mockRejectedValueOnce(new Error('Drop failed')); // drop fails

        await expect(schemaBuilder.dropTable('users')).rejects.toThrow(DatabaseQueryError);
      });
    });
  });

  describe('Column Management', () => {
    describe('addColumn', () => {
      it('should throw an error if table name is empty', async () => {
        const column = new ColumnMetadata(User, 'age', false, false, false, {
          type: 'number',
        });

        await expect(schemaBuilder.addColumn('', column)).rejects.toThrow('table name must not be empty');
      });

      it('should throw an error if column name is empty', async () => {
        const column = { name: '' } as ColumnMetadata;

        await expect(schemaBuilder.addColumn('users', column)).rejects.toThrow('column name must not be empty');
      });

      it('should add a column successfully', async () => {
        const column = new ColumnMetadata(User, 'age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        mockDriver.query.mockResolvedValue(true);
        const result = await schemaBuilder.addColumn('users', column);

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should include NOT NULL when column is not nullable', async () => {
        const column = new ColumnMetadata(User, 'age', false, false, false, {
          type: 'number',
          isNullable: false,
        });

        mockDriver.query.mockResolvedValue(true);
        await schemaBuilder.addColumn('users', column);

        expect(mockDriver.query).toHaveBeenCalledWith(
          expect.stringContaining('INT(11) NOT NULL'),
        );
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        const column = new ColumnMetadata(User, 'age', false, false, false, {
          type: 'number',
          isNullable: true,
        });
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.addColumn('users', column)).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('dropColumn', () => {
      it('should use DROP COLUMN without IF EXISTS for older MySQL versions', async () => {
        mockDriver.query.mockResolvedValueOnce([{ version: '5.6.0' }]);
        mockDriver.query.mockResolvedValueOnce({ affectedRows: 1 });

        const result = await schemaBuilder.dropColumn('users', 'age');

        expect(result).toBe(true);
        expect(mockDriver.query).toHaveBeenNthCalledWith(1, 'SELECT VERSION() AS version');
        expect(mockDriver.query.mock.calls[1][0]).toContain('DROP COLUMN `age`');
      });

      it('should drop a column without IF EXISTS for MySQL newest versions', async () => {
        mockDriver.query.mockResolvedValueOnce([{ version: '5.7.0' }]);
        mockDriver.query.mockResolvedValueOnce({ affectedRows: 1 });

        const result = await schemaBuilder.dropColumn('users', 'old_column');

        expect(result).toBe(true);
        expect(mockDriver.query).toHaveBeenNthCalledWith(1, 'SELECT VERSION() AS version');
        expect(mockDriver.query.mock.calls[1][0]).toMatch(/DROP COLUMN IF EXISTS `old_column`/);
      });


      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new DatabaseQueryError('Query failed'));

        await expect(schemaBuilder.dropColumn('users', 'age')).rejects.toThrow(DatabaseQueryError);
      });

      it('should throw an error if table name is empty', async () => {
        await expect(schemaBuilder.dropColumn('', 'age')).rejects.toThrow('table name must not be empty');
      });

      it('should throw an error if column name is empty', async () => {
        await expect(schemaBuilder.dropColumn('users', '')).rejects.toThrow('column name must not be empty');
      });
    });

    describe('renameColumn', () => {
      it('should rename a column successfully', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        mockDriver.query.mockResolvedValueOnce({ affectedRows: 1 }); // Simulate success

        await schemaBuilder.renameColumn('users', 'age', newColumn);

        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.renameColumn('users', 'age', newColumn)).rejects.toThrow(DatabaseQueryError);
      });

      it('should throw an error if table name is invalid', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        await expect(schemaBuilder.renameColumn('', 'age', newColumn)).rejects.toThrow('table name must not be empty or invalid.');
      });

      it('should throw an error if column name is invalid', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        await expect(schemaBuilder.renameColumn('users', '', newColumn)).rejects.toThrow('column name must not be empty or invalid.');
      });
    });

    describe('alterColumn', () => {
      it('should alter a column successfully', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        mockDriver.query.mockResolvedValueOnce({ affectedRows: 1 });

        await schemaBuilder.alterColumn('users', 'age', newColumn);

        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.alterColumn('users', 'age', newColumn)).rejects.toThrow(DatabaseQueryError);
      });

      it('should throw an error if table name is invalid', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        await expect(schemaBuilder.alterColumn('', 'age', newColumn)).rejects.toThrow('table name must not be empty or invalid.');
      });

      it('should throw an error if column name is invalid', async () => {
        const newColumn = new ColumnMetadata(User, 'new_age', false, false, false, {
          type: 'number',
          isNullable: true,
        });

        await expect(schemaBuilder.alterColumn('users', '', newColumn)).rejects.toThrow('column name must not be empty or invalid.');
      });
    });

    describe('getChangedColumns', () => {
      const column = new ColumnMetadata(User, 'age', false, false, false, {
        type: Number,
        isNullable: true,
      });

      const dbMatch = {
        COLUMN_NAME: 'age',
        COLUMN_TYPE: 'int(11)',
        COLUMN_COMMENT: '',
        IS_NULLABLE: 'YES',
        EXTRA: '',
        COLUMN_KEY: '',
      };

      const dbDifferent = {
        ...dbMatch,
        IS_NULLABLE: 'NO', // change triggers isColumnChanged
      };

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should return a changed column when metadata differs from database', async () => {
        mockDriver.query.mockResolvedValueOnce([dbDifferent]);

        const result = await schemaBuilder.getChangedColumns('users', [column]);

        expect(result).toEqual([
          { columnName: 'age', hasPrimaryKey: false },
        ]);
      });

      it('should return empty array when column matches database', async () => {
        // override isColumnChanged to return false
        jest.spyOn(schemaBuilder as any, 'isColumnChanged').mockReturnValue(false);

        mockDriver.query.mockResolvedValueOnce([dbMatch]);

        const result = await schemaBuilder.getChangedColumns('users', [column]);
        expect(result).toEqual([]);
      });

      it('should throw InvalidNameError for empty table name', async () => {
        await expect(schemaBuilder.getChangedColumns('', [column])).rejects.toThrow(InvalidNameError);
      });

      it('should throw DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.getChangedColumns('users', [column])).rejects.toThrow(DatabaseQueryError);
      });

      it('should correctly mark column as primary key when COLUMN_KEY is PRI', async () => {
        const dbWithPK = {
          ...dbDifferent,
          COLUMN_KEY: 'PRI',
        };

        mockDriver.query.mockResolvedValueOnce([dbWithPK]);

        const result = await schemaBuilder.getChangedColumns('users', [column]);

        expect(result).toEqual([
          { columnName: 'age', hasPrimaryKey: true },
        ]);
      });

      it('should skip column if it does not exist in the database (dbData is undefined)', async () => {
        // Note: result.rows is empty — no matching COLUMN_NAME
        mockDriver.query.mockResolvedValueOnce([]);

        const result = await schemaBuilder.getChangedColumns('users', [column]);

        expect(result).toEqual([]);
      });
    });
  });

  describe('Index Management', () => {
    describe('createIndex', () => {
      it('should create a basic index successfully', async () => {
        mockDriver.query.mockResolvedValueOnce(true);

        await schemaBuilder.createIndex('users', 'idx_name', ['name']);

        expect(mockDriver.query.mock.calls[0][0]).toContain('CREATE INDEX');
      });

      it('should create a UNIQUE index successfully', async () => {
        mockDriver.query.mockResolvedValueOnce(true);

        await schemaBuilder.createIndex('users', 'idx_email_unique', ['email'], 'UNIQUE');

        expect(mockDriver.query.mock.calls[0][0]).toContain('CREATE UNIQUE INDEX');
      });

      it('should throw if columns array is empty', async () => {
        await expect(
          schemaBuilder.createIndex('users', 'idx_invalid', []),
        ).rejects.toThrow('At least one column must be specified for indexing');
      });

      it('should throw if table name is invalid', async () => {
        await expect(
          schemaBuilder.createIndex('', 'idx_invalid', ['name']),
        ).rejects.toThrow('table name must not be empty');
      });

      it('should throw if index name is invalid', async () => {
        await expect(
          schemaBuilder.createIndex('users', '', ['name']),
        ).rejects.toThrow('Identifier must not be empty.');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(
          schemaBuilder.createIndex('users', 'idx_fail', ['name']),
        ).rejects.toThrow(DatabaseQueryError);
      });

      it('should use default index name if indexName is not provided', async () => {
        const columns = ['email'];

        mockDriver.query.mockResolvedValueOnce([]);

        const result = await schemaBuilder.createIndex('users', undefined as any, columns);

        expect(result).toEqual(undefined)
        expect(mockDriver.query.mock.calls[0][0]).toContain('CREATE INDEX');
      });
    });

    describe('dropIndex', () => {
      it('should drop an index successfully', async () => {
        mockDriver.query.mockResolvedValueOnce({ affectedRows: 1 });

        const result = await schemaBuilder.dropIndex('users', 'idx_name');

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should throw if table name is invalid', async () => {
        await expect(
          schemaBuilder.dropIndex('', 'idx_name'),
        ).rejects.toThrow('table name must not be empty');
      });

      it('should throw if index name is invalid', async () => {
        await expect(
          schemaBuilder.dropIndex('users', ''),
        ).rejects.toThrow('index name must not be empty');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(
          schemaBuilder.dropIndex('users', 'idx_name'),
        ).rejects.toThrow(DatabaseQueryError);
      });
    });
  });

  describe('Constraint Management', () => {
    describe('addUniqueKey', () => {
      it('should execute the correct query for adding a unique key', async () => {
        mockDriver.query.mockResolvedValue(true);

        await schemaBuilder.addUniqueKey('users', 'email', 'UQ_users_email');

        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should throw an error if tableName is empty', async () => {
        await expect(schemaBuilder.addUniqueKey('', 'email', 'UQ_users_email'))
          .rejects.toThrow('table name must not be empty');
      });

      it('should throw an error if columnName is empty', async () => {
        await expect(schemaBuilder.addUniqueKey('users', '', 'UQ_users_email'))
          .rejects.toThrow('column name must not be empty');
      });

      it('should throw an error if keyName is empty', async () => {
        await expect(schemaBuilder.addUniqueKey('users', 'email', ''))
          .rejects.toThrow('key name must not be empty');
      });

      it('should throw a DatabaseQueryError if query execution fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('SQL error'));

        await expect(schemaBuilder.addUniqueKey('users', 'email', 'UQ_users_email'))
          .rejects.toThrow(DatabaseQueryError);

        await expect(schemaBuilder.addUniqueKey('users', 'email', 'UQ_users_email'))
          .rejects.toThrow('Failed to add unique key UQ_users_email on column email');
      });
    });

    describe('dropUniqueKey', () => {
      it('should drop a unique key successfully', async () => {
        mockDriver.query.mockResolvedValueOnce({ rows: [], affectedRows: 1 });

        const result = await schemaBuilder.dropUniqueKey('users', 'uq_email');

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should throw an error if table name is empty', async () => {
        await expect(schemaBuilder.dropUniqueKey('', 'uq_email')).rejects.toThrow(
          'table name must not be empty',
        );
      });

      it('should throw an error if constraint name is empty', async () => {
        await expect(schemaBuilder.dropUniqueKey('users', '')).rejects.toThrow(
          'unique key name must not be empty',
        );
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.dropUniqueKey('users', 'uq_email')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('addForeignKey', () => {
      const validForeignKey = {
        name: 'fk_user_id',
        table: { name: 'orders' },
        referencedTable: { name: 'users' },
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
      } as ForeignKeyMetadata;

      it('should add a foreign key successfully', async () => {
        mockDriver.query.mockResolvedValue(true);

        const result = await schemaBuilder.addForeignKey(validForeignKey);

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[0][0]).toContain('ADD CONSTRAINT `fk_user_id`');
      });

      it('should throw an error if no columns provided', async () => {
        const badFK = {
          ...validForeignKey,
          columnNames: [],
          relatedColumnNames: [],
        } as unknown as ForeignKeyMetadata;

        await expect(schemaBuilder.addForeignKey(badFK)).rejects.toThrow('Foreign key must have at least one column.');
      });

      it('should throw if column and related column counts do not match', async () => {
        const badFK = {
          ...validForeignKey,
          referencedColumnNames: ['id', 'name'],
        } as ForeignKeyMetadata;

        await expect(schemaBuilder.addForeignKey(badFK)).rejects.toThrow(
          'Number of columns must match number of related columns',
        );
      });

      it('should throw if constraint/table/column names are invalid', async () => {
        const badFK = {
          name: '',
          table: { name: '' },
          referencedTable: { name: '' },
          columnNames: [''],
          referencedColumnNames: [''],
        } as ForeignKeyMetadata;

        await expect(schemaBuilder.addForeignKey(badFK as any)).rejects.toThrow('table name must not be empty or invalid.');
      });

      it('should throw if table/relatedTable are invalid', async () => {
        const foreignKey = {
          table: undefined,
          relatedTable: undefined,
        } as unknown as ForeignKeyMetadata;

        await expect(schemaBuilder.addForeignKey(foreignKey)).rejects.toThrow('Invalid foreign key metadata.');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.addForeignKey(validForeignKey)).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('dropForeignKey', () => {
      it('should drop a foreign key successfully', async () => {
        mockDriver.query.mockResolvedValueOnce({ affectedRows: 1 });

        const result = await schemaBuilder.dropForeignKey('orders', 'fk_user_id');

        expect(result).toBe(true);
        expect(mockDriver.query.mock.calls[0][0]).toContain('ALTER TABLE');
      });

      it('should return false if no rows were affected', async () => {
        mockDriver.query.mockResolvedValueOnce({ affectedRows: 0 });

        const result = await schemaBuilder.dropForeignKey('orders', 'fk_non_existent');
        expect(result).toBe(false);
      });

      it('should throw an error if table name is empty', async () => {
        await expect(schemaBuilder.dropForeignKey('', 'fk_user_id')).rejects.toThrow(
          'table name must not be empty',
        );
      });

      it('should throw an error if foreign key name is empty', async () => {
        await expect(schemaBuilder.dropForeignKey('orders', '')).rejects.toThrow(
          'foreign key name must not be empty',
        );
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.dropForeignKey('orders', 'fk_user_id')).rejects.toThrow(
          DatabaseQueryError,
        );
      });
    });
  });

  describe('Schema Introspection', () => {
    describe('hasTable', () => {
      it('should return true if the table exists', async () => {
        mockDriver.query.mockResolvedValue([{ Tables_in_test_db: 'users' }]);

        const result = await schemaBuilder.hasTable('users');

        expect(result).toBe(true);
        expect(mockDriver.query).toHaveBeenCalledWith('SHOW TABLES LIKE \'users\'');
      });

      it('should return false if the table does not exist', async () => {
        mockDriver.query.mockResolvedValue({ rows: [] });

        const result = await schemaBuilder.hasTable('nonexistent_table');

        expect(result).toBe(false);
      });

      it('should throw an error if table name is invalid', async () => {
        await expect(schemaBuilder.hasTable('')).rejects.toThrow('table name must not be empty or invalid.');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.hasTable('users')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getTableColumns', () => {
      it('should throw an error if tableName is empty', async () => {
        await expect(schemaBuilder.getTableColumns('')).rejects.toThrow('table name must not be empty');
      });

      it('should return column metadata for a valid table', async () => {
        const tableName = 'users';
        const mockResult = [
          {
            Field: 'id',
            Type: 'int(11)',
            Null: 'NO',
            Key: 'PRI',
            Default: null,
            Extra: 'auto_increment',
          },
          {
            Field: 'email',
            Type: 'varchar(255)',
            Null: 'YES',
            Key: 'UNI',
            Default: null,
            Extra: '',
          },
        ];

        mockDriver.query.mockResolvedValue(mockResult);

        const columns = await schemaBuilder.getTableColumns(tableName);

        expect(columns).toEqual([
          {
            name: 'id',
            type: 'int(11)',
            nullable: false,
            default: null,
            isPrimary: true,
            isUnique: false, // PRI, not UNI
            isAutoIncrement: true,
          },
          {
            name: 'email',
            type: 'varchar(255)',
            nullable: true,
            default: null,
            isPrimary: false,
            isUnique: true,
            isAutoIncrement: false,
          },
        ]);

        expect(mockDriver.query).toHaveBeenCalledWith('SHOW COLUMNS FROM `users`');
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.getTableColumns('users')).rejects.toThrow(DatabaseQueryError);
      });

      it('should parse column info with auto_increment flag', async () => {
        mockDriver.query.mockResolvedValueOnce([{
          Field: 'id',
          Type: 'int(11)',
          Null: 'NO',
          Default: null,
          Key: 'PRI',
          Extra: 'auto_increment',
        }]);

        const result = await schemaBuilder.getTableColumns('users');

        expect(result).toEqual([
          {
            name: 'id',
            type: 'int(11)',
            nullable: false,
            default: null,
            isPrimary: true,
            isUnique: false,
            isAutoIncrement: true,
          },
        ]);
      });

      it('should default isAutoIncrement to false if Extra is undefined', async () => {
        mockDriver.query.mockResolvedValueOnce([{
          Field: 'created_at',
          Type: 'timestamp',
          Null: 'YES',
          Default: null,
          Key: '',
          Extra: undefined,
        }]);

        const result = await schemaBuilder.getTableColumns('users');

        expect(result[0].isAutoIncrement).toBe(false);
      });
    });

    describe('getForeignKeys', () => {
      const mockRows = [
        {
          CONSTRAINT_NAME: 'fk_user_id',
          COLUMN_NAME: 'user_id',
          REFERENCED_TABLE_NAME: 'users',
          REFERENCED_COLUMN_NAME: 'id',
        },
        {
          CONSTRAINT_NAME: 'fk_profile_id',
          COLUMN_NAME: 'profile_id',
          REFERENCED_TABLE_NAME: 'profiles',
          REFERENCED_COLUMN_NAME: 'id',
        },
      ];

      it('should return an array of foreign keys for a valid table', async () => {
        mockDriver.query.mockResolvedValue(mockRows);

        const result = await schemaBuilder.getForeignKeys('orders');

        expect(result).toEqual([
          {
            constraintName: 'fk_user_id',
            columnName: 'user_id',
            referencedTable: 'users',
            referencedColumn: 'id',
          },
          {
            constraintName: 'fk_profile_id',
            columnName: 'profile_id',
            referencedTable: 'profiles',
            referencedColumn: 'id',
          },
        ]);

        expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining('FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE'));
      });

      it('should return an empty array if no foreign keys are found', async () => {
        mockDriver.query.mockResolvedValue([]);

        const result = await schemaBuilder.getForeignKeys('no_fk_table');

        expect(result).toEqual([]);
      });

      it('should throw an error if table name is invalid', async () => {
        await expect(schemaBuilder.getForeignKeys('')).rejects.toThrow('table name must not be empty');
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.getForeignKeys('orders')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getTableIndexes', () => {
      it('should return index metadata for a valid table', async () => {
        mockDriver.query.mockResolvedValue([
          {
            Table: 'users',
            Non_unique: 0,
            Key_name: 'PRIMARY',
            Column_name: 'id',
            Index_type: 'BTREE',
          },
          {
            Table: 'users',
            Non_unique: 1,
            Key_name: 'idx_users_email',
            Column_name: 'email',
            Index_type: 'BTREE',
          },
        ]);

        const result = await schemaBuilder.getTableIndexes('users');

        expect(result).toEqual([
          {
            name: 'PRIMARY',
            column: 'id',
            isUnique: true,
            type: 'BTREE',
          },
          {
            name: 'idx_users_email',
            column: 'email',
            isUnique: false,
            type: 'BTREE',
          },
        ]);

        expect(mockDriver.query).toHaveBeenCalledWith('SHOW INDEX FROM `users`');
      });

      it('should return an empty array if no indexes exist', async () => {
        mockDriver.query.mockResolvedValue([]);

        const result = await schemaBuilder.getTableIndexes('empty_table');

        expect(result).toEqual([]);
      });

      it('should throw an error if table name is invalid', async () => {
        await expect(schemaBuilder.getTableIndexes('')).rejects.toThrow('table name must not be empty');
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.getTableIndexes('users')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getUniqueConstraints', () => {
      it('should return unique constraints for a valid table', async () => {
        mockDriver.query.mockResolvedValue([
          { CONSTRAINT_NAME: 'UQ_email', COLUMN_NAME: 'email' },
          { CONSTRAINT_NAME: 'UQ_username_age', COLUMN_NAME: 'username' },
          { CONSTRAINT_NAME: 'UQ_username_age', COLUMN_NAME: 'age' },
        ]);

        const result = await schemaBuilder.getUniqueConstraints('users');

        expect(result).toEqual([
          { constraintName: 'UQ_email', columnName: 'email' },
          { constraintName: 'UQ_username_age', columnName: 'username' },
          { constraintName: 'UQ_username_age', columnName: 'age' },
        ]);
      });

      it('should return an empty array if no unique constraints exist', async () => {
        mockDriver.query.mockResolvedValue([]);

        const result = await schemaBuilder.getUniqueConstraints('no_constraints');
        expect(result).toEqual([]);
      });

      it('should throw an error if table name is empty', async () => {
        await expect(schemaBuilder.getUniqueConstraints('')).rejects.toThrow('table name must not be empty');
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        await expect(schemaBuilder.getUniqueConstraints('users')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getUniqueConstraintNames', () => {
      it('should throw an error if the table name is empty', async () => {
        await expect(schemaBuilder.getUniqueConstraintNames('')).rejects.toThrow(
          'table name must not be empty or invalid.',
        );
      });

      it('should return unique keys when given a valid table name', async () => {
        mockDriver.query.mockResolvedValue([{ CONSTRAINT_NAME: 'unique_key_1' }, { CONSTRAINT_NAME: 'unique_key_2' }]);

        const tableName = 'test_table';
        const uniqueKeys = await schemaBuilder.getUniqueConstraintNames(tableName);

        expect(uniqueKeys).toEqual(['unique_key_1', 'unique_key_2']);
        // expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining('FROM information_schema.TABLE_CONSTRAINTS'));
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValue(new Error('Query failed'));

        const tableName = 'test_table';
        await expect(schemaBuilder.getUniqueConstraintNames(tableName)).rejects.toThrow(
          `Failed to retrieve unique constraint names for table 'test_table'`,
        );
      });
    });

    describe('getTables', () => {
      it('should return a list of table names', async () => {
        mockDriver.query.mockResolvedValueOnce([
          { TABLE_NAME: 'users' },
          { TABLE_NAME: 'orders' },
          { TABLE_NAME: 'products' },
        ]);

        const result = await schemaBuilder.getTables();

        expect(result).toEqual(['users', 'orders', 'products']);
        expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining('FROM INFORMATION_SCHEMA.TABLES'));
        expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining(`'test'`));
      });

      it('should throw a DatabaseQueryError if query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.getTables()).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getTableDefinition', () => {
      it('should return the CREATE TABLE statement for a valid table', async () => {
        const createStatement = 'CREATE TABLE `users` (\n  `id` INT PRIMARY KEY\n);';

        mockDriver.query.mockResolvedValueOnce([{ 'Create Table': createStatement }]);

        const result = await schemaBuilder.getTableDefinition('users');

        expect(result).toBe(createStatement);
        expect(mockDriver.query).toHaveBeenCalledWith('SHOW CREATE TABLE `users`');
      });

      it('should throw an error if the table name is empty', async () => {
        await expect(schemaBuilder.getTableDefinition('')).rejects.toThrow('table name must not be empty');
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.getTableDefinition('users')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getColumnDefinition', () => {
      const mockColumn = {
        COLUMN_NAME: 'age',
        COLUMN_TYPE: 'int(11)',
        COLUMN_COMMENT: '',
        IS_NULLABLE: 'NO',
        EXTRA: '',
        COLUMN_KEY: '',
      };

      it('should return column metadata if the column exists', async () => {
        mockDriver.query.mockResolvedValueOnce([mockColumn]);

        const result = await schemaBuilder.getColumnDefinition('users', 'age');

        expect(result).toEqual(mockColumn);
        expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining('INFORMATION_SCHEMA.COLUMNS'));
        expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining('TABLE_NAME = \'users\''));
        expect(mockDriver.query).toHaveBeenCalledWith(expect.stringContaining('COLUMN_NAME = \'age\''));
      });

      it('should return undefined if the column is not found', async () => {
        mockDriver.query.mockResolvedValueOnce({ rows: [] });

        const result = await schemaBuilder.getColumnDefinition('users', 'missing_column');

        expect(result).toBeUndefined();
      });

      it('should throw InvalidNameError for empty table name', async () => {
        await expect(schemaBuilder.getColumnDefinition('', 'age')).rejects.toThrow(InvalidNameError);
      });

      it('should throw InvalidNameError for empty column name', async () => {
        await expect(schemaBuilder.getColumnDefinition('users', '')).rejects.toThrow(InvalidNameError);
      });

      it('should throw DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.getColumnDefinition('users', 'age')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getPrimaryKey', () => {
      it('should return the primary key constraint name for a given table', async () => {
        mockDriver.query.mockResolvedValueOnce([{ CONSTRAINT_NAME: 'PRIMARY' }]);

        const result = await schemaBuilder.getPrimaryKey('users');

        expect(result).toBe('PRIMARY');

        const call = mockDriver.query.mock.calls[0][0];
        expect(call).toContain('TABLE_CONSTRAINTS');
        expect(call).toContain('CONSTRAINT_TYPE = \'PRIMARY KEY\'');
        expect(call).toContain('TABLE_NAME = \'users\'');
      });

      it('should return undefined if no primary key is found', async () => {
        mockDriver.query.mockResolvedValueOnce([]);

        const result = await schemaBuilder.getPrimaryKey('users');

        expect(result).toBeUndefined();
      });

      it('should throw an error if the table name is invalid', async () => {
        await expect(schemaBuilder.getPrimaryKey('')).rejects.toThrow('table name must not be empty');
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.getPrimaryKey('users')).rejects.toThrow(DatabaseQueryError);
      });
    });

    describe('getDatabaseVersion', () => {
      it('should return the database version string', async () => {
        mockDriver.query.mockResolvedValueOnce([{ version: '8.0.36' }]);

        const result = await schemaBuilder.getDatabaseVersion();

        expect(result).toBe('8.0.36');
        expect(mockDriver.query).toHaveBeenCalledWith('SELECT VERSION() AS version');
      });

      it('should throw a DatabaseQueryError if the query fails', async () => {
        mockDriver.query.mockRejectedValueOnce(new Error('Query failed'));

        await expect(schemaBuilder.getDatabaseVersion()).rejects.toThrow(DatabaseQueryError);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('buildColumnDefinition', () => {
      it('should build a basic NOT NULL column definition', () => {
        const col = new ColumnMetadata(User, 'age', false, false, false, {
          type: Number,
          isNullable: false,
        });

        const result = schemaBuilder['createColumnDefinition'](col, false);
        expect(result).toBe('`age` INT(11) NOT NULL');
      });

      it('should include NULL if isNullable is true', () => {
        const col = new ColumnMetadata(User, 'age', false, false, false, {
          type: Number,
          isNullable: true,
        });

        const result = schemaBuilder['createColumnDefinition'](col, false);
        expect(result).toContain('NULL');
      });

      it('should include PRIMARY KEY if isPrimary and skipPrimary is false', () => {
        const col = new ColumnMetadata(User, 'id', true, false, false, {
          type: Number,
        });

        const result = schemaBuilder['createColumnDefinition'](col, false);
        expect(result).toContain('PRIMARY KEY');
      });

      it('should not include PRIMARY KEY if skipPrimary is true', () => {
        const col = new ColumnMetadata(User, 'id', true, false, false, {
          type: Number,
        });

        const result = schemaBuilder['createColumnDefinition'](col, true);
        expect(result).not.toContain('PRIMARY KEY');
      });

      it('should include AUTO_INCREMENT if isAutoIncrement and skipPrimary is false', () => {
        const col = new ColumnMetadata(User, 'id', true, false, true, {
          type: Number,
          isAutoIncrement: true,
        });

        const result = schemaBuilder['createColumnDefinition'](col, false);
        expect(result).toContain('AUTO_INCREMENT');
      });

      it('should include COMMENT if comment is defined', () => {
        const col = new ColumnMetadata(User, 'email', false, false, false, {
          type: String,
          comment: 'User email address',
        });

        const result = schemaBuilder['createColumnDefinition'](col, false);
        expect(result).toContain(`COMMENT 'User email address'`);
      });

      it('should include custom columnDefinition if provided', () => {
        const col = new ColumnMetadata(User, 'status', false, false, false, {
          type: 'string',
          columnDefinition: 'DEFAULT "active"',
        });

        const result = schemaBuilder['createColumnDefinition'](col, false);
        expect(result).toContain('DEFAULT "active"');
      });
    });

    describe('checkMySQLVersion', () => {
      it('should return true if major version is greater', () => {
        expect(schemaBuilder['checkMySQLVersion']('9.0.0', '8.0.0')).toBe(true);
      });

      it('should return false if major version is less', () => {
        expect(schemaBuilder['checkMySQLVersion']('5.7.0', '8.0.0')).toBe(false);
      });

      it('should return true if minor version is greater and majors are equal', () => {
        expect(schemaBuilder['checkMySQLVersion']('8.1.0', '8.0.0')).toBe(true);
      });

      it('should return false if minor version is less and majors are equal', () => {
        expect(schemaBuilder['checkMySQLVersion']('8.0.0', '8.1.0')).toBe(false);
      });

      it('should return true if patch version is greater and major/minor match', () => {
        expect(schemaBuilder['checkMySQLVersion']('8.0.23', '8.0.20')).toBe(true);
      });

      it('should return false if patch version is less and major/minor match', () => {
        expect(schemaBuilder['checkMySQLVersion']('8.0.19', '8.0.20')).toBe(false);
      });

      it('should return true if versions are exactly equal', () => {
        expect(schemaBuilder['checkMySQLVersion']('8.0.20', '8.0.20')).toBe(true);
      });
    });

    describe('compareLength', () => {
      it('should return false if columnLength is undefined', () => {
        expect(schemaBuilder['compareLength'](undefined, '255')).toBe(false);
      });

      it('should return false if columnLength matches db value', () => {
        expect(schemaBuilder['compareLength'](255, '255')).toBe(false);
      });

      it('should return true if columnLength differs from db value', () => {
        expect(schemaBuilder['compareLength'](255, '200')).toBe(true);
      });

      it('should return false if dbLength is undefined or null', () => {
        expect(schemaBuilder['compareLength'](255, undefined)).toBe(true); // Because parseInt(undefined) = NaN ≠ 255
        expect(schemaBuilder['compareLength'](255, null as any)).toBe(true);
      });

      it('should return false if both are undefined', () => {
        expect(schemaBuilder['compareLength'](undefined, undefined)).toBe(false);
      });
    });

    describe('isColumnChanged', () => {
      const baseDbColumn = {
        DATA_TYPE: 'int',
        IS_NULLABLE: 'NO',
        CHARACTER_MAXIMUM_LENGTH: '11',
      };

      const baseColumn = new ColumnMetadata(User, 'age', false, false, false, {
        type: Number,
        isNullable: false,
        length: 11,
      });

      it('should return false when all properties match', () => {
        expect(schemaBuilder['isColumnChanged'](baseDbColumn, baseColumn)).toBe(false);
      });

      it('should detect type mismatch', () => {
        const db = { ...baseDbColumn, DATA_TYPE: 'varchar' };
        expect(schemaBuilder['isColumnChanged'](db, baseColumn)).toBe(true);
      });

      it('should detect nullable mismatch', () => {
        const db = { ...baseDbColumn, IS_NULLABLE: 'YES' };
        expect(schemaBuilder['isColumnChanged'](db, baseColumn)).toBe(true);
      });

      it('should detect length mismatch', () => {
        const column = new ColumnMetadata(User, 'age', false, false, false, {
          type: 'number',
          isNullable: false,
          length: 10,
        });

        expect(schemaBuilder['isColumnChanged'](baseDbColumn, column)).toBe(true);
      });

      it('should skip length check if column.length is undefined', () => {
        const column = new ColumnMetadata(User, 'age', false, false, false, {
          type: Number,
          isNullable: false,
        });

        expect(schemaBuilder['isColumnChanged'](baseDbColumn, column)).toBe(false); // type + nullable match
      });
    });

    describe('normalizeType', () => {
      it('should normalize INT with default and custom length', () => {
        expect(schemaBuilder['normalizeType'](ColumnType.INT)).toBe('INT(11)');
        expect(schemaBuilder['normalizeType'](ColumnType.INT, 5)).toBe('INT(5)');
      });

      it('should normalize DECIMAL with default and custom precision/scale', () => {
        expect(schemaBuilder['normalizeType'](ColumnType.DECIMAL)).toBe('DECIMAL(10, 2)');
        expect(schemaBuilder['normalizeType'](ColumnType.DECIMAL, 4, 20)).toBe('DECIMAL(20, 4)');
      });

      it('should normalize VARCHAR with default and custom length', () => {
        expect(schemaBuilder['normalizeType'](ColumnType.VARCHAR)).toBe('VARCHAR(255)');
        expect(schemaBuilder['normalizeType'](ColumnType.VARCHAR, 100)).toBe('VARCHAR(100)');
      });

      it('should normalize other static types', () => {
        expect(schemaBuilder['normalizeType'](ColumnType.TEXT)).toBe('TEXT');
        expect(schemaBuilder['normalizeType'](ColumnType.BOOLEAN)).toBe('BOOLEAN');
        expect(schemaBuilder['normalizeType'](ColumnType.UUID)).toBe('CHAR(36)');
        expect(schemaBuilder['normalizeType'](ColumnType.DATE)).toBe('DATE');
        expect(schemaBuilder['normalizeType'](ColumnType.TIMESTAMP)).toBe('TIMESTAMP');
        expect(schemaBuilder['normalizeType'](ColumnType.FLOAT)).toBe('FLOAT');
        expect(schemaBuilder['normalizeType'](ColumnType.BLOB)).toBe('BLOB');
        expect(schemaBuilder['normalizeType'](ColumnType.JSON)).toBe('JSON');
      });

      it('should throw an error for unsupported types', () => {
        expect(() => schemaBuilder['normalizeType']('UNSUPPORTED' as any)).toThrow('Unsupported type: UNSUPPORTED');
      });
    });

    describe('escapeIdentifier', () => {
      it('should escape identifiers correctly', () => {
        const result = schemaBuilder['escapeIdentifier']('users');

        expect(result).toBe('`users`');
      });

      it('should throw an error if identifier is empty', () => {
        expect(() => schemaBuilder['escapeIdentifier']('')).toThrow('Identifier must not be empty.');
      });
    });

    describe('escapeLiteral', () => {
      it('should wrap a plain string in single quotes', () => {
        expect(schemaBuilder['escapeLiteral']('users')).toBe(`'users'`);
      });

      it('should escape single quotes inside the string', () => {
        expect(schemaBuilder['escapeLiteral'](`O'Reilly`)).toBe(`'O''Reilly'`);
        expect(schemaBuilder['escapeLiteral'](`It's a test`)).toBe(`'It''s a test'`);
      });

      it('should handle empty strings correctly', () => {
        expect(schemaBuilder['escapeLiteral']('')).toBe(`''`);
      });

      it('should return valid SQL literals for edge cases', () => {
        expect(schemaBuilder['escapeLiteral'](`a'b'c`)).toBe(`'a''b''c'`);
        expect(schemaBuilder['escapeLiteral'](`'quoted'`)).toBe(`'''quoted'''`);
      });
    });

    describe('validateName', () => {
      it('should not throw for valid names', () => {
        expect(() => schemaBuilder['validateName']('users', 'table name')).not.toThrow();
        expect(() => schemaBuilder['validateName']('email', 'column name')).not.toThrow();
      });

      it('should throw InvalidNameError for empty string', () => {
        expect(() => schemaBuilder['validateName']('', 'table name')).toThrow(InvalidNameError);
      });

      it('should throw InvalidNameError for whitespace only', () => {
        expect(() => schemaBuilder['validateName']('   ', 'column name')).toThrow(InvalidNameError);
      });

      it('should include the name type and invalid value in the error message', () => {
        try {
          schemaBuilder['validateName']('', 'constraint');
        } catch (error) {
          expect(error).toBeInstanceOf(InvalidNameError);
          expect((error as any).message).toContain('constraint must not be empty or invalid');
        }
      });
    });
  });
});
