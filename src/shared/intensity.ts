import type { Intensity } from './types';

export const INTENSITY_ORDER: Intensity[] = ['chill', 'normal', 'chaos'];

export interface IntensityConfig {
  /** Tick frequency for the behavior scheduler (ms). */
  tickMs: number;
  /** Probability per tick that any mischief fires. */
  tickFireChance: number;
  /** Allowed mischief tiers (1 = visual, 2 = interactive, 3 = OS-level). */
  allowedTiers: ReadonlyArray<1 | 2 | 3>;
  /** Probability weights per tier when picking mischief. */
  tierWeights: Record<1 | 2 | 3, number>;
}

export const INTENSITY: Record<Intensity, IntensityConfig> = {
  chill: {
    tickMs: 5000,
    tickFireChance: 0.03,
    allowedTiers: [1],
    tierWeights: { 1: 1, 2: 0, 3: 0 },
  },
  normal: {
    tickMs: 5000,
    tickFireChance: 0.05,
    allowedTiers: [1, 2, 3],
    tierWeights: { 1: 0.6, 2: 0.3, 3: 0.1 },
  },
  chaos: {
    tickMs: 3000,
    tickFireChance: 0.12,
    allowedTiers: [1, 2, 3],
    tierWeights: { 1: 0.35, 2: 0.35, 3: 0.3 },
  },
};
