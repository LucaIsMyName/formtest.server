import { app, shell, BrowserWindow, ipcMain, protocol, net } from "electron";
import { join } from "path";
import { existsSync } from "fs";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { initDatabase } from "./database";
import { setupIpcHandlers } from "./ipcHandlers";
import { scheduler } from "./schedulerService";

let mainWindow: BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    minWidth: 1090,
    minHeight: 500,
    // maxHeight: 1080,
    // maxWidth: 1340,
    show: false,
    frame: false, // Remove OS frame
    titleBarStyle: "hidden", // Hide title bar
    trafficLightPosition: { x: -1000, y: -1000 }, // Hide traffic lights completely
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// Register custom protocol for serving local files (screenshots)
// Must be registered before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'local-file', privileges: { secure: true, standard: true, supportFetchAPI: true, stream: true } }
]);

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.formtest.server");

  // Register the local-file protocol handler
  protocol.handle('local-file', (request) => {
    // URL format: local-file:///absolute/path/to/file.png
    const url = request.url;
    let filePath = decodeURIComponent(url.replace('local-file://', ''));
    
    // Handle Windows paths that might have an extra slash
    if (process.platform === 'win32' && filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }
    
    console.log(`[local-file protocol] Serving: ${filePath}`);
    
    // Security check: only allow files from screenshots directory
    const screenshotsDir = join(process.cwd(), 'screenshots');
    if (!filePath.startsWith(screenshotsDir)) {
      console.error(`[local-file protocol] Access denied: ${filePath} is not in screenshots directory`);
      return new Response('Access denied', { status: 403 });
    }
    
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`[local-file protocol] File not found: ${filePath}`);
      return new Response('File not found', { status: 404 });
    }
    
    // Serve the file using net.fetch with file:// protocol
    return net.fetch(`file://${filePath}`);
  });

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Initialize database
  initDatabase();

  // Setup IPC handlers
  setupIpcHandlers();

  // Initialize scheduler
  scheduler.init();

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Window control IPC handlers
ipcMain.handle("window-minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window-close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});
