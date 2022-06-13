/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],

  verbose: true,
  collectCoverage: true,
  coverageReporters: [
    "json",
    "lcov",
    "text"
  ],
  coverageThreshold: {
    "global": {
      // "branches": 100,
      // "functions": 100,
      "lines": 40,
      // "statements": 100
    }
  },
  testPathIgnorePatterns: [
    "<rootDir>/path/to/ignore/"
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
 
  // testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/*.spec.ts'],
  collectCoverageFrom: [
    "**/*.{ts,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/__tests__/**"
  ]
};