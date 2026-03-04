import { ipcMain } from 'electron';
import type { DatabaseAdapter } from '../services/contextBuilder';
import { ScalingEngine } from '../services/scalingEngine';
import type { YieldConfig, ProcedureStep, FailureMode, ProcessInfo } from '../../src/types/calculator';

// --- Row types for direct DB queries ---

interface ProcedureRow {
  id: number;
  process_id: number;
  step_number: number;
  instruction: string;
  visual_cue: string | null;
  failure_mode: string | null;
  failure_fix: string | null;
  emergency_action: string | null;
  temp_target: number | null;
  temp_danger: number | null;
  duration_min: number | null;
  duration_max: number | null;
  severity: string | null;
}

interface ProcessRow {
  id: number;
  name: string;
  chapter: number;
  description: string | null;
  temp_min: number | null;
  temp_max: number | null;
  temp_danger: number | null;
  yield_practical_max: number | null;
  yield_min: number | null;
  yield_max: number | null;
  yield_default: number | null;
  duration_min: number | null;
  duration_max: number | null;
  reference_input_g: number | null;
  reference_output_g: number | null;
}

/**
 * Register all Calculator IPC handlers on the main process.
 */
export function registerCalcHandlers(db: DatabaseAdapter): void {
  const scalingEngine = new ScalingEngine(db);

  // ─── calc:calculate ─────────────────────────────────────────
  ipcMain.handle('calc:calculate', (_event, payload: { targetG: number; yields: YieldConfig }) => {
    try {
      return scalingEngine.calculate(payload.targetG, payload.yields);
    } catch (err) {
      console.error('[calcHandlers] calculate error:', err);
      return {
        targetFinalCrystalG: payload.targetG,
        yields: payload.yields,
        chapters: { ch2: null, ch3: null, ch4: null, ch5: null },
        allReagents: [],
        validation: { isValid: false, errors: [(err as Error).message], warnings: [] },
        calculatorContext: { activeChapter: 1, targetYieldGrams: null, selectedMethod: null, calculatedReagents: null },
      };
    }
  });

  // ─── calc:getProcessInfo ────────────────────────────────────
  ipcMain.handle('calc:getProcessInfo', (_event, payload: { chapter: number }): ProcessInfo | null => {
    try {
      const rows = db.all<ProcessRow>(
        'SELECT * FROM processes WHERE chapter = ?',
        payload.chapter
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        chapter: r.chapter,
        description: r.description,
        tempMin: r.temp_min,
        tempMax: r.temp_max,
        tempDanger: r.temp_danger,
        yieldPracticalMax: r.yield_practical_max,
        yieldMin: r.yield_min,
        yieldMax: r.yield_max,
        yieldDefault: r.yield_default,
        durationMin: r.duration_min,
        durationMax: r.duration_max,
        referenceInputG: r.reference_input_g,
        referenceOutputG: r.reference_output_g,
      };
    } catch (err) {
      console.error('[calcHandlers] getProcessInfo error:', err);
      return null;
    }
  });

  // ─── calc:getProcedures ─────────────────────────────────────
  ipcMain.handle('calc:getProcedures', (_event, payload: { chapter: number }): ProcedureStep[] => {
    try {
      const rows = db.all<ProcedureRow>(
        `SELECT pr.* FROM procedures pr
         JOIN processes p ON p.id = pr.process_id
         WHERE p.chapter = ?
         ORDER BY pr.step_number`,
        payload.chapter
      );
      return rows.map((r): ProcedureStep => ({
        id: r.id,
        processId: r.process_id,
        stepNumber: r.step_number,
        instruction: r.instruction,
        visualCue: r.visual_cue,
        failureMode: r.failure_mode,
        failureFix: r.failure_fix,
        emergencyAction: r.emergency_action,
        tempTarget: r.temp_target,
        tempDanger: r.temp_danger,
        durationMin: r.duration_min,
        durationMax: r.duration_max,
        severity: r.severity as ProcedureStep['severity'],
      }));
    } catch (err) {
      console.error('[calcHandlers] getProcedures error:', err);
      return [];
    }
  });

  // ─── calc:getFailureModes ───────────────────────────────────
  ipcMain.handle('calc:getFailureModes', (_event, payload: { chapter?: number }): FailureMode[] => {
    try {
      let sql = `SELECT pr.step_number, pr.failure_mode, pr.failure_fix, pr.emergency_action, pr.severity,
                        p.chapter
                 FROM procedures pr
                 JOIN processes p ON p.id = pr.process_id
                 WHERE pr.failure_mode IS NOT NULL`;
      const params: unknown[] = [];

      if (payload.chapter != null) {
        sql += ' AND p.chapter = ?';
        params.push(payload.chapter);
      }

      sql += ' ORDER BY p.chapter, pr.step_number';

      interface FailureModeRow {
        step_number: number;
        failure_mode: string;
        failure_fix: string | null;
        emergency_action: string | null;
        severity: string | null;
        chapter: number;
      }

      const rows = db.all<FailureModeRow>(sql, ...params);
      return rows.map((r, index): FailureMode => ({
        id: `FM-${String(index + 1).padStart(2, '0')}`,
        chapter: r.chapter,
        trigger: r.failure_mode,
        symptom: r.failure_mode,
        protocol: r.failure_fix ?? r.emergency_action ?? 'No fix documented.',
        severity: (r.severity as FailureMode['severity']) ?? 'warning',
      }));
    } catch (err) {
      console.error('[calcHandlers] getFailureModes error:', err);
      return [];
    }
  });
}
