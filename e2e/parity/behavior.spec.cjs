const { test, expect } = require('./fixtures.cjs');

const routes = [
    ['/', 'manifesto'],
    ['/self-work', 'self-work'],
    ['/bodywork', 'bodywork'],
    ['/posts', 'posts'],
    ['/about', 'about'],
];

async function imagesLoaded(page, selector = 'img') {
    await expect
        .poll(() =>
            page
                .locator(selector)
                .evaluateAll((images) =>
                    images.every(
                        (image) => image.complete && image.naturalWidth > 0,
                    ),
                ),
        )
        .toBe(true);
}

async function routeReady(page, path) {
    const heading = routes.find(([route]) => route === path)[1];
    await expect(
        page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await imagesLoaded(page);
}

async function visit(pages, path) {
    await Promise.all(
        pages.map(async (page) => {
            await page.goto(path);
            await routeReady(page, path);
        }),
    );
}

async function imageContent(page, selector = 'img', galleryLimit = null) {
    return page.locator(selector).evaluateAll(async (elements, limit) => {
        let galleryIndex = 0;
        const images = elements.filter((image) => {
            if (!image.classList.contains('section__img') || limit === null)
                return true;
            galleryIndex += 1;
            return galleryIndex <= limit;
        });
        return Promise.all(
            images.map(async (image) => {
                const response = await fetch(image.currentSrc || image.src);
                if (!response.ok)
                    throw new Error(
                        `Image fetch failed: ${response.status} ${image.src}`,
                    );
                // Vite may serialize SVG markup differently when inlining it. The
                // static asset verifier checks that exact markup equivalence; runtime
                // hashes establish byte identity for the actual gallery/modal bitmaps.
                const isSVG = (
                    response.headers.get('content-type') || ''
                ).includes('image/svg+xml');
                const digest = isSVG
                    ? null
                    : await crypto.subtle.digest(
                          'SHA-256',
                          await response.arrayBuffer(),
                      );
                return {
                    alt: image.getAttribute('alt'),
                    item:
                        image.getAttribute('data-cy') ||
                        image.parentElement.getAttribute('data-cy'),
                    loaded: image.complete && image.naturalWidth > 0,
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
    }, galleryLimit);
}

async function contentState(page, galleryLimit = null) {
    await imagesLoaded(page);
    const state = await page.evaluate(() => {
        const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();
        const href = (link) => {
            const url = new URL(link.href, location.href);
            return url.origin === location.origin
                ? `${url.pathname}${url.search}${url.hash}`
                : url.href;
        };
        return {
            path: location.pathname,
            title: document.title,
            description: document.querySelector('meta[name="description"]')
                ?.content,
            text: normalize(document.querySelector('#root').textContent),
            headings: [
                ...document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
            ].map((element) => ({
                level: element.tagName,
                text: normalize(element.textContent),
            })),
            links: [...document.querySelectorAll('#root a')].map((link) => ({
                text: normalize(link.textContent),
                label: link.getAttribute('aria-label'),
                href: href(link),
                target: link.getAttribute('target'),
                rel: link.getAttribute('rel'),
            })),
        };
    });
    return { ...state, images: await imageContent(page, 'img', galleryLimit) };
}

async function navigationState(page) {
    const path = new URL(page.url()).pathname;
    const initialCount = { '/posts': 6, '/self-work': 4 }[path];
    if (initialCount) {
        // During a scrolled route transition the original uncancelled timeout may
        // append one extra batch. This is the accepted pagination-timer change.
        // Compare every initial item byte-for-byte and bound any extra batch;
        // the dedicated pagination tests compare the entire loaded batch exactly.
        const count = await page.locator('.section__img').count();
        expect(count).toBeGreaterThanOrEqual(initialCount);
        expect(count).toBeLessThanOrEqual(initialCount * 2);
    }
    return {
        ...(await contentState(page, initialCount ?? null)),
        menuOpen: (await page.locator('.navbar--expanded').count()) > 0,
        activeLinks: await page
            .locator('.navbar__route--active')
            .allTextContents(),
        scrollY: await page.evaluate(() => window.scrollY),
    };
}

async function modalState(page) {
    // The wrapper has zero dimensions because its visible children are fixed.
    await expect(page.locator('.modal__box')).toBeVisible();
    await imagesLoaded(page, '.modal img');
    const state = await page.locator('.modal').evaluate((modal) => {
        const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();
        const image = modal.querySelector('.modal__img img');
        const text = modal.querySelector('.modal__text');
        return {
            path: location.pathname,
            image: image.getAttribute('data-cy'),
            alt: image.getAttribute('alt'),
            text: normalize(text.textContent),
            textAtTop: text.scrollTop < 1,
            previous: !!modal.querySelector('[data-cy="Previous"]'),
            next: !!modal.querySelector('[data-cy="Next"]'),
            carousel: [...modal.querySelectorAll('.modal__carousel')].map(
                (control) => ({
                    image: control.getAttribute('data-cy'),
                    selected: control.classList.contains(
                        'modal__carousel--selected',
                    ),
                }),
            ),
        };
    });
    const [image] = await imageContent(page, '.modal__img img');
    return { ...state, imageSha256: image.sha256 };
}

async function settleScroll(page) {
    await page.evaluate(
        () =>
            new Promise((resolve) => {
                let previous = window.scrollY;
                let stableFrames = 0;
                const frame = () => {
                    const current = window.scrollY;
                    stableFrames = current === previous ? stableFrames + 1 : 0;
                    previous = current;
                    if (stableFrames >= 12) resolve();
                    else requestAnimationFrame(frame);
                };
                requestAnimationFrame(frame);
            }),
    );
}

async function compare(pages, readState, description) {
    const [before, after] = await Promise.all(
        pages.map((page) => readState(page)),
    );
    expect(after, description).toEqual(before);
    return after;
}

async function openMenuIfNeeded(page) {
    const toggle = page.locator('.navbar__button');
    if (await toggle.isVisible()) {
        await toggle.click();
        await expect(page.locator('.navbar')).toHaveClass(/navbar--expanded/);
    }
}

async function followRoute(page, path) {
    await openMenuIfNeeded(page);
    await page.locator(`.navbar__routes a[href="${path}"]`).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(path);
    await routeReady(page, path);
    await expect(page.locator('.navbar--expanded')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

async function closeModal(pages) {
    // The original zero-height Close button is an explicitly accepted difference.
    await pages[0].getByTestId('Close').dispatchEvent('click');
    await pages[1].getByTestId('Close').click();
    await Promise.all(
        pages.map((page) => expect(page.locator('.modal')).toHaveCount(0)),
    );
}

test('before/after: content, links, images and refresh on every direct route', async ({
    beforePage,
    afterPage,
}) => {
    test.setTimeout(120_000);
    const pages = [beforePage, afterPage];
    for (const [path] of routes) {
        await test.step(`${path}: direct visit and refresh`, async () => {
            await visit(pages, path);
            await compare(pages, contentState, `Direct route ${path}`);
            await Promise.all(
                pages.map(async (page) => {
                    await page.reload();
                    await routeReady(page, path);
                }),
            );
            await compare(pages, contentState, `Refreshed route ${path}`);
        });
    }
});

test('before/after: route navigation, menu dismissal, active links and scroll reset', async ({
    beforePage,
    afterPage,
}) => {
    test.setTimeout(90_000);
    const pages = [beforePage, afterPage];
    await visit(pages, '/');
    for (const path of ['/posts', '/about', '/self-work', '/bodywork']) {
        await Promise.all(pages.map(settleScroll));
        // The accepted pagination-timer fix can leave the original gallery one
        // batch longer. Start both pages at the same reachable scroll position.
        const scrollTarget = Math.min(
            200,
            ...(await Promise.all(
                pages.map((page) =>
                    page.evaluate(() =>
                        Math.max(
                            0,
                            document.documentElement.scrollHeight - innerHeight,
                        ),
                    ),
                ),
            )),
        );
        await Promise.all(
            pages.map(async (page) => {
                await page.evaluate(
                    (top) => window.scrollTo({ top, behavior: 'instant' }),
                    scrollTarget,
                );
                await expect
                    .poll(() => page.evaluate(() => window.scrollY))
                    .toBe(scrollTarget);
                await openMenuIfNeeded(page);
                await settleScroll(page);
            }),
        );
        await compare(pages, navigationState, `Navigation menu before ${path}`);
        await Promise.all(
            pages.map(async (page) => {
                await page.locator(`.navbar__routes a[href="${path}"]`).click();
                await expect
                    .poll(() => new URL(page.url()).pathname)
                    .toBe(path);
                await routeReady(page, path);
                await expect(page.locator('.navbar--expanded')).toHaveCount(0);
                await expect
                    .poll(() => page.evaluate(() => window.scrollY))
                    .toBe(0);
            }),
        );
        const state = await compare(
            pages,
            navigationState,
            `Navigation to ${path}`,
        );
        expect(state.scrollY).toBe(0);
        expect(state.menuOpen).toBe(false);
    }
    await Promise.all(
        pages.map(async (page) => {
            await page
                .getByRole('link', { name: 'Free Your Vulva Homepage' })
                .click();
            await routeReady(page, '/');
        }),
    );
    await compare(pages, navigationState, 'Homepage logo navigation');
});

test('before/after: browser history preserves content and returns the current site to the top', async ({
    beforePage,
    afterPage,
}) => {
    test.setTimeout(90_000);
    const pages = [beforePage, afterPage];
    await visit(pages, '/');
    await Promise.all(pages.map((page) => followRoute(page, '/posts')));
    await Promise.all(pages.map((page) => followRoute(page, '/about')));
    for (const [direction, path] of [
        ['goBack', '/posts'],
        ['goBack', '/'],
        ['goForward', '/posts'],
        ['goForward', '/about'],
    ]) {
        await Promise.all(
            pages.map(async (page) => {
                await page.evaluate(() =>
                    window.scrollTo({ top: 200, behavior: 'instant' }),
                );
                await page[direction]();
                await expect
                    .poll(() => new URL(page.url()).pathname)
                    .toBe(path);
                await routeReady(page, path);
                await settleScroll(page);
            }),
        );
        // Returning to the top is an intentional change from the original app.
        await expect
            .poll(() => afterPage.evaluate(() => window.scrollY))
            .toBe(0);
        await compare(
            pages,
            async (page) => {
                const state = await navigationState(page);
                delete state.scrollY;
                return state;
            },
            `${direction} to ${path}: content matches; current scroll resets`,
        );
    }
});

test('before/after: post modal, all first-post carousel images, next/previous and dismissal', async ({
    beforePage,
    afterPage,
}) => {
    test.setTimeout(90_000);
    const pages = [beforePage, afterPage];
    await visit(pages, '/posts');
    await Promise.all(
        pages.map((page) => page.getByTestId('section__img-138').click()),
    );
    const initial = await compare(pages, modalState, 'First post opens');
    expect(initial.image).toBe('modal__img-138');
    expect(initial.previous).toBe(false);
    expect(initial.next).toBe(true);
    for (const image of [139, 140, 141, 142, 138]) {
        await Promise.all(
            pages.map(async (page) => {
                await page.getByTestId(`carousel-img-${image}`).click();
                await expect(
                    page.getByTestId(`modal__img-${image}`),
                ).toBeVisible();
            }),
        );
        const state = await compare(
            pages,
            modalState,
            `Carousel image ${image}`,
        );
        expect(state.carousel.filter((control) => control.selected)).toEqual([
            { image: `carousel-img-${image}`, selected: true },
        ]);
    }
    await Promise.all(
        pages.map(async (page) => {
            await page.locator('.modal__text').evaluate((text) =>
                text.scrollTo({
                    top: text.scrollHeight,
                    behavior: 'instant',
                }),
            );
            await page.getByTestId('Next').click();
            await expect(page.getByTestId('modal__img-137')).toBeVisible();
        }),
    );
    const next = await compare(
        pages,
        modalState,
        'Next post resets image and text scroll',
    );
    expect(next.previous).toBe(true);
    expect(next.textAtTop).toBe(true);
    await Promise.all(
        pages.map(async (page) => {
            await page.getByTestId('Previous').click();
            await expect(page.getByTestId('modal__img-138')).toBeVisible();
        }),
    );
    expect(
        await compare(pages, modalState, 'Previous returns to first post'),
    ).toEqual(initial);
    await closeModal(pages);
    await compare(pages, contentState, 'Gallery after Close');
    await Promise.all(
        pages.map(async (page) => {
            await page.getByTestId('section__img-138').click();
            await expect(page.locator('.modal__box')).toBeVisible();
            await page
                .locator('.modal__bckg')
                .click({ position: { x: 2, y: 2 } });
            await expect(page.locator('.modal')).toHaveCount(0);
        }),
    );
    await compare(pages, contentState, 'Gallery after backdrop dismissal');
});

test('before/after: self-work gallery modal content and next/previous controls', async ({
    beforePage,
    afterPage,
}) => {
    const pages = [beforePage, afterPage];
    await visit(pages, '/self-work');
    await Promise.all(
        pages.map((page) => page.getByTestId('section__img-1').click()),
    );
    const first = await compare(pages, modalState, 'First self-work entry');
    expect(first.image).toBe('modal__img-1');
    expect(first.previous).toBe(false);
    expect(first.carousel).toEqual([]);
    await Promise.all(
        pages.map(async (page) => {
            await page.getByTestId('Next').click();
            await expect(page.getByTestId('modal__img-2')).toBeVisible();
        }),
    );
    await compare(pages, modalState, 'Second self-work entry');
    await Promise.all(
        pages.map(async (page) => {
            await page.getByTestId('Previous').click();
            await expect(page.getByTestId('modal__img-1')).toBeVisible();
        }),
    );
    expect(
        await compare(pages, modalState, 'Return to first self-work entry'),
    ).toEqual(first);
    await closeModal(pages);
    await compare(pages, contentState, 'Self-work gallery after Close');
});

for (const [path, initialCount, loadedCount] of [
    ['/posts', 6, 12],
    ['/self-work', 4, 8],
]) {
    test(`before/after: one completed pagination load on ${path}`, async ({
        beforePage,
        afterPage,
    }) => {
        const pages = [beforePage, afterPage];
        await visit(pages, path);
        await Promise.all(
            pages.map((page) =>
                expect(page.locator('.section__img')).toHaveCount(initialCount),
            ),
        );
        await compare(pages, contentState, `${path} initial gallery`);
        await Promise.all(
            pages.map(async (page) => {
                // One scroll and one completed load avoid the accepted coalescing/timer change.
                await page.evaluate(() =>
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'instant',
                    }),
                );
                await expect(page.locator('.section__img')).toHaveCount(
                    loadedCount,
                );
                await expect(page.locator('.loader-container')).toHaveCount(0);
                await imagesLoaded(page, '.section__img');
            }),
        );
        await compare(
            pages,
            contentState,
            `${path} gallery after one completed load`,
        );
        // Clicking the final newly loaded item also checks item ordering and event wiring.
        await Promise.all(
            pages.map(async (page) => {
                await page
                    .locator('.section__img')
                    .nth(loadedCount - 1)
                    .click();
                await expect(page.locator('.modal__box')).toBeVisible();
            }),
        );
        await compare(pages, modalState, `${path} newly loaded entry opens`);
        await closeModal(pages);
    });
}
