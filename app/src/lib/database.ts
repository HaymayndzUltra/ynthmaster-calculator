import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import { seedDatabase } from './seedDatabase'

let db: Database.Database | null = null

export function getDbPath(): string {
  const isDev = !app.isPackaged
  if (isDev) {
    return path.join(__dirname, '../../data/stoichiometry_master.db')
  }
  return path.join(process.resourcesPath, 'data/stoichiometry_master.db')
}

export function getDatabase(): Database.Database {
  if (db) return db

  const dbPath = getDbPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initializeSchema(db)
  seedDatabase(db)
  return db
}

function initializeSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS reagents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internal_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      molecular_weight REAL NOT NULL,
      density REAL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      chapter INTEGER NOT NULL,
      description TEXT,
      temp_min REAL,
      temp_max REAL,
      yield_min REAL,
      yield_max REAL,
      yield_default REAL
    );

    CREATE TABLE IF NOT EXISTS process_reagents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_id INTEGER NOT NULL,
      reagent_id INTEGER NOT NULL,
      molar_ratio REAL,
      ratio_type TEXT DEFAULT 'eq',
      notes TEXT,
      FOREIGN KEY (process_id) REFERENCES processes(id),
      FOREIGN KEY (reagent_id) REFERENCES reagents(id)
    );

    CREATE TABLE IF NOT EXISTS procedures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      visual_cue TEXT,
      failure_mode TEXT,
      failure_fix TEXT,
      temp_target REAL,
      temp_danger REAL,
      duration_min REAL,
      duration_max REAL,
      severity TEXT DEFAULT 'normal',
      FOREIGN KEY (process_id) REFERENCES processes(id)
    );
  `)
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
