/**
 * 16.9 — Scaling Engine Back-Calculation Test
 *
 * Validates:
 *   - 7-step back-calculation algorithm from PRD §3.3
 *   - 25g target produces correct chapter inputs (PRD worked example)
 *   - Standard 40g P2P batch produces correct downstream amounts
 *   - Default yields: Ch2=60%, Ch3=58%, Ch4=65%, Ch5=76%
 *   - Boundary conditions: 1g, 500g, extreme yields (10%, 95%)
 *   - Input validation: rejects NaN, negative, zero, out-of-range yields
 *
 * NOTE: Tests mirror the back-calculation math from scalingEngine.ts.
 * Vitest runs in browser-like env so we cannot import Electron services directly.
 * Numbers validated against PRD §3.3 worked example.
 */
import { describe, it, expect } from 'vitest';

// ═══════════════════════════════════════════════════════════════
// Constants — mirrors scalingEngine.ts
// ═══════════════════════════════════════════════════════════════

/** 80g P2P per 136g PAA = 0.5882... */
const PRACTICAL_MAX_RATIO_CH2 = 80 / 136;
/** 60g MeAm per 100g Hex = 0.60 */
const PRACTICAL_MAX_RATIO_CH3 = 60 / 100;
/** 30g freebase per 40g P2P = 0.75 */
const PRACTICAL_MAX_RATIO_CH4 = 30 / 40;

interface YieldConfig {
  ch2: number;
  ch3: number;
  ch4: number;
  ch5: number;
}

const DEFAULT_YIELDS: YieldConfig = {
  ch2: 0.60,
  ch3: 0.58,
  ch4: 0.65,
  ch5: 0.76,
};

// ═══════════════════════════════════════════════════════════════
// Back-calculation engine — mirrors scalingEngine.ts calculate()
// ═══════════════════════════════════════════════════════════════

interface BackCalcResult {
  freebaseNeededG: number;  // Ch5 input
  p2pNeededG: number;       // Ch4 input (= Ch2 output target)
  meAmNeededG: number;      // Ch3 output target (= P2P × 1.0)
  paaNeededG: number;       // Ch2 input
  pbAcNeededG: number;      // Ch2 co-reagent (PAA × 2.390)
  hexNeededG: number;       // Ch3 input
  hclNeededML: number;      // Ch3 co-reagent (Hex × 3.0)
  // Standard Ch4 co-reagents
  alNeededG: number;        // P2P × 1.250
  hgCl2NeededG: number;     // P2P × 0.0125
  ipaML: number;            // P2P × 2.500
}

function backCalculate(targetFinalCrystalG: number, yields: YieldConfig): BackCalcResult {
  // Step 1: Ch5 → freebase needed
  const freebaseNeededG = targetFinalCrystalG / yields.ch5;

  // Step 2: Ch4 → P2P needed
  const p2pNeededG = freebaseNeededG / (PRACTICAL_MAX_RATIO_CH4 * yields.ch4);

  // Step 3: Ch4 co-reagents (scale from P2P)
  const meAmNeededG = p2pNeededG * 1.000;
  const alNeededG = p2pNeededG * 1.250;
  const hgCl2NeededG = p2pNeededG * 0.0125;
  const ipaML = p2pNeededG * 2.500;

  // Step 4: Ch2 → PAA needed
  const paaNeededG = p2pNeededG / (PRACTICAL_MAX_RATIO_CH2 * yields.ch2);

  // Step 5: Ch2 → Lead Acetate Trihydrate (mass ratio 2.390)
  const pbAcNeededG = paaNeededG * 2.390;

  // Step 6: Ch3 → Hexamine needed
  const hexNeededG = meAmNeededG / (PRACTICAL_MAX_RATIO_CH3 * yields.ch3);

  // Step 7: Ch3 → HCl needed
  const hclNeededML = hexNeededG * 3.0;

  return {
    freebaseNeededG,
    p2pNeededG,
    meAmNeededG,
    paaNeededG,
    pbAcNeededG,
    hexNeededG,
    hclNeededML,
    alNeededG,
    hgCl2NeededG,
    ipaML,
  };
}

