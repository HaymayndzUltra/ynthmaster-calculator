import React, { useState, useRef, useEffect } from 'react';
import { Thermometer, ChevronDown, ChevronUp } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TemperatureMonitorProps {
  tempTarget: number | null;
  tempDanger: number | null;
  activeChapter: number;
  screenMode: string;
}

type TempStatus = 'cold' | 'safe' | 'caution' | 'danger';

function getStatus(target: number | null, danger: number | null): TempStatus {
  if (target == null) return 'safe';
  if (danger != null && target >= danger) return 'danger';
  if (danger != null && target >= danger * 0.85) return 'caution';
  if (target < 20) return 'cold';
  return 'safe';
}

const STATUS_CONFIG: Record<TempStatus, { label: string; color: string; bg: string; border: string; glow: string }> = {
  cold: {
    label: 'TOO COLD',
    color: 'var(--accent-blue)',
    bg: 'rgba(76,158,255,0.06)',
    border: 'rgba(76,158,255,0.2)',
    glow: '',
  },
  safe: {
    label: 'SAFE',
    color: 'var(--accent-green)',
    bg: 'rgba(63,185,80,0.06)',
    border: 'rgba(63,185,80,0.2)',
    glow: '',
  },
  caution: {
    label: 'CAUTION',
    color: 'var(--accent-amber)',
    bg: 'rgba(212,160,23,0.06)',
    border: 'rgba(212,160,23,0.2)',
    glow: '',
  },
  danger: {
    label: 'DANGER',
    color: 'var(--accent-red)',
    bg: 'rgba(229,72,77,0.08)',
    border: 'rgba(229,72,77,0.3)',
    glow: 'var(--shadow-glow-red)',
  },
};

export const TemperatureMonitor: React.FC<TemperatureMonitorProps> = ({
  tempTarget,
  tempDanger,
  activeChapter,
  screenMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  const { position, isDragging, handleMouseDown } = useDraggable(widgetRef, {
    resetKey: `${screenMode}-${activeChapter}`,
  });

  const status = getStatus(tempTarget, tempDanger);
  const cfg = STATUS_CONFIG[status];

  // Collapse on scroll >200px
  useEffect(() => {
    const scrollContainer = document.getElementById('main-content');
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (scrollContainer.scrollTop > 200 && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [isCollapsed]);

  // ARIA: announce status changes every 30s (not every render)
  const [announcedStatus, setAnnouncedStatus] = useState(status);
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncedStatus(status);
    }, 30000);
    return () => clearInterval(interval);
  }, [status]);

  const progressPercent = tempTarget != null && tempDanger != null && tempDanger > 0
    ? Math.min(100, Math.max(0, (tempTarget / tempDanger) * 100))
    : 50;

  const transitionStyle = isReducedMotion ? {} : {
    transition: `width 250ms var(--ease-out-expo), opacity 250ms var(--ease-out-expo)`,
  };

  return (
    <div
      ref={widgetRef}
      className="blur-widget rounded-xl border"
      style={{
        width: isCollapsed ? '48px' : '220px',
        borderColor: cfg.border,
        boxShadow: status === 'danger' ? cfg.glow : 'var(--shadow-md)',
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : undefined,
        ...transitionStyle,
        overflow: 'hidden',
      }}
      role="status"
      aria-live="polite"
      aria-label="Temperature range indicator"
      aria-atomic="true"
    >
      {/* Drag handle / header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Thermometer
            size={16}
            style={{ color: cfg.color }}
            className={status === 'danger' && !isReducedMotion ? 'animate-pulse' : ''}
          />
          {!isCollapsed && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
            className="p-0.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Collapse temperature monitor"
          >
            <ChevronUp size={12} />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {!isCollapsed && (
        <div className="px-3 pb-3 space-y-2" style={{ opacity: 1 }}>
          {/* Target range */}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target</span>
            <span
              className="text-sm font-bold mono tabular-nums"
              style={{ color: cfg.color }}
            >
              {tempTarget != null ? `${tempTarget}°C` : '—'}
            </span>
          </div>

          {/* Danger threshold */}
          {tempDanger != null && (
            <div className="flex items-baseline justify-between">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Danger</span>
              <span
                className="text-[11px] font-semibold mono tabular-nums"
                style={{ color: 'var(--accent-red)' }}
              >
                &gt;{tempDanger}°C
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                background: status === 'danger' || status === 'caution'
                  ? 'var(--gradient-temp-danger)'
                  : 'var(--gradient-temp-safe)',
                transition: isReducedMotion ? 'none' : 'width 300ms var(--ease-out-expo)',
              }}
            />
          </div>

          {/* Status text */}
          <div
            className="text-[9px] font-medium text-center uppercase tracking-widest"
            style={{ color: cfg.color }}
          >
            {status === 'safe' && 'Within safe range'}
            {status === 'cold' && 'Below operating temperature'}
            {status === 'caution' && 'Approaching danger zone'}
            {status === 'danger' && 'THERMAL RUNAWAY RISK'}
          </div>
        </div>
      )}

      {/* Collapsed: expand on click */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full flex justify-center pb-2"
          aria-label="Expand temperature monitor"
        >
          <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}

      {/* Screen reader announcement (updates every 30s) */}
      <div className="sr-only" aria-live="polite" role="log">
        Temperature status: {announcedStatus}. {tempTarget != null ? `Target: ${tempTarget}°C.` : ''} {tempDanger != null ? `Danger above ${tempDanger}°C.` : ''}
      </div>
    </div>
  );
};
