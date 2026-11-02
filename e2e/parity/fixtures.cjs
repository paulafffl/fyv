const { test: base, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const fontDirectory = path.join(root, '.parity/fonts');
const fontRequests = new Map();
const fontDefinitions = [
    '300 16px "Trispace"',
    '600 16px "Trispace"',
    '300 16px "Figtree"',
    '800 16px "Figtree"',
    '400 16px "Passion One"',
];
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

async function fontResponse(route) {
    const request = route.request();
    const key = sha256(
        `${request.url()}\n${request.headers()['user-agent'] || ''}`,
    );
    const metadataPath = path.join(fontDirectory, `${key}.json`);
    const bodyPath = path.join(fontDirectory, `${key}.bin`);
    if (!fontRequests.has(key))
        fontRequests.set(
            key,
            (async () => {
                fs.mkdirSync(fontDirectory, { recursive: true });
                if (fs.existsSync(metadataPath) && fs.existsSync(bodyPath)) {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath));
                    const body = fs.readFileSync(bodyPath);
                    if (sha256(body) !== metadata.sha256)
                        throw new Error(
                            `Font cache checksum mismatch: ${request.url()}`,
                        );
                    return { metadata, body };
                }
                const response = await route.fetch({
                    timeout: 60_000,
                    maxRetries: 2,
                });
                if (!response.ok())
                    throw new Error(
                        `Font fetch failed: ${response.status()} ${request.url()}`,
                    );
                const body = await response.body();
                const metadata = {
                    url: request.url(),
                    userAgent: request.headers()['user-agent'],
                    contentType: response.headers()['content-type'],
                    sha256: sha256(body),
                };
                // Publish content before metadata; both sides replay exactly these bytes.
                fs.writeFileSync(`${bodyPath}.${process.pid}`, body);
                fs.renameSync(`${bodyPath}.${process.pid}`, bodyPath);
                fs.writeFileSync(
                    `${metadataPath}.${process.pid}`,
                    JSON.stringify(metadata, null, 2),
                );
                fs.renameSync(`${metadataPath}.${process.pid}`, metadataPath);
                return { metadata, body };
            })(),
        );
    const { metadata, body } = await fontRequests.get(key);
    await route.fulfill({
        status: 200,
        body,
        headers: {
            'content-type': metadata.contentType,
            'access-control-allow-origin': '*',
        },
    });
}

async function createPage(browser, testInfo, before) {
    const use = testInfo.project.use;
    const baseURL = before ? 'http://127.0.0.1:4311' : 'http://127.0.0.1:4312';
    const context = await browser.newContext({
        baseURL,
        viewport: use.viewport,
        deviceScaleFactor: 1,
        isMobile: use.isMobile,
        hasTouch: use.hasTouch,
        userAgent: use.userAgent,
        locale: 'en-GB',
        timezoneId: 'Europe/London',
        colorScheme: 'light',
        reducedMotion: 'reduce',
    });
    const failures = [];
    const page = await context.newPage();
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('response', (response) => {
        if (
            new URL(response.url()).origin === baseURL &&
            response.status() >= 400
        ) {
            failures.push(
                `${response.status()} ${new URL(response.url()).pathname}`,
            );
        }
    });
    await page.clock.setFixedTime(new Date('2026-11-01T12:00:00Z'));
    await page.route(
        /https:\/\/fonts\.(googleapis|gstatic)\.com\//,
        async (route) => {
            try {
                await fontResponse(route);
            } catch (error) {
                failures.push(error.message);
                await route.abort();
            }
        },
    );
    // Verify original GIF bytes, then serve the exact same decoded first frame.
    await page.route(/\.gif(?:\?.*)?$/, async (route) => {
        const response = await route.fetch();
        const key = sha256(await response.body());
        const manifest = JSON.parse(
            fs.readFileSync(
                path.join(root, '.parity/animation-frames/manifest.json'),
            ),
        );
        const frame = manifest.frames[key];
        if (!frame)
            throw new Error(`Unverified animation: ${route.request().url()}`);
        await route.fulfill({
            status: 200,
            contentType: 'image/png',
            body: fs.readFileSync(
                path.join(root, '.parity/animation-frames', frame.file),
            ),
        });
    });
    return { context, page, failures };
}

