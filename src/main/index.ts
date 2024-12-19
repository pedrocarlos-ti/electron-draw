import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
  Display,
} from "electron";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isDrawingMode = false;
let forceQuit = false;
let currentDisplay: Display;

const moveToDisplay = (display: Display) => {
  if (!mainWindow) return;
  
  currentDisplay = display;
  mainWindow.setBounds({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
  });
};

const createTray = () => {
  const image = nativeImage.createFromPath(
    "/Users/psantos/CascadeProjects/electron-draw/src/assets/pencil.png"
  );
  const resizedImage = image.resize({ width: 16, height: 16 });
  tray = new Tray(resizedImage);
  tray.setToolTip("ElectronDraw");

  const updateContextMenu = () => {
    const displays = screen.getAllDisplays();
    const displayMenuItems = displays.map((display) => ({
      label: `Move to Display ${display.id} (${display.size.width}x${display.size.height})${
        display.id === currentDisplay.id ? " ✓" : ""
      }`,
      click: () => moveToDisplay(display),
      checked: display.id === currentDisplay.id,
      type: 'radio' as const,
    }));

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
        label: "Select Display",
        submenu: displayMenuItems,
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
  };

  // Update menu when displays change
  screen.on('display-added', updateContextMenu);
  screen.on('display-removed', updateContextMenu);
  screen.on('display-metrics-changed', updateContextMenu);
  
  updateContextMenu();
};

const createWindow = async () => {
  if (mainWindow) {
    mainWindow.show();
    return;
  }

  mainWindow = new BrowserWindow({
    width: currentDisplay.bounds.width,
    height: currentDisplay.bounds.height,
    x: currentDisplay.bounds.x,
    y: currentDisplay.bounds.y,
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
  mainWindow.setIgnoreMouseEvents(!isDrawingMode, { forward: true });
  mainWindow.webContents.send("drawing-mode-changed", isDrawingMode);
};

const cleanup = () => {
  globalShortcut.unregisterAll();
  if (tray) {
    tray.destroy();
  }
};

app.whenReady().then(async () => {
  // Initialize currentDisplay after app is ready
  currentDisplay = screen.getPrimaryDisplay();
  
  createTray();
  await createWindow();

  // Register global shortcut
  globalShortcut.register("CommandOrControl+Shift+D", toggleDrawingMode);
  globalShortcut.register("CommandOrControl+Shift+X", () => {
    mainWindow?.webContents.send("clear-canvas");
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", cleanup);

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
