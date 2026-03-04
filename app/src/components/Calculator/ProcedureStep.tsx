import React, { useState } from 'react';
import { Eye, AlertTriangle, Wrench, ShieldAlert, Thermometer, Clock } from 'lucide-react';
import type { ProcedureStep as ProcedureStepType } from '../../types/calculator';
import { StepImage } from './StepImage';
import { ProTip } from './ProTip';

interface ProcedureStepProps {
  step: ProcedureStepType;
  isLast?: boolean;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
}

const SEV = {
  info:      { dot: 'bg-blue-500', ring: 'ring-blue-500/20', border: 'border-[#141920]' },
  warning:   { dot: 'bg-amber-500', ring: 'ring-amber-500/20', border: 'border-amber-500/20' },
  critical:  { dot: 'bg-orange-500', ring: 'ring-orange-500/20', border: 'border-orange-500/20' },
  emergency: { dot: 'bg-red-500 animate-pulse', ring: 'ring-red-500/30', border: 'border-red-500/30' },
};

export const ProcedureStepComponent: React.FC<ProcedureStepProps> = ({
  step, isLast, isCompleted = false, onMarkComplete,
}) => {
  const severity = (step.severity ?? 'info') as keyof typeof SEV;
  const sev = SEV[severity] ?? SEV.info;
  const [note, setNote] = useState('');

  return (
    <div className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className={`w-3 h-3 rounded-full ${sev.dot} ring-4 ${sev.ring}`} />
        {!isLast && <div className="w-px flex-1 bg-[#151B25] mt-1" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        {/* Header badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-elevated)' }}>
            STEP {step.stepNumber}
          </span>
          {step.tempTarget != null && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Thermometer size={10} /> {step.tempTarget}°C
            </span>
          )}
          {step.tempDanger != null && (
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'var(--accent-red)' }}>
              <ShieldAlert size={10} /> &gt;{step.tempDanger}°C DANGER
            </span>
          )}
          {step.durationMin != null && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <Clock size={10} /> {step.durationMin}–{step.durationMax ?? '?'} min
            </span>
          )}
          {step.severity && step.severity !== 'info' && (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `var(--severity-${step.severity}-bg)`,
                color: `var(--severity-${step.severity}-text)`,
              }}
              aria-label={`Severity: ${step.severity}`}
            >
              {step.severity}
            </span>
          )}
        </div>

        {/* Instruction text */}
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
          {step.instruction}
        </p>

        {/* Reference image */}
        {step.imagePath && (
          <StepImage
            imagePath={step.imagePath}
            caption="What this should look like"
          />
        )}

        {/* Info cards */}
        <div className="space-y-2 mt-3">
          {/* Visual cue */}
          {step.visualCue && (
            <div className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10">
              <Eye size={14} className="text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold text-emerald-500/70 uppercase tracking-wider mb-0.5">What you should see</div>
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
            <div className="flex gap-2.5 items-start px-3.5 py-3 rounded-lg bg-red-500/[0.06] border-2 border-red-500/20"
              role="alert" aria-live="assertive">
              <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider mb-0.5">EMERGENCY ACTION</div>
                <div className="text-[13px] text-red-300 font-semibold leading-relaxed">{step.emergencyAction}</div>
              </div>
            </div>
          )}

          {/* Pro tip */}
          {step.proTip && <ProTip content={step.proTip} />}
        </div>

        {/* Step completion checkbox */}
        {onMarkComplete && (
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onMarkComplete}
              className="flex items-center gap-2 text-xs cursor-pointer"
              style={{ color: isCompleted ? 'var(--accent-green)' : 'var(--text-muted)' }}
              role="checkbox"
              aria-checked={isCompleted}
            >
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-[#1E2530]'
              }`}>
                {isCompleted && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7l3 3 5-6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="20"
                      strokeDashoffset="0"
                      className="transition-all duration-300"
                      style={{ transitionTimingFunction: 'var(--ease-spring)' }}
                    />
                  </svg>
                )}
              </div>
              I completed this step and the visual cues match
            </button>
          </div>
        )}

        {/* Optional ephemeral note */}
        {onMarkComplete && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            rows={2}
            className="mt-2 w-full text-xs rounded-lg px-3 py-2 outline-none resize-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          />
        )}
      </div>
    </div>
  );
};
