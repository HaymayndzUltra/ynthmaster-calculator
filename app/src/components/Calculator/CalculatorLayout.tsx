import React, { useEffect, useRef } from 'react';
import { Package, FlaskConical, TestTubes, Flame, Gem, ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import type { YieldConfig } from '../../types/calculator';
import type { UseCalculatorReturn } from '../../types/calculator';
import { TargetInput } from './TargetInput';
import { ChapterView } from './ChapterView';
import { OnboardingScreen } from './OnboardingScreen';
import { IngredientChecklist } from './IngredientChecklist';
import { SkipLink } from './SkipLink';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CalculatorLayoutProps {
  calculator: UseCalculatorReturn;
}

const CHAPTERS = [
  { num: 1, label: 'Logistics', Icon: Package },
  { num: 2, label: 'P2P', Icon: FlaskConical },
  { num: 3, label: 'Methylamine', Icon: TestTubes },
  { num: 4, label: 'Reaction', Icon: Flame },
  { num: 5, label: 'Workup', Icon: Gem },
];

const YIELD_KEY_MAP: Record<number, keyof YieldConfig> = {
  2: 'ch2',
  3: 'ch3',
  4: 'ch4',
  5: 'ch5',
};

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({ calculator }) => {
  const {
    targetG, setTargetG,
    yields, setYield,
    activeChapter, setActiveChapter,
    results, procedures, failureModes,
    isLoading, error,
    screenMode, setScreenMode,
    currentStep, setCurrentStep,
    completedSteps, markStepComplete,
    timerSeconds,
  } = calculator;

  const isReducedMotion = useReducedMotion();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { register, unregister } = useKeyboardShortcuts();

  const currentChapterResult = results
    ? results.chapters[`ch${activeChapter}` as keyof typeof results.chapters] ?? null
    : null;

  const yieldKey = YIELD_KEY_MAP[activeChapter];
  const yieldValue = yieldKey ? yields[yieldKey] : 0;

  // ─── Focus management: move focus to main content on screen change ───
  useEffect(() => {
    if (!mainContentRef.current) return;
    const heading = mainContentRef.current.querySelector('h2');
    if (heading instanceof HTMLElement) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }, [screenMode]);

  // ─── Keyboard shortcuts (screen-specific) ───────────────────────────
  useEffect(() => {
    // Chapter jump shortcuts (Mod+1 through Mod+5)
    if (screenMode === 'execution' || screenMode === 'checklist') {
      for (let i = 1; i <= 5; i++) {
        const key = `Mod+${i}`;
        register(key, () => {
          setActiveChapter(i);
          if (screenMode !== 'execution') setScreenMode('execution');
        });
      }
    }

    // Step navigation (Screen 3 only)
    if (screenMode === 'execution') {
      register('ArrowRight', () => setCurrentStep(currentStep + 1));
      register('ArrowLeft', () => setCurrentStep(currentStep - 1));
      register('Mod+ArrowRight', () => {
        if (activeChapter < 5) setActiveChapter(activeChapter + 1);
      });
      register('Mod+ArrowLeft', () => {
        if (activeChapter > 1) setActiveChapter(activeChapter - 1);
      });
    }

    return () => {
      for (let i = 1; i <= 5; i++) unregister(`Mod+${i}`);
      unregister('ArrowRight');
      unregister('ArrowLeft');
      unregister('Mod+ArrowRight');
      unregister('Mod+ArrowLeft');
    };
  }, [screenMode, activeChapter, currentStep, setActiveChapter, setScreenMode, setCurrentStep, register, unregister]);

  // ─── Screen transition wrapper ──────────────────────────────────────
  const transitionClass = isReducedMotion
    ? ''
    : 'transition-opacity duration-[250ms]';

  // ─── Render: Onboarding screen (no sidebar) ─────────────────────────
  if (screenMode === 'onboarding') {
    return (
      <div className="h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <SkipLink />
        <div id="main-content" ref={mainContentRef} className={`h-full ${transitionClass}`}>
          <OnboardingScreen calculator={calculator} />
        </div>
      </div>
    );
  }

  // ─── Render: Checklist + Execution screens (with sidebar) ───────────
  const isExecution = screenMode === 'execution';
  const showFloatingWidgets = isExecution && activeChapter >= 2 && activeChapter <= 4;

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SkipLink />

      {/* ── Left sidebar: Pipeline Nav ────────────────────── */}
      <div className="w-[200px] shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-deep)' }}>
        {/* Logo area */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--text-muted)' }}>Project Alpha</div>
          <div className="text-sm font-bold text-white mt-0.5">Calculator</div>
        </div>

        {/* Chapter nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5" aria-label="Pipeline chapters">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter === ch.num;
            const isPast = ch.num < activeChapter;
            const ChIcon = ch.Icon;

            return (
              <button
                key={ch.num}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveChapter(ch.num);
                  if (screenMode === 'checklist') setScreenMode('execution');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer border
                  ${isActive
                    ? 'bg-blue-500/[0.08] border-blue-500/20 text-blue-400'
                    : isPast
                      ? 'bg-transparent border-transparent text-slate-400 hover:bg-[#0C1017]'
                      : 'bg-transparent border-transparent text-slate-600 hover:bg-[#0C1017] hover:text-slate-400'
                  }
                `}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-blue-500/15' : isPast ? 'bg-[#111620]' : 'bg-[#0C1017]'
                }`}>
                  {isPast && !isActive ? (
                    <Check size={14} className="text-emerald-500/60" />
                  ) : (
                    <ChIcon size={16} className={isActive ? 'text-blue-400' : 'text-slate-600'} />
                  )}
                </div>
                <div>
                  <div className={`text-[12px] font-semibold ${isActive ? 'text-blue-300' : ''}`}>
                    {ch.label}
                  </div>
                  <div className="text-[9px]" style={{ color: 'var(--text-dim)' }}>
                    Ch {ch.num}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* F12 hint */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
          <div className="text-[9px] text-center" style={{ color: 'var(--text-dim)' }}>
            Press <kbd className="px-1 py-0.5 rounded text-[8px] font-mono" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>F12</kbd> for panic mode
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Target input header (execution mode only) */}
        {isExecution && (
          <div className="shrink-0 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <TargetInput value={targetG} onChange={setTargetG} />
          </div>
        )}

        {/* Scrollable content */}
        <div id="main-content" ref={mainContentRef} className={`flex-1 overflow-auto ${transitionClass}`}>
          {/* ── Screen: Checklist ── */}
          {screenMode === 'checklist' && (
            <div className="max-w-[720px] mx-auto">
              <IngredientChecklist calculator={calculator} />
            </div>
          )}

          {/* ── Screen: Execution ── */}
          {isExecution && (
            <div className="max-w-[700px] mx-auto">
              {/* Errors */}
              {error && (
                <div className="flex items-center gap-2 mx-6 mt-4 px-4 py-3 rounded-xl bg-red-500/[0.05] border border-red-500/20 text-red-400 text-sm">
                  <AlertTriangle size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Warnings */}
              {results?.validation.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-2 mx-6 mt-2 px-4 py-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/10 text-amber-400/80 text-xs">
                  <AlertTriangle size={12} className="shrink-0" />
                  {w}
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Calculating...
                </div>
              )}

              {/* Chapter view */}
              {!isLoading && (
                <ChapterView
                  chapter={activeChapter}
                  result={currentChapterResult}
                  procedures={procedures}
                  failureModes={failureModes}
                  yieldValue={yieldValue}
                  yieldKey={yieldKey ?? 'ch2'}
                  onYieldChange={setYield}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                  completedSteps={completedSteps.get(activeChapter) ?? new Set()}
                  onMarkStepComplete={(stepNum) => markStepComplete(activeChapter, stepNum)}
                  timerSeconds={timerSeconds}
                />
              )}

              {/* Bottom navigation */}
              <div className="flex justify-between items-center px-6 pb-8 pt-2">
                {activeChapter > 1 ? (
                  <button
                    onClick={() => setActiveChapter(activeChapter - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                ) : <div />}

                {activeChapter < 5 ? (
                  <button
                    onClick={() => setActiveChapter(activeChapter + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-500/[0.12] transition-colors"
                  >
                    Next Chapter <ChevronRight size={14} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400 text-xs font-semibold">
                    <Check size={14} /> Pipeline Complete
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Floating widget container (execution mode, Ch2-4) ── */}
        {showFloatingWidgets && (
          <div
            className="fixed flex flex-col gap-2"
            style={{
              right: '24px',
              top: '80px',
              zIndex: 'var(--z-float)',
            }}
          >
            {/* TemperatureMonitor and ReactionTimer will be rendered here in Phase 4 */}
          </div>
        )}
      </div>
    </div>
  );
};
