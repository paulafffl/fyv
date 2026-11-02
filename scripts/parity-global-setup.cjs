const { createHash } = require('node:crypto');
const { mkdir, readFile, readdir, rm, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const parityDirectory = path.join(root, '.parity');
const baselineDirectory = path.join(parityDirectory, 'baseline');
const afterDirectory = path.join(root, 'build');
const framesDirectory = path.join(parityDirectory, 'animation-frames');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const staticAssetExtension =
    /\.(?:png|avif|gif|jpe?g|svg|ico|ttf|otf|woff2?)$/i;
const closeNormalization =
    '.modal__close button { min-width: 0 !important; min-height: 0 !important; line-height: 0 !important; }';

async function artifactFiles(directory, prefix = '') {
    const files = [];
    const entries = await readdir(path.join(directory, prefix), {
        withFileTypes: true,
    });
    for (const entry of entries.sort((left, right) =>
        left.name.localeCompare(right.name),
    )) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory())
            files.push(...(await artifactFiles(directory, relative)));
        else if (entry.isFile()) {
            const bytes = await readFile(path.join(directory, relative));
            files.push({
                path: relative,
                bytes: bytes.length,
                sha256: sha256(bytes),
            });
        } else
            throw new Error(
                `Unexpected non-file production artifact: ${relative}`,
            );
    }
    return files;
}

