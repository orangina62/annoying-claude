import { contextBridge, ipcRenderer } from 'electron';

const api = {
  close: (): void => {
    // No IPC needed — the popup window can close itself directly via window.close().
    window.close();
  },
  /** Pings the main process if needed in future (audio, telemetry…). */
  ping: (): void => {
    ipcRenderer.send('popup:ping');
  },
};

contextBridge.exposeInMainWorld('popupAPI', api);

export type PopupAPI = typeof api;
