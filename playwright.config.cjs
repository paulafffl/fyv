const { defineConfig, devices } = require('@playwright/test');

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

module.exports = defineConfig({
    testDir: './e2e',
    testIgnore: ['**/parity/**'],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 2,
    timeout: 30_000,
    globalTimeout: 10 * 60_000,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL,
        testIdAttribute: 'data-cy',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 900 },
            },
        },
        { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1440, height: 900 },
            },
        },
        { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
    ],
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command:
                  'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
              url: baseURL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
