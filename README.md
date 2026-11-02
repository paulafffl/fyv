# Free Your Vulva

A React single-page website, built with Vite and deployed to Firebase Hosting.

## Local development

Use the Node version in `.nvmrc` (Node 24 LTS) and npm 11:

```sh
nvm install
nvm use
npm ci
npm start
```

The development server uses http://127.0.0.1:3000. If that port is occupied,
run `npm start -- --port 3001 --strictPort`.

```sh
npm run lint
npm run test:cli
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
npm audit --audit-level=low
```

Production files are written to `build/`, matching `firebase.json`. The root
`index.html` contains the entry point and site metadata. Files containing JSX
use `.jsx`; gallery images are mapped through Vite in `src/galleryImages.js`.
The production build includes modern and SystemJS legacy bundles. Explicit
engine targets and CSS prefixes in `browser-targets.mjs` preserve the original
CRA build's historical compilation coverage. This is not a claim that every
historical browser runs React or the site's existing CSS correctly; automated
browser checks use the current Playwright engines.

## End-to-end tests

Install the browser once after `npm ci`, and again after Playwright upgrades:

```sh
npx playwright install --with-deps chromium
npm test
```

`npm test` and `npm run test:e2e` run desktop Chromium and an emulated Android
viewport. Playwright builds the app and starts the production preview on port
4173 automatically. Set `CI=1` to require a fresh server rather than reusing a
running preview. Use a free port 4173 for a production-build check.

```sh
npm run test:e2e:ui
npm run test:e2e:report
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e:all
```

The full suite also runs Firefox, WebKit and emulated iPhone/WebKit. Device
profiles are emulation, not tests on physical phones. To test an already-running
local server instead of starting a build/preview:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

Coverage includes all routes and refreshed deep links, desktop/mobile navigation,
post and self-work galleries, modal opening/closing and post navigation, the
within-post image carousel, infinite scrolling, local asset loading, and
contact/social link destinations. Tests do not visit external sites and block
remote fonts. Reports, screenshots and failure traces are saved in
`playwright-report/` and `test-results/` (both ignored by Git).

Navigation always starts at the top, including Back/Forward, entries with the
same pathname, and returning to a cached page. Browser scroll restoration is
disabled while the app is mounted, and route resets bypass smooth scrolling.

Cypress and the unused CRA/Jest scaffolding have been removed. `npm test` now
runs real browser tests rather than the old empty unit-test runner.

## Before/after migration comparison

The separate parity suite compares the original CRA production build from commit
`3bc40055d03f9e01209c12783de989ec540449ef` with a fresh production build of the
current working tree. It leaves the Git index and working source files alone.

```sh
npm run test:parity:prepare
npx playwright install --with-deps chromium firefox webkit
npm run test:parity:all
npm run test:parity:report
```

Preparation exports the original commit into ignored `.parity/source/`, installs
its committed lockfile with install hooks disabled, and rebuilds it. Historical
dependencies remain isolated there; they are not installed in the current app.
The helper records the commit, dependency versions and every output file's hash
in `.parity/baseline-provenance.json`. Later runs verify all original artifacts.
Preparation requires access to that Git commit and the npm registry. Both local
ports 4311 and 4312 must be free. `npm run test:parity` runs only the three
Chromium viewport projects; `test:parity:all` adds Firefox and desktop/mobile WebKit.
The manual **Before and after comparison** GitHub Actions workflow runs the full
comparison.

The suite compares all five routes, refreshed deep links, navigation/history,
gallery content, modal/carousel controls and completed pagination loads. A desktop
traversal checks all 38 posts, 25 self-work entries and 144 modal image references.
A separate desktop check forces the emitted legacy bundle to run. The suite
captures full pages, open menus, modals, carousel selections and loaded galleries
at desktop, compact and phone sizes, plus all routes immediately below, at and
above each CSS breakpoint (769, 1024 and 1366 pixels). Screenshots require exact
equality within the same browser, with zero differing pixels. Each run captures
its baseline from the original app; updating snapshots cannot accept the new app
as the reference.

