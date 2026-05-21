import type { Intensity } from '@shared/types';

declare global {
  interface Window {
    welcomeAPI: {
      confirm: (intensity: Intensity) => void;
      cancel: () => void;
    };
  }
}

export {};
