import React from 'react';
import { Target } from 'lucide-react';
import type { UseCalculatorReturn } from '../../types/calculator';

interface OnboardingScreenProps {
  calculator: UseCalculatorReturn;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ calculator }) => {
  const { targetG, setTargetG, setScreenMode } = calculator;

  const handleSubmit = () => {
    if (targetG >= 1 && targetG <= 500) {
      setScreenMode('checklist');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full" style={{ background: 'var(--gradient-onboard)' }}>
      <div
        className="w-full max-w-[520px] mx-auto rounded-2xl border p-12 text-center"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Target size={32} className="text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Project Alpha</h1>
        <p className="text-xs font-medium text-blue-400 mt-1">Batch Calculator</p>
        <h2 className="text-xl font-bold text-white mt-6">Gaano karaming produkto ang gagawin mo?</h2>

        <div className="mt-6 relative">
          <input
            type="number"
            value={targetG}
            onChange={(e) => setTargetG(Number(e.target.value))}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') setTargetG(25); }}
            min={1}
            max={500}
            autoFocus
            className="w-full text-center bg-[#0C1017] border-2 rounded-2xl px-6 py-4 text-white outline-none transition-all"
            style={{
              fontSize: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 'var(--lh-display)',
              borderColor: targetG >= 1 && targetG <= 500 ? 'var(--border-focus)' : 'var(--accent-red)',
            }}
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-base font-semibold text-blue-400">grams</span>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>final crystal output</p>

        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Start with 25–100g for your first batch. You can adjust this anytime.
        </p>

        <button
          onClick={handleSubmit}
          disabled={targetG < 1 || targetG > 500}
          className="w-full mt-6 h-14 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all duration-150"
          style={{
            backgroundColor: 'var(--accent-blue)',
            opacity: targetG >= 1 && targetG <= 500 ? 1 : 0.35,
            cursor: targetG >= 1 && targetG <= 500 ? 'pointer' : 'not-allowed',
          }}
        >
          Calculate My Ingredients →
        </button>

        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          Lahat ng quantities ay automatically scaled. Pwede mong baguhin ang yield factors sa bawat chapter.
        </p>
      </div>
    </div>
  );
};
