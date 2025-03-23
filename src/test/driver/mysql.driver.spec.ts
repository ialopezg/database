import { MySQLDriver } from '../../driver';
import { ConnectionOptions } from '../../connection';

// Mock mysql module
// Define the mock connection object
const mockConnection = {
  connect: jest.fn((callback: (err: any) => void) => callback(null)), // Simulate successful connection
  end: jest.fn((callback: (err: any) => void) => callback(null)), // Simulate successful disconnection
  query: jest.fn((sql: string, callback: (err: any, result: any) => void) =>
    callback(null, [{ id: 1, name: 'Test' }]),
  ),
};

// Define the mock mysql module
const mockMysql = {
  createConnection: jest.fn().mockReturnValue(mockConnection), // Ensure it returns mockConnection
};

describe('MySQLDriver', () => {
  let mySQLDriver: MySQLDriver;
  const connectionOptions: ConnectionOptions = {
    host: 'localhost',
    username: 'user',
    password: 'password',
    database: 'test_db',
  };

  beforeEach(() => {
    // Reset mock call counts before each test
    jest.clearAllMocks();

    mySQLDriver = new MySQLDriver(mockMysql as any);
  });

  describe('MySQL::initialize', () => {
    it('should create a query builder', () => {
      const queryBuilder = mySQLDriver.createQueryBuilder();

      expect(queryBuilder).toBeDefined();
    });

    it('should create a schema builder', () => {
      const schemaBuilder = mySQLDriver.createSchemaBuilder();

      expect(schemaBuilder).toBeDefined();
    });

    it('should return the correct engine', () => {
      expect(mySQLDriver.engine).toBe(mockMysql);
    });
  });

  describe('MySQL::connect', () => {
    it('should successfully connect', async () => {
      await expect(mySQLDriver.connect(connectionOptions)).resolves.not.toThrow();

      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        user: 'user',
        password: 'password',
        database: 'test_db',
      });
      expect(mockConnection.connect).toHaveBeenCalled();
    });

    it('should throw error when no database is set', () => {
      mySQLDriver['_options'] = null; // Simulate no options

      expect(() => mySQLDriver.database).toThrow('⛔️ No active connection or database not set.');
    });

    it('should return the correct database name', () => {
      mySQLDriver['_options'] = { database: 'test_db' };
      expect(mySQLDriver.database).toBe('test_db');
    });

    it('should throw an error if connection fails', async () => {
      const connectionError = new Error('Failed to connect to database');

      mockConnection.connect.mockImplementation((callback: (err: any) => void) => callback(connectionError));

      await expect(mySQLDriver.connect(connectionOptions)).rejects.toThrow('Failed to connect to database');
      expect(mockConnection.connect).toHaveBeenCalled();
    });
  });

  describe('MySQL::disconnect', () => {
    it('should throw an error when no connection is established', async () => {
      mySQLDriver['_connection'] = null; // Simulate no connection

      await expect(mySQLDriver.disconnect()).rejects.toThrow('⛔️ Connection is not established, cannot disconnect!');
    });

    it('should disconnect successfully', async () => {
      mockConnection.connect.mockImplementation((callback: (err: any) => void) => callback(null));
      mockConnection.end.mockImplementation((callback: (err: any) => void) => callback(null));

      await mySQLDriver.connect(connectionOptions); // Ensure connection is established
      await expect(mySQLDriver.disconnect()).resolves.not.toThrow();

      expect(mockConnection.end).toHaveBeenCalled();
    });

    it('should throw an error if disconnection fails', async () => {
      const disconnectError = new Error('Failed to disconnect');

      mockConnection.connect.mockImplementation((callback: (err: any) => void) => callback(null));
      // Simulate success connection
      await mySQLDriver.connect(connectionOptions); // Ensure connection is established
      // Simulate disconnection failure
      mockConnection.end.mockImplementation((callback: (err: any) => void) => callback(disconnectError));

      await expect(mySQLDriver.disconnect()).rejects.toThrow('Failed to disconnect');
      expect(mockConnection.end).toHaveBeenCalled();
    });
  });

  describe('MySQL::query', () => {
    it('should throw an error when querying without an active connection', async () => {
      await expect(mySQLDriver.query('SELECT * FROM users')).rejects.toThrow(
        'Connection is not established, cannot execute a query!',
      );
    });

    it('should execute a query successfully', async () => {
      await mySQLDriver.connect(connectionOptions);
      const result = await mySQLDriver.query('SELECT * FROM users');

      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
    });

    it('should throw an error when query execution fails', async () => {
      const errorMessage = 'Query failed!';
      mockConnection.query.mockImplementation((_sql, callback) => callback(new Error(errorMessage), null));

      await mySQLDriver.connect(connectionOptions);
      await expect(mySQLDriver.query('SELECT * FROM users')).rejects.toThrow(`❌ Query execution failed: ${errorMessage}`);
    });
  });
});
