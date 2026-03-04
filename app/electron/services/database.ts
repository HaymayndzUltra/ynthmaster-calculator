import { readFileSync } from 'fs';
import { join } from 'path';
import type { DatabaseAdapter } from './contextBuilder';

/**
 * SQLite database service using sql.js (pure JS, no native build).
 * Initializes from seed.sql on first run. Provides typed query interface
 * matching the DatabaseAdapter contract used by contextBuilder.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: any = null;

/**
 * Initialize the SQLite database.
 * - Loads sql.js WASM
 * - Creates in-memory DB
 * - Executes seed.sql to populate tables
 * Returns a DatabaseAdapter compatible with contextBuilder.
 */
export async function initializeDatabase(dataDir: string): Promise<DatabaseAdapter> {
  if (dbInstance) {
    return createAdapter(dbInstance);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    dbInstance = new SQL.Database();

    // Execute seed SQL to create tables and insert data
    const seedPath = join(dataDir, 'seed.sql');
    try {
      const seedSql = readFileSync(seedPath, 'utf-8');
      dbInstance.run(seedSql);
      console.log('[Database] Seed data loaded successfully from', seedPath);
    } catch (seedErr) {
      console.warn('[Database] Failed to load seed.sql:', (seedErr as Error).message);
      console.warn('[Database] Database will be empty — calculator and AI context will have no data.');
    }

    // Verify tables exist
    const tables = dbInstance.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    if (tables.length > 0 && tables[0].values) {
      console.log('[Database] Tables:', tables[0].values.map((r: unknown[]) => r[0]).join(', '));
    }

    return createAdapter(dbInstance);
  } catch (err) {
    console.error('[Database] Failed to initialize sql.js:', err);
    return createNoopAdapter();
  }
}

/**
 * Create a DatabaseAdapter wrapping a sql.js Database instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createAdapter(db: any): DatabaseAdapter {
  return {
    all<T = Record<string, unknown>>(sql: string, ...params: unknown[]): T[] {
      try {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }

        const results: T[] = [];
        while (stmt.step()) {
          const row = stmt.getAsObject() as T;
          results.push(row);
        }
        stmt.free();
        return results;
      } catch (err) {
        console.warn('[Database] Query failed:', (err as Error).message, '\nSQL:', sql.slice(0, 200));
        return [];
      }
    },
  };
}

/**
 * No-op adapter for when DB initialization fails.
 */
function createNoopAdapter(): DatabaseAdapter {
  console.warn('⚠️ Database not initialized — using no-op adapter.');
  return {
    all<T = Record<string, unknown>>(): T[] {
      return [];
    },
  };
}

/**
 * Close the database connection. Call on app shutdown.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('[Database] Closed.');
  }
}
