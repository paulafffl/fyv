import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import autoprefixer from 'autoprefixer';
import { legacyTargets, cssBrowsers } from './browser-targets.mjs';

export default defineConfig({
    plugins: [react(), legacy({ targets: legacyTargets, polyfills: true })],
    css: {
        postcss: {
            plugins: [autoprefixer({ overrideBrowserslist: cssBrowsers })],
        },
    },
    build: {
        // Firebase Hosting and existing tooling use this directory.
        outDir: 'build',
        // Preserve the old build's CSS syntax/prefix coverage as well as its JS.
        cssTarget: [
            'chrome30',
            'edge99',
            'firefox98',
            'safari13.1',
            'ios12.2',
            'ie11',
        ],
    },
});
