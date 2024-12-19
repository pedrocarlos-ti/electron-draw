import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
} from "electron";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isDrawingMode = false;
let forceQuit = false;

const createTray = () => {
  const image = nativeImage.createFromPath(
    "/Users/psantos/CascadeProjects/electron-draw/src/assets/pencil.png"
  );
  const resizedImage = image.resize({ width: 16, height: 16 });
  tray = new Tray(resizedImage);
  tray.setToolTip("ElectronDraw");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Toggle Drawing Mode",
      accelerator: "CommandOrControl+Shift+D",
      click: toggleDrawingMode,
    },
    {
      label: "Clear Canvas",
      accelerator: "CommandOrControl+Shift+X",
      click: () => mainWindow?.webContents.send("clear-canvas"),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        forceQuit = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Show window on tray icon click
  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });
};

const createWindow = async () => {
  if (mainWindow) {
    mainWindow.show();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    width: primaryDisplay.bounds.width,
    height: primaryDisplay.bounds.height,
    x: 0,
    y: 0,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    frame: false,
    transparent: true,
    hasShadow: false,
    roundedCorners: false,
    resizable: false,
    movable: false,
    focusable: true,
    backgroundColor: "#00000000",
    titleBarStyle: "hidden",
    skipTaskbar: true,
  });

  // Hide dock icon but keep the tray icon
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  mainWindow.setAlwaysOnTop(true, "screen-saver");

  mainWindow.setBounds({
    x: 0,
    y: 0,
    width: primaryDisplay.bounds.width,
    height: primaryDisplay.bounds.height,
  });

  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.show();

  mainWindow.on("close", (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
};

const toggleDrawingMode = () => {
  if (!mainWindow) return;

  isDrawingMode = !isDrawingMode;

  if (isDrawingMode) {
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.show();
    mainWindow.focus();
  } else {
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  }

  mainWindow.webContents.send("drawing-mode-changed", isDrawingMode);
};

const cleanup = () => {
  globalShortcut.unregisterAll();
  if (tray) {
    tray.destroy();
    tray = null;
  }
  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }
  forceQuit = true;
};

app.whenReady().then(async () => {
  createTray();
  await createWindow();

  globalShortcut.register("CommandOrControl+Shift+D", toggleDrawingMode);
  globalShortcut.register("CommandOrControl+Shift+X", () => {
    if (mainWindow) {
      mainWindow.webContents.send("clear-canvas");
    }
  });
});

app.on("before-quit", () => {
  cleanup();
});

app.on("quit", () => {
  cleanup();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    cleanup();
  }
});

app.on("activate", async () => {
  if (!mainWindow) {
    await createWindow();
  } else {
    mainWindow.show();
  }
});

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
  }
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

ipcMain.on("toggle-click-through", (_event, enable: boolean) => {
  if (mainWindow) {
    if (!isDrawingMode) {
      mainWindow.setIgnoreMouseEvents(enable, { forward: true });
    }
  }
});

ipcMain.on("set-window-bounds", (_event, bounds: Electron.Rectangle) => {
  if (mainWindow) {
    mainWindow.setBounds(bounds);
  }
});

ipcMain.on("quit-app", () => {
  cleanup();
});
