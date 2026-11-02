// Minimum engines resolved by the original CRA lockfile's production
// Browserslist. Explicit engine versions avoid newer Browserslist databases
// silently remapping historical Android/UC aliases to their latest releases.
// Chrome 30 conservatively covers the original Android 4.4 and UC targets.
export const legacyTargets = {
    android: '4.4',
    chrome: '30',
    edge: '99',
    firefox: '98',
    ie: '11',
    ios: '12.2',
    opera: '85',
    safari: '13.1',
    samsung: '16',
};

export const cssBrowsers = [
    'android 4.4.3-4.4.4',
    'chrome 30',
    'edge 99',
    'firefox 98',
    'ie 11',
    'ios_saf 12.2-12.5',
    'opera 85',
    'safari 13.1',
    'samsung 16.0',
];
