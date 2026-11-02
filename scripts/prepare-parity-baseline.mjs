#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import {
    cp,
    mkdir,
    readFile,
    readdir,
    rename,
    rm,
    writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

// Rebuild the committed CRA application, independently of the working tree/index.
// Dependency install scripts stay disabled, including Cypress's binary download.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.includes('--help')) {
    console.log(
        'Usage: node scripts/prepare-parity-baseline.mjs [--ref <git-revision>] [--legacy-peer-deps]',
    );
    console.log(
        'Default revision: 3bc4005. Outputs .parity/baseline and .parity/baseline-provenance.json.',
    );
    process.exit(0);
}

let revision = '3bc4005';
let legacyPeerDeps = false;
for (let index = 0; index < args.length; index += 1) {
    if (
        args[index] === '--ref' &&
        args[index + 1] &&
        !args[index + 1].startsWith('-')
    ) {
        revision = args[++index];
    } else if (args[index] === '--legacy-peer-deps') {
        legacyPeerDeps = true;
    } else {
        throw new Error(`Unknown or incomplete argument: ${args[index]}`);
    }
}

function git(...gitArgs) {
    return execFileSync('git', ['-C', root, ...gitArgs], {
        encoding: 'utf8',
    }).trim();
}

const commit = git('rev-parse', '--verify', `${revision}^{commit}`);
const tree = git('rev-parse', '--verify', `${commit}^{tree}`);
const parityRoot = path.join(root, '.parity');
const source = path.join(parityRoot, 'source', commit);
const baseline = path.join(parityRoot, 'baseline');
const staging = path.join(parityRoot, 'baseline.next');
const provenancePath = path.join(parityRoot, 'baseline-provenance.json');
const archive = path.join(parityRoot, `source-${commit}.tar`);
const logs = path.join(parityRoot, 'logs');
const startedAt = new Date().toISOString();
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Keep build-affecting variables from a developer shell out of the reference.
const env = { ...process.env };
for (const key of Object.keys(env)) {
    if (
        key.startsWith('REACT_APP_') ||
        [
            'PUBLIC_URL',
            'BUILD_PATH',
            'NODE_ENV',
            'GENERATE_SOURCEMAP',
            'INLINE_RUNTIME_CHUNK',
            'IMAGE_INLINE_SIZE_LIMIT',
            'DISABLE_ESLINT_PLUGIN',
            'SKIP_PREFLIGHT_CHECK',
            'TSC_COMPILE_ON_ERROR',
            'WDS_SOCKET_HOST',
            'WDS_SOCKET_PATH',
            'WDS_SOCKET_PORT',
            'NODE_OPTIONS',
        ].includes(key)
    )
        delete env[key];
}
Object.assign(env, {
    CI: 'false',
    CYPRESS_INSTALL_BINARY: '0',
    npm_config_ignore_scripts: 'true',
    npm_config_engine_strict: 'false',
});

async function run(
    command,
    commandArgs,
    logName,
    cwd = source,
    commandEnv = env,
) {
    const logPath = path.join(logs, logName);
    console.log(
        `Running ${command} ${commandArgs.join(' ')} (log: ${path.relative(root, logPath)})`,
    );
    const output = createWriteStream(logPath);
    const child = spawn(command, commandArgs, {
        cwd,
        env: commandEnv,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout = pipeline(child.stdout, output, { end: false });
    child.stderr.on('data', (chunk) => output.write(chunk));
    let exitCode;
    try {
        exitCode = await new Promise((resolve, reject) => {
            child.once('error', reject);
            child.once('close', resolve);
        });
        await stdout;
    } finally {
        await new Promise((resolve) => output.end(resolve));
    }
    if (exitCode !== 0) {
        const log = await readFile(logPath, 'utf8');
        console.error(log.slice(-12000));
        throw new Error(`${command} exited with ${exitCode}. See ${logPath}.`);
    }
    return {
        command: [command, ...commandArgs],
        log: path.relative(root, logPath),
    };
}

async function fingerprint(directory, prefix = '') {
    const files = [];
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) =>
        left.name.localeCompare(right.name),
    )) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory())
            files.push(...(await fingerprint(absolute, relative)));
        else if (entry.isFile()) {
            const bytes = await readFile(absolute);
            files.push({
                path: relative,
                bytes: bytes.length,
                sha256: sha256(bytes),
            });
        } else throw new Error(`Unexpected non-file build entry: ${absolute}`);
    }
    return files;
}

