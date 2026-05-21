import type { PopupAPI } from '../../preload/popup';

declare global {
  interface Window {
    popupAPI: PopupAPI;
  }
}

export {};