function validateInput(targetG: number, yields: YieldConfig): string[] {
  const errors: string[] = [];
  if (isNaN(targetG) || targetG <= 0) errors.push('Target must be a positive number.');
  if (targetG < 1) errors.push('Target must be at least 1g.');
  if (targetG > 500) errors.push('Target must be 500g or less.');
  for (const [key, value] of Object.entries(yields)) {
    if (isNaN(value) || value < 0.10 || value > 0.95) {
      errors.push(`${key} yield must be between 10% and 95%.`);
    }
  }
  return errors;
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/** Assert number is within ±tolerance of expected */
function approx(actual: number, expected: number, tolerance: number, label: string): void {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`${label}: expected ${expected} ±${tolerance}, got ${actual} (diff ${diff.toFixed(4)})`);
  }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe('16.9 Scaling Engine Back-Calculation', () => {

  // ─── PRD §3.3 Worked Example: 25g target, default yields ────
  describe('PRD §3.3 Worked Example — 25g final crystal, default yields', () => {
    const result = backCalculate(25, DEFAULT_YIELDS);

    it('Step 1: freebase needed ≈ 32.89g (25 / 0.76)', () => {
      approx(result.freebaseNeededG, 32.89, 0.1, 'freebase');
    });

    it('Step 2: P2P needed ≈ 67.47g (32.89 / 0.4875)', () => {
      approx(result.p2pNeededG, 67.47, 0.1, 'P2P');
    });

    it('Step 3: MeAm needed = P2P (1:1 mass ratio)', () => {
      expect(result.meAmNeededG).toBeCloseTo(result.p2pNeededG, 4);
    });

    it('Step 3: Al needed ≈ 84.34g (P2P × 1.25)', () => {
      approx(result.alNeededG, 84.34, 0.2, 'Al');
    });

    it('Step 3: HgCl2 needed ≈ 0.84g (P2P × 0.0125)', () => {
      approx(result.hgCl2NeededG, 0.84, 0.02, 'HgCl2');
    });

    it('Step 3: IPA needed ≈ 168.7mL (P2P × 2.5)', () => {
      approx(result.ipaML, 168.7, 0.5, 'IPA');
    });

    it('Step 4: PAA needed ≈ 191.1g', () => {
      approx(result.paaNeededG, 191.1, 1.0, 'PAA');
    });

    it('Step 5: Lead Acetate Trihydrate ≈ 456.7g (PAA × 2.390)', () => {
      approx(result.pbAcNeededG, 456.7, 2.0, 'PbAc Trihydrate');
    });

    it('Step 6: Hexamine needed ≈ 193.9g', () => {
      approx(result.hexNeededG, 193.9, 1.0, 'Hex');
    });

    it('Step 7: Muriatic Acid 32% ≈ 581.7mL (Hex × 3.0)', () => {
      approx(result.hclNeededML, 581.7, 2.0, 'HCl mL');
    });
  });

  // ─── Standard batch validation — work backwards from 40g P2P ─
  describe('Standard batch cross-check — CSOG Manual reference amounts', () => {
    // Standard batch: 40g P2P → 15-25g freebase (60-65% yield)
    // Reverse: if P2P_needed = 40g exactly, what target does that imply?
    // P2P = freebase / (0.75 × ch4_yield), freebase = crystal / ch5_yield
    // So: 40 = (crystal / 0.76) / (0.75 × 0.65) = crystal / (0.76 × 0.4875)
    // crystal = 40 × 0.76 × 0.4875 = 14.82g
    const TARGET_FOR_40G_P2P = 40 * PRACTICAL_MAX_RATIO_CH4 * DEFAULT_YIELDS.ch4 * DEFAULT_YIELDS.ch5;
    const result = backCalculate(TARGET_FOR_40G_P2P, DEFAULT_YIELDS);

    it('P2P needed should be exactly 40g', () => {
      approx(result.p2pNeededG, 40.0, 0.01, 'P2P = 40g');
    });

    it('MeAm needed should be 40g (1:1 with P2P)', () => {
      approx(result.meAmNeededG, 40.0, 0.01, 'MeAm = 40g');
    });

    it('Al needed should be 50g (P2P × 1.25)', () => {
      approx(result.alNeededG, 50.0, 0.01, 'Al = 50g');
    });

    it('HgCl2 needed should be 0.5g (P2P × 0.0125)', () => {
      approx(result.hgCl2NeededG, 0.5, 0.001, 'HgCl2 = 0.5g');
    });

    it('IPA needed should be 100mL (P2P × 2.5)', () => {
      approx(result.ipaML, 100.0, 0.1, 'IPA = 100mL');
    });
  });

  // ─── Chain consistency ─────────────────────────────────────
  describe('Chain consistency — output feeds into next chapter input', () => {
    const result = backCalculate(25, DEFAULT_YIELDS);

    it('freebaseNeeded × ch5_yield ≈ target (25g)', () => {
      approx(result.freebaseNeededG * DEFAULT_YIELDS.ch5, 25, 0.001, 'Ch5 output');
    });

    it('p2pNeeded × RATIO_CH4 × ch4_yield ≈ freebaseNeeded', () => {
      const expectedFreebase = result.p2pNeededG * PRACTICAL_MAX_RATIO_CH4 * DEFAULT_YIELDS.ch4;
      approx(expectedFreebase, result.freebaseNeededG, 0.001, 'Ch4 output');
    });

    it('paaNeeded × RATIO_CH2 × ch2_yield ≈ p2pNeeded', () => {
      const expectedP2P = result.paaNeededG * PRACTICAL_MAX_RATIO_CH2 * DEFAULT_YIELDS.ch2;
      approx(expectedP2P, result.p2pNeededG, 0.001, 'Ch2 output');
    });

    it('hexNeeded × RATIO_CH3 × ch3_yield ≈ meAmNeeded', () => {
      const expectedMeAm = result.hexNeededG * PRACTICAL_MAX_RATIO_CH3 * DEFAULT_YIELDS.ch3;
      approx(expectedMeAm, result.meAmNeededG, 0.001, 'Ch3 output');
    });

    it('PbAc = PAA × 2.390 exactly', () => {
      expect(result.pbAcNeededG).toBeCloseTo(result.paaNeededG * 2.390, 4);
    });

    it('HCl = Hex × 3.0 exactly', () => {
      expect(result.hclNeededML).toBeCloseTo(result.hexNeededG * 3.0, 4);
    });
  });

  // ─── Scaling proportionality ──────────────────────────────
  describe('Linear scaling proportionality', () => {
    it('doubling target doubles all amounts', () => {
      const r25 = backCalculate(25, DEFAULT_YIELDS);
      const r50 = backCalculate(50, DEFAULT_YIELDS);
      approx(r50.paaNeededG, r25.paaNeededG * 2, 0.01, 'PAA doubles');
      approx(r50.hexNeededG, r25.hexNeededG * 2, 0.01, 'Hex doubles');
      approx(r50.p2pNeededG, r25.p2pNeededG * 2, 0.01, 'P2P doubles');
    });

    it('halving target halves all amounts', () => {
      const r25 = backCalculate(25, DEFAULT_YIELDS);
      const r12 = backCalculate(12.5, DEFAULT_YIELDS);
      approx(r12.paaNeededG, r25.paaNeededG / 2, 0.01, 'PAA halves');
      approx(r12.hexNeededG, r25.hexNeededG / 2, 0.01, 'Hex halves');
    });
  });

  // ─── Yield factor sensitivity ─────────────────────────────
  describe('Yield factor sensitivity — lower yield = more precursor', () => {
    it('lower Ch2 yield requires more PAA', () => {
      const highYield = backCalculate(25, { ...DEFAULT_YIELDS, ch2: 0.75 });
      const lowYield  = backCalculate(25, { ...DEFAULT_YIELDS, ch2: 0.40 });
      expect(lowYield.paaNeededG).toBeGreaterThan(highYield.paaNeededG);
    });

    it('lower Ch4 yield requires more P2P', () => {
      const highYield = backCalculate(25, { ...DEFAULT_YIELDS, ch4: 0.80 });
      const lowYield  = backCalculate(25, { ...DEFAULT_YIELDS, ch4: 0.30 });
      expect(lowYield.p2pNeededG).toBeGreaterThan(highYield.p2pNeededG);
    });

    it('lower Ch5 yield requires more freebase', () => {
      const highYield = backCalculate(25, { ...DEFAULT_YIELDS, ch5: 0.90 });
      const lowYield  = backCalculate(25, { ...DEFAULT_YIELDS, ch5: 0.50 });
      expect(lowYield.freebaseNeededG).toBeGreaterThan(highYield.freebaseNeededG);
    });

    it('at 10% Ch4 yield, P2P requirement is 7.5× the 75% case', () => {
      const r75 = backCalculate(25, { ...DEFAULT_YIELDS, ch4: 0.75 });
      const r10 = backCalculate(25, { ...DEFAULT_YIELDS, ch4: 0.10 });
      approx(r10.p2pNeededG / r75.p2pNeededG, 7.5, 0.01, 'ratio 7.5x');
    });
  });

  // ─── Boundary conditions ──────────────────────────────────
  describe('Boundary conditions', () => {
    it('1g target produces non-zero positive amounts', () => {
      const r = backCalculate(1, DEFAULT_YIELDS);
      expect(r.paaNeededG).toBeGreaterThan(0);
      expect(r.hexNeededG).toBeGreaterThan(0);
      expect(r.p2pNeededG).toBeGreaterThan(0);
    });

    it('500g target produces amounts ≈ 20× the 25g target', () => {
      const r25 = backCalculate(25, DEFAULT_YIELDS);
      const r500 = backCalculate(500, DEFAULT_YIELDS);
      approx(r500.paaNeededG / r25.paaNeededG, 20, 0.01, 'PAA 20× ratio');
    });

    it('500g target PAA ≈ 3822g', () => {
      const r = backCalculate(500, DEFAULT_YIELDS);
      approx(r.paaNeededG, 3822, 20, 'PAA 500g target');
    });

    it('1g target is self-consistent through the chain', () => {
      const r = backCalculate(1, DEFAULT_YIELDS);
      const recoveredTarget = r.freebaseNeededG * DEFAULT_YIELDS.ch5;
      approx(recoveredTarget, 1.0, 0.001, 'round-trip');
    });
  });

  // ─── Input validation ─────────────────────────────────────
  describe('Input validation', () => {
    it('valid inputs produce no errors', () => {
      expect(validateInput(25, DEFAULT_YIELDS)).toHaveLength(0);
    });

    it('negative target is rejected', () => {
      const errors = validateInput(-10, DEFAULT_YIELDS);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('zero target is rejected', () => {
      const errors = validateInput(0, DEFAULT_YIELDS);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('NaN target is rejected', () => {
      const errors = validateInput(NaN, DEFAULT_YIELDS);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('target > 500g is rejected', () => {
      const errors = validateInput(501, DEFAULT_YIELDS);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('exactly 500g is valid', () => {
      expect(validateInput(500, DEFAULT_YIELDS)).toHaveLength(0);
    });

    it('exactly 1g is valid', () => {
      expect(validateInput(1, DEFAULT_YIELDS)).toHaveLength(0);
    });

    it('yield < 10% is rejected', () => {
      const errors = validateInput(25, { ...DEFAULT_YIELDS, ch4: 0.09 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('yield > 95% is rejected', () => {
      const errors = validateInput(25, { ...DEFAULT_YIELDS, ch2: 0.96 });
      expect(errors.length).toBeGreaterThan(0);
    });

    it('yield = 10% is valid', () => {
      expect(validateInput(25, { ...DEFAULT_YIELDS, ch4: 0.10 })).toHaveLength(0);
    });

    it('yield = 95% is valid', () => {
      expect(validateInput(25, { ...DEFAULT_YIELDS, ch2: 0.95 })).toHaveLength(0);
    });
  });

  // ─── Physical reasonableness checks ──────────────────────
  describe('Physical reasonableness — amounts must make chemical sense', () => {
    it('PbAc always > PAA by mass (2.39× ratio)', () => {
      const r = backCalculate(25, DEFAULT_YIELDS);
      expect(r.pbAcNeededG).toBeGreaterThan(r.paaNeededG);
    });

    it('Hexamine > MeAm (100g Hex → 60g MeAm, so Hex is larger)', () => {
      const r = backCalculate(25, DEFAULT_YIELDS);
      expect(r.hexNeededG).toBeGreaterThan(r.meAmNeededG);
    });

    it('PAA >> P2P (136g PAA → ~48g P2P at 60% yield)', () => {
      const r = backCalculate(25, DEFAULT_YIELDS);
      expect(r.paaNeededG).toBeGreaterThan(r.p2pNeededG);
    });

    it('HCl volume (mL) > Hex mass (g) by 3× factor', () => {
      const r = backCalculate(25, DEFAULT_YIELDS);
      approx(r.hclNeededML / r.hexNeededG, 3.0, 0.001, 'HCl/Hex ratio');
    });
  });
});
