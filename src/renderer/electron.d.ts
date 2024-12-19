export interface IElectronAPI {
  toggleClickThrough: (enable: boolean) => void;
  setWindowBounds: (bounds: Electron.Rectangle) => void;
  onDrawingModeChanged: (callback: (isDrawing: boolean) => void) => void;
  onClearCanvas: (callback: () => void) => void;
  quitApp: () => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
