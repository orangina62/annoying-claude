import { Menu, Tray, app, nativeImage } from 'electron';
import { join } from 'node:path';
import { MOOD_LABEL, type Mood } from '@shared/mood';
import type { Intensity } from '@shared/types';

export interface TrayHandlers {
  isPaused: () => boolean;
  togglePause: () => void;
  setIntensity: (intensity: Intensity) => void;
  getIntensity: () => Intensity;
  getMood: () => Mood;
  forceMischief: (id: string) => void;
  listMischief: () => Array<{ id: string; label: string }>;
  quit: () => void;
}

let tray: Tray | null = null;

function trayIconPath(): string {
  // Placeholder: a 1x1 transparent icon until we ship a real .ico.
  // Electron tolerates an empty NativeImage — we just create one if no file.
  return join(__dirname, '../../assets/claude-icon.png');
}

function buildIcon() {
  try {
    const img = nativeImage.createFromPath(trayIconPath());
    if (!img.isEmpty()) return img;
  } catch {
    // fall through
  }
  // Fallback: 16x16 orange square so the tray icon is always visible.
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    buffer[i * 4 + 0] = 0xd9; // R
    buffer[i * 4 + 1] = 0x6e; // G
    buffer[i * 4 + 2] = 0x3a; // B
    buffer[i * 4 + 3] = 0xff; // A
  }
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

export function createTray(handlers: TrayHandlers): Tray {
  tray = new Tray(buildIcon());
  tray.setToolTip('Annoying Claude');
  rebuild(handlers);
  return tray;
}

export function rebuild(handlers: TrayHandlers): void {
  if (!tray) return;

  const intensity = handlers.getIntensity();
  const paused = handlers.isPaused();

  const intensityItems = (['chill', 'normal', 'chaos'] as const).map((value) => ({
    label: value.charAt(0).toUpperCase() + value.slice(1),
    type: 'radio' as const,
    checked: intensity === value,
    click: () => {
      handlers.setIntensity(value);
      rebuild(handlers);
    },
  }));

  const mischiefItems = handlers.listMischief().map((m) => ({
    label: m.label,
    click: () => handlers.forceMischief(m.id),
  }));

  const moodLabel = MOOD_LABEL[handlers.getMood()];

  const menu = Menu.buildFromTemplate([
    { label: 'Annoying Claude', enabled: false },
    { label: `Mood — ${moodLabel}`, enabled: false },
    { type: 'separator' },
    {
      label: paused ? 'Resume' : 'Pause',
      click: () => {
        handlers.togglePause();
        rebuild(handlers);
      },
    },
    { label: 'Intensity', submenu: intensityItems },
    { type: 'separator' },
    {
      label: 'Force mischief (debug)',
      submenu: mischiefItems.length
        ? mischiefItems
        : [{ label: '(none registered yet)', enabled: false }],
    },
    { type: 'separator' },
    { label: 'Quit (Ctrl+Shift+Q)', click: () => handlers.quit() },
  ]);

  tray.setContextMenu(menu);
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}

// Quiet "unused" warnings if app re-exports things.
void app;
