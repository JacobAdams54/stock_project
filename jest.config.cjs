// Jest config (CommonJS) to avoid requiring ts-node for config parsing
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // Add polyfills for TextEncoder/TextDecoder (required by React Router)
  globals: {
    TextEncoder: TextEncoder,
    TextDecoder: TextDecoder,
  },
};
