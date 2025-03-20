export default {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!**/node_modules/**', '!**/vendor/**', '!**/dist/**', '!**/tests/**'],
  coverageProvider: 'v8',
};
