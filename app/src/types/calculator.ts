// Calculator-specific type definitions
// All interfaces used by scaling engine, IPC handlers, and Calculator UI components

import type { CalculatorContext } from './ai';

// --- Yield Configuration ---

export interface YieldConfig {
  ch2: number; // 0.10–0.95, default 0.60
  ch3: number; // 0.10–0.95, default 0.58
  ch4: number; // 0.10–0.95, default 0.65
  ch5: number; // 0.10–0.95, default 0.76
}

export const DEFAULT_YIELDS: YieldConfig = {
  ch2: 0.60,
  ch3: 0.58,
  ch4: 0.65,
  ch5: 0.76,
};

// --- Scaling Result Types ---

export interface ScaledReagent {
  internalId: string;       // e.g., 'PAA', 'PBA'
  alias: string;            // OPSEC name: 'Honey Crystals'
  chapter: number;          // Which chapter this reagent belongs to
  massGrams: number | null; // Calculated mass in grams (null for volume-only)
  volumeML: number | null;  // Calculated volume in mL (null for mass-only)
  moles: number | null;     // Calculated moles (null for fixed excess)
  equivalents: number | null; // Molar equivalents vs baseline (null for fixed excess)
  ratioType: 'mass' | 'volume' | 'fixed_excess';
  isBaseline: boolean;      // true = this is the reference reagent for its chapter
  notes: string | null;
}

export interface ChapterResult {
  chapter: number;
  chapterName: string;
  reagents: ScaledReagent[];
  yieldFactor: number;      // The yield used for this chapter (0.10–0.95)
  inputAmountG: number;     // How much of the baseline reagent is needed
  outputAmountG: number;    // Expected output at current yield
  practicalMaxG: number;    // Method-limited maximum output
}

export interface ScalingResult {
  targetFinalCrystalG: number;
  yields: YieldConfig;
  chapters: {
    ch2: ChapterResult;
    ch3: ChapterResult;
    ch4: ChapterResult;
    ch5: ChapterResult;
  };
  allReagents: ScaledReagent[];  // Flattened list of all reagents across all chapters
  validation: ValidationResult;
  calculatorContext: CalculatorContext; // Ready to pass to AI
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// --- Process & Procedure Types (from SQLite) ---

export interface ProcessInfo {
  id: number;
  name: string;
  chapter: number;
  description: string | null;
  tempMin: number | null;
  tempMax: number | null;
  tempDanger: number | null;
  yieldPracticalMax: number | null;
  yieldMin: number | null;
  yieldMax: number | null;
  yieldDefault: number | null;
  durationMin: number | null;
  durationMax: number | null;
  referenceInputG: number | null;
  referenceOutputG: number | null;
}

export interface ProcedureStep {
  id: number;
  processId: number;
  stepNumber: number;
  instruction: string;
  visualCue: string | null;
  failureMode: string | null;
  failureFix: string | null;
  emergencyAction: string | null;
  tempTarget: number | null;
  tempDanger: number | null;
  durationMin: number | null;
  durationMax: number | null;
  severity: 'info' | 'warning' | 'critical' | 'emergency' | null;
}

export interface FailureMode {
  id: string;           // e.g., 'FM-01'
  chapter: number;
  trigger: string;
  symptom: string;
  protocol: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
}

// --- Calculator UI State ---

export interface CalculatorState {
  targetG: number;
  yields: YieldConfig;
  activeChapter: number;    // 1-5
  results: ScalingResult | null;
  procedures: ProcedureStep[];
  failureModes: FailureMode[];
  isPanicMode: boolean;
  isLoading: boolean;
  error: string | null;
}

// --- Hook Return Type ---

export interface UseCalculatorReturn {
  targetG: number;
  setTargetG: (g: number) => void;
  yields: YieldConfig;
  setYield: (chapter: keyof YieldConfig, value: number) => void;
  activeChapter: number;
  setActiveChapter: (ch: number) => void;
  results: ScalingResult | null;
  procedures: ProcedureStep[];
  failureModes: FailureMode[];
  isPanicMode: boolean;
  togglePanic: () => void;
  isLoading: boolean;
  error: string | null;
  calculatorContext: CalculatorContext | undefined;
}
