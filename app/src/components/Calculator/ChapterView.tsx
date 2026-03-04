import React from 'react';
import { Package, FlaskConical, Flame, Gem, TestTubes, ArrowDown, ShoppingCart, Shield, Wind, FireExtinguisher, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { ChapterResult, ProcedureStep as ProcedureStepType, FailureMode, YieldConfig } from '../../types/calculator';
import { DEFAULT_YIELDS } from '../../types/calculator';
import { YieldSlider } from './YieldSlider';
import { ReagentTable } from './ReagentTable';
import { ProcedureStepComponent } from './ProcedureStep';
import { StepDots } from './StepDots';

interface ChapterViewProps {
  chapter: number;
  result: ChapterResult | null;
  procedures: ProcedureStepType[];
  failureModes: FailureMode[];
  yieldValue: number;
  yieldKey: keyof YieldConfig;
  onYieldChange: (chapter: keyof YieldConfig, value: number) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  completedSteps?: Set<number>;
  onMarkStepComplete?: (stepNumber: number) => void;
  timerSeconds?: number;
}

const CH_META: Record<number, { title: string; sub: string; Icon: typeof Package }> = {
  1: { title: 'Logistics & Sourcing', sub: 'Gather all materials before starting', Icon: Package },
  2: { title: 'P2P Synthesis', sub: 'Dry distillation — create the precursor oil', Icon: FlaskConical },
  3: { title: 'Methylamine Generation', sub: 'Hexamine hydrolysis — create the reagent', Icon: TestTubes },
  4: { title: 'The Reaction', sub: 'Al/Hg reductive amination — the main event', Icon: Flame },
  5: { title: 'Workup & Crystallization', sub: 'Extract, gas, crystallize — finish the product', Icon: Gem },
};

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter, result, procedures, failureModes: _failureModes, yieldValue, yieldKey, onYieldChange,
  currentStep = 1, onStepChange, completedSteps = new Set(), onMarkStepComplete, timerSeconds,
}) => {
  const meta = CH_META[chapter] ?? { title: `Chapter ${chapter}`, sub: '', Icon: Package };
  const ChIcon = meta.Icon;
  const totalSteps = procedures.length;
  const currentProcedure = procedures[currentStep - 1] ?? null;
  const isLastStep = currentStep >= totalSteps;
  const showTimer = timerSeconds != null && chapter >= 2 && chapter <= 4;

  // ─── Chapter 1: Static checklist ──────────────────────────────
  if (chapter === 1) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{meta.title}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{meta.sub}</p>
        </div>

        <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            This chapter has no calculations. Complete this checklist before starting any chemistry.
          </p>

          {[
            { icon: ShoppingCart, text: 'Buy all chemicals from multiple stores (never same place)', color: 'text-blue-400' },
            { icon: Wind, text: 'Build your Negative Pressure Box (DIY fume hood)', color: 'text-cyan-400' },
            { icon: Shield, text: 'Get PPE: 3M respirator (60926) + nitrile gloves + goggles', color: 'text-emerald-400' },
            { icon: FireExtinguisher, text: 'Have a Class ABC fire extinguisher within reach', color: 'text-orange-400' },
          ].map(({ icon: Ic, text, color }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-deep)', borderColor: 'var(--border-default)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <Ic size={16} className={color} />
              </div>
              <span className="text-[13px] leading-relaxed pt-1" style={{ color: 'var(--text-primary)' }}>{text}</span>
            </div>
          ))}

          <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--severity-warning-bg)', border: '1px solid var(--severity-warning-border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--severity-warning-text)' }}>
              Do NOT proceed to Chapter 2 until you have everything above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chapters 2-5: Single-step execution view ─────────────────
  return (
    <div className="flex flex-col min-h-full">
      {/* ── Top Bar: Progress + Timer ── */}
      {totalSteps > 0 && (
        <div className="shrink-0 px-6 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>
              CHAPTER {chapter} — STEP {currentStep} of {totalSteps}
            </span>
            {showTimer && (
              <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--accent-blue)' }}>
                {formatTimer(timerSeconds!)}
              </span>
            )}
          </div>
          <div className="w-full h-1 rounded-full" style={{ backgroundColor: '#151B25' }}>
            <div
              className="h-full rounded-full transition-all duration-[400ms]"
              style={{
                width: `${(currentStep / totalSteps) * 100}%`,
                background: 'var(--gradient-progress)',
                transitionTimingFunction: 'var(--ease-out-expo)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Summary + Yield (collapsed header) ── */}
      <div className="px-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <ChIcon size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{meta.title}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta.sub}</p>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <div className="text-[9px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Input</div>
              <div className="text-lg font-black text-white tabular-nums">{result.inputAmountG.toFixed(1)}<span className="text-xs font-semibold ml-0.5" style={{ color: 'var(--text-muted)' }}>g</span></div>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <div className="text-[9px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Output</div>
              <div className="text-lg font-black tabular-nums" style={{ color: 'var(--accent-green)' }}>{result.outputAmountG.toFixed(1)}<span className="text-xs font-semibold ml-0.5" style={{ color: 'var(--text-muted)' }}>g</span></div>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
              <div className="text-[9px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Yield</div>
              <div className="text-lg font-black tabular-nums" style={{ color: 'var(--accent-blue)' }}>{Math.round(result.yieldFactor * 100)}<span className="text-xs font-semibold ml-0.5" style={{ color: 'var(--text-muted)' }}>%</span></div>
            </div>
          </div>
        )}

        <div className="rounded-xl border px-4 py-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <YieldSlider
            label="Adjust yield"
            value={yieldValue}
            defaultValue={DEFAULT_YIELDS[yieldKey]}
            onChange={(v) => onYieldChange(yieldKey, v)}
          />
        </div>

        {result && result.reagents.length > 0 && (
          <>
            <div className="flex items-center justify-center">
              <ArrowDown size={16} style={{ color: 'var(--text-dim)' }} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold tracking-[1.5px] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                What You Need
              </h3>
              <ReagentTable reagents={result.reagents} chapter={chapter} />
            </div>
          </>
        )}
      </div>

      {/* ── Single Step View ── */}
      {currentProcedure && (
        <div className="flex-1 px-6 py-4">
          <div className="flex items-center justify-center my-2">
            <ArrowDown size={16} style={{ color: 'var(--text-dim)' }} />
          </div>
          <h3 className="text-[11px] font-bold tracking-[1.5px] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            Current Step
          </h3>
          <div className="contain-layout">
            <ProcedureStepComponent
              step={currentProcedure}
              isLast={true}
              isCompleted={completedSteps.has(currentProcedure.stepNumber)}
              onMarkComplete={onMarkStepComplete ? () => onMarkStepComplete(currentProcedure.stepNumber) : undefined}
            />
          </div>
        </div>
      )}

      {/* ── Bottom Navigation ── */}
      {totalSteps > 0 && onStepChange && (
        <div className="shrink-0 flex items-center justify-between px-6 pb-6 pt-2">
          <button
            onClick={() => onStepChange(currentStep - 1)}
            disabled={currentStep <= 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            style={{
              borderColor: 'var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: currentStep > 1 ? 'var(--text-muted)' : 'var(--text-dim)',
              border: '1px solid var(--border-default)',
              opacity: currentStep > 1 ? 1 : 0.35,
              cursor: currentStep > 1 ? 'pointer' : 'not-allowed',
            }}
          >
            <ChevronLeft size={14} /> Previous Step
          </button>

          <StepDots
            totalSteps={totalSteps}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={onStepChange}
          />

          {isLastStep ? (
            <button
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-emerald-500/20 bg-emerald-500/[0.08]"
              style={{ color: 'var(--accent-green)' }}
            >
              <Check size={14} /> Complete Chapter
            </button>
          ) : (
            <button
              onClick={() => onStepChange(currentStep + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.08] text-xs font-semibold cursor-pointer hover:bg-blue-500/[0.12] transition-colors"
              style={{ color: 'var(--accent-blue)' }}
            >
              Next Step <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
