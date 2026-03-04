import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalculatorContext } from '../types/ai';
import type {
  YieldConfig,
  ScalingResult,
  ProcedureStep,
  FailureMode,
  UseCalculatorReturn,
} from '../types/calculator';
import { DEFAULT_YIELDS } from '../types/calculator';

const DEBOUNCE_MS = 150;

export function useCalculator(): UseCalculatorReturn {
  const [targetG, setTargetG] = useState(25);
  const [yields, setYields] = useState<YieldConfig>({ ...DEFAULT_YIELDS });
  const [activeChapter, setActiveChapter] = useState(2);
  const [results, setResults] = useState<ScalingResult | null>(null);
  const [procedures, setProcedures] = useState<ProcedureStep[]>([]);
  const [failureModes, setFailureModes] = useState<FailureMode[]>([]);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Recalculate on target or yield change (debounced 150ms) ───
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await window.calc.calculate(targetG, yields);
        setResults(result);
        if (!result.validation.isValid) {
          setError(result.validation.errors.join('. '));
        }
      } catch (err) {
        console.error('useCalculator: calculate failed:', err);
        setError('Calculation failed. Check database connection.');
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [targetG, yields]);

  // ─── Load procedures + failure modes on chapter change ─────────
  useEffect(() => {
    if (activeChapter < 2 || activeChapter > 5) {
      setProcedures([]);
      setFailureModes([]);
      return;
    }

    let cancelled = false;

    const loadChapterData = async (): Promise<void> => {
      try {
        const [procs, fms] = await Promise.all([
          window.calc.getProcedures(activeChapter),
          window.calc.getFailureModes(activeChapter),
        ]);
        if (!cancelled) {
          setProcedures(procs);
          setFailureModes(fms);
        }
      } catch (err) {
        console.error('useCalculator: failed to load chapter data:', err);
      }
    };

    loadChapterData();
    return () => { cancelled = true; };
  }, [activeChapter]);

  // ─── Yield setter (per chapter) ────────────────────────────────
  const setYield = useCallback((chapter: keyof YieldConfig, value: number) => {
    setYields((prev) => ({ ...prev, [chapter]: value }));
  }, []);

  // ─── Panic mode toggle ─────────────────────────────────────────
  const togglePanic = useCallback(() => {
    setIsPanicMode((prev) => !prev);
  }, []);

  // ─── Derived: CalculatorContext for AI ──────────────────────────
  const calculatorContext: CalculatorContext | undefined = results
    ? results.calculatorContext
    : undefined;

  return {
    targetG,
    setTargetG,
    yields,
    setYield,
    activeChapter,
    setActiveChapter,
    results,
    procedures,
    failureModes,
    isPanicMode,
    togglePanic,
    isLoading,
    error,
    calculatorContext,
  };
}