const test = base.extend({
    beforePage: async ({ browser }, use, testInfo) => {
        const state = await createPage(browser, testInfo, true);
        await use(state.page);
        await state.context.close();
        expect(state.failures, 'Original build browser/network errors').toEqual(
            [],
        );
    },
    afterPage: async ({ browser }, use, testInfo) => {
        const state = await createPage(browser, testInfo, false);
        await use(state.page);
        await state.context.close();
        expect(state.failures, 'Migrated build browser/network errors').toEqual(
            [],
        );
    },
});

async function ready(page) {
    await expect
        .poll(
            async () =>
                page.evaluate(async (definitions) => {
                    const loaded = await Promise.all(
                        definitions.map((definition) =>
                            document.fonts.load(definition),
                        ),
                    );
                    await document.fonts.ready;
                    const images = [...document.images];
                    return {
                        fonts: loaded.every(
                            (faces) =>
                                faces.length > 0 &&
                                faces.every((face) => face.status === 'loaded'),
                        ),
                        images:
                            images.length > 0 &&
                            images.every(
                                (img) => img.complete && img.naturalWidth > 0,
                            ),
                    };
                }, fontDefinitions),
            {
                timeout: 60_000,
                message:
                    'All real fonts and images must load before comparison',
            },
        )
        .toEqual({ fonts: true, images: true });
    await page.evaluate(async () => {
        await Promise.all([...document.images].map((image) => image.decode()));
        const background = getComputedStyle(
            document.body,
        ).backgroundImage.match(/^url\("?(.*?)"?\)$/);
        if (background) {
            const image = new Image();
            image.src = background[1];
            await image.decode();
        }
    });
}

async function capture(page, testInfo, options) {
    await page.bringToFront();
    if (testInfo.project.use.browserName === 'webkit') {
        // Toggling animation cancellation at screenshot time can invalidate
        // WebKit's compositor. Pause infinite animations first, and let finite
        // transitions finish, so the capture does not change animation state.
        await page.evaluate(() => {
            for (const animation of document.getAnimations()) {
                if (animation.effect.getTiming().iterations === Infinity) {
                    animation.pause();
                    animation.currentTime = 0;
                } else animation.finish();
            }
        });
        if (options.fullPage) {
            await page.evaluate(async () => {
                const original = {
                    x: scrollX,
                    y: scrollY,
                    height: document.body.scrollHeight,
                    count: document.querySelectorAll('.section__img').length,
                };
                const frames = () =>
                    new Promise((resolve) =>
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() =>
                                requestAnimationFrame(resolve),
                            ),
                        ),
                    );
                // Paint off-screen images, including the footer. Prevent these
                // capture-only scrolls from requesting another gallery batch.
                // Functional tests exercise pagination without this listener.
                const stop = (event) => event.stopImmediatePropagation();
                window.addEventListener('scroll', stop, true);
                try {
                    for (let pass = 0; pass < 2; pass += 1) {
                        for (
                            let y = 0;
                            y < original.height;
                            y += Math.max(1, innerHeight - 80)
                        ) {
                            scrollTo({ top: y, behavior: 'instant' });
                            await frames();
                        }
                        scrollTo({
                            left: original.x,
                            top: original.y,
                            behavior: 'instant',
                        });
                        await frames();
                    }
                } finally {
                    scrollTo({
                        left: original.x,
                        top: original.y,
                        behavior: 'instant',
                    });
                    await frames();
                    window.removeEventListener('scroll', stop, true);
                }
                if (
                    document.querySelectorAll('.section__img').length !==
                        original.count ||
                    document.body.scrollHeight !== original.height
                ) {
                    throw new Error(
                        'Capture paint warm-up changed page content or gallery state',
                    );
                }
            });
        } else {
            await page.evaluate(
                () =>
                    new Promise((resolve) =>
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() =>
                                requestAnimationFrame(resolve),
                            ),
                        ),
                    ),
            );
        }
        return page.screenshot({ ...options, animations: 'allow' });
    }
    return page.screenshot(options);
}

