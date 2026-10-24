import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Explicitly map modern file extensions so Jest can resolve internal angular modules smoothly
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|@ngrx)'
  ],
  verbose: true
};

export default config;