import React from 'react';
import { Package, FlaskConical, TestTubes, Flame, Gem, ChevronLeft, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import type { YieldConfig } from '../../types/calculator';
import type { UseCalculatorReturn } from '../../types/calculator';
import { TargetInput } from './TargetInput';
import { ChapterView } from './ChapterView';

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
  } = calculator;

  const currentChapterResult = results
    ? results.chapters[`ch${activeChapter}` as keyof typeof results.chapters] ?? null
    : null;

  const yieldKey = YIELD_KEY_MAP[activeChapter];
  const yieldValue = yieldKey ? yields[yieldKey] : 0;

  return (
    <div className="flex h-full bg-[#06080C]">
      {/* ── Left sidebar: Pipeline Nav ────────────────────── */}
      <div className="w-[200px] shrink-0 border-r border-[#111620] flex flex-col bg-[#080B10]">
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-[#111620]">
          <div className="text-[10px] font-bold tracking-[2px] uppercase text-slate-600">Project Alpha</div>
          <div className="text-sm font-bold text-white mt-0.5">Calculator</div>
        </div>

        {/* Chapter nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {CHAPTERS.map((ch) => {
            const isActive = activeChapter === ch.num;
            const isPast = ch.num < activeChapter;
            const ChIcon = ch.Icon;

            return (
              <button
                key={ch.num}
                onClick={() => setActiveChapter(ch.num)}
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
                  <div className="text-[9px] text-slate-700">
                    Ch {ch.num}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* F12 hint */}
        <div className="px-4 py-3 border-t border-[#111620]">
          <div className="text-[9px] text-slate-700 text-center">
            Press <kbd className="px-1 py-0.5 bg-[#111620] rounded text-slate-500 text-[8px] font-mono">F12</kbd> for panic mode
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Target input */}
        <div className="shrink-0 border-b border-[#111620]">
          <TargetInput value={targetG} onChange={setTargetG} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto">
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
              <div className="text-center py-16 text-slate-600 text-sm">
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
              />
            )}

            {/* Bottom navigation */}
            <div className="flex justify-between items-center px-6 pb-8 pt-2">
              {activeChapter > 1 ? (
                <button
                  onClick={() => setActiveChapter(activeChapter - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#141920] bg-[#0B0F15] text-slate-500 text-xs font-medium cursor-pointer hover:border-[#1E2530] hover:text-slate-400 transition-colors"
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
        </div>
      </div>
    </div>
  );
};
