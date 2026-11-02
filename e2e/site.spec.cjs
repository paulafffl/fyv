const { test: base, expect } = require('@playwright/test');

const test = base.extend({
    page: async ({ page, baseURL }, use) => {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('response', (response) => {
            if (
                response.url().startsWith(baseURL) &&
                response.status() >= 400
            ) {
                errors.push(`${response.status()} ${response.url()}`);
            }
        });
        // The suite exercises this site, without relying on external fonts/sites.
        await page.route(
            /https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            (route) => route.abort(),
        );
        await use(page);
        expect(errors, 'No browser exceptions or failed local assets').toEqual(
            [],
        );
    },
});

async function expectImagesLoaded(images) {
    await expect
        .poll(() =>
            images.evaluateAll(
                (elements) =>
                    elements.length > 0 &&
                    elements.every(
                        (img) => img.complete && img.naturalWidth > 0,
                    ),
            ),
        )
        .toBe(true);
}

async function expectNavigationAtTop(page, path) {
    await expect
        .poll(() => {
            const url = new URL(page.url());
            return `${url.pathname}${url.search}`;
        })
        .toBe(path);
    const pathname = new URL(page.url()).pathname;
    const heading = {
        '/': 'manifesto',
        '/about': 'about',
        '/bodywork': 'bodywork',
    }[pathname];
    await expect(
        page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
    await expectImagesLoaded(page.locator('img'));
    // Give native history restoration time to run before asserting the position.
    await page.evaluate(
        () =>
            new Promise((resolve) => {
                let frames = 0;
                const next = () => {
                    if (++frames >= 12) resolve();
                    else requestAnimationFrame(next);
                };
                requestAnimationFrame(next);
            }),
    );
    expect(await page.evaluate(() => ({ x: scrollX, y: scrollY }))).toEqual({
        x: 0,
        y: 0,
    });
    expect(await page.evaluate(() => history.scrollRestoration)).toBe('manual');
}

async function scrollDown(page) {
    await page.evaluate(() =>
        window.scrollTo({ top: 200, behavior: 'instant' }),
    );
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(200);
}

async function followNavigation(page, name) {
    const menu = page.getByRole('button', { name: 'Open menu', exact: true });
    if (await menu.isVisible()) await menu.click();
    await page
        .getByRole('navigation')
        .getByRole('link', { name, exact: true })
        .click();
}

for (const [path, heading] of [
    ['/', 'manifesto'],
    ['/self-work', 'self-work'],
    ['/bodywork', 'bodywork'],
    ['/posts', 'posts'],
    ['/about', 'about'],
]) {
    test(`@baseline direct route and refresh: ${path}`, async ({ page }) => {
        await page.goto(path);
        await expect(
            page.getByRole('heading', { name: heading, exact: true }),
        ).toBeVisible();
        await expectImagesLoaded(page.locator('img'));
        await page.reload();
        await expect(
            page.getByRole('heading', { name: heading, exact: true }),
        ).toBeVisible();
        await expectImagesLoaded(page.locator('img'));
    });
}

test('Back and Forward always return to the top', async ({ page }) => {
    await page.goto('/about');
    await expectNavigationAtTop(page, '/about');
    for (const [name, path] of [
        ['BODYWORK', '/bodywork'],
        ['Free Your Vulva Homepage', '/'],
    ]) {
        await scrollDown(page);
        if (path === '/')
            await page.getByRole('link', { name, exact: true }).click();
        else await followNavigation(page, name);
        await expectNavigationAtTop(page, path);
    }
    for (const [direction, path] of [
        ['goBack', '/bodywork'],
        ['goBack', '/about'],
        ['goForward', '/bodywork'],
        ['goForward', '/'],
    ]) {
        await scrollDown(page);
        await page[direction]();
        await expectNavigationAtTop(page, path);
    }
});

test('history between entries for the same page returns to the top', async ({
    page,
}) => {
    await page.goto('/about?visit=first');
    await expectNavigationAtTop(page, '/about?visit=first');
    await scrollDown(page);
    await followNavigation(page, 'ABOUT');
    await expectNavigationAtTop(page, '/about');
    for (const [direction, path] of [
        ['goBack', '/about?visit=first'],
        ['goForward', '/about'],
    ]) {
        await scrollDown(page);
        await page[direction]();
        await expectNavigationAtTop(page, path);
    }
});

test('returning to a previous document starts at the top', async ({ page }) => {
    await page.goto('/about');
    await expectNavigationAtTop(page, '/about');
    await scrollDown(page);
    // Full document navigations also cover restoration from the browser cache.
    await page.goto('/bodywork');
    await expectNavigationAtTop(page, '/bodywork');
    await scrollDown(page);
    await page.goBack();
    await expectNavigationAtTop(page, '/about');
    await scrollDown(page);
    await page.goForward();
    await expectNavigationAtTop(page, '/bodywork');
});

test('@baseline post modal opens, changes posts and closes', async ({
    page,
}) => {
    await page.goto('/posts');
    await page.getByTestId('section__img-138').click();
    await expect(page.getByTestId('modal__img-138')).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Previous', exact: true }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('modal__img-137')).toBeVisible();
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await expect(page.getByTestId('modal__img-138')).toBeVisible();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.locator('.modal')).toHaveCount(0);
});

