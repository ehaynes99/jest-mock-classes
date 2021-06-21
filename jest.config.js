module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.(spec|test).(t|j)s'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*'],
  coverageReporters: ['text', 'lcov', 'cobertura'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['index.ts'],
};
