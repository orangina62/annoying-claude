// Safe wrapper around nut.js's `getActiveWindow()` for OS focus detection.
// Used by the sherlock mischief to spawn only when a browser is in focus.

interface NutWindowApi {
  getActiveWindow: () => Promise<NutWindow>;
}

interface NutWindow {
  getTitle(): Promise<string>;
}

let nutWindow: NutWindowApi | null = null;
let attempted = false;

function loadNutWindow(): NutWindowApi | null {
  if (attempted) return nutWindow;
  attempted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@nut-tree-fork/nut-js') as NutWindowApi;
    if (typeof mod.getActiveWindow === 'function') {
      nutWindow = mod;
    }
  } catch {
    nutWindow = null;
  }
  return nutWindow;
}

export async function getActiveWindowTitle(): Promise<string | null> {
  const mod = loadNutWindow();
  if (!mod) return null;
  try {
    const win = await mod.getActiveWindow();
    return await win.getTitle();
  } catch {
    return null;
  }
}

const BROWSER_HINTS: ReadonlyArray<string> = [
  'Google Chrome',
  'Chromium',
  'Mozilla Firefox',
  'Microsoft Edge',
  'Microsoft Edge',
  'Brave',
  'Opera',
  'Arc',
  'Vivaldi',
  'Safari',
];

export async function isBrowserActive(): Promise<boolean> {
  const title = await getActiveWindowTitle();
  if (!title) return false;
  return BROWSER_HINTS.some((hint) => title.includes(hint));
}
