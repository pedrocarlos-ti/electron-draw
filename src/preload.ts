import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  toggleClickThrough: (enable: boolean) => ipcRenderer.send('toggle-click-through', enable),
  setWindowBounds: (bounds: Electron.Rectangle) => ipcRenderer.send('set-window-bounds', bounds),
  onDrawingModeChanged: (callback: (isDrawing: boolean) => void) => {
    ipcRenderer.on('drawing-mode-changed', (_event, isDrawing) => callback(isDrawing));
  },
  onClearCanvas: (callback: () => void) => {
    ipcRenderer.on('clear-canvas', () => callback());
  },
  quitApp: () => ipcRenderer.send('quit-app'),
});

// This file is intentionally empty for now
// We'll add IPC communication handlers here if needed
