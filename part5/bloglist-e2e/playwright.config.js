const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  // The tests share one database, so they run one after another
  fullyParallel: false,
  workers: 1,
  // A short report in the terminal (the "html" one opens a web page)
  reporter: 'list',
  use: {
    // The address of the frontend (the backend is reached through its proxy)
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})