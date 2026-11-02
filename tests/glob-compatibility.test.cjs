const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const { promisify } = require('node:util');

const fromFirebase = createRequire(
    require.resolve('firebase-tools/package.json'),
);
const fromArchiver = createRequire(
    fromFirebase.resolve('archiver/package.json'),
);
const fromSuperstatic = createRequire(
    fromFirebase.resolve('superstatic/package.json'),
);
const fromReaddir = createRequire(
    fromArchiver.resolve('readdir-glob/package.json'),
);
const fromGlob = createRequire(fromFirebase.resolve('glob/package.json'));
const fromEslint = createRequire(require.resolve('eslint/package.json'));

async function fixture(context) {
    const directory = await fs.mkdtemp(
        path.join(os.tmpdir(), 'fyv-glob-compat-'),
    );
    context.after(() => fs.rm(directory, { recursive: true, force: true }));
    const files = {
        'index.html': '<div>home</div>',
        'assets/app.js': 'app',
        'assets/app.js.map': 'map',
        'assets/art.avif': 'art',
        'assets/nested/post.png': 'post',
        'assets/.private': 'private',
        '.hidden': 'hidden',
        'node_modules/private.js': 'dependency',
        'firebase.json': '{}',
        'firebase-debug.log': 'debug',
        '.firebase/cache': 'cache',
    };
    await Promise.all(
        Object.entries(files).map(async ([file, contents]) => {
            const target = path.join(directory, file);
            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.writeFile(target, contents);
        }),
    );
    return directory;
}

test('patched minimatch preserves callable and named APIs through actual CLI consumers', () => {
    for (const consumer of [
        fromFirebase,
        fromSuperstatic,
        fromReaddir,
        fromGlob,
        fromEslint,
    ]) {
        const matcher = consumer('minimatch');
        assert.equal(consumer('minimatch/package.json').version, '11.0.3');
        assert.equal(typeof matcher, 'function');
        assert.equal(matcher.minimatch, matcher);
        assert.equal(matcher('assets/art.avif', '**/*.avif'), true);
        assert.equal(
            new matcher.Minimatch('**/*.png').match('assets/post.png'),
            true,
        );
        assert.equal(matcher.defaults({ dot: true })('.hidden', '*'), true);
        assert.deepEqual(matcher.match(['app.js', 'art.avif'], '*.avif'), [
            'art.avif',
        ]);
        assert.equal(matcher.filter('*.js')('app.js'), true);
        assert.deepEqual(matcher.braceExpand('post-{1,2}.png'), [
            'post-1.png',
            'post-2.png',
        ]);
    }
});

test('Firebase recursive deployment filtering preserves ignored paths', async (context) => {
    const directory = await fixture(context);
    const { readdirRecursive } = fromFirebase('./lib/fsAsync');
    const files = await readdirRecursive({
        path: directory,
        ignoreStrings: [
            'firebase.json',
            '**/.*',
            '**/node_modules/**',
            '**/*.log',
        ],
        ignoreSymlinks: true,
    });
    assert.deepEqual(
        files.map((file) => path.relative(directory, file.name)).sort(),
        [
            'assets/app.js',
            'assets/app.js.map',
            'assets/art.avif',
            'assets/nested/post.png',
            'index.html',
        ],
    );
});

test('Superstatic matches website rewrites and asset patterns with the callable API', () => {
    const { configMatcher } = fromSuperstatic('./lib/utils/patterns');
    for (const route of [
        '/',
        '/self-work',
        '/bodywork',
        '/posts',
        '/about',
        '/posts/nested',
    ]) {
        assert.equal(configMatcher(route, { source: '**' }), true, route);
    }
    assert.equal(
        configMatcher('/assets/art.avif', { source: '**/*.avif' }),
        true,
    );
    assert.equal(
        configMatcher('/assets/app.js', { source: '**/*.avif' }),
        false,
    );
    assert.equal(configMatcher('/.hidden', { source: '**' }), false);
    assert.equal(
        configMatcher('/posts/nested', { source: '/posts{,/**}' }),
        true,
    );
});

test('readdir-glob preserves constructor-based filtering used by archives', async (context) => {
    const directory = await fixture(context);
    const read = promisify(fromArchiver('readdir-glob'));
    const matches = await read(directory, {
        pattern: ['**/*.js', '**/*.html'],
        nodir: true,
        skip: ['node_modules'],
    });
    assert.deepEqual(matches.sort(), ['assets/app.js', 'index.html']);
});

test('glob 14 supports Firebase discovery, archive expansion, and controller loading', async (context) => {
    const directory = await fixture(context);
    assert.equal(fromFirebase('glob/package.json').version, '14.0.3');
    const glob = fromFirebase('glob');
    const options = { cwd: directory, nodir: true };
    const expectedAssets = [
        'assets/app.js',
        'assets/app.js.map',
        'assets/art.avif',
        'assets/nested/post.png',
    ];
    assert.deepEqual(
        (await glob.glob('assets/**/*', options)).sort(),
        expectedAssets,
    );
    assert.deepEqual(
        glob.globSync('assets/**/*', options).sort(),
        expectedAssets,
    );
    const { listFiles } = fromFirebase('./lib/listFiles');
    assert.deepEqual(
        listFiles(directory, [
            '**/.*',
            '**/node_modules/**',
            'firebase.json',
        ]).sort(),
        [...expectedAssets, 'index.html'],
    );
    const archiveFiles = fromArchiver('archiver-utils/file');
    assert.deepEqual(
        archiveFiles.expand(options, ['assets/**/*', '!**/*.map']).sort(),
        ['assets/app.js', 'assets/art.avif', 'assets/nested/post.png'],
    );

    const controllers = path.join(directory, 'controllers');
    await fs.mkdir(path.join(controllers, 'nested'), { recursive: true });
    await fs.writeFile(
        path.join(controllers, 'health.js'),
        'module.exports = { status: "ok" };',
    );
    await fs.writeFile(
        path.join(controllers, 'nested', 'index.js'),
        'module.exports = { status: "nested" };',
    );
    const { loadControllersSync } = fromFirebase(
        'exegesis/lib/controllers/loadControllers',
    );
    const loaded = loadControllersSync(controllers);
    assert.equal(loaded.health.status, 'ok');
    assert.equal(loaded.nested.status, 'nested');
    assert.deepEqual(Object.keys(loaded).sort(), [
        'health',
        'health.js',
        'nested',
        'nested/index',
        'nested/index.js',
    ]);
});

test('native ESM glob and minimatch entries retain named imports', async (context) => {
    const directory = await fixture(context);
    const globDirectory = path.dirname(
        fromFirebase.resolve('glob/package.json'),
    );
    const matcherDirectory = path.dirname(
        fromGlob.resolve('minimatch/package.json'),
    );
    const [glob, matcher] = await Promise.all([
        import(
            pathToFileURL(path.join(globDirectory, 'dist', 'esm', 'index.js'))
        ),
        import(
            pathToFileURL(
                path.join(matcherDirectory, 'dist', 'esm', 'index.js'),
            )
        ),
    ]);
    assert.equal(matcher.minimatch('assets/art.avif', '**/*.avif'), true);
    assert.equal(new matcher.Minimatch('*.js').match('app.js'), true);
    assert.deepEqual(
        (await glob.glob('assets/*.avif', { cwd: directory })).sort(),
        ['assets/art.avif'],
    );
});