await mkdir(logs, { recursive: true });
await mkdir(path.dirname(source), { recursive: true });
await rm(source, { recursive: true, force: true });
await mkdir(source, { recursive: true });
console.log(
    `Preparing original commit ${commit} in ${path.relative(root, source)}.`,
);

try {
    await run(
        'git',
        ['-C', root, 'archive', '--format=tar', `--output=${archive}`, commit],
        'baseline-archive.log',
        root,
    );
    await run(
        'tar',
        ['--extract', `--file=${archive}`, `--directory=${source}`],
        'baseline-extract.log',
        root,
    );
} finally {
    await rm(archive, { force: true });
}

const packageBytes = await readFile(path.join(source, 'package.json'));
const lockBytes = await readFile(path.join(source, 'package-lock.json'));
const packageJson = JSON.parse(packageBytes);
const lock = JSON.parse(lockBytes);
if (
    packageJson.dependencies?.['react-scripts'] !== '5.0.1' ||
    packageJson.scripts?.build !== 'react-scripts build'
) {
    throw new Error(
        'Selected revision is not the expected original react-scripts@5.0.1 application.',
    );
}
const npmVersion = execFileSync('npm', ['--version'], {
    cwd: source,
    env,
    encoding: 'utf8',
}).trim();
const installArgs = ['ci', '--ignore-scripts', '--no-audit', '--no-fund'];
if (legacyPeerDeps) installArgs.push('--legacy-peer-deps');
const install = await run('npm', installArgs, 'baseline-install.log');
if (
    sha256(await readFile(path.join(source, 'package-lock.json'))) !==
    sha256(lockBytes)
) {
    throw new Error(
        'The committed dependency lock changed during installation.',
    );
}

const lockedPackages = {};
for (const name of [
    'react',
    'react-dom',
    'react-router-dom',
    'react-scripts',
    'sass',
]) {
    const expected = lock.packages?.[`node_modules/${name}`]?.version;
    const actual = JSON.parse(
        await readFile(path.join(source, 'node_modules', name, 'package.json')),
    ).version;
    if (!expected || actual !== expected)
        throw new Error(
            `${name} installed ${actual}; lock requires ${expected}.`,
        );
    lockedPackages[name] = actual;
}

// npm run still invokes the explicit build script when install hooks are disabled.
const build = await run('npm', ['run', 'build'], 'baseline-build.log');
if (
    sha256(await readFile(path.join(source, 'package-lock.json'))) !==
        sha256(lockBytes) ||
    sha256(await readFile(path.join(source, 'package.json'))) !==
        sha256(packageBytes)
) {
    throw new Error('Original package files changed during the build.');
}
await rm(staging, { recursive: true, force: true });
await cp(path.join(source, 'build'), staging, { recursive: true });
const artifacts = await fingerprint(staging);
if (!artifacts.some((file) => file.path === 'index.html'))
    throw new Error('Original build has no index.html.');

const provenance = {
    schemaVersion: 1,
    kind: 'fresh-original-production-build',
    requestedRevision: revision,
    commit,
    tree,
    sourceMethod: 'git archive (no working-tree or index files)',
    packageJsonSha256: sha256(packageBytes),
    packageLockSha256: sha256(lockBytes),
    node: process.version,
    npm: npmVersion,
    platform: process.platform,
    architecture: process.arch,
    lockedPackages,
    install,
    build,
    environment: {
        CI: 'false',
        CYPRESS_INSTALL_BINARY: '0',
        npm_config_ignore_scripts: 'true',
        npm_config_engine_strict: 'false',
    },
    legacyPeerDeps,
    sourceDirectory: path.relative(root, source),
    buildDirectory: path.relative(root, baseline),
    startedAt,
    finishedAt: new Date().toISOString(),
    artifactsSha256: sha256(JSON.stringify(artifacts)),
    artifacts,
};
await rm(baseline, { recursive: true, force: true });
await rename(staging, baseline);
await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(
    `Original production build ready: ${path.relative(root, baseline)} (${artifacts.length} files).`,
);
console.log(`Provenance: ${path.relative(root, provenancePath)}`);
