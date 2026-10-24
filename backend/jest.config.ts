import type { Config } from 'jest';
const config = {
    // 1. Scan all files in dist/ to find things that have 0% coverage
    collectCoverageFrom: [
        'dist/**/*.js',
        '!dist/config/**',
        '!dist/server.js',
        '!dist/app.js',
        '!dist/**/*.test.js',
        '!dist/utils/AppError.js' // Already hit 100%
    ],

    // 2. Instruct Jest where to look for your compiled test files
    testMatch: [
        '**/dist/**/*.test.js'
    ],
    // 3. Setup standard test environment settings
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    verbose: true
};

module.exports = config;