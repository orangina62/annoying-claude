import { BrowserWindow, app, ipcMain, screen } from 'electron';
import { BehaviorScheduler } from './behavior-scheduler';
import { loadConfig, saveConfig } from './config';
import { playSound, setAudioEnabled, setAudioTarget } from './audio';
import { registerHotkeys } from './hotkeys';
import { registerIpc } from './ipc';
import { triggerBattle, BATTLE_DURATION_MS } from './mischief/battle';
import { MoodEngine } from './mood-engine';
import { isOsControlAvailable } from './os';
import { createTray, destroyTray, rebuild as rebuildTray } from './tray';
import {
  closeWelcomeWindow,
  createClaudeWindow,
  createWelcomeWindow,
  getClaudeWindow,
  getScreenSize,
  getWelcomeWindow,
} from './window-manager';
import type { Intensity } from '@shared/types';
import { IpcChannels } from '@shared/types';

const CLICK_BURST_THRESHOLD = 3;
const CLICK_BURST_WINDOW_MS = 4_000;

let scheduler: BehaviorScheduler | null = null;
let mood: MoodEngine | null = null;
let intensity: Intensity = 'normal';

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.dock?.hide?.();

app.whenReady().then(() => {
  const config = loadConfig();
  intensity = config.intensity;
  setAudioEnabled(config.audioEnabled);

  // Probe OS control early — surfaces nut.js native-module problems in logs
  // before we silently no-op the first sword swing.
  const osOk = isOsControlAvailable();
  console.info(`[boot] OS cursor control: ${osOk ? 'enabled' : 'disabled'}`);

  if (!config.welcomeShown) {
    showWelcomeThenStart();
  } else {
    startClaude();
  }
});

function showWelcomeThenStart(): void {
  const win = createWelcomeWindow();

  ipcMain.once(IpcChannels.WelcomeConfirm, (_e, picked: Intensity) => {
    intensity = picked;
    saveConfig({ welcomeShown: true, intensity });
    closeWelcomeWindow();
    startClaude();
  });

  ipcMain.once(IpcChannels.WelcomeCancel, () => {
    closeWelcomeWindow();
    app.exit(0);
  });

  win.on('closed', () => {
    // If user closed via the X without confirming, treat as cancel — but only
    // if we haven't started Claude yet.
    if (!scheduler) app.exit(0);
  });
}

const clickTimes: number[] = [];

function recordClick(claudeWindow: BrowserWindow): void {
  const now = Date.now();
  clickTimes.push(now);
  // Keep only the recent window.
  while (clickTimes.length && now - clickTimes[0]! > CLICK_BURST_WINDOW_MS) {
    clickTimes.shift();
  }
  if (clickTimes.length >= CLICK_BURST_THRESHOLD) {
    clickTimes.length = 0;
    mood?.onClickBurst();
    triggerBattle(claudeWindow);
    // Battle drains energy — flip to `tired` once it ends.
    setTimeout(() => mood?.onBattleEnd(), BATTLE_DURATION_MS + 500);
  } else {
    // Per-click feedback even when below threshold.
    playSound('beep');
  }
}

function startClaude(): void {
  const claudeWindow = createClaudeWindow();
  setAudioTarget(claudeWindow);

  const trayHandlers = {
    isPaused: () => scheduler?.isPaused() ?? false,
    togglePause: () => scheduler?.togglePause(),
    setIntensity: (v: Intensity) => {
      intensity = v;
      scheduler?.setIntensity(v);
      saveConfig({ intensity: v });
    },
    getIntensity: () => intensity,
    getMood: () => mood?.getCurrent() ?? 'happy',
    forceMischief: (id: string) => scheduler?.forceMischief(id),
    listMischief: () => scheduler?.listMischief() ?? [],
    quit: () => panicQuit(),
  };

  mood = new MoodEngine({
    onChange: () => rebuildTray(trayHandlers),
  });
  mood.start();
  scheduler = new BehaviorScheduler(claudeWindow, getScreenSize(), mood);
  scheduler.setIntensity(intensity);

  registerIpc({
    getBootInfo: () => ({ screen: getScreenSize(), intensity }),
    onCharacterReady: () => {
      scheduler?.start();
      // Welcome chirp so the user knows audio is alive.
      setTimeout(() => playSound('ding'), 600);
    },
    onCharacterArrived: () => {
      // hook for future mischief sequencing
    },
    onCharacterClicked: () => recordClick(claudeWindow),
  });

  createTray(trayHandlers);

  registerHotkeys({
    onPanicQuit: panicQuit,
    onTogglePause: () => {
      scheduler?.togglePause();
      rebuildTray(trayHandlers);
    },
    onCatch: () => {
      // TODO Phase 3: teleport Claude to cursor + sleep state
      playSound('pop');
    },
  });

  screen.on('display-metrics-changed', () => {
    scheduler?.updateScreen(getScreenSize());
  });
}

function panicQuit(): void {
  scheduler?.stop();
  mood?.stop();
  destroyTray();
  closeWelcomeWindow();
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.destroy();
  }
  app.exit(0);
}

app.on('window-all-closed', () => {
  // Don't quit on window-all-closed — the tray is the source of truth.
  // But if no Claude window exists yet AND welcome was rejected, exit already.
  if (!scheduler && !getWelcomeWindow()) app.exit(0);
});

app.on('second-instance', () => {
  getClaudeWindow()?.focus();
});