function assertPixels(testInfo, name, expected, actual) {
    const snapshotName = `${sha256(testInfo.titlePath.join('/')).slice(0, 12)}-${name}.png`;
    const baselinePath = testInfo.snapshotPath(snapshotName);
    fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
    // Always write the original app as the reference, including tiled captures.
    fs.writeFileSync(baselinePath, expected);
    expect(actual).toMatchSnapshot(snapshotName, {
        threshold: 0,
        maxDiffPixels: 0,
    });
    expect(sha256(actual), 'Exact normalized screenshot equality').toBe(
        sha256(expected),
    );
}

async function compareWebkitViewports(
    beforePage,
    afterPage,
    testInfo,
    name,
    options,
) {
    const states = [];
    try {
        for (const page of [beforePage, afterPage]) {
            const lock = await page.evaluateHandle(() => {
                const stop = (event) => event.stopImmediatePropagation();
                const original = {
                    x: scrollX,
                    y: scrollY,
                    height: document.body.scrollHeight,
                    width: document.documentElement.scrollWidth,
                    count: document.querySelectorAll('.section__img').length,
                    viewportHeight: innerHeight,
                    overlap: Math.max(
                        80,
                        Math.ceil(
                            document
                                .querySelector('.navbar')
                                ?.getBoundingClientRect().height || 0,
                        ) + 16,
                    ),
                };
                window.addEventListener('scroll', stop, true);
                return { stop, original };
            });
            states.push({
                page,
                lock,
                geometry: await lock.evaluate((state) => state.original),
            });
        }
        const [before, after] = states;
        for (const key of [
            'height',
            'width',
            'count',
            'viewportHeight',
            'overlap',
        ]) {
            expect(after.geometry[key], `Full-page ${key}`).toBe(
                before.geometry[key],
            );
        }
        const geometry = before.geometry;
        expect(geometry.height).toBeGreaterThan(0);
        expect(geometry.viewportHeight).toBeGreaterThan(geometry.overlap);
        const positions = new Set();
        const step = Math.max(1, geometry.viewportHeight - geometry.overlap);
        for (let y = 0; y < geometry.height; y += step) {
            positions.add(
                Math.min(
                    y,
                    Math.max(0, geometry.height - geometry.viewportHeight),
                ),
            );
        }
        // Compare every visible viewport with overlap that exceeds the fixed
        // navbar height. WebKit's fullPage capture can omit off-screen images
        // even after paint sweeps, including on two original-build visits.
        for (const y of positions) {
            const captures = [];
            for (const { page } of states) {
                await page.bringToFront();
                await page.evaluate(
                    (top) => scrollTo({ top, behavior: 'instant' }),
                    y,
                );
                captures.push(
                    await capture(page, testInfo, {
                        ...options,
                        fullPage: false,
                    }),
                );
            }
            assertPixels(
                testInfo,
                `${name}-viewport-y${y}`,
                captures[0],
                captures[1],
            );
        }
        for (const { lock } of states) {
            expect(
                await lock.evaluate(() => ({
                    height: document.body.scrollHeight,
                    count: document.querySelectorAll('.section__img').length,
                })),
            ).toEqual({ height: geometry.height, count: geometry.count });
        }
    } finally {
        for (const { lock } of states) {
            try {
                await lock.evaluate(async ({ stop, original }) => {
                    try {
                        scrollTo({
                            left: original.x,
                            top: original.y,
                            behavior: 'instant',
                        });
                        await new Promise((resolve) =>
                            requestAnimationFrame(() =>
                                requestAnimationFrame(() =>
                                    requestAnimationFrame(resolve),
                                ),
                            ),
                        );
                    } finally {
                        window.removeEventListener('scroll', stop, true);
                    }
                });
            } finally {
                await lock.dispose();
            }
        }
    }
}