Unlike the regular functional suite, this comparison loads the real Google
fonts, caches verified responses and replays identical bytes to both builds. A
missing font fails the run. Image/font assets must match by content, including
assets inlined into bundles. The only permitted SVG packaging transformation is
exact removal of inter-tag whitespace and replacement of attribute double quotes
with single quotes; both hashes are recorded. Identical GIF sources are rendered
as the same decoded first frame to make captures deterministic. CSS animations
are disabled, the caret is hidden and the clock is fixed. Firefox can retain
different column balancing even between visits to the original build. After raw
captures, its bodywork columns are recalculated and their exact styles restored.
WebKit's modal flex layout is likewise recalculated after Close normalization,
with every original style restored. These steps do not retain layout overrides.
WebKit full-page captures also paint every viewport twice while that page is in
the foreground. Scroll handlers are suppressed only during these capture sweeps,
then restored along with the original scroll position; unchanged gallery counts
and page height are required. Its infinite animations are paused at time zero
before painting. Pagination behavior is compared separately with normal events.
Because native WebKit full-page screenshots can still omit off-screen images,
their raw captures serve as overviews. Its strict comparisons instead capture
every visible viewport, with overlap exceeding the fixed navbar's height. Every
tile must match exactly, and page dimensions and gallery counts must match. This
covers the whole page without masking any content.

The accepted changes are the usable modal Close hitbox, the native keyboard
accessible menu button, cancellation/coalescing of pagination timers, and
returning to the top on Back/Forward instead of restoring saved positions. The
history comparison checks matching content and explicitly requires the current
site to be at the top; the original site's scroll position is allowed to differ. Only
Close-button dimensions and line height are restored to the original CSS during
the pixel comparison; raw before/after captures remain attached. No page regions
are masked, and typography differences are not ignored. The standard functional
tests separately check the improved controls and gallery loading.

Open `parity-report/index.html` or use the report command to inspect captures and
failure diffs. Provenance, asset checks and cached font metadata are in `.parity/`;
browser artifacts are in `parity-results/`. These directories are ignored by Git.
This verifies the tested routes, interactions, sizes and current browser engines;
it does not establish parity on every browser release or physical device.

## Continuous integration and dependency maintenance

GitHub Actions installs dependencies with `npm ci`, checks lint and the entire
npm dependency tree (including dev tooling), then builds and tests the production
site. Pull requests and pushes to `main`/`master` use desktop/mobile Chromium.
Weekly and manually triggered checks run all five browser projects. Failure
reports are retained for 14 days. Dependabot checks npm and Actions weekly.

The security acceptance check is `npm audit --audit-level=low`: any known
low-or-higher advisory fails CI. Reclassifying a package as a dev dependency does
not exempt it. Review updates and their release notes, regenerate the lockfile,
and run lint, the audit, and browser tests before merging.

Dependency overrides address advisories inherited by Firebase CLI and lint tools:

-   `@google-cloud/pubsub` uses `@opentelemetry/core@2.8.0` for
    [GHSA-8988-4f7v-96qf](https://github.com/open-telemetry/opentelemetry-js/security/advisories/GHSA-8988-4f7v-96qf).
-   `gaxios@6` uses the CommonJS-compatible `uuid@11.1.1` for
    [GHSA-w5hq-g745-h8pq](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq).
-   `glob@10` uses `glob@14.0.3` for
    [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4).
-   All `minimatch` consumers use `11.0.3` for
    [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

Older Firebase/Superstatic callers expect `require('minimatch')` to be callable.
The `postinstall` hook applies a small export adapter to the pinned patched
CommonJS entry, retaining its named exports. It verifies the version and exact
upstream file hash before touching any installed copy and fails on unexpected
content. The matching algorithm and ESM entry are unchanged. Keep install hooks
enabled; upgrades require reviewing this adapter and its hash.

`npm run test:cli` verifies the affected HTTP/trace APIs and file-matching callers
through the actual dependency graph, without credentials or network calls. These
overrides cross parents' declared major-version ranges; recheck compatibility
when upgrading tools and remove overrides/adapters when upstream callers support
the patched releases directly.

## Firebase deployment

Authenticate the local Firebase CLI when setting up a new machine:

```sh
npx firebase login
npm run deploy
```

`npm run deploy` builds the site and deploys only Firebase Hosting. The existing
hosting site and SPA route rewrite are defined in `firebase.json`; no additional
Firebase initialization is needed for this checkout. To check the actual Hosting
rewrite configuration locally, build and run the Hosting emulator:

```sh
npm run build
npx firebase emulators:start --only hosting --project demo-fyv
```

In another terminal, run the suite against the emulator:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5000 npm run test:e2e
```
