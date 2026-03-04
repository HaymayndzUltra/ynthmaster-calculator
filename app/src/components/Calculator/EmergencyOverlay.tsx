import React, { useRef, useState } from 'react';
import { AlertTriangle, X, Shield } from 'lucide-react';
import type { FailureMode } from '../../types/calculator';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface EmergencyOverlayProps {
  failureModes: FailureMode[];
  activeChapter: number;
  onClose: () => void;
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({
  failureModes,
  activeChapter,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);

  useFocusTrap(overlayRef, {
    isActive: true,
    onEscape: onClose,
  });

  // Entrance animation trigger
  React.useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Filter emergency-level failure modes for current chapter
  const emergencyModes = failureModes.filter(
    (fm) => fm.severity === 'emergency' || fm.severity === 'critical'
  );

  const entranceStyle = isReducedMotion
    ? { opacity: 1 }
    : {
        opacity: hasEntered ? 1 : 0,
        transition: 'opacity 400ms var(--ease-out-expo)',
      };

  const contentStyle = isReducedMotion
    ? {}
    : {
        transform: hasEntered ? 'scale(1)' : 'scale(0.95)',
        opacity: hasEntered ? 1 : 0,
        transition: 'transform 400ms var(--ease-out-expo), opacity 400ms var(--ease-out-expo)',
      };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-start justify-center overflow-auto blur-overlay"
      style={{
        zIndex: 'var(--z-overlay)',
        background: 'var(--gradient-emergency)',
        ...entranceStyle,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Emergency procedures"
    >
      <div
        className="w-full max-w-[640px] mx-auto px-6 py-8"
        style={contentStyle}
      >
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(229,72,77,0.08)',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(229,72,77,0.15)',
            }}
            aria-label="Close emergency procedures — I'm OK, return to procedure"
          >
            <X size={14} />
            I'm OK — Return to procedure
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 animate-emergency-pulse border-2 border-red-500/20">
            <AlertTriangle size={32} style={{ color: 'var(--accent-red)' }} />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--accent-red)' }}
          >
            🚨 EMERGENCY PROCEDURES
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Chapter {activeChapter} — Follow these steps immediately
          </p>
        </div>

        {/* General emergency actions */}
        <div
          className="rounded-xl border p-5 mb-6"
          style={{
            backgroundColor: 'rgba(229,72,77,0.04)',
            borderColor: 'rgba(229,72,77,0.15)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} style={{ color: 'var(--accent-red)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--accent-red)' }}>
              IMMEDIATE ACTIONS
            </h2>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            <li className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              <strong>STOP</strong> — Remove all heat sources immediately
            </li>
            <li className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              <strong>VENTILATE</strong> — Open windows, turn on exhaust
            </li>
            <li className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              <strong>DISTANCE</strong> — Step back from the reaction
            </li>
            <li className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              <strong>ASSESS</strong> — Read the specific emergency below
            </li>
          </ol>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(229,72,77,0.06)' }}>
            <span className="text-[11px] font-bold" style={{ color: 'var(--accent-red)' }}>
              PPE REMINDER: Respirator ON, gloves ON, goggles ON at all times
            </span>
          </div>
        </div>

        {/* Chapter-specific emergency/critical failure modes */}
        {emergencyModes.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Chapter {activeChapter} Specific Emergencies
            </h2>
            {emergencyModes.map((fm) => (
              <div
                key={fm.id}
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: fm.severity === 'emergency'
                    ? 'rgba(229,72,77,0.04)'
                    : 'rgba(249,115,22,0.04)',
                  borderColor: fm.severity === 'emergency'
                    ? 'rgba(229,72,77,0.15)'
                    : 'rgba(249,115,22,0.15)',
                }}
              >
                {/* Trigger */}
                <div className="flex items-start gap-2 mb-2">
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{
                      backgroundColor: fm.severity === 'emergency'
                        ? 'var(--severity-emergency-bg)'
                        : 'var(--severity-critical-bg)',
                      color: fm.severity === 'emergency'
                        ? 'var(--severity-emergency-text)'
                        : 'var(--severity-critical-text)',
                    }}
                  >
                    {fm.severity}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {fm.trigger}
                  </span>
                </div>

                {/* Symptom */}
                <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <strong>Symptom:</strong> {fm.symptom}
                </p>

                {/* Protocol */}
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--bg-deep)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-red)' }}>
                    What to do
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {fm.protocol}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border p-6 text-center"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No specific emergency procedures documented for this chapter's current step.
              Follow the general emergency actions above.
            </p>
          </div>
        )}

        {/* Bottom close */}
        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            I'm OK — Return to procedure
          </button>
        </div>
      </div>
    </div>
  );
};
