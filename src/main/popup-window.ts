import { BrowserWindow, screen } from 'electron';
import { join } from 'node:path';

const isDev = !!process.env.ELECTRON_RENDERER_URL;

export type PopupType =
  | 'sticky'
  | 'claude-md'
  | 'todo'
  | 'dropped-file'
  | 'browser-tab';

export interface PopupOptions {
  type: PopupType;
  /** Free-form payload — passed as query params, so keep values short strings. */
  payload?: Record<string, string>;
  width: number;
  height: number;
  /** Window position. If omitted, randomly placed near the requested edge. */
  position?: { x: number; y: number } | 'top-right' | 'random' | 'center';
  /** Auto-close after this many ms. 0 disables. */
  autoCloseMs?: number;
  /** Whether the popup is draggable (uses -webkit-app-region). */
  draggable?: boolean;
}

const POPUP_PRELOAD = () => join(__dirname, '../preload/popup.js');

export function openPopup(opts: PopupOptions): BrowserWindow {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workAreaSize;
  const { x: sx, y: sy } = display.workArea;
  const { width, height } = opts;

  const pos = resolvePosition(opts.position, { sw, sh, sx, sy, width, height });

  const win = new BrowserWindow({
    x: pos.x,
    y: pos.y,
    width,
    height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    show: false,
    webPreferences: {
      preload: POPUP_PRELOAD(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      additionalArguments: [`--popup-type=${opts.type}`],
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const query: Record<string, string> = { type: opts.type, ...(opts.payload ?? {}) };

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    const qs = new URLSearchParams(query).toString();
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/popup/index.html?${qs}`);
  } else {
    win.loadFile(join(__dirname, '../renderer/popup/index.html'), { query });
  }

  win.once('ready-to-show', () => win.show());

  if (opts.autoCloseMs && opts.autoCloseMs > 0) {
    setTimeout(() => {
      if (!win.isDestroyed()) win.close();
    }, opts.autoCloseMs);
  }

  return win;
}

interface Bounds {
  sw: number;
  sh: number;
  sx: number;
  sy: number;
  width: number;
  height: number;
}

function resolvePosition(
  position: PopupOptions['position'],
  b: Bounds,
): { x: number; y: number } {
  if (position && typeof position === 'object') return position;

  const margin = 16;
  switch (position) {
    case 'top-right':
      return { x: b.sx + b.sw - b.width - margin, y: b.sy + margin };
    case 'center':
      return {
        x: b.sx + Math.floor((b.sw - b.width) / 2),
        y: b.sy + Math.floor((b.sh - b.height) / 2),
      };
    case 'random':
    default: {
      const maxX = b.sw - b.width - margin * 2;
      const maxY = b.sh - b.height - margin * 2;
      return {
        x: b.sx + margin + Math.floor(Math.random() * Math.max(0, maxX)),
        y: b.sy + margin + Math.floor(Math.random() * Math.max(0, maxY)),
      };
    }
  }
}
