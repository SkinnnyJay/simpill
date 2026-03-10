/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/index.ts"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: { branches: 55, functions: 62, lines: 72, statements: 69 },
  },
  moduleFileExtensions: ["ts", "js", "json"],
  transform: { "^.+\\.ts$": "ts-jest" },
  verbose: true,
  clearMocks: true,
};
