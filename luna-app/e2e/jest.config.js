module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'detox/runners/jest/reporter',
    [
      'jest-html-reporters',
      {
        publicPath: './e2e/reports',
        filename: 'luna-e2e-report.html',
        expand: true,
        pageTitle: 'Luna E2E Test Report',
        hideIcon: false,
        includeFailureMsg: true,
        enableMergeData: true,
        dataMergeLevel: 1,
        inlineSource: true
      }
    ]
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js']
};