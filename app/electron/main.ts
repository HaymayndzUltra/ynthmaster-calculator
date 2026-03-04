import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { readFileSync } from 'fs';
import { registerAIHandlers } from './ipc/aiHandlers';
import { registerCalcHandlers } from './ipc/calcHandlers';
import { initializeDatabase, closeDatabase } from './services/database';
import type { OpsecMappingFile } from '../src/types/ai';
import type { DatabaseAdapter } from './services/contextBuilder';

let mainWindow: BrowserWindow | null = null;
let aiInitialized = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#06080C',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#06080C',
      symbolColor: '#8A95A8',
      height: 32,
    },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4321');
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'));
  }
}

async function initializeServices(): Promise<void> {
  if (!mainWindow) return;
  if (aiInitialized) return;

  try {
    // ─── 1. Load OPSEC mappings ───────────────────────────────
    let opsecMap: OpsecMappingFile = { version: '1.0', description: '', mappings: [] };
    try {
      const opsecPath = join(__dirname, '..', 'data', 'opsecMapping.json');
      const raw = readFileSync(opsecPath, 'utf-8');
      opsecMap = JSON.parse(raw) as OpsecMappingFile;
    } catch {
      console.warn('⚠️ opsecMapping.json missing — AI will work without OPSEC aliases');
    }

    // ─── 2. Initialize real SQLite database ───────────────────
    const dataDir = join(__dirname, '..', 'data');
    const db: DatabaseAdapter = await initializeDatabase(dataDir);

    // ─── 3. Register Calculator IPC handlers ──────────────────
    registerCalcHandlers(db);

    // ─── 4. Register AI IPC handlers ──────────────────────────
    const result = registerAIHandlers(mainWindow, db, opsecMap);
    aiInitialized = true;

    // Start health polling when window is ready
    mainWindow.webContents.once('did-finish-load', () => {
      result.modelManager.startHealthPolling((status) => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('ai:status-changed', status);
        }
      });
    });

    // Stop polling and reset flag on window close
    mainWindow.on('closed', () => {
      result.modelManager.stopHealthPolling();
      closeDatabase();
      aiInitialized = false;
      mainWindow = null;
    });
  } catch (err) {
    console.error('⚠️ Service initialization failed — app continues without AI/Calculator:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  initializeServices();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      initializeServices();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
