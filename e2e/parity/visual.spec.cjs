const { test, expect, ready, compareScreenshot } = require('./fixtures.cjs');

for (const route of ['/', '/self-work', '/bodywork', '/posts', '/about']) {
    test(`visual parity: ${route}`, async ({
        beforePage,
        afterPage,
    }, testInfo) => {
        await Promise.all([beforePage.goto(route), afterPage.goto(route)]);
        await compareScreenshot(beforePage, afterPage, testInfo, 'full-page', {
            fullPage: true,
        });
    });
}

test('visual parity: expanded compact/mobile menu', async ({
    beforePage,
    afterPage,
}, testInfo) => {
    await Promise.all([beforePage.goto('/'), afterPage.goto('/')]);
    await Promise.all([ready(beforePage), ready(afterPage)]);
    if (!(await beforePage.locator('.navbar__button').isVisible())) {
        await Promise.all([
            beforePage.setViewportSize({ width: 1024, height: 768 }),
            afterPage.setViewportSize({ width: 1024, height: 768 }),
        ]);
    }
    await beforePage.locator('.navbar__button').click();
    await afterPage.locator('.navbar__button').click();
    await compareScreenshot(beforePage, afterPage, testInfo, 'expanded-menu');
});

for (const route of ['/posts', '/self-work']) {
    test(`visual parity: ${route} modal and carousel`, async ({
        beforePage,
        afterPage,
    }, testInfo) => {
        await Promise.all([beforePage.goto(route), afterPage.goto(route)]);
        await Promise.all([ready(beforePage), ready(afterPage)]);
        const thumbnail =
            route === '/posts' ? 'section__img-138' : 'section__img-1';
        await beforePage.getByTestId(thumbnail).click();
        await afterPage.getByTestId(thumbnail).click();
        await compareScreenshot(beforePage, afterPage, testInfo, 'modal');
        if (route === '/posts') {
            await beforePage.getByTestId('carousel-img-139').click();
            await afterPage.getByTestId('carousel-img-139').click();
            await Promise.all([
                expect(beforePage.getByTestId('modal__img-139')).toBeVisible(),
                expect(afterPage.getByTestId('modal__img-139')).toBeVisible(),
            ]);
            await compareScreenshot(
                beforePage,
                afterPage,
                testInfo,
                'carousel',
            );
        }
        await beforePage
            .getByRole('button', { name: 'Next', exact: true })
            .click();
        await afterPage
            .getByRole('button', { name: 'Next', exact: true })
            .click();
        const nextImage =
            route === '/posts' ? 'modal__img-137' : 'modal__img-2';
        await Promise.all([
            expect(beforePage.getByTestId(nextImage)).toBeVisible(),
            expect(afterPage.getByTestId(nextImage)).toBeVisible(),
        ]);
        await compareScreenshot(beforePage, afterPage, testInfo, 'next-post');
        const hitbox = await afterPage
            .getByRole('button', { name: 'Close', exact: true })
            .boundingBox();
        // Firefox reports 44 CSS pixels as 43.999992 due to float conversion.
        expect(Math.round(hitbox.width * 1000) / 1000).toBeGreaterThanOrEqual(
            44,
        );
        expect(Math.round(hitbox.height * 1000) / 1000).toBeGreaterThanOrEqual(
            44,
        );
    });
}

for (const [route, initialCount] of [
    ['/posts', 6],
    ['/self-work', 4],
]) {
    test(`visual parity: ${route} after scrolling`, async ({
        beforePage,
        afterPage,
    }, testInfo) => {
        for (const page of [beforePage, afterPage]) {
            await page.goto(route);
            await ready(page);
            await page.evaluate(() =>
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'instant',
                }),
            );
            await expect
                .poll(() => page.locator('.section__img').count())
                .toBeGreaterThan(initialCount);
            await page.evaluate(() =>
                window.scrollTo({ top: 0, behavior: 'instant' }),
            );
            await expect(page.locator('.loader')).toHaveCount(0);
        }
        await compareScreenshot(
            beforePage,
            afterPage,
            testInfo,
            'loaded-gallery',
            { fullPage: true },
        );
    });
}

for (const breakpoint of [769, 1024, 1366]) {
    test(`visual parity: responsive boundary ${breakpoint}px`, async ({
        beforePage,
        afterPage,
    }, testInfo) => {
        test.skip(
            testInfo.project.name !== 'chromium-desktop',
            'Boundary sweep supplements the six browser/device projects.',
        );
        test.setTimeout(180_000);
        for (const width of [breakpoint - 1, breakpoint, breakpoint + 1]) {
            await Promise.all([
                beforePage.setViewportSize({ width, height: 900 }),
                afterPage.setViewportSize({ width, height: 900 }),
            ]);
            for (const route of [
                '/',
                '/self-work',
                '/bodywork',
                '/posts',
                '/about',
            ]) {
                await Promise.all([
                    beforePage.goto(route),
                    afterPage.goto(route),
                ]);
                await compareScreenshot(
                    beforePage,
                    afterPage,
                    testInfo,
                    `${width}-${route.slice(1) || 'home'}`,
                    { fullPage: true },
                );
            }
        }
    });
}
