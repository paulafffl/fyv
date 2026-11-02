const { test, expect, ready } = require('./fixtures.cjs');

function attribute(attributes, name) {
    const match = attributes.match(
        new RegExp(
            String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))`,
            'i',
        ),
    );
    return match ? match[1] ?? match[2] ?? match[3] : null;
}

function forceLegacyHTML(html, url) {
    const scripts = [
        ...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi),
    ];
    const polyfills = scripts.find(
        (script) => attribute(script[1], 'id') === 'vite-legacy-polyfill',
    );
    const entry = scripts.find(
        (script) => attribute(script[1], 'id') === 'vite-legacy-entry',
    );
    const modules = scripts.filter(
        (script) => attribute(script[1], 'type')?.toLowerCase() === 'module',
    );
    const details = {
        url,
        modulesRemoved: modules.length,
        modernScripts: modules
            .map((script) => attribute(script[1], 'src'))
            .filter(Boolean)
            .map((src) => new URL(src, url).href),
        polyfillTag: !!polyfills,
        entryTag: !!entry,
        polyfillNomodule: !!polyfills && /\bnomodule\b/i.test(polyfills[1]),
        entryNomodule: !!entry && /\bnomodule\b/i.test(entry[1]),
        polyfillURL:
            polyfills && attribute(polyfills[1], 'src')
                ? new URL(attribute(polyfills[1], 'src'), url).href
                : null,
        entryURL:
            entry && attribute(entry[1], 'data-src')
                ? new URL(attribute(entry[1], 'data-src'), url).href
                : null,
    };
    const transformed = html.replace(
        /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
        (script, attributes, body) => {
            if (attribute(attributes, 'type')?.toLowerCase() === 'module')
                return '';
            const classicAttributes = attributes.replace(
                /\s+nomodule(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi,
                '',
            );
            return `<script${classicAttributes}>${body}</script>`;
        },
    );
    return { details, html: transformed };
}

async function installLegacyNavigation(page) {
    const documents = [];
    const responses = new Map();
    page.on('response', (response) =>
        responses.set(response.url(), response.status()),
    );
    await page.route('http://127.0.0.1:4312/**', async (route) => {
        if (
            !route.request().isNavigationRequest() ||
            route.request().resourceType() !== 'document'
        ) {
            await route.fallback();
            return;
        }
        const response = await route.fetch();
        const transformed = forceLegacyHTML(
            await response.text(),
            route.request().url(),
        );
        documents.push({ ...transformed.details, status: response.status() });
        await route.fulfill({ response, body: transformed.html });
    });
    return async () => {
        const document = documents.at(-1);
        expect(
            document,
            'The migrated navigation HTML was intercepted',
        ).toBeDefined();
        expect(document.status).toBe(200);
        expect(
            document.modulesRemoved,
            'The unmodified HTML contains the modern entry',
        ).toBeGreaterThan(0);
        expect(
            document.polyfillTag,
            'The unmodified HTML contains legacy polyfills',
        ).toBe(true);
        expect(
            document.entryTag,
            'The unmodified HTML contains the legacy entry',
        ).toBe(true);
        expect(document.polyfillNomodule).toBe(true);
        expect(document.entryNomodule).toBe(true);
        expect(document.polyfillURL).toBeTruthy();
        expect(document.entryURL).toBeTruthy();
        await expect(
            page.locator('script[type="module"], script[nomodule]'),
        ).toHaveCount(0);
        await expect
            .poll(() => page.evaluate(() => typeof window.System?.import))
            .toBe('function');
        await expect.poll(() => responses.get(document.polyfillURL)).toBe(200);
        await expect.poll(() => responses.get(document.entryURL)).toBe(200);
        for (const url of document.modernScripts) {
            expect(
                responses.has(url),
                `The removed modern entry must not execute: ${url}`,
            ).toBe(false);
        }
    };
}

async function state(page, selector = '#root') {
    await ready(page);
    return page.locator(selector).evaluate(async (root) => {
        const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();
        const images = await Promise.all(
            [...root.querySelectorAll('img')].map(async (image) => {
                const response = await fetch(image.currentSrc || image.src);
                if (!response.ok)
                    throw new Error(
                        `Image fetch failed: ${response.status} ${image.src}`,
                    );
                // The static verifier checks SVG serialization equivalence separately.
                const svg = (
                    response.headers.get('content-type') || ''
                ).includes('image/svg+xml');
                const digest = svg
                    ? null
                    : await crypto.subtle.digest(
                          'SHA-256',
                          await response.arrayBuffer(),
                      );
                return {
                    id:
                        image.getAttribute('data-cy') ||
                        image.parentElement.getAttribute('data-cy'),
                    alt: image.getAttribute('alt'),
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                    sha256:
                        digest === null
                            ? null
                            : [...new Uint8Array(digest)]
                                  .map((byte) =>
                                      byte.toString(16).padStart(2, '0'),
                                  )
                                  .join(''),
                };
            }),
        );
        return {
            path: location.pathname,
            title: document.title,
            text: normalize(root.textContent),
            headings: [...root.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
                (heading) => ({
                    level: heading.tagName,
                    text: normalize(heading.textContent),
                }),
            ),
            links: [...root.querySelectorAll('a')].map((link) => {
                const url = new URL(link.href, location.href);
                return {
                    text: normalize(link.textContent),
                    label: link.getAttribute('aria-label'),
                    href:
                        url.origin === location.origin
                            ? `${url.pathname}${url.search}${url.hash}`
                            : url.href,
                    target: link.getAttribute('target'),
                    rel: link.getAttribute('rel'),
                };
            }),
            images,
            previous: !!root.querySelector('[data-cy="Previous"]'),
            next: !!root.querySelector('[data-cy="Next"]'),
            carousel: [...root.querySelectorAll('.modal__carousel')].map(
                (control) => ({
                    id: control.getAttribute('data-cy'),
                    selected: control.classList.contains(
                        'modal__carousel--selected',
                    ),
                }),
            ),
        };
    });
}

async function compare(pages, label, selector) {
    const [before, legacy] = await Promise.all(
        pages.map((page) => state(page, selector)),
    );
    expect(legacy, label).toEqual(before);
    return legacy;
}

test('before/after: forced SystemJS legacy bundle preserves routes and gallery controls', async ({
    beforePage,
    afterPage,
}, testInfo) => {
    test.skip(
        testInfo.project.name !== 'chromium-desktop',
        'Force the legacy compilation path once; modern browser parity runs separately.',
    );
    test.setTimeout(180_000);
    const pages = [beforePage, afterPage];
    const verifyLegacy = await installLegacyNavigation(afterPage);
    for (const [path, heading] of [
        ['/', 'manifesto'],
        ['/self-work', 'self-work'],
        ['/bodywork', 'bodywork'],
        ['/posts', 'posts'],
        ['/about', 'about'],
    ]) {
        await Promise.all(pages.map((page) => page.goto(path)));
        // Check generated tags before waiting for app readiness, so missing legacy
        // output fails with its cause rather than an unrelated missing heading.
        await verifyLegacy();
        await Promise.all(
            pages.map((page) =>
                expect(
                    page.getByRole('heading', { name: heading, exact: true }),
                ).toBeVisible(),
            ),
        );
        await compare(pages, `${path}: original versus forced legacy content`);
    }
    for (const [path, first, next] of [
        ['/posts', 138, 137],
        ['/self-work', 1, 2],
    ]) {
        await Promise.all(
            pages.map(async (page) => {
                await page.goto(path);
                await ready(page);
                await page.getByTestId(`section__img-${first}`).click();
                await expect(page.locator('.modal__box')).toBeVisible();
            }),
        );
        await verifyLegacy();
        const initial = await compare(
            pages,
            `${path}: legacy modal opens`,
            '.modal',
        );
        expect(initial.previous).toBe(false);
        expect(initial.next).toBe(true);
        if (path === '/posts') {
            await Promise.all(
                pages.map(async (page) => {
                    await page.getByTestId('carousel-img-139').click();
                    await expect(
                        page.getByTestId('modal__img-139'),
                    ).toBeVisible();
                }),
            );
            await compare(pages, 'Legacy post image carousel', '.modal');
        }
        await Promise.all(
            pages.map(async (page) => {
                await page.getByTestId('Next').click();
                await expect(
                    page.getByTestId(`modal__img-${next}`),
                ).toBeVisible();
            }),
        );
        const nextState = await compare(
            pages,
            `${path}: legacy next post`,
            '.modal',
        );
        expect(nextState.previous).toBe(true);
        await Promise.all(
            pages.map(async (page) => {
                await page.getByTestId('Previous').click();
                await expect(
                    page.getByTestId(`modal__img-${first}`),
                ).toBeVisible();
            }),
        );
        expect(
            await compare(
                pages,
                `${path}: legacy previous resets image`,
                '.modal',
            ),
        ).toEqual(initial);
        // The original zero-height Close target is an accepted existing difference.
        await beforePage.getByTestId('Close').dispatchEvent('click');
        await afterPage.getByTestId('Close').click();
        await Promise.all(
            pages.map((page) => expect(page.locator('.modal')).toHaveCount(0)),
        );
        await compare(pages, `${path}: legacy modal closes`);
    }
});
