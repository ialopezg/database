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
  },
  moduleDirectories: ['node_modules', '<rootDir>/src/__mocks__'],
};
