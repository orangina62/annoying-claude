import { BrowserWindow, screen } from 'electron';
import { join } from 'node:path';

let claudeWindow: BrowserWindow | null = null;
let welcomeWindow: BrowserWindow | null = null;

const isDev = !!process.env.ELECTRON_RENDERER_URL;

export function getClaudeWindow(): BrowserWindow | null {
  return claudeWindow;
}

export function createClaudeWindow(): BrowserWindow {
  const primary = screen.getPrimaryDisplay();
  const { width, height } = primary.workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    x: primary.workArea.x,
    y: primary.workArea.y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Start click-through; the renderer will request hit-test regions when needed.
  win.setIgnoreMouseEvents(true, { forward: true });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/claude/index.html`);
  } else {
    win.loadFile(join(__dirname, '../renderer/claude/index.html'));
  }

  win.once('ready-to-show', () => win.show());

  win.on('closed', () => {
    claudeWindow = null;
  });

  claudeWindow = win;
  return win;
}

export function getScreenSize(): { width: number; height: number } {
  const primary = screen.getPrimaryDisplay();
  return primary.workAreaSize;
}

export function getWelcomeWindow(): BrowserWindow | null {
  return welcomeWindow;
}

export function createWelcomeWindow(): BrowserWindow {
  if (welcomeWindow && !welcomeWindow.isDestroyed()) {
    welcomeWindow.focus();
    return welcomeWindow;
  }

  const win = new BrowserWindow({
    width: 480,
    height: 440,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    center: true,
    frame: true,
    title: 'Annoying Claude — Welcome',
    backgroundColor: '#1a1410',
    webPreferences: {
      preload: join(__dirname, '../preload/welcome.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(`${process.env.ELECTRON_RENDERER_URL}/welcome/index.html`);
  } else {
    win.loadFile(join(__dirname, '../renderer/welcome/index.html'));
  }

  win.setMenuBarVisibility(false);
  win.on('closed', () => {
    welcomeWindow = null;
  });

  welcomeWindow = win;
  return win;
}

export function closeWelcomeWindow(): void {
  if (welcomeWindow && !welcomeWindow.isDestroyed()) {
    welcomeWindow.close();
  }
  welcomeWindow = null;
}
