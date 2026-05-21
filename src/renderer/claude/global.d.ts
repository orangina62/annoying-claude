import type { ClaudeAPI } from '../../preload';

declare global {
  interface Window {
    claudeAPI: ClaudeAPI;
  }
}

export {};
