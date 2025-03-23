import { ConnectionOptions } from '../../connection';
import { PostgresDriver } from '../../driver';

// Manually define a mock PostgreSQL client
class MockPgClient {
  connect = jest.fn();
  end = jest.fn();
  query = jest.fn();
}

describe('PostgresDriver', () => {
  let postgresDriver: PostgresDriver;
  let mockClient: MockPgClient;
  let connectionOptions: ConnectionOptions;

  beforeEach(() => {
    mockClient = new MockPgClient(); // Create new mock client
    postgresDriver = new PostgresDriver({ Client: jest.fn(() => mockClient) } as any); // Inject mock
    connectionOptions = {
      host: 'localhost',
      username: 'user',
      password: 'pass',
      database: 'test_db',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PostgreSQL::initialize', () => {
    const mockPostgresEngine = { name: 'pg' };
    let driver: PostgresDriver;

    beforeEach(() => {
      driver = new PostgresDriver(mockPostgresEngine as any);
    });

    it('should create a query builder', () => {
      const queryBuilder = driver.createQueryBuilder();

      expect(queryBuilder).toBeDefined();
    });

    it('should create a schema builder', () => {
      const schemaBuilder = driver.createSchemaBuilder();

      expect(schemaBuilder).toBeDefined();
    });

    it('should return the correct engine', () => {
      expect(driver.engine).toBe(mockPostgresEngine);
    });
  });

  describe('PostgreSQL::connect', () => {
    it('should successfully connect', async () => {
      mockClient.connect.mockResolvedValue(undefined);

      await expect(postgresDriver.connect(connectionOptions)).resolves.not.toThrow();

      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should throw error when no database is set', () => {
      postgresDriver['_options'] = null; // Simulate no options

      expect(() => postgresDriver.database).toThrow('⛔️ No active connection or database not set.');
    });

    it('should return the correct database name', () => {
      postgresDriver['_options'] = { database: 'test_db' };

      expect(postgresDriver.database).toBe('test_db');
    });
  });

  describe('PostgreSQL::disconnect', () => {
    it('should throw an error when no connection is established', async () => {
      postgresDriver['_connection'] = null; // Simulate no connection

      await expect(postgresDriver.disconnect()).rejects.toThrow('⛔️ Connection is not established, cannot disconnect!');
    });

    it('should disconnect successfully', async () => {
      mockClient.end.mockResolvedValue(undefined);

      await expect(postgresDriver.connect(connectionOptions)).resolves.not.toThrow();
      await expect(postgresDriver.disconnect()).resolves.not.toThrow();

      expect(mockClient.end).toHaveBeenCalled();
    });
  });

  describe('PostgreSQL::query', () => {
    it('should throw an error when querying without an active connection (Postgres)', async () => {
      postgresDriver = new PostgresDriver({} as any);

      await expect(postgresDriver.query('SELECT * FROM users'))
        .rejects
        .toThrow('⛔️ Connection is not established, cannot execute a query!');
    });

    it('should execute a query successfully', async () => {
      await expect(postgresDriver.connect(connectionOptions)).resolves.not.toThrow();

      const mockResult = { rows: [{ id: 1, name: 'Test' }] };
      mockClient.query.mockResolvedValue(mockResult);

      const result = await postgresDriver.query('SELECT * FROM users');
      expect(result).toEqual(mockResult.rows);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users');
    });

    it('should throw an error when a query fails', async () => {
      await expect(postgresDriver.connect(connectionOptions)).resolves.not.toThrow();

      const errorMessage = 'callback is not a function!';
      mockClient.query.mockImplementation((_query: string, callback: Function) =>
        callback(new Error(errorMessage), null)
      );

      await expect(postgresDriver.query('SELECT * FROM users'))
        .rejects
        .toThrow(`⛔️ Query failed: ${errorMessage}`);

      expect(mockClient.query).toHaveBeenCalled();
    });
  });
});