function decodeStringEscapes(value) {
    return value.replace(
        /\\(?:u\{[a-f\d]+\}|u[a-f\d]{4}|x[a-f\d]{2}|\r?\n|[\s\S])/gi,
        (escaped) => {
            if (/^\\u\{/.test(escaped))
                return String.fromCodePoint(parseInt(escaped.slice(3, -1), 16));
            if (/^\\[ux]/.test(escaped))
                return String.fromCharCode(parseInt(escaped.slice(2), 16));
            if (/^\\\r?\n$/.test(escaped)) return '';
            return (
                {
                    n: '\n',
                    r: '\r',
                    t: '\t',
                    b: '\b',
                    f: '\f',
                    v: '\v',
                    0: '\0',
                }[escaped[1]] ?? escaped[1]
            );
        },
    );
}

function decodePercentBytes(value) {
    const parts = [];
    let offset = 0;
    for (const match of value.matchAll(/%([a-f\d]{2})/gi)) {
        parts.push(Buffer.from(value.slice(offset, match.index), 'utf8'));
        parts.push(Buffer.from([parseInt(match[1], 16)]));
        offset = match.index + match[0].length;
    }
    parts.push(Buffer.from(value.slice(offset), 'utf8'));
    return Buffer.concat(parts);
}

async function inlineAssets(directory, artifacts) {
    const assets = [];
    for (const artifact of artifacts.filter((file) =>
        /\.(?:js|css|html)$/i.test(file.path),
    )) {
        const text = await readFile(
            path.join(directory, artifact.path),
            'utf8',
        );
        const literals = [
            ...text.matchAll(
                /([`"'])(data:(?:image|font)\/(?:(?:\\[\s\S])|(?!\1)[^\\])*)\1/g,
            ),
            ...text.matchAll(/url\((data:(?:image|font)\/[^)]*)\)/g),
        ];
        for (const match of literals.sort(
            (left, right) => left.index - right.index,
        )) {
            const uri = decodeStringEscapes(match[2] || match[1]).trim();
            const comma = uri.indexOf(',');
            if (comma < 0)
                throw new Error(
                    `Malformed inline asset in ${artifact.path} at ${match.index}`,
                );
            const header = uri.slice(5, comma);
            const payload = decodePercentBytes(uri.slice(comma + 1));
            const bytes = /;base64$/i.test(header)
                ? Buffer.from(payload.toString('ascii'), 'base64')
                : payload;
            assets.push({
                path: `${artifact.path}#inline:${match.index}`,
                containerPath: artifact.path,
                inline: true,
                mediaType: header.split(';')[0],
                bytes: bytes.length,
                sha256: sha256(bytes),
                sourceBytes: bytes,
            });
        }
    }
    return assets;
}

// Both builds replay the same decoded first frame. Original GIF byte equality is
// checked first, so stabilizing animation cannot conceal changed source artwork.
module.exports = async function parityGlobalSetup() {
    let provenance;
    try {
        provenance = JSON.parse(
            await readFile(
                path.join(parityDirectory, 'baseline-provenance.json'),
                'utf8',
            ),
        );
    } catch (error) {
        throw new Error(
            'Parity requires a verified original build. Run npm run test:parity:prepare first.',
            { cause: error },
        );
    }
    if (
        provenance.schemaVersion !== 1 ||
        provenance.kind !== 'fresh-original-production-build' ||
        !/^[a-f0-9]{40}$/.test(provenance.commit || '') ||
        path.resolve(root, provenance.buildDirectory || '') !==
            baselineDirectory ||
        !Array.isArray(provenance.artifacts)
    ) {
        throw new Error(
            'Invalid original-build provenance; regenerate the parity baseline.',
        );
    }

    if (
        sha256(JSON.stringify(provenance.artifacts)) !==
        provenance.artifactsSha256
    ) {
        throw new Error(
            'Original artifact manifest hash does not match build provenance.',
        );
    }
    const [baselineArtifacts, afterArtifacts] = await Promise.all([
        artifactFiles(baselineDirectory),
        artifactFiles(afterDirectory),
    ]);
    const recorded = new Map(
        provenance.artifacts.map((artifact) => [artifact.path, artifact]),
    );
    if (
        recorded.size !== provenance.artifacts.length ||
        recorded.size !== baselineArtifacts.length
    ) {
        throw new Error(
            'Original production artifact file set does not match build provenance.',
        );
    }
    for (const file of baselineArtifacts) {
        const expected = recorded.get(file.path);
        if (expected?.sha256 !== file.sha256 || expected.bytes !== file.bytes) {
            throw new Error(
                `Original artifact does not match build provenance: ${file.path}`,
            );
        }
    }

    const [beforeInlineAssets, afterInlineAssets] = await Promise.all([
        inlineAssets(baselineDirectory, baselineArtifacts),
        inlineAssets(afterDirectory, afterArtifacts),
    ]);
    const assets = {};
    for (const [build, files] of [
        [
            'before',
            [
                ...baselineArtifacts.filter((file) =>
                    staticAssetExtension.test(file.path),
                ),
                ...beforeInlineAssets,
            ],
        ],
        [
            'after',
            [
                ...afterArtifacts.filter((file) =>
                    staticAssetExtension.test(file.path),
                ),
                ...afterInlineAssets,
            ],
        ],
    ]) {
        for (const file of files) {
            assets[file.sha256] ||= {
                bytes: file.bytes,
                before: [],
                after: [],
            };
            assets[file.sha256][build].push(file.path);
        }
    }
    const byteUnmatchedAssets = Object.fromEntries(
        Object.entries(assets).filter(
            ([, asset]) => !asset.before.length || !asset.after.length,
        ),
    );
    const unmatchedAssets = { ...byteUnmatchedAssets };
    const packagingTransforms = [];
    // Vite's inline SVG encoder changes quotes and removes whitespace between
    // tags. Accept precisely that byte transformation, never arbitrary SVG edits.
    for (const [originalSha256, asset] of Object.entries(byteUnmatchedAssets)) {
        if (!asset.before.length || asset.after.length) continue;
        const originalFile = asset.before.find((file) => /\.svg$/i.test(file));
        const originalInline = beforeInlineAssets.find(
            (file) =>
                file.sha256 === originalSha256 &&
                file.mediaType === 'image/svg+xml',
        );
        if (!originalFile && !originalInline) continue;
        const original =
            originalInline?.sourceBytes ||
            (await readFile(path.join(baselineDirectory, originalFile)));
        const transformed = Buffer.from(
            original
                .toString('utf8')
                .trim()
                .replace(/>\s+</g, '><')
                .replaceAll('"', "'"),
            'utf8',
        );
        const transformedSha256 = sha256(transformed);
        const migrated = afterInlineAssets.find(
            (file) =>
                file.mediaType === 'image/svg+xml' &&
                file.sha256 === transformedSha256 &&
                file.sourceBytes.equals(transformed),
        );
        if (!migrated || !byteUnmatchedAssets[transformedSha256]?.after.length)
            continue;
        packagingTransforms.push({
            name: 'vite-inline-svg-quotes-and-inter-tag-whitespace',
            exactTransform: `original.trim().replace(/>\\s+</g, '><').replaceAll('"', "'")`,
            originalSha256,
            transformedSha256,
            before: asset.before,
            after: byteUnmatchedAssets[transformedSha256].after,
        });
        delete unmatchedAssets[originalSha256];
        delete unmatchedAssets[transformedSha256];
    }
    const inlineMetadata = (files) =>
        files.map(({ sourceBytes, ...metadata }) => {
            // Raw bytes are used for equality above, while reports retain hashes.
            void sourceBytes;
            return metadata;
        });
    const assetComparison = {
        schemaVersion: 1,
        baselineCommit: provenance.commit,
        extensions: [
            'png',
            'avif',
            'gif',
            'jpg',
            'jpeg',
            'svg',
            'ico',
            'ttf',
            'otf',
            'woff',
            'woff2',
        ],
        comparison: 'SHA-256 byte hash sets, independent of output filenames',
        inlineAssets: {
            before: inlineMetadata(beforeInlineAssets),
            after: inlineMetadata(afterInlineAssets),
        },
        byteHashSetsMatch: Object.keys(byteUnmatchedAssets).length === 0,
        packagingTransforms,
        matched: Object.keys(unmatchedAssets).length === 0,
        unmatched: unmatchedAssets,
        assets,
    };
    await writeFile(
        path.join(parityDirectory, 'asset-comparison.json'),
        `${JSON.stringify(assetComparison, null, 2)}\n`,
    );
    const comparisonProvenance = {
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        baseline: {
            commit: provenance.commit,
            tree: provenance.tree,
            packageLockSha256: provenance.packageLockSha256,
            node: provenance.node,
            npm: provenance.npm,
            artifacts: {
                count: baselineArtifacts.length,
                sha256: provenance.artifactsSha256,
                allFilesVerified: true,
            },
        },
        after: {
            node: process.version,
            packageLockSha256: sha256(
                await readFile(path.join(root, 'package-lock.json')),
            ),
            artifacts: {
                count: afterArtifacts.length,
                sha256: sha256(JSON.stringify(afterArtifacts)),
            },
        },
        staticAssetSetsMatch: assetComparison.byteHashSetsMatch,
        staticAssetsVerified: assetComparison.matched,
        fonts: {
            strategy:
                'Cache original font HTTP responses and replay identical bytes to both builds',
            required:
                'Each screenshot waits for real font faces to load; font response manifest is recorded by test fixtures',
            directory: '.parity/fonts',
        },
        allowedNormalizations: {
            closeButtonCss: closeNormalization,
            animatedImages:
                'Identical GIF source bytes decoded to the same first-frame PNG in both builds',
            cssAnimations:
                'Disabled; WebKit infinite animations are paused at time zero before capture to avoid compositor invalidation',
            caret: 'hide',
            screenshotScale: 'css',
            pointerPosition: { x: 0, y: 0 },
            masks: [],
            pixelTolerance: 0,
            staticAssetPackaging: packagingTransforms,
            firefoxColumns:
                'After raw captures, recalculate bodywork columns with column-count:1 and restore their exact original inline styles (Firefox font-load balancing cache)',
            webkitModalLayout:
                'After raw captures and Close normalization, recalculate modal flex layout and restore its exact original inline styles (WebKit scrollbar cache)',
            webkitFullPagePainting:
                'Foreground each page, paint two full-page scroll sweeps, restore scroll position, then capture immediately. Scroll handlers are suppressed only during capture sweeps; unchanged page height and gallery count are required.',
            webkitFullPageComparison:
                'Native full-page captures are raw overviews only. Exact comparisons use every overlapping viewport tile; overlap exceeds the fixed navbar height. Original page geometry and gallery counts must match; scroll handlers/positions are restored after capture.',
        },
    };
    await writeFile(
        path.join(parityDirectory, 'comparison-provenance.json'),
        `${JSON.stringify(comparisonProvenance, null, 2)}\n`,
    );
    if (!assetComparison.matched) {
        throw new Error(
            `Static asset bytes differ between production builds. No files were ignored. See .parity/asset-comparison.json: ${JSON.stringify(unmatchedAssets)}`,
        );
    }

    const baseline = baselineArtifacts.filter((file) =>
        /\.gif$/i.test(file.path),
    );
    const after = afterArtifacts.filter((file) => /\.gif$/i.test(file.path));
    if (!baseline.length || !after.length) {
        throw new Error(
            'Both production builds must contain the original animated GIFs.',
        );
    }

    const frames = {};
    for (const [build, files] of [
        ['baseline', baseline],
        ['after', after],
    ]) {
        for (const file of files) {
            frames[file.sha256] ||= {
                file: `${file.sha256}.png`,
                baseline: [],
                after: [],
            };
            frames[file.sha256][build].push(file.path);
        }
    }
    const unmatched = Object.entries(frames).filter(
        ([, frame]) => !frame.baseline.length || !frame.after.length,
    );
    if (unmatched.length) {
        throw new Error(
            `Animation bytes changed between builds: ${JSON.stringify(
                Object.fromEntries(unmatched),
            )}`,
        );
    }

    await mkdir(framesDirectory, { recursive: true });
    // A previous run's manifest must never make incomplete output look valid.
    await rm(path.join(framesDirectory, 'manifest.json'), { force: true });
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage();
        await page.route('**/*', (route) =>
            route.fulfill({
                contentType: 'text/html',
                body: '<!doctype html><title>GIF frame decoder</title>',
            }),
        );
        // WebCodecs requires a secure context. This request is fulfilled locally.
        await page.goto('https://parity-decoder.invalid/');
        const supported = await page.evaluate(
            async () =>
                typeof ImageDecoder !== 'undefined' &&
                typeof OffscreenCanvas !== 'undefined' &&
                (await ImageDecoder.isTypeSupported('image/gif')),
        );
        if (!supported) {
            throw new Error(
                'Parity GIF stabilization requires Chromium WebCodecs ImageDecoder and OffscreenCanvas. Install the Playwright Chromium browser; GIFs will not be skipped or masked.',
            );
        }

        for (const file of baseline) {
            const frame = frames[file.sha256];
            if (frame.pngSha256) continue;
            const decoded = await page.evaluate(
                async (base64) => {
                    const data = Uint8Array.from(atob(base64), (character) =>
                        character.charCodeAt(0),
                    );
                    const decoder = new ImageDecoder({
                        data,
                        type: 'image/gif',
                        preferAnimation: true,
                    });
                    let image;
                    try {
                        await decoder.tracks.ready;
                        ({ image } = await decoder.decode({
                            frameIndex: 0,
                            completeFramesOnly: true,
                        }));
                        const width = image.displayWidth;
                        const height = image.displayHeight;
                        const canvas = new OffscreenCanvas(width, height);
                        const context = canvas.getContext('2d');
                        if (!context)
                            throw new Error(
                                'Could not create the GIF frame canvas.',
                            );
                        context.drawImage(image, 0, 0);
                        const blob = await canvas.convertToBlob({
                            type: 'image/png',
                        });
                        const png = new Uint8Array(await blob.arrayBuffer());
                        let binary = '';
                        for (
                            let offset = 0;
                            offset < png.length;
                            offset += 32768
                        ) {
                            binary += String.fromCharCode(
                                ...png.subarray(offset, offset + 32768),
                            );
                        }
                        return { width, height, png: btoa(binary) };
                    } finally {
                        image?.close();
                        decoder.close();
                    }
                },
                (
                    await readFile(path.join(baselineDirectory, file.path))
                ).toString('base64'),
            );
            const png = Buffer.from(decoded.png, 'base64');
            await writeFile(path.join(framesDirectory, frame.file), png);
            Object.assign(frame, {
                width: decoded.width,
                height: decoded.height,
                pngSha256: sha256(png),
            });
        }
    } finally {
        await browser.close();
    }
    await writeFile(
        path.join(framesDirectory, 'manifest.json'),
        `${JSON.stringify(
            {
                schemaVersion: 1,
                baselineCommit: provenance.commit,
                frameIndex: 0,
                frames,
            },
            null,
            2,
        )}\n`,
    );
    console.log(
        `Prepared ${Object.keys(frames).length} identical GIF first frames for both builds.`,
    );
};