test('carousel changes the image within a post', async ({ page }) => {
    await page.goto('/posts');
    await page.getByTestId('section__img-138').click();
    await page.getByTestId('carousel-img-139').click();
    await expect(page.getByTestId('modal__img-139')).toBeVisible();
    await expectImagesLoaded(page.locator('.modal img'));
    await page.getByTestId('carousel-img-138').click();
    await expect(page.getByTestId('modal__img-138')).toBeVisible();
    await expectImagesLoaded(page.locator('.modal img'));
});

test('post navigation stops at the final post', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/posts');
    await page.getByTestId('section__img-138').click();
    const next = page.getByRole('button', { name: 'Next', exact: true });
    // Bound the traversal so an accidentally wrapping carousel fails clearly.
    for (let index = 0; index < 100 && (await next.count()); index += 1) {
        await next.click();
    }
    await expect(next).toHaveCount(0);
    await expect(
        page.getByRole('button', { name: 'Previous', exact: true }),
    ).toBeVisible();
    await expectImagesLoaded(page.locator('.modal img'));
});

test('self-work uses animated thumbnails and released modal images', async ({
    page,
}) => {
    await page.goto('/self-work');
    await expectImagesLoaded(page.locator('.section__img'));
    await page.getByTestId('section__img-1').click();
    await expect(page.getByTestId('modal__img-1')).toBeVisible();
    await expectImagesLoaded(page.locator('.modal img'));
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByTestId('modal__img-2')).toBeVisible();
    await expectImagesLoaded(page.locator('.modal img'));
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.locator('.modal')).toHaveCount(0);
});

test('scrolling loads additional posts', async ({ page }) => {
    await page.goto('/posts');
    const thumbnails = page.locator('.section__img');
    await expect(thumbnails).toHaveCount(6);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => thumbnails.count()).toBeGreaterThan(6);
    await expectImagesLoaded(thumbnails);
});

test('navigation works on desktop and mobile and closes the menu', async ({
    page,
}, testInfo) => {
    await page.goto('/');
    const mobile = testInfo.project.name.startsWith('mobile-');
    for (const [name, path] of [
        ['POSTS', '/posts'],
        ['ABOUT', '/about'],
        ['SELF-WORK', '/self-work'],
        ['BODYWORK', '/bodywork'],
    ]) {
        if (mobile)
            await page.getByRole('button', { name: 'Open menu' }).click();
        await page
            .getByRole('navigation')
            .getByRole('link', { name, exact: true })
            .click();
        await expect(page).toHaveURL(new RegExp(`${path}$`));
        if (mobile)
            await expect(
                page.getByRole('button', { name: 'Open menu' }),
            ).toHaveAttribute('aria-expanded', 'false');
    }
    await page.getByRole('link', { name: 'Free Your Vulva Homepage' }).click();
    await expect(
        page.getByRole('heading', { name: 'manifesto', exact: true }),
    ).toBeVisible();
});

test('contact and social links point to their intended destinations', async ({
    page,
}) => {
    await page.goto('/');
    await expect(
        page.getByRole('link', {
            name: 'Follow - Open Instagram page in a new window',
        }),
    ).toHaveAttribute('href', 'https://www.instagram.com/freeyourvulva/');
    await expect(
        page.getByRole('link', {
            name: 'Support - Open BuyMeACoffee page in a new window',
        }),
    ).toHaveAttribute('href', 'https://www.buymeacoffee.com/freeyourvulva');
    await expect(
        page.getByRole('link', {
            name: 'Share my wisdom - Open mail to page in a new window',
        }),
    ).toHaveAttribute('href', /^mailto:freeyourvulva@gmail\.com\?/);
});
