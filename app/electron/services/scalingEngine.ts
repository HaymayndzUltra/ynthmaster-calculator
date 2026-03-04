import type { DatabaseAdapter } from './contextBuilder';
import type {
  YieldConfig,
  ScalingResult,
  ChapterResult,
  ScaledReagent,
  ValidationResult,
} from '../../src/types/calculator';
import type { CalculatorContext, ReagentEntry } from '../../src/types/ai';

// --- Constants: Practical max ratios from PRD §3.2 ---
// These are method-limited maximums, NOT stoichiometric theoretical.

/** 80g P2P per 136g PAA = 0.588 */
const PRACTICAL_MAX_RATIO_CH2 = 80 / 136;
/** 60g MeAm per 100g Hex = 0.60 */
const PRACTICAL_MAX_RATIO_CH3 = 60 / 100;
/** 30g freebase per 40g P2P = 0.75 */
const PRACTICAL_MAX_RATIO_CH4 = 30 / 40;

// --- Chapter names ---
const CHAPTER_NAMES: Record<number, string> = {
  1: 'Logistics & Sourcing',
  2: 'P2P Synthesis',
  3: 'Methylamine Generation',
  4: 'Reductive Amination',
  5: 'Workup & Crystallization',
};

// --- Row types for DB queries ---

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

interface ProcessReagentRow {
  internal_id: string;
  name: string;
  alias: string;
  molecular_weight: number;
  mass_ratio: number | null;
  volume_ratio: number | null;
  molar_ratio: number | null;
  ratio_type: string;
  is_baseline: number;
  notes: string | null;
}

interface ReagentRow {
  internal_id: string;
  alias: string;
  molecular_weight: number;
}

/**
 * Scaling Engine — implements the 7-step back-calculation algorithm from PRD §3.3.
 * Input: target final crystal grams + per-chapter yield factors.
 * Output: all precursor amounts for every chapter.
 */
export class ScalingEngine {
  private db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  /**
   * Main calculation method.
   * Implements PRD §3.3 back-calculation algorithm.
   */
  calculate(targetFinalCrystalG: number, yields: YieldConfig): ScalingResult {
    const validation = this.validate(targetFinalCrystalG, yields);

    if (!validation.isValid) {
      return this.emptyResult(targetFinalCrystalG, yields, validation);
    }

    // ─── Step 1: Ch5 → How much freebase needed? ───
    const freebaseNeededG = targetFinalCrystalG / yields.ch5;

    // ─── Step 2: Ch4 → How much P2P needed? ───
    const p2pNeededG = freebaseNeededG / (PRACTICAL_MAX_RATIO_CH4 * yields.ch4);

    // ─── Step 3: Ch4 → All Ch4 reagents (scale from P2P) ───
    const ch4Reagents = this.scaleChapterReagents(4, p2pNeededG);
    const meAmNeededG = p2pNeededG * 1.0; // 1:1 mass ratio with P2P

    // ─── Step 4: Ch2 → How much PAA needed? ───
    const paaNeededG = p2pNeededG / (PRACTICAL_MAX_RATIO_CH2 * yields.ch2);

    // ─── Step 5: Ch2 → Lead Acetate (scale from PAA) ───
    const ch2Reagents = this.scaleChapterReagents(2, paaNeededG);

    // ─── Step 6: Ch3 → How much Hexamine needed? ───
    const hexNeededG = meAmNeededG / (PRACTICAL_MAX_RATIO_CH3 * yields.ch3);

    // ─── Step 7: Ch3 → HCl (scale from Hexamine) ───
    const ch3Reagents = this.scaleChapterReagents(3, hexNeededG);

    // ─── Ch5 reagents (mostly fixed excess, scaled from P2P input) ───
    const ch5Reagents = this.scaleChapterReagents(5, p2pNeededG);

    // Build chapter results
    const ch2Result: ChapterResult = {
      chapter: 2,
      chapterName: CHAPTER_NAMES[2],
      reagents: ch2Reagents,
      yieldFactor: yields.ch2,
      inputAmountG: paaNeededG,
      outputAmountG: paaNeededG * PRACTICAL_MAX_RATIO_CH2 * yields.ch2,
      practicalMaxG: paaNeededG * PRACTICAL_MAX_RATIO_CH2,
    };

    const ch3Result: ChapterResult = {
      chapter: 3,
      chapterName: CHAPTER_NAMES[3],
      reagents: ch3Reagents,
      yieldFactor: yields.ch3,
      inputAmountG: hexNeededG,
      outputAmountG: hexNeededG * PRACTICAL_MAX_RATIO_CH3 * yields.ch3,
      practicalMaxG: hexNeededG * PRACTICAL_MAX_RATIO_CH3,
    };

    const ch4Result: ChapterResult = {
      chapter: 4,
      chapterName: CHAPTER_NAMES[4],
      reagents: ch4Reagents,
      yieldFactor: yields.ch4,
      inputAmountG: p2pNeededG,
      outputAmountG: freebaseNeededG,
      practicalMaxG: p2pNeededG * PRACTICAL_MAX_RATIO_CH4,
    };

    const ch5Result: ChapterResult = {
      chapter: 5,
      chapterName: CHAPTER_NAMES[5],
      reagents: ch5Reagents,
      yieldFactor: yields.ch5,
      inputAmountG: freebaseNeededG,
      outputAmountG: targetFinalCrystalG,
      practicalMaxG: freebaseNeededG, // Ch5 practical max = freebase input × yield
    };

    const allReagents = [...ch2Reagents, ...ch3Reagents, ...ch4Reagents, ...ch5Reagents];

    // Build CalculatorContext for AI integration
    const calculatorContext = this.buildCalculatorContext(allReagents, yields, targetFinalCrystalG);

    // Add warnings for large batches or extreme yields
    if (targetFinalCrystalG > 200) {
      validation.warnings.push('Large batch (>200g) — see Ch4 scale-up warnings. Heat management is CRITICAL.');
    }
    if (targetFinalCrystalG < 5) {
      validation.warnings.push('Very small batch (<5g) — transfer losses will dominate. Consider 10g+ for first attempt.');
    }

    return {
      targetFinalCrystalG,
      yields,
      chapters: {
        ch2: ch2Result,
        ch3: ch3Result,
        ch4: ch4Result,
        ch5: ch5Result,
      },
      allReagents,
      validation,
      calculatorContext,
    };
  }

