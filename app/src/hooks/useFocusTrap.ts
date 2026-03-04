import { useEffect, useRef, useCallback, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  isActive: boolean;
  onEscape?: () => void;
}

/**
 * Traps Tab/Shift+Tab cycling within a container element.
 * Restores focus to the trigger element on deactivation.
 * Handles Escape key to close.
 */
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  options: UseFocusTrapOptions,
): void {
  const { isActive, onEscape } = options;
  const triggerRef = useRef<Element | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }, [containerRef]);

  // Store the trigger element when trap activates
  useEffect(() => {
    if (isActive) {
      triggerRef.current = document.activeElement;
    }
  }, [isActive]);

  // Move focus into container when trap activates
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      containerRef.current.setAttribute('tabindex', '-1');
      containerRef.current.focus();
    }
  }, [isActive, containerRef, getFocusableElements]);

  // Trap Tab cycling + handle Escape
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isActive, onEscape, getFocusableElements]);

  // Restore focus on deactivation
  useEffect(() => {
    return () => {
      if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);
}
