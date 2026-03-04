import React from 'react';
import { Package, FlaskConical, Flame, Gem, TestTubes, ArrowDown, ShoppingCart, Shield, Wind, FireExtinguisher } from 'lucide-react';
import type { ChapterResult, ProcedureStep as ProcedureStepType, FailureMode, YieldConfig } from '../../types/calculator';
import { DEFAULT_YIELDS } from '../../types/calculator';
import { YieldSlider } from './YieldSlider';
import { ReagentTable } from './ReagentTable';
import { ProcedureStepComponent } from './ProcedureStep';

interface ChapterViewProps {
  chapter: number;
  result: ChapterResult | null;
  procedures: ProcedureStepType[];
  failureModes: FailureMode[];
  yieldValue: number;
  yieldKey: keyof YieldConfig;
  onYieldChange: (chapter: keyof YieldConfig, value: number) => void;
}

const CH_META: Record<number, { title: string; sub: string; Icon: typeof Package }> = {
  1: { title: 'Logistics & Sourcing', sub: 'Gather all materials before starting', Icon: Package },
  2: { title: 'P2P Synthesis', sub: 'Dry distillation — create the precursor oil', Icon: FlaskConical },
  3: { title: 'Methylamine Generation', sub: 'Hexamine hydrolysis — create the reagent', Icon: TestTubes },
  4: { title: 'The Reaction', sub: 'Al/Hg reductive amination — the main event', Icon: Flame },
  5: { title: 'Workup & Crystallization', sub: 'Extract, gas, crystallize — finish the product', Icon: Gem },
};

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter, result, procedures, failureModes, yieldValue, yieldKey, onYieldChange,
}) => {
  const meta = CH_META[chapter] ?? { title: `Chapter ${chapter}`, sub: '', Icon: Package };
  const ChIcon = meta.Icon;

  // ─── Chapter 1: Static checklist ──────────────────────────────
  if (chapter === 1) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{meta.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{meta.sub}</p>
        </div>

        {/* Checklist */}
        <div className="bg-[#0B0F15] rounded-2xl border border-[#141920] p-6 space-y-4">
          <p className="text-sm text-slate-400 leading-relaxed">
            This chapter has no calculations. Complete this checklist before starting any chemistry.
          </p>

          {[
            { icon: ShoppingCart, text: 'Buy all chemicals from multiple stores (never same place)', color: 'text-blue-400' },
            { icon: Wind, text: 'Build your Negative Pressure Box (DIY fume hood)', color: 'text-cyan-400' },
            { icon: Shield, text: 'Get PPE: 3M respirator (60926) + nitrile gloves + goggles', color: 'text-emerald-400' },
            { icon: FireExtinguisher, text: 'Have a Class ABC fire extinguisher within reach', color: 'text-orange-400' },
          ].map(({ icon: Ic, text, color }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#080B10] border border-[#111620]">
              <div className="w-8 h-8 rounded-lg bg-[#111620] flex items-center justify-center shrink-0">
                <Ic size={16} className={color} />
              </div>
              <span className="text-[13px] text-slate-300 leading-relaxed pt-1">{text}</span>
            </div>
          ))}

          <div className="mt-4 p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
            <p className="text-xs text-amber-400/80 font-semibold">
              Do NOT proceed to Chapter 2 until you have everything above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Chapters 2-5: Calculated view ────────────────────────────
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <ChIcon size={28} className="text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{meta.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{meta.sub}</p>
      </div>

      {/* Summary stats */}
      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#0B0F15] rounded-xl border border-[#141920] p-4 text-center">
            <div className="text-[9px] font-semibold tracking-widest uppercase text-slate-600 mb-1">Input Needed</div>
            <div className="text-2xl font-black text-white tabular-nums">{result.inputAmountG.toFixed(1)}<span className="text-sm font-semibold text-slate-500 ml-0.5">g</span></div>
          </div>
          <div className="bg-[#0B0F15] rounded-xl border border-[#141920] p-4 text-center">
            <div className="text-[9px] font-semibold tracking-widest uppercase text-slate-600 mb-1">Expected Output</div>
            <div className="text-2xl font-black text-emerald-400 tabular-nums">{result.outputAmountG.toFixed(1)}<span className="text-sm font-semibold text-emerald-600 ml-0.5">g</span></div>
          </div>
          <div className="bg-[#0B0F15] rounded-xl border border-[#141920] p-4 text-center">
            <div className="text-[9px] font-semibold tracking-widest uppercase text-slate-600 mb-1">Your Yield</div>
            <div className="text-2xl font-black text-blue-400 tabular-nums">{Math.round(result.yieldFactor * 100)}<span className="text-sm font-semibold text-blue-600 ml-0.5">%</span></div>
          </div>
        </div>
      )}

      {/* Yield slider */}
      <div className="bg-[#0B0F15] rounded-xl border border-[#141920] px-4 py-3">
        <YieldSlider
          label="Adjust yield"
          value={yieldValue}
          defaultValue={DEFAULT_YIELDS[yieldKey]}
          onChange={(v) => onYieldChange(yieldKey, v)}
        />
      </div>

      {/* Flow indicator */}
      {result && result.reagents.length > 0 && (
        <div className="flex items-center justify-center">
          <ArrowDown size={16} className="text-slate-700" />
        </div>
      )}

      {/* Reagents */}
      {result && result.reagents.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-3">
            What You Need
          </h3>
          <ReagentTable reagents={result.reagents} chapter={chapter} />
        </div>
      )}

      {/* Procedures */}
      {procedures.length > 0 && (
        <div>
          <div className="flex items-center justify-center my-2">
            <ArrowDown size={16} className="text-slate-700" />
          </div>
          <h3 className="text-[11px] font-bold tracking-[1.5px] uppercase text-slate-600 mb-4">
            Step by Step — {procedures.length} steps
          </h3>
          <div className="pl-1">
            {procedures.map((step, i) => (
              <ProcedureStepComponent
                key={`${step.processId}-${step.stepNumber}`}
                step={step}
                isLast={i === procedures.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
