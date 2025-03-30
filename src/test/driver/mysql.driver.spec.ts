import { MySQLDriver } from '../../driver';
import { ConnectionOptions } from '../../connection';

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
  let driver: MySQLDriver;
  const connectionOptions: ConnectionOptions = {
    host: 'localhost',
    username: 'user',
    password: 'password',
    database: 'test_db',
  };

  beforeEach(() => {
    // Reset mock call counts before each test
    jest.clearAllMocks();

    driver = new MySQLDriver(mockMysql as any);
  });

  describe('MySQL::initialize', () => {
    it('should create a query builder', () => {
      const queryBuilder = driver.createQueryBuilder();

      expect(queryBuilder).toBeDefined();
    });

    it('should create a schema builder', () => {
      const schemaBuilder = driver.createSchemaBuilder();

      expect(schemaBuilder).toBeDefined();
    });

    it('should return the correct engine', () => {
      expect(driver.engine).toBe(mockMysql);
    });

    it('should have connect method', () => {
      expect(driver.connect).toBeDefined();
    });

    it('should have createSchemaBuilder method', () => {
      expect(driver.createSchemaBuilder).toBeDefined();
    });

    it('should have createQueryBuilder method', () => {
      expect(driver.createQueryBuilder).toBeDefined();
    });

    it('should have disconnect method', () => {
      expect(driver.disconnect).toBeDefined();
    });

    it('should have query method', () => {
      expect(driver.query).toBeDefined();
    });
  });

  describe('MySQL::connect', () => {
    it('should successfully connect', async () => {
      await expect(driver.connect(connectionOptions)).resolves.not.toThrow();

      expect(mockMysql.createConnection).toHaveBeenCalledWith({
        host: 'localhost',
        user: 'user',
        password: 'password',
        database: 'test_db',
      });
      expect(mockConnection.connect).toHaveBeenCalled();
    });

    it('should throw error when no database is set', () => {
      driver['_options'] = null; // Simulate no options

      expect(() => driver.database).toThrow('⛔️ No active connection or database not set.');
    });

    it('should return the correct database name', () => {
      driver['_options'] = { database: 'test_db' };
      expect(driver.database).toBe('test_db');
    });

    it('should throw an error if connection fails', async () => {
      const connectionError = new Error('Failed to connect to database');

      mockConnection.connect.mockImplementation((callback: (err: any) => void) => callback(connectionError));

      await expect(driver.connect(connectionOptions)).rejects.toThrow('Failed to connect to database');
      expect(mockConnection.connect).toHaveBeenCalled();
    });
  });

  describe('MySQL::disconnect', () => {
    it('should throw an error when no connection is established', async () => {
      driver['_connection'] = null; // Simulate no connection

      await expect(driver.disconnect()).rejects.toThrow('Connection is not established, cannot disconnect!');
    });

    it('should disconnect successfully', async () => {
      mockConnection.connect.mockImplementation((callback: (err: any) => void) => callback(null));
      mockConnection.end.mockImplementation((callback: (err: any) => void) => callback(null));

      await driver.connect(connectionOptions); // Ensure connection is established
      await expect(driver.disconnect()).resolves.not.toThrow();

      expect(mockConnection.end).toHaveBeenCalled();
    });

    it('should throw an error if disconnection fails', async () => {
      const disconnectError = new Error('Failed to disconnect');

      mockConnection.connect.mockImplementation((callback: (err: any) => void) => callback(null));
      // Simulate success connection
      await driver.connect(connectionOptions); // Ensure connection is established
      // Simulate disconnection failure
      mockConnection.end.mockImplementation((callback: (err: any) => void) => callback(disconnectError));

      await expect(driver.disconnect()).rejects.toThrow('Failed to disconnect');
      expect(mockConnection.end).toHaveBeenCalled();
    });
  });

  describe('MySQL::query', () => {
    it('should throw an error when querying without an active connection', async () => {
      await expect(driver.query('SELECT * FROM users')).rejects.toThrow(
        'Connection is not established, cannot execute a query!',
      );
    });

    it('should execute a query successfully', async () => {
      await driver.connect(connectionOptions);
      const result = await driver.query('SELECT * FROM users');

      expect(result).toEqual([{ id: 1, name: 'Test' }]);
      expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
    });

    it('should throw an error when query execution fails', async () => {
      const errorMessage = 'Query failed!';
      mockConnection.query.mockImplementation((_sql, callback) => callback(new Error(errorMessage), null));

      await driver.connect(connectionOptions);
      await expect(driver.query('SELECT * FROM users')).rejects.toThrow(`Query execution failed: ${errorMessage}`);
    });
  });
});
