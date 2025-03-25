
import { ColumnOptions, ColumnType } from '../../../../builders/options';
import { MySQLSchemaBuilder } from '../../../../driver/builders';
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from '../../../../builders/metadata';
import { MySQLDriver } from '../../../../driver';
import { DatabaseQueryError, InvalidTableNameError } from '../../../../errors';

// Mock the MySQLDriver
jest.mock('../../../../driver/mysql.driver', () => {
  return {
    MySQLDriver: jest.fn().mockImplementation(() => ({
      query: jest.fn(),
    })),
  };
});

describe('MySQLSchemaBuilder', () => {
  let schemaBuilder: MySQLSchemaBuilder;
  let mockDriver: jest.Mocked<MySQLDriver>;

  class User {
  }

  beforeEach(() => {
    mockDriver = new MySQLDriver('mysql') as jest.Mocked<MySQLDriver>;
    schemaBuilder = new MySQLSchemaBuilder(mockDriver);
  });

  describe('MySQLSchemaBuilder - addColumn', () => {
    it('should return true when column is successfully added', async () => {
      mockDriver.query = jest.fn().mockResolvedValue({});

      const column: ColumnMetadata = new ColumnMetadata(User, 'age', false, false, false, {
        type: ColumnType.INTEGER,
      });

      await expect(schemaBuilder.addColumn('users', column)).resolves.toBe(true);
    });

    it('should throw DatabaseQueryError on query failure', async () => {
      mockDriver.query = jest.fn().mockRejectedValue(new Error('Query failed'));

      const column: ColumnMetadata = new ColumnMetadata(User, 'age', false, false, false, {
        name: 'age',
        type: ColumnType.INTEGER,
      });

      await expect(schemaBuilder.addColumn('users', column)).rejects.toThrow(DatabaseQueryError);
    });
  });

  describe('MySQLSchemaBuilder - checkIfTableExists', () => {
    it('should return true if table exists', async () => {
      mockDriver.query = jest.fn().mockResolvedValue([{ table: 'users' }]);

      await expect(schemaBuilder.checkIfTableExists('users')).resolves.toBe(true);
    });

    it('should return false if table does not exist', async () => {
      mockDriver.query = jest.fn().mockResolvedValue([]);

      await expect(schemaBuilder.checkIfTableExists('nonexistent_table')).resolves.toBe(false);
    });

    it('should throw InvalidTableNameError if table name is empty', async () => {
      await expect(schemaBuilder.checkIfTableExists('  ')).rejects.toThrow(InvalidTableNameError);
    });

    it('should throw DatabaseQueryError on query failure', async () => {
      mockDriver.query = jest.fn().mockRejectedValue(new Error('Query failed'));

      await expect(schemaBuilder.checkIfTableExists('users')).rejects.toThrow(DatabaseQueryError);
    });
  });

  describe('MySQLSchemaBuilder - dropColumn', () => {
    let mockQuery: jest.Mock;

    beforeEach(() => {
      mockQuery = jest.fn();
      mockDriver.query = mockQuery;
      schemaBuilder = new MySQLSchemaBuilder(mockDriver);
    });

    it('should drop a column using IF EXISTS if MySQL version supports it', async () => {
      mockQuery
        .mockResolvedValueOnce([{ version: '8.0.22' }]) // MySQL version check
        .mockResolvedValueOnce(true); // Column drop query result

      const result = await schemaBuilder.dropColumn('users', 'age');

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith('SELECT VERSION() AS version');
      expect(result).toBe(true);
    });

    it('should drop a column without IF EXISTS if MySQL version is below 5.7.0', async () => {
      mockQuery
        .mockResolvedValueOnce([{ version: '5.6.9' }]) // MySQL version check
        .mockResolvedValueOnce(true); // Column drop query result

      const result = await schemaBuilder.dropColumn('users', 'age');

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith('SELECT VERSION() AS version');
      expect(result).toBe(true);
    });

    it('should throw DatabaseQueryError if query fails', async () => {
      mockQuery
        .mockResolvedValueOnce([{ version: '8.0.22' }]) // MySQL version check
        .mockRejectedValue(new Error('Syntax error'));

      await expect(schemaBuilder.dropColumn('users', 'age')).rejects.toThrow(
        new DatabaseQueryError(`Failed to drop column 'age' from 'users': Syntax error`, new Error('Syntax error')),
      );

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenCalledWith('SELECT VERSION() AS version');
    });
  });

  describe('MySQLSchemaBuilder addForeignKey', () => {
    let schemaBuilder: MySQLSchemaBuilder;
    let mockQuery: jest.Mock;

    class User {}

    class Profile {}

    // Mock MySQL Driver
    beforeEach(() => {
      const mockDriver = new MySQLDriver({} as any) as jest.Mocked<MySQLDriver>;
      mockQuery = (mockDriver.query as jest.Mock); // Ensure it's a Jest mock function
      schemaBuilder = new MySQLSchemaBuilder(mockDriver);
    });

    it('should add a foreign key successfully', async () => {
      const table = new TableMetadata(User);
      const columns = [new ColumnMetadata(User, 'user_id', false, false, false, {} as ColumnOptions)];
      const relatedTable = new TableMetadata(Profile);
      const relatedColumns = [new ColumnMetadata(Profile, 'id', true, false, false, {} as ColumnOptions)];
      const foreignKey = new ForeignKeyMetadata(table, columns, relatedTable, relatedColumns);

      // Mock query result to simulate success
      mockQuery.mockResolvedValue(true);

      const result = await schemaBuilder.addForeignKey(foreignKey);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('ALTER TABLE `User`\n' +
        '          ADD CONSTRAINT `fk_7ee0e595`\n' +
        '              FOREIGN KEY (`[object Object]`)\n' +
        '                  REFERENCES `Profile` (`id`)',
      );
    });

    it('should throw an error when foreignKey metadata is invalid', async () => {
      // Manually create an invalid foreignKey object (avoid calling constructor)
      const invalidForeignKey = {
        table: { name: 'users' },
        relatedTable: { name: 'profiles' },
        columns: [], // Empty columns
        relatedColumnNames: [], // Empty related columns
        name: 'fk_user_profile',
      } as any; // Cast to 'any' to bypass ForeignKeyMetadata validation

      // Ensure that `addForeignKey` actually throws an error
      await expect(schemaBuilder.addForeignKey(invalidForeignKey))
        .rejects.toThrow(new Error('Foreign key must have at least one column.'));
    });

    it('should throw an error when columns length does not match related columns length', () => {
      const table = new TableMetadata(User);
      const columns = [new ColumnMetadata(User, 'user_id', false, false, false, {} as ColumnOptions)];
      const relatedTable = new TableMetadata(Profile);
      const relatedColumns = [
        new ColumnMetadata(Profile, 'id', true, false, false, {} as ColumnOptions),
        new ColumnMetadata(Profile, 'extra_col', false, false, false, {} as ColumnOptions), // Extra column
      ];

      expect(() => new ForeignKeyMetadata(table, columns, relatedTable, relatedColumns)).toThrow(
        'The number of columns in the foreign key must match the number of related columns.',
      );
    });

    it('should throw DatabaseQueryError if query fails', async () => {
      const table = new TableMetadata(User);
      const columns = [new ColumnMetadata(User, 'user_id', false, false, false, {} as ColumnOptions)];
      const relatedTable = new TableMetadata(Profile);
      const relatedColumns = [new ColumnMetadata(Profile, 'id', true, false, false, {} as ColumnOptions)];
      const foreignKey = new ForeignKeyMetadata(table, columns, relatedTable, relatedColumns);

      mockQuery.mockRejectedValue(new Error('Query execution failed')); // Simulating SQL failure

      await expect(schemaBuilder.addForeignKey(foreignKey)).rejects.toThrow(DatabaseQueryError);
      await expect(schemaBuilder.addForeignKey(foreignKey)).rejects.toThrow(
        `Failed to add foreign key ${foreignKey.name} from ${table.name} to ${relatedTable.name}: Query execution failed`,
      );
    });
  });

  describe('MySQLSchemaBuilder - MySQL Version Comparison', () => {
    it('should return true if MySQL version is greater than or equal to the target', () => {
      expect(schemaBuilder['checkMySQLVersion']('8.0.22', '5.7.0')).toBe(true);
      expect(schemaBuilder['checkMySQLVersion']('5.7.0', '5.7.0')).toBe(true);
      expect(schemaBuilder['checkMySQLVersion']('10.3.25', '5.7.0')).toBe(true);
    });

    it('should return false if MySQL version is lower than the target', () => {
      expect(schemaBuilder['checkMySQLVersion']('5.6.9', '5.7.0')).toBe(false);
      expect(schemaBuilder['checkMySQLVersion']('4.1.2', '5.7.0')).toBe(false);
    });
  });
});
