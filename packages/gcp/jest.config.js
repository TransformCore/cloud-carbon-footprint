/*
 * © 2021 ThoughtWorks, Inc.
 */

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 97,
      functions: 91,
      lines: 96,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/fixtures',
    '<rootDir>/src/__tests__/helpers.ts',
  ],
  modulePathIgnorePatterns: ['index.ts'],
  coveragePathIgnorePatterns: ['Recommendations.ts', 'ServiceWrapper.ts'],
}