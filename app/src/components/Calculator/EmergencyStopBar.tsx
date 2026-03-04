import React, { useState } from 'react';
import { CircleStop } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface EmergencyStopBarProps {
  onEmergencyClick: () => void;
}

export const EmergencyStopBar: React.FC<EmergencyStopBarProps> = ({ onEmergencyClick }) => {
  const isReducedMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);

  // Trigger entrance animation on mount
  React.useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const entranceStyle = isReducedMotion
    ? {}
    : {
        transform: hasEntered ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms var(--ease-out-expo)',
      };

  return (
    <div
      className="sticky bottom-0 left-0 right-0 border-t"
      style={{
        backgroundColor: 'rgba(229,72,77,0.08)',
        borderColor: 'rgba(229,72,77,0.20)',
        zIndex: 'var(--z-sticky)',
        ...entranceStyle,
      }}
      role="alert"
      aria-live="assertive"
    >
      <button
        onClick={onEmergencyClick}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 cursor-pointer transition-colors"
        style={{ color: 'var(--accent-red)' }}
        aria-label="Emergency — Click if something is wrong"
      >
        <CircleStop
          size={18}
          className={!isReducedMotion ? 'animate-pulse' : ''}
          style={{ color: 'var(--accent-red)' }}
        />
        <span className="text-[12px] font-bold uppercase tracking-wider">
          Emergency — Click if something is wrong
        </span>
      </button>
    </div>
  );
};
