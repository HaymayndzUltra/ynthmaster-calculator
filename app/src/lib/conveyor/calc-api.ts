import type { YieldConfig, ScalingResult, ProcessInfo, ProcedureStep, FailureMode } from '../../types/calculator';

/**
 * CalcApi — Type-safe wrapper for Calculator IPC channels.
 * Uses window.calc bridge exposed by preload.
 */
export class CalcApi {
  calculate(targetG: number, yields: YieldConfig): Promise<ScalingResult> {
    return window.calc.calculate(targetG, yields);
  }

  getProcessInfo(chapter: number): Promise<ProcessInfo | null> {
    return window.calc.getProcessInfo(chapter);
  }

  getProcedures(chapter: number): Promise<ProcedureStep[]> {
    return window.calc.getProcedures(chapter);
  }

  getFailureModes(chapter?: number): Promise<FailureMode[]> {
    return window.calc.getFailureModes(chapter);
  }
}
