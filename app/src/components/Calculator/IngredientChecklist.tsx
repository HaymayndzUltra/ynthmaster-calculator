import React from 'react';
import { FlaskConical, ChevronLeft } from 'lucide-react';
import type { UseCalculatorReturn } from '../../types/calculator';

interface IngredientChecklistProps {
  calculator: UseCalculatorReturn;
}

export const IngredientChecklist: React.FC<IngredientChecklistProps> = ({ calculator }) => {
  const { results, setScreenMode, checkedReagents, toggleReagentCheck } = calculator;

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-4">
        <FlaskConical size={48} className="text-slate-600" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enter your target yield first</p>
        <button
          onClick={() => setScreenMode('onboarding')}
          className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)' }}
        >
          ← Back to Target Input
        </button>
      </div>
    );
  }

  const allReagents = results.allReagents;
  const checkedCount = checkedReagents.size;
  const totalCount = allReagents.length;
  const isAllChecked = checkedCount >= totalCount;

  const chapterGroups = [
    { chapter: 2, name: 'P2P Synthesis' },
    { chapter: 3, name: 'Methylamine Generation' },
    { chapter: 4, name: 'The Reaction' },
    { chapter: 5, name: 'Workup & Crystallization' },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => setScreenMode('onboarding')}
          className="flex items-center gap-1 text-xs mb-3 cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} /> Target: {results.targetFinalCrystalG}g
        </button>
        <h2 className="text-xl font-bold text-white">What You Need</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          For {results.targetFinalCrystalG}g final product target
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="text-[9px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Reagents</div>
          <div className="text-2xl font-black text-white tabular-nums">{totalCount}</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="text-[9px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Chapters</div>
          <div className="text-2xl font-black tabular-nums" style={{ color: 'var(--accent-blue)' }}>5</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="text-[9px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Est. Cost</div>
          <div className="text-2xl font-black tabular-nums" style={{ color: 'var(--accent-green)' }}>₱{results.targetFinalCrystalG <= 50 ? '2-4k' : '5-10k'}</div>
        </div>
      </div>

      {/* Chapter groups */}
      {chapterGroups.map((group) => {
        const reagents = allReagents.filter((r) => r.chapter === group.chapter);
        const groupChecked = reagents.filter((r) => checkedReagents.has(r.internalId)).length;

        return (
          <div key={group.chapter} className="rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-sm font-semibold text-white">Chapter {group.chapter} — {group.name}</h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{
                backgroundColor: groupChecked === reagents.length ? 'rgba(63,185,80,0.1)' : 'rgba(138,149,168,0.1)',
                color: groupChecked === reagents.length ? 'var(--accent-green)' : 'var(--text-secondary)',
              }}>
                {groupChecked}/{reagents.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {reagents.map((reagent) => {
                const isChecked = checkedReagents.has(reagent.internalId);
                const amount = reagent.massGrams != null
                  ? `${reagent.massGrams.toFixed(1)}g`
                  : reagent.volumeML != null
                    ? `${reagent.volumeML.toFixed(1)}mL`
                    : reagent.notes ?? '—';

                return (
                  <div
                    key={reagent.internalId}
                    onClick={() => toggleReagentCheck(reagent.internalId)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
                    style={{ backgroundColor: isChecked ? 'rgba(63,185,80,0.02)' : 'transparent' }}
                    role="checkbox"
                    aria-checked={isChecked}
                    aria-label={`${reagent.realName} — ${amount}`}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-[#1E2530]'
                    }`}>
                      {isChecked && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{reagent.realName}</div>
                      <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{reagent.internalId}</div>
                    </div>
                    <div className="text-xl font-bold text-white tabular-nums mono shrink-0">
                      {amount}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Sticky footer */}
      <div className="sticky bottom-0 py-4 px-4 -mx-6 mt-6 flex items-center justify-between gap-4"
        style={{ backgroundColor: 'rgba(6,8,12,0.95)', backdropFilter: 'blur(8px)' }}>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {checkedCount} of {totalCount} items ready
        </span>
        <button
          onClick={() => {
            calculator.setScreenMode('execution');
            calculator.setActiveChapter(2);
          }}
          disabled={!isAllChecked}
          className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-150"
          style={{
            backgroundColor: 'var(--accent-blue)',
            opacity: isAllChecked ? 1 : 0.35,
            cursor: isAllChecked ? 'pointer' : 'not-allowed',
          }}
        >
          Lahat ay handa na → Start Chapter 2
        </button>
      </div>
    </div>
  );
};
