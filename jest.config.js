export default {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
    '!**/tests/**',
  ],
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^mysql$': '<rootDir>/src/__mocks__/mysql.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@builders/(.*)$': '<rootDir>/src/builders/$1',
    '^@driver/(.*)$': '<rootDir>/src/driver/$1',
    '^@strategies/(.*)$': '<rootDir>/src/strategies/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/src/__mocks__'],
};
