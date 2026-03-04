import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Loader2 } from 'lucide-react';
import type { UseCalculatorReturn } from '../../types/calculator';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface OnboardingScreenProps {
  calculator: UseCalculatorReturn;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ calculator }) => {
  const { targetG, setTargetG, setScreenMode, isLoading } = calculator;
  const isReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid = targetG >= 1 && targetG <= 500;
  const isSmallBatch = targetG > 0 && targetG < 5;
  const isLargeBatch = targetG > 200 && targetG <= 500;

  useEffect(() => {
    inputRef.current?.focus();
    const t = setTimeout(() => setHasAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    submitTimeoutRef.current = setTimeout(() => {
      setScreenMode('checklist');
      setIsSubmitting(false);
    }, 150);
  }, [isValid, isSubmitting, setScreenMode]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, []);

  const show = isReducedMotion || hasAnimated;
  const anim = (delayMs: number) =>
    isReducedMotion
      ? {}
      : {
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity 350ms var(--ease-out-expo) ${delayMs}ms, transform 350ms var(--ease-out-expo) ${delayMs}ms`,
        };

  return (
    <div className="flex items-center justify-center min-h-full px-4" style={{ background: 'var(--gradient-onboard)' }}>
      <div
        className="w-full max-w-[520px] mx-auto rounded-2xl border text-center
          p-12 max-lg:p-8"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* App icon */}
        <div style={{ ...anim(100), display: 'flex', justifyContent: 'center' }}>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Target size={32} className="text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <div style={anim(200)}>
          <h1 className="text-2xl max-md:text-xl font-bold text-white mt-6">Project Alpha</h1>
          <p className="text-xs font-medium mt-1" style={{ color: 'var(--accent-blue)' }}>Batch Calculator</p>
        </div>

        {/* Main question */}
        <h2 className="text-xl max-md:text-base font-bold text-white mt-6" style={anim(350)}>
          Gaano karaming produkto ang gagawin mo?
        </h2>

        {/* Giant input */}
        <div className="mt-6 relative" style={anim(450)}>
          <input
            ref={inputRef}
            type="number"
            value={targetG}
            onChange={(e) => setTargetG(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') setTargetG(25);
            }}
            min={1}
            max={500}
            className="w-full text-center bg-[#0C1017] border-2 rounded-2xl px-6 py-4 text-white outline-none transition-all
              text-[42px] max-md:text-[36px] font-[800]"
            style={{
              lineHeight: 'var(--lh-display)',
              borderColor: isValid ? 'var(--border-focus)' : 'var(--accent-red)',
            }}
            aria-label="Target yield in grams"
            aria-invalid={!isValid}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-base font-semibold" style={{ color: 'var(--accent-blue)' }}>grams</span>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)', ...anim(450) }}>final crystal output</p>

        {/* Boundary warnings */}
        {isSmallBatch && (
          <p className="text-xs mt-2" style={{ color: 'var(--accent-amber)' }}>
            Very small batch — losses may be significant below 5g.
          </p>
        )}
        {isLargeBatch && (
          <p className="text-xs mt-2" style={{ color: 'var(--accent-amber)' }}>
            Large batch — ensure you have adequate equipment and ventilation.
          </p>
        )}

        {/* Helper tip */}
        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)', ...anim(550) }}>
          Start with 25–100g for your first batch. You can adjust this anytime.
        </p>

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          aria-busy={isSubmitting || isLoading}
          className="w-full mt-6 rounded-xl text-white font-semibold text-sm transition-all duration-150
            h-14 max-md:h-12
            hover:enabled:-translate-y-px"
          style={{
            backgroundColor: 'var(--accent-blue)',
            opacity: isValid && !isSubmitting ? 1 : 0.35,
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            boxShadow: isValid ? 'var(--shadow-glow-blue)' : 'none',
            ...anim(650),
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Calculating...
            </span>
          ) : (
            'Calculate My Ingredients →'
          )}
        </button>

        {/* Secondary text */}
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)', ...anim(700) }}>
          Lahat ng quantities ay automatically scaled. Pwede mong baguhin ang yield factors sa bawat chapter.
        </p>
      </div>
    </div>
  );
};
