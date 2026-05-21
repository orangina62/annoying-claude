export type Intensity = 'chill' | 'normal' | 'chaos';

export type CharacterState =
  | 'idle'
  | 'walking'
  | 'dragging'
  | 'talking'
  | 'sleeping'
  | 'surprise'
  | 'evil'
  | 'battling'
  | 'sherlock';

export type Direction = 'left' | 'right';

export interface CharacterCommand {
  type: 'moveTo' | 'setState' | 'face' | 'click-ripple';
  x?: number;
  y?: number;
  state?: CharacterState;
  direction?: Direction;
  /** ms to take to reach the target (for moveTo) */
  durationMs?: number;
}

export interface BootInfo {
  screen: { width: number; height: number };
  intensity: Intensity;
}

export const IpcChannels = {
  CharacterCommand: 'character:command',
  CharacterReady: 'character:ready',
  CharacterArrived: 'character:arrived',
  CharacterClicked: 'character:clicked',
  BattleStart: 'character:battleStart',
  BattleSwingHit: 'character:battleSwingHit',
  DuelStart: 'duel:start',
  DialogueShow: 'dialogue:show',
  WindowSetClickThrough: 'window:setClickThrough',
  RequestBootInfo: 'app:bootInfo',
  WelcomeConfirm: 'welcome:confirm',
  WelcomeCancel: 'welcome:cancel',
  PlaySound: 'audio:play',
} as const;

export interface BattleStartPayload {
  durationMs: number;
}

export interface BattleSwingHitPayload {
  /** Unit vector from Claude toward the cursor. */
  dirX: number;
  dirY: number;
  /** How hard to propel (pixels). */
  forcePx: number;
}

export interface DuelStartPayload {
  entryEdge: 'left' | 'right';
  durationMs: number;
}

export type DialogueKind = 'think' | 'speak';

export interface DialogueShowPayload {
  text: string;
  kind: DialogueKind;
  /** ms to hold after the typewriter finishes (before fade-out). */
  holdMs: number;
}

export type SoundEffect = 'ding' | 'thinking' | 'typing' | 'pop' | 'beep' | 'honk';
