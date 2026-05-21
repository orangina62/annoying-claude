import { app, globalShortcut } from 'electron';

export interface HotkeyHandlers {
  onPanicQuit: () => void;
  onTogglePause: () => void;
  onCatch: () => void;
}

export function registerHotkeys(handlers: HotkeyHandlers): void {
  // Panic kill — always wins, even if scheduler is wedged.
  const panic = globalShortcut.register('Control+Shift+Q', () => {
    handlers.onPanicQuit();
  });
  if (!panic) {
    console.error('[hotkeys] Failed to register panic shortcut Ctrl+Shift+Q');
  }

  globalShortcut.register('Control+Shift+P', handlers.onTogglePause);
  globalShortcut.register('Control+Shift+C', handlers.onCatch);

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}
