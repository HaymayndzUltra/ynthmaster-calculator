import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { readFileSync } from 'fs';
import { registerAIHandlers } from './ipc/aiHandlers';
import type { OpsecMappingFile } from '../src/types/ai';

let mainWindow: BrowserWindow | null = null;
let modelManagerRef: { modelManager: ReturnType<typeof registerAIHandlers>['modelManager'] } | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development, load from Vite dev server; in production, load built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'));
  }
}

function initializeAI(): void {
  if (!mainWindow) return;

  // Load opsecMapping.json
  let opsecMap: OpsecMappingFile = { version: '1.0', description: '', mappings: [] };
  try {
    const opsecPath = join(__dirname, '..', 'data', 'opsecMapping.json');
    const raw = readFileSync(opsecPath, 'utf-8');
    opsecMap = JSON.parse(raw) as OpsecMappingFile;
  } catch {
    // opsecMapping.json missing — AI will work without OPSEC aliases
  }

  // Database stub — will be replaced when SQLite is wired in parent PRD tasks
  // For now, provide a no-op adapter that returns empty arrays for all queries
  const db = {
    all: () => [],
  };

  // Register AI IPC handlers
  const result = registerAIHandlers(mainWindow, db, opsecMap);
  modelManagerRef = result;

  // Start health polling when window is ready
  mainWindow.webContents.once('did-finish-load', () => {
    result.modelManager.startHealthPolling((status) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('ai:status-changed', status);
      }
    });
  });

  // Stop polling on window close
  mainWindow.on('closed', () => {
    result.modelManager.stopHealthPolling();
    modelManagerRef = null;
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  initializeAI();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      initializeAI();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
