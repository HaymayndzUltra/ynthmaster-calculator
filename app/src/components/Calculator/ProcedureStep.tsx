import React from 'react';
import { Eye, AlertTriangle, Wrench, ShieldAlert, Thermometer, Clock } from 'lucide-react';
import type { ProcedureStep as ProcedureStepType } from '../../types/calculator';

interface ProcedureStepProps {
  step: ProcedureStepType;
  isLast?: boolean;
}

const SEV = {
  info:      { dot: 'bg-blue-500', ring: 'ring-blue-500/20', border: 'border-[#141920]' },
  warning:   { dot: 'bg-amber-500', ring: 'ring-amber-500/20', border: 'border-amber-500/20' },
  critical:  { dot: 'bg-orange-500', ring: 'ring-orange-500/20', border: 'border-orange-500/20' },
  emergency: { dot: 'bg-red-500 animate-pulse', ring: 'ring-red-500/30', border: 'border-red-500/30' },
};

export const ProcedureStepComponent: React.FC<ProcedureStepProps> = ({ step, isLast }) => {
  const severity = (step.severity ?? 'info') as keyof typeof SEV;
  const sev = SEV[severity] ?? SEV.info;

  return (
    <div className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className={`w-3 h-3 rounded-full ${sev.dot} ring-4 ${sev.ring}`} />
        {!isLast && <div className="w-px flex-1 bg-[#151B25] mt-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        {/* Header badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 bg-[#111620] px-2 py-0.5 rounded-md">
            STEP {step.stepNumber}
          </span>
          {step.tempTarget != null && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Thermometer size={10} /> {step.tempTarget}°C
            </span>
          )}
          {step.tempDanger != null && (
            <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold">
              <ShieldAlert size={10} /> &gt;{step.tempDanger}°C DANGER
            </span>
          )}
          {step.durationMin != null && (
            <span className="flex items-center gap-1 text-[10px] text-slate-600">
              <Clock size={10} /> {step.durationMin}–{step.durationMax ?? '?'} min
            </span>
          )}
        </div>

        {/* Instruction text */}
        <p className="text-[13px] leading-relaxed text-slate-300 mb-3">
          {step.instruction}
        </p>

        {/* Info cards */}
        <div className="space-y-2">
          {/* Visual cue */}
          {step.visualCue && (
            <div className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10">
              <Eye size={14} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-wider mb-0.5">Look for</div>
                <div className="text-[12px] text-emerald-300/80 leading-relaxed">{step.visualCue}</div>
              </div>
            </div>
          )}

          {/* Failure mode */}
          {step.failureMode && (
            <div className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg bg-amber-500/[0.03] border border-amber-500/10">
              <AlertTriangle size={14} className="text-amber-500/70 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-amber-500/60 uppercase tracking-wider mb-0.5">If this goes wrong</div>
                <div className="text-[12px] text-amber-400/70 leading-relaxed">{step.failureMode}</div>
                {step.failureFix && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <Wrench size={11} className="text-amber-500/50 mt-0.5 shrink-0" />
                    <span className="text-[12px] text-amber-300/60">{step.failureFix}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency */}
          {step.emergencyAction && (
            <div className="flex gap-2.5 items-start px-3.5 py-3 rounded-lg bg-red-500/[0.06] border-2 border-red-500/20">
              <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider mb-0.5">EMERGENCY ACTION</div>
                <div className="text-[13px] text-red-300 font-semibold leading-relaxed">{step.emergencyAction}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
