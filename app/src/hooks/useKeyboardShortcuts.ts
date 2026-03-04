import { useEffect, useRef, useCallback } from 'react';

type ShortcutHandler = (e: KeyboardEvent) => void;

interface ShortcutEntry {
  handler: ShortcutHandler;
  description?: string;
}

/**
 * Parses a shortcut string like "Mod+E" or "ArrowRight" into a match object.
 * `Mod` maps to `Ctrl` on Windows/Linux.
 */
function parseShortcut(shortcut: string) {
  const parts = shortcut.split('+').map((p) => p.trim().toLowerCase());
  const hasMod = parts.includes('mod');
  const hasShift = parts.includes('shift');
  const hasAlt = parts.includes('alt');
  const key = parts.filter((p) => !['mod', 'shift', 'alt'].includes(p))[0] ?? '';

  return { hasMod, hasShift, hasAlt, key };
}

function matchesShortcut(e: KeyboardEvent, parsed: ReturnType<typeof parseShortcut>): boolean {
  const isMod = e.ctrlKey || e.metaKey;
  if (parsed.hasMod !== isMod) return false;
  if (parsed.hasShift !== e.shiftKey) return false;
  if (parsed.hasAlt !== e.altKey) return false;

  const eventKey = e.key.toLowerCase();
  const parsedKey = parsed.key;

  // Handle number keys: "1" through "9"
  if (/^\d$/.test(parsedKey)) {
    return eventKey === parsedKey;
  }

  // Handle named keys
  const keyMap: Record<string, string> = {
    arrowright: 'arrowright',
    arrowleft: 'arrowleft',
    arrowup: 'arrowup',
    arrowdown: 'arrowdown',
    enter: 'enter',
    escape: 'escape',
    space: ' ',
    tab: 'tab',
  };

  const mappedKey = keyMap[parsedKey] ?? parsedKey;
  return eventKey === mappedKey;
}

// Shortcuts that conflict with Electron/OS — never register these
const BLOCKED_SHORTCUTS = new Set(['mod+w', 'mod+q', 'mod+n']);

/**
 * Centralized keyboard shortcut handler.
 * Returns `register` and `unregister` functions to manage shortcuts.
 * Shortcuts are active only while the component is mounted.
 *
 * Usage:
 * ```ts
 * const { register, unregister } = useKeyboardShortcuts();
 * useEffect(() => {
 *   register('Mod+E', (e) => { openEmergency(); });
 *   return () => unregister('Mod+E');
 * }, [register, unregister]);
 * ```
 */
export function useKeyboardShortcuts() {
  const shortcutsRef = useRef<Map<string, ShortcutEntry>>(new Map());

  const register = useCallback((shortcut: string, handler: ShortcutHandler, description?: string) => {
    const normalized = shortcut.toLowerCase().trim();
    if (BLOCKED_SHORTCUTS.has(normalized)) {
      console.warn(`[useKeyboardShortcuts] Blocked shortcut "${shortcut}" — conflicts with Electron/OS.`);
      return;
    }
    shortcutsRef.current.set(normalized, { handler, description });
  }, []);

  const unregister = useCallback((shortcut: string) => {
    shortcutsRef.current.delete(shortcut.toLowerCase().trim());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      for (const [shortcutStr, entry] of shortcutsRef.current) {
        const parsed = parseShortcut(shortcutStr);

        // Allow Enter/Escape in inputs, but block other custom shortcuts
        if (isInput && parsed.key !== 'escape' && parsed.key !== 'enter' && !parsed.hasMod) {
          continue;
        }

        if (matchesShortcut(e, parsed)) {
          e.preventDefault();
          e.stopPropagation();
          entry.handler(e);
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Clean up all shortcuts on unmount
  useEffect(() => {
    return () => {
      shortcutsRef.current.clear();
    };
  }, []);

  return { register, unregister };
}
