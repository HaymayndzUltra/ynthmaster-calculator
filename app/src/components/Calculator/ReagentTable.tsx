import React from 'react';
import { Beaker, Star, Lock } from 'lucide-react';
import type { ScaledReagent } from '../../types/calculator';

interface ReagentTableProps {
  reagents: ScaledReagent[];
  chapter: number;
}

export const ReagentTable: React.FC<ReagentTableProps> = ({ reagents, chapter }) => {
  const chapterReagents = reagents.filter((r) => r.chapter === chapter);

  if (chapterReagents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600 text-sm">
        <Beaker size={24} className="mx-auto mb-2 opacity-30" />
        No reagent data for this chapter
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {chapterReagents.map((r) => {
        const amount = r.massGrams != null
          ? `${r.massGrams.toFixed(1)}g`
          : r.volumeML != null
            ? `${r.volumeML.toFixed(1)} mL`
            : '—';

        const isFixed = r.ratioType === 'fixed_excess';

        return (
          <div
            key={`${r.internalId}-${r.notes?.slice(0, 10) ?? ''}`}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-colors
              ${r.isBaseline
                ? 'bg-blue-500/[0.04] border-blue-500/20'
                : 'bg-[#0B0F15] border-[#141920] hover:border-[#1E2530]'
              }
            `}
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              r.isBaseline ? 'bg-blue-500/10' : isFixed ? 'bg-slate-800/50' : 'bg-[#111620]'
            }`}>
              {r.isBaseline ? (
                <Star size={16} className="text-blue-400" />
              ) : isFixed ? (
                <Lock size={14} className="text-slate-600" />
              ) : (
                <Beaker size={15} className="text-slate-500" />
              )}
            </div>

            {/* Name + notes */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[14px] font-semibold ${
                  r.isBaseline ? 'text-blue-300' : 'text-slate-200'
                }`}>
                  {r.alias}
                </span>
                {r.isBaseline && (
                  <span className="text-[8px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded tracking-wider">
                    PRIMARY
                  </span>
                )}
                {isFixed && (
                  <span className="text-[8px] font-semibold text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded">
                    FIXED
                  </span>
                )}
              </div>
              {r.notes && (
                <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                  {r.notes}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
              <span className={`font-bold tabular-nums ${
                isFixed ? 'text-slate-500 text-[15px]' : 'text-white text-xl'
              }`}>
                {amount}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
