import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp, Pause, Play, RotateCcw } from 'lucide-react';
import { useDraggable } from '../../hooks/useDraggable';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ReactionTimerProps {
  timerSeconds: number;
  timerRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  durationMax: number | null;
  activeChapter: number;
  screenMode: string;
}

type TimerStatus = 'running' | 'paused' | 'exceeded' | 'critical';

function getTimerStatus(seconds: number, running: boolean, durationMax: number | null): TimerStatus {
  if (durationMax != null) {
    const maxSeconds = durationMax * 60;
    if (seconds >= maxSeconds * 1.5) return 'critical';
    if (seconds >= maxSeconds) return 'exceeded';
  }
  return running ? 'running' : 'paused';
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const STATUS_CONFIG: Record<TimerStatus, { color: string; border: string; glow: string }> = {
  running: {
    color: 'var(--accent-blue)',
    border: 'rgba(76,158,255,0.2)',
    glow: '',
  },
  paused: {
    color: 'var(--text-muted)',
    border: 'var(--border-default)',
    glow: '',
  },
  exceeded: {
    color: 'var(--accent-amber)',
    border: 'rgba(212,160,23,0.2)',
    glow: '',
  },
  critical: {
    color: 'var(--accent-red)',
    border: 'rgba(229,72,77,0.3)',
    glow: 'var(--shadow-glow-red)',
  },
};

export const ReactionTimer: React.FC<ReactionTimerProps> = ({
  timerSeconds,
  timerRunning,
  onToggle,
  onReset,
  durationMax,
  activeChapter,
  screenMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  const { position, isDragging, handleMouseDown } = useDraggable(widgetRef, {
    resetKey: `${screenMode}-${activeChapter}`,
  });

  const status = getTimerStatus(timerSeconds, timerRunning, durationMax);
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

  // ARIA: announce time every 30s when running
  const lastAnnounceRef = useRef(0);
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (!timerRunning) return;
    if (timerSeconds - lastAnnounceRef.current >= 30) {
      lastAnnounceRef.current = timerSeconds;
      const statusLabel = status === 'exceeded' ? 'exceeded target duration' :
        status === 'critical' ? 'critically exceeded' : 'running';
      setAnnouncement(`Timer ${statusLabel}: ${formatTime(timerSeconds)}`);
    }
  }, [timerSeconds, timerRunning, status]);

  const targetDisplay = durationMax != null ? `${durationMax} min` : null;
  const progressPercent = durationMax != null
    ? Math.min(100, (timerSeconds / (durationMax * 60)) * 100)
    : null;

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
        boxShadow: status === 'critical' ? cfg.glow : 'var(--shadow-md)',
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : undefined,
        ...transitionStyle,
        overflow: 'hidden',
      }}
      role="timer"
      aria-live="polite"
      aria-label="Reaction timer"
      aria-atomic="true"
    >
      {/* Drag handle / header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Clock
            size={16}
            style={{ color: cfg.color }}
            className={timerRunning && !isReducedMotion ? 'animate-pulse' : ''}
          />
          {isCollapsed && (
            <span
              className="text-[11px] font-bold mono tabular-nums"
              style={{ color: cfg.color }}
            >
              {formatTime(timerSeconds).slice(3)}
            </span>
          )}
          {!isCollapsed && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: cfg.color }}
            >
              Timer
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }}
            className="p-0.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Collapse timer"
          >
            <ChevronUp size={12} />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {!isCollapsed && (
        <div className="px-3 pb-3 space-y-2">
          {/* Main time display */}
          <div className="text-center">
            <span
              className="text-[20px] font-bold mono tabular-nums tracking-wide"
              style={{
                color: cfg.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {formatTime(timerSeconds)}
            </span>
          </div>

          {/* Target duration */}
          {targetDisplay && (
            <div className="flex items-baseline justify-between">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target</span>
              <span
                className="text-[11px] font-semibold mono tabular-nums"
                style={{ color: 'var(--text-secondary)' }}
              >
                {targetDisplay}
              </span>
            </div>
          )}

          {/* Progress bar (if target duration known) */}
          {progressPercent != null && (
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(progressPercent, 100)}%`,
                  background: status === 'exceeded' || status === 'critical'
                    ? 'var(--gradient-temp-danger)'
                    : 'var(--gradient-progress)',
                  transition: isReducedMotion ? 'none' : 'width 1s linear',
                }}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={onToggle}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
              style={{
                backgroundColor: timerRunning ? 'rgba(212,160,23,0.08)' : 'rgba(76,158,255,0.08)',
                color: timerRunning ? 'var(--accent-amber)' : 'var(--accent-blue)',
                border: `1px solid ${timerRunning ? 'rgba(212,160,23,0.15)' : 'rgba(76,158,255,0.15)'}`,
              }}
              aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {timerRunning ? <Pause size={10} /> : <Play size={10} />}
              {timerRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-default)',
              }}
              aria-label="Reset timer"
            >
              <RotateCcw size={10} />
            </button>
          </div>
        </div>
      )}

      {/* Collapsed: expand on click */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full flex justify-center pb-2"
          aria-label="Expand timer"
        >
          <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}

      {/* Screen reader announcement (throttled to every 30s) */}
      <div className="sr-only" aria-live="polite" role="log">
        {announcement}
      </div>
    </div>
  );
};