async function compareScreenshot(
    beforePage,
    afterPage,
    testInfo,
    name,
    options = {},
) {
    await Promise.all([ready(beforePage), ready(afterPage)]);
    await beforePage.mouse.move(0, 0);
    await afterPage.mouse.move(0, 0);
    const screenshotOptions = {
        animations: 'disabled',
        caret: 'hide',
        scale: 'css',
        ...options,
    };
    // Keep unmodified screenshots visible in the report, including accepted fixes.
    await testInfo.attach(`${name}-before-raw`, {
        body: await capture(beforePage, testInfo, screenshotOptions),
        contentType: 'image/png',
    });
    await testInfo.attach(`${name}-after-raw`, {
        body: await capture(afterPage, testInfo, screenshotOptions),
        contentType: 'image/png',
    });
    if (testInfo.project.use.browserName === 'firefox') {
        // Firefox can retain font-fallback column balancing after fonts load.
        // Even two original-build visits differ. Recalculate both builds, then
        // restore their exact styles; raw captures above retain the initial state.
        for (const page of [beforePage, afterPage]) {
            await page
                .locator('.bodywork__col-grid-2')
                .evaluateAll((columns) => {
                    for (const column of columns) {
                        const originalStyle = column.getAttribute('style');
                        column.style.setProperty('column-count', '1');
                        column.getBoundingClientRect();
                        if (originalStyle === null)
                            column.removeAttribute('style');
                        else column.setAttribute('style', originalStyle);
                        column.getBoundingClientRect();
                    }
                });
        }
    }
    // Normalize only the accepted Close-button dimensions/line height. Keep the
    // style installed while layout settles, then remove it even on failure.
    const normalizers = [];
    try {
        for (const page of [beforePage, afterPage]) {
            normalizers.push(
                await page.addStyleTag({
                    content:
                        '.modal__close button { min-width: 0 !important; min-height: 0 !important; line-height: 0 !important; }',
                }),
            );
            if (testInfo.project.use.browserName === 'webkit') {
                // WebKit can retain the scrollbar/flex layout from the larger
                // Close target. Recalculate after normalization, preserving every
                // original style. This does not change the final CSS or text.
                await page
                    .locator('.modal__content')
                    .evaluateAll((contents) => {
                        for (const content of contents) {
                            const originalStyle = content.getAttribute('style');
                            content.style.display = 'none';
                            content.getBoundingClientRect();
                            if (originalStyle === null)
                                content.removeAttribute('style');
                            else content.setAttribute('style', originalStyle);
                            content.getBoundingClientRect();
                        }
                    });
            }
            await page.evaluate(
                () =>
                    new Promise((resolve) =>
                        requestAnimationFrame(() =>
                            requestAnimationFrame(resolve),
                        ),
                    ),
            );
        }
        if (
            testInfo.project.use.browserName === 'webkit' &&
            screenshotOptions.fullPage
        ) {
            await compareWebkitViewports(
                beforePage,
                afterPage,
                testInfo,
                name,
                screenshotOptions,
            );
        } else {
            const expected = await capture(
                beforePage,
                testInfo,
                screenshotOptions,
            );
            const actual = await capture(
                afterPage,
                testInfo,
                screenshotOptions,
            );
            assertPixels(testInfo, name, expected, actual);
        }
    } finally {
        await Promise.all(
            normalizers.map((style) =>
                style.evaluate((element) => element.remove()),
            ),
        );
    }
}

module.exports = { test, expect, ready, compareScreenshot };
