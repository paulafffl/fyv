const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './e2e/parity',
    outputDir: './parity-results',
    globalSetup: './scripts/parity-global-setup.cjs',
    timeout: 120_000,
    globalTimeout: 30 * 60_000,
    workers: 2,
    retries: 0,
    forbidOnly: true,
    updateSnapshots: 'none',
    snapshotPathTemplate:
        '{testDir}/../../.parity/screenshots/{projectName}/{testFilePath}/{arg}{ext}',
    reporter: [
        ['list'],
        ['html', { outputFolder: 'parity-report', open: 'never' }],
    ],
    use: {
        testIdAttribute: 'data-cy',
        locale: 'en-GB',
        timezoneId: 'Europe/London',
    },
    projects: [
        {
            name: 'chromium-desktop',
            use: {
                browserName: 'chromium',
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'chromium-compact',
            use: {
                browserName: 'chromium',
                viewport: { width: 1024, height: 768 },
            },
        },
        {
            name: 'chromium-mobile',
            use: {
                ...devices['Pixel 7'],
                browserName: 'chromium',
                viewport: { width: 393, height: 851 },
            },
        },
        {
            name: 'firefox-desktop',
            use: {
                browserName: 'firefox',
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'webkit-desktop',
            use: {
                browserName: 'webkit',
                viewport: { width: 1440, height: 900 },
            },
        },
        {
            name: 'webkit-mobile',
            use: {
                ...devices['iPhone 13'],
                browserName: 'webkit',
                viewport: { width: 390, height: 844 },
            },
        },
    ],
    webServer: [
        {
            command:
                'node scripts/serve-parity-build.mjs --directory .parity/baseline --port 4311',
            url: 'http://127.0.0.1:4311',
            reuseExistingServer: false,
            timeout: 30_000,
        },
        {
            command:
                'npm run build && node scripts/serve-parity-build.mjs --directory build --port 4312',
            url: 'http://127.0.0.1:4312',
            reuseExistingServer: false,
            timeout: 120_000,
        },
    ],
});
