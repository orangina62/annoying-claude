import { app } from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Intensity } from '@shared/types';

export interface AppConfig {
  welcomeShown: boolean;
  intensity: Intensity;
  audioEnabled: boolean;
}

const DEFAULTS: AppConfig = {
  welcomeShown: false,
  intensity: 'normal',
  audioEnabled: true,
};

function configPath(): string {
  return join(app.getPath('userData'), 'config.json');
}

let cached: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cached) return cached;
  const path = configPath();
  if (!existsSync(path)) {
    cached = { ...DEFAULTS };
    return cached;
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    cached = { ...DEFAULTS, ...raw };
    return cached!;
  } catch (err) {
    console.error('[config] failed to read, using defaults', err);
    cached = { ...DEFAULTS };
    return cached;
  }
}

export function saveConfig(patch: Partial<AppConfig>): AppConfig {
  const current = loadConfig();
  cached = { ...current, ...patch };
  try {
    writeFileSync(configPath(), JSON.stringify(cached, null, 2), 'utf-8');
  } catch (err) {
    console.error('[config] failed to write', err);
  }
  return cached;
}
