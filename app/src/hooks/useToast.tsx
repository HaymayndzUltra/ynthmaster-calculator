import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useReducedMotion } from './useReducedMotion';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
}

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS: Record<ToastType, number | null> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: null,
};

const MAX_VISIBLE = 3;

const TOAST_CONFIG: Record<ToastType, { Icon: typeof Info; color: string; bg: string; border: string }> = {
  success: {
    Icon: CheckCircle,
    color: 'var(--accent-green)',
    bg: 'rgba(63,185,80,0.06)',
    border: 'rgba(63,185,80,0.15)',
  },
  info: {
    Icon: Info,
    color: 'var(--accent-blue)',
    bg: 'rgba(76,158,255,0.06)',
    border: 'rgba(76,158,255,0.15)',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'var(--accent-amber)',
    bg: 'rgba(212,160,23,0.06)',
    border: 'rgba(212,160,23,0.15)',
  },
  error: {
    Icon: XCircle,
    color: 'var(--accent-red)',
    bg: 'rgba(229,72,77,0.06)',
    border: 'rgba(229,72,77,0.15)',
  },
};

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const isReducedMotion = useReducedMotion();

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++toastCounter}`;
    const toast: Toast = { id, type, message, createdAt: Date.now() };

    setToasts((prev) => {
      const next = [...prev, toast];
      return next.slice(-MAX_VISIBLE);
    });

    const dismissMs = AUTO_DISMISS_MS[type];
    if (dismissMs != null) {
      const timer = setTimeout(() => removeToast(id), dismissMs);
      timersRef.current.set(id, timer);
    }
  }, [removeToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container: fixed, bottom-right, above emergency bar */}
      <div
        className="fixed flex flex-col-reverse gap-2"
        style={{
          bottom: '64px',
          right: '24px',
          zIndex: 'var(--z-toast)',
          pointerEvents: 'none',
        }}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const cfg = TOAST_CONFIG[toast.type];
          const TIcon = cfg.Icon;

          return (
            <div
              key={toast.id}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl border min-w-[280px] max-w-[380px] blur-tooltip"
              style={{
                backgroundColor: cfg.bg,
                borderColor: cfg.border,
                boxShadow: 'var(--shadow-md)',
                pointerEvents: 'auto',
                ...(isReducedMotion ? {} : {
                  animation: 'toast-enter 300ms var(--ease-out-expo) forwards',
                }),
              }}
              role="alert"
            >
              <TIcon size={16} className="shrink-0 mt-0.5" style={{ color: cfg.color }} />
              <p className="text-[12px] leading-relaxed flex-1" style={{ color: 'var(--text-primary)' }}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-0.5 rounded shrink-0 transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Dismiss notification"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    console.error('useToast: must be used within a ToastProvider');
    return { addToast: () => {} };
  }
  return ctx;
}
