/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/code_documentation/',
    '<rootDir>/coverage_report/',
    '<rootDir>/dist/',
  ],
  collectCoverageFrom: ['src/**'],
};
