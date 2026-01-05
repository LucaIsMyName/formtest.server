import { app, shell, BrowserWindow, ipcMain } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { initDatabase, testRunQueries } from "./database";
import { setupIpcHandlers } from "./ipcHandlers";
import { scheduler } from "./schedulerService";
import { getTestQueue } from "./testQueue";
import { getTestProcessManager } from "./testRunner/processManager";

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

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.formtest.server");

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

// Handle app close - stop test processes but keep tests in RUNNING/QUEUED state for recovery dialog
app.on("before-quit", async (event) => {
  try {
    // Check if there are any RUNNING or QUEUED tests
    const interruptedTests = testRunQueries.getInterruptedTestsWithDetails();
    
    if (interruptedTests.length > 0) {
      console.log(`[App] Found ${interruptedTests.length} interrupted tests on app close - will be shown in recovery dialog on next startup`);
      
      // Stop the test process manager to clean up browser processes
      // This kills the browser but does NOT mark tests as STOPPED
      const processManager = getTestProcessManager();
      try {
        await processManager.stopProcess();
      } catch (error) {
        console.error("[App] Error stopping test process:", error);
      }
      
      // Reset queue state without marking tests as STOPPED
      // We need to clear the in-memory queue but keep database tests in RUNNING/QUEUED state
      const testQueue = getTestQueue();
      try {
        testQueue.resetState();
      } catch (error) {
        console.error("[App] Error resetting test queue:", error);
      }
    }
  } catch (error) {
    console.error("[App] Error in before-quit handler:", error);
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
