import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalculatorContext } from '../types/ai';
import type {
  YieldConfig,
  ScalingResult,
  ProcedureStep,
  FailureMode,
  UseCalculatorReturn,
  ScreenMode,
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

  const [screenMode, setScreenMode] = useState<ScreenMode>('onboarding');
  const [currentStep, setCurrentStepRaw] = useState(1);
  const [checkedReagents, setCheckedReagents] = useState<Set<string>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Map<number, Set<number>>>(new Map());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // ─── Reset currentStep to 1 on chapter change ─────────────────
  useEffect(() => {
    setCurrentStepRaw(1);
  }, [activeChapter]);

  // ─── Step navigation with bounds checking ──────────────────────
  const setCurrentStep = useCallback((step: number) => {
    const max = procedures.length || 1;
    const clamped = Math.max(1, Math.min(step, max));
    setCurrentStepRaw(clamped);
  }, [procedures.length]);

  // ─── Reagent checklist (ephemeral — not persisted to disk) ─────
  const toggleReagentCheck = useCallback((internalId: string) => {
    setCheckedReagents((prev) => {
      const next = new Set(prev);
      if (next.has(internalId)) {
        next.delete(internalId);
      } else {
        next.add(internalId);
      }
      return next;
    });
  }, []);

  // ─── Reaction timer (setInterval with cleanup) ─────────────────
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning]);

  const toggleTimer = useCallback(() => {
    setTimerRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(0);
  }, []);

  // ─── Step completion tracking (ephemeral) ──────────────────────
  const markStepComplete = useCallback((chapter: number, stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Map(prev);
      const chapterSet = new Set(next.get(chapter) ?? []);
      chapterSet.add(stepNumber);
      next.set(chapter, chapterSet);
      return next;
    });
  }, []);

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
    screenMode,
    setScreenMode,
    currentStep,
    setCurrentStep,
    checkedReagents,
    toggleReagentCheck,
    timerSeconds,
    timerRunning,
    toggleTimer,
    resetTimer,
    completedSteps,
    markStepComplete,
  };
}