  /**
   * Scale all reagents for a given chapter based on the baseline input amount.
   */
  private scaleChapterReagents(chapter: number, baselineInputG: number): ScaledReagent[] {
    const rows = this.db.all<ProcessReagentRow>(
      `SELECT r.internal_id, r.name, r.alias, r.molecular_weight,
              pr.mass_ratio, pr.volume_ratio, pr.molar_ratio,
              pr.ratio_type, pr.is_baseline, pr.notes
       FROM process_reagents pr
       JOIN reagents r ON r.id = pr.reagent_id
       JOIN processes p ON p.id = pr.process_id
       WHERE p.chapter = ?`,
      chapter
    );

    return rows.map((row): ScaledReagent => {
      let massGrams: number | null = null;
      let volumeML: number | null = null;
      let moles: number | null = null;
      let equivalents: number | null = null;

      if (row.ratio_type === 'mass' && row.mass_ratio != null) {
        massGrams = round4(baselineInputG * row.mass_ratio);
        moles = round4(massGrams / row.molecular_weight);
      } else if (row.ratio_type === 'volume' && row.volume_ratio != null) {
        volumeML = round4(baselineInputG * row.volume_ratio);
      } else if (row.ratio_type === 'fixed_excess') {
        // Fixed excess — not scaled, just pass through notes
      }

      if (row.molar_ratio != null) {
        equivalents = row.molar_ratio;
      }

      return {
        internalId: row.internal_id,
        realName: row.name,
        alias: row.alias,
        chapter,
        massGrams,
        volumeML,
        moles,
        equivalents,
        ratioType: row.ratio_type as 'mass' | 'volume' | 'fixed_excess',
        isBaseline: row.is_baseline === 1,
        notes: row.notes,
      };
    });
  }

  /**
   * Build CalculatorContext for passing to AI system prompt.
   */
  private buildCalculatorContext(
    allReagents: ScaledReagent[],
    yields: YieldConfig,
    targetG: number
  ): CalculatorContext {
    // Determine active chapter (default to Ch4 as the main reaction)
    const activeChapter = 4;

    const calculatedReagents: ReagentEntry[] = allReagents
      .filter((r) => r.massGrams != null && r.ratioType !== 'fixed_excess')
      .map((r) => ({
        opsecAlias: r.alias,
        massGrams: r.massGrams!,
        moles: r.moles ?? 0,
        equivalents: r.equivalents ?? 0,
      }));

    return {
      activeChapter,
      targetYieldGrams: targetG,
      selectedMethod: 'reductive_amination_alhg',
      calculatedReagents,
    };
  }

  /**
   * Input validation.
   */
  private validate(targetG: number, yields: YieldConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (isNaN(targetG) || targetG <= 0) {
      errors.push('Target must be a positive number.');
    }
    if (targetG < 1) {
      errors.push('Target must be at least 1g.');
    }
    if (targetG > 500) {
      errors.push('Target must be 500g or less.');
    }

    for (const [key, value] of Object.entries(yields)) {
      if (isNaN(value) || value < 0.10 || value > 0.95) {
        errors.push(`${key} yield must be between 10% and 95%.`);
      }
      if (value < 0.20) {
        warnings.push(`${key} yield is very low (${(value * 100).toFixed(0)}%) — amounts will be very large.`);
      }
      if (value > 0.90) {
        warnings.push(`${key} yield is very high (${(value * 100).toFixed(0)}%) — unrealistic for most operators.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Return an empty result when validation fails.
   */
  private emptyResult(targetG: number, yields: YieldConfig, validation: ValidationResult): ScalingResult {
    const emptyChapter = (ch: number): ChapterResult => ({
      chapter: ch,
      chapterName: CHAPTER_NAMES[ch],
      reagents: [],
      yieldFactor: 0,
      inputAmountG: 0,
      outputAmountG: 0,
      practicalMaxG: 0,
    });

    return {
      targetFinalCrystalG: targetG,
      yields,
      chapters: {
        ch2: emptyChapter(2),
        ch3: emptyChapter(3),
        ch4: emptyChapter(4),
        ch5: emptyChapter(5),
      },
      allReagents: [],
      validation,
      calculatorContext: {
        activeChapter: 1,
        targetYieldGrams: null,
        selectedMethod: null,
        calculatedReagents: null,
      },
    };
  }
}

/**
 * Round to 4 decimal places (internal precision).
 * Display should round to 1dp separately.
 */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
