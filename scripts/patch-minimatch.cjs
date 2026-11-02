const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const version = '11.0.3';
const commonJsSha256 =
    '235c5458355f1449cc100f1cea1a43d45f788a4feb524a83497aa146bea88f32';
const esmSha256 =
    'b238ca70371b1f192817ae9516afaacb566d1df2a7a85e47c6c24f41f1707864';
const adapter = Buffer.from(
    '\n// FYV compatibility: restore the legacy callable CommonJS export.\n' +
        'module.exports = Object.assign(exports.minimatch, exports);\n',
);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Firebase and Superstatic call require('minimatch') directly. Version 11 exports
// an object instead. Adapt only that export shape; keep the patched matcher and
// its native ESM entry intact. This is a local compatibility adapter, not an
// upstream-supported combination of Firebase's dependency versions.
function patchInstalledMinimatch(root = path.resolve(__dirname, '..')) {
    const lock = JSON.parse(
        fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'),
    );
    const installations = Object.entries(lock.packages || {}).filter(([name]) =>
        /(?:^|\/)node_modules\/minimatch$/.test(name),
    );
    if (!installations.length)
        throw new Error(
            'The dependency lock has no minimatch installations to verify.',
        );

    const verified = installations.map(([relative, locked]) => {
        const directory = path.resolve(root, relative);
        if (
            path.relative(root, directory).startsWith('..') ||
            !fs.lstatSync(directory).isDirectory()
        ) {
            throw new Error(
                `Unexpected minimatch installation path: ${relative}`,
            );
        }
        const metadata = JSON.parse(
            fs.readFileSync(path.join(directory, 'package.json'), 'utf8'),
        );
        if (
            locked.version !== version ||
            metadata.name !== 'minimatch' ||
            metadata.version !== version
        ) {
            throw new Error(
                `Expected minimatch ${version} at ${relative}; refusing to patch another version.`,
            );
        }
        const entry = path.join(directory, 'dist', 'commonjs', 'index.js');
        const esmEntry = path.join(directory, 'dist', 'esm', 'index.js');
        if (!fs.lstatSync(entry).isFile() || !fs.lstatSync(esmEntry).isFile()) {
            throw new Error(`Unexpected minimatch entry type at ${relative}.`);
        }
        if (sha256(fs.readFileSync(esmEntry)) !== esmSha256) {
            throw new Error(
                `The minimatch ESM entry has changed at ${relative}; no files were patched.`,
            );
        }
        const bytes = fs.readFileSync(entry);
        if (sha256(bytes) === commonJsSha256) {
            return {
                entry,
                bytes: Buffer.concat([bytes, adapter]),
                needsPatch: true,
            };
        }
        const original = bytes.subarray(
            0,
            Math.max(0, bytes.length - adapter.length),
        );
        if (
            bytes.subarray(original.length).equals(adapter) &&
            sha256(original) === commonJsSha256
        ) {
            return { entry, bytes, needsPatch: false };
        }
        throw new Error(
            `Unexpected minimatch CommonJS bytes at ${relative}; no files were patched.`,
        );
    });

    // Verify every installed copy before writing any. A changed package version
    // or source hash must fail installation without leaving a partial adapter.
    for (const installation of verified) {
        if (installation.needsPatch)
            fs.writeFileSync(installation.entry, installation.bytes);
    }
    const patched = verified.filter(
        (installation) => installation.needsPatch,
    ).length;
    console.log(
        `Verified minimatch ${version}: adapted ${patched} CommonJS exports; ${verified.length - patched} already adapted. ESM unchanged.`,
    );
}

module.exports = { patchInstalledMinimatch };

if (require.main === module) {
    try {
        patchInstalledMinimatch();
    } catch (error) {
        console.error(`Minimatch compatibility setup failed: ${error.message}`);
        process.exitCode = 1;
    }
}
