const { test, expect, ready } = require('./fixtures.cjs');

async function loadedImages(page, selector) {
    await expect
        .poll(() =>
            page
                .locator(selector)
                .evaluateAll(
                    (images) =>
                        images.length > 0 &&
                        images.every(
                            (image) => image.complete && image.naturalWidth > 0,
                        ),
                ),
        )
        .toBe(true);
}

async function bitmapState(page, selector) {
    await loadedImages(page, selector);
    return page.locator(selector).evaluateAll((images) =>
        Promise.all(
            images.map(async (image) => {
                const response = await fetch(image.currentSrc || image.src);
                if (!response.ok)
                    throw new Error(
                        `Image fetch failed: ${response.status} ${image.src}`,
                    );
                const digest = await crypto.subtle.digest(
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
                    sha256: [...new Uint8Array(digest)]
                        .map((byte) => byte.toString(16).padStart(2, '0'))
                        .join(''),
                };
            }),
        ),
    );
}

async function nextFrame(page) {
    await page.evaluate(
        () =>
            new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
    );
}

async function loadGallery(page, path, batchSize, total) {
    await page.goto(path);
    await ready(page);
    await expect(page.locator('.section__img')).toHaveCount(batchSize);
    for (let count = batchSize; count < total; count += batchSize) {
        // Start each completed load at the top. No overlapping timers or rapid
        // scroll events are needed to exercise every item in the archive.
        await page.evaluate(() =>
            window.scrollTo({ top: 0, behavior: 'instant' }),
        );
        await nextFrame(page);
        await page.evaluate(() =>
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'instant',
            }),
        );
        await expect(page.locator('.section__img')).toHaveCount(
            Math.min(count + batchSize, total),
        );
        await expect(page.locator('.loader-container')).toHaveCount(0);
        await loadedImages(page, '.section__img');
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await nextFrame(page);
    return bitmapState(page, '.section__img');
}

async function modalState(page) {
    await expect(page.locator('.modal__box')).toBeVisible();
    const [image] = await bitmapState(page, '.modal__img img');
    const content = await page.locator('.modal').evaluate((modal) => {
        const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();
        return {
            text: normalize(modal.querySelector('.modal__text').textContent),
            headings: [...modal.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
                (heading) => ({
                    level: heading.tagName,
                    text: normalize(heading.textContent),
                }),
            ),
            links: [...modal.querySelectorAll('a')].map((link) => {
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
            previous: !!modal.querySelector('[data-cy="Previous"]'),
            next: !!modal.querySelector('[data-cy="Next"]'),
            carousel: [...modal.querySelectorAll('.modal__carousel')].map(
                (control) => ({
                    id: control.getAttribute('data-cy'),
                    selected: control.classList.contains(
                        'modal__carousel--selected',
                    ),
                }),
            ),
        };
    });
    return { ...content, image };
}

test('before/after: every archive thumbnail, modal and carousel image', async ({
    beforePage,
    afterPage,
}, testInfo) => {
    test.skip(
        testInfo.project.name !== 'chromium-desktop',
        'Exhaustive content comparison runs once; visual/browser parity runs on every project.',
    );
    test.setTimeout(300_000);
    const pages = [beforePage, afterPage];
    for (const [path, batchSize, total] of [
        // The additional opening post in the source is commented out.
        ['/posts', 6, 38],
        ['/self-work', 4, 25],
    ]) {
        const [beforeThumbnails, afterThumbnails] = await Promise.all(
            pages.map((page) => loadGallery(page, path, batchSize, total)),
        );
        expect(
            afterThumbnails,
            `${path}: every thumbnail in archive order`,
        ).toEqual(beforeThumbnails);
        expect(afterThumbnails).toHaveLength(total);
        await Promise.all(
            pages.map((page) =>
                page.getByTestId(beforeThumbnails[0].id).click(),
            ),
        );
        for (let index = 0; index < total; index += 1) {
            await test.step(`${path}: entry ${index + 1}/${total}`, async () => {
                const imageId = beforeThumbnails[index].id.replace(
                    'section__img-',
                    'modal__img-',
                );
                await Promise.all(
                    pages.map((page) =>
                        expect(page.getByTestId(imageId)).toBeVisible(),
                    ),
                );
                const [before, after] = await Promise.all(
                    pages.map(modalState),
                );
                expect(
                    after,
                    `${path}: modal ${index + 1} content and initial bitmap`,
                ).toEqual(before);
                expect(after.image.id).toBe(imageId);
                expect(after.previous).toBe(index > 0);
                expect(after.next).toBe(index < total - 1);
                for (const control of before.carousel.filter(
                    (item) => !item.selected,
                )) {
                    const selectedImage = control.id.replace(
                        'carousel-img-',
                        'modal__img-',
                    );
                    await Promise.all(
                        pages.map(async (page) => {
                            await page.getByTestId(control.id).click();
                            await expect(
                                page.getByTestId(selectedImage),
                            ).toBeVisible();
                        }),
                    );
                    const [beforeCarousel, afterCarousel] = await Promise.all(
                        pages.map(modalState),
                    );
                    expect(
                        afterCarousel,
                        `${path}: modal ${index + 1}, ${control.id}`,
                    ).toEqual(beforeCarousel);
                    expect(
                        afterCarousel.carousel.filter((item) => item.selected),
                    ).toEqual([{ id: control.id, selected: true }]);
                }
                if (index < total - 1) {
                    await Promise.all(
                        pages.map((page) => page.getByTestId('Next').click()),
                    );
                }
            });
        }
        await Promise.all(
            pages.map((page) =>
                expect(page.getByTestId('Next')).toHaveCount(0),
            ),
        );
        // The original Close button needs an event because its target has zero height.
        await beforePage.getByTestId('Close').dispatchEvent('click');
        await afterPage.getByTestId('Close').click();
        await Promise.all(
            pages.map((page) => expect(page.locator('.modal')).toHaveCount(0)),
        );
    }
});
