import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  /** Initial position. Defaults to { x: 0, y: 0 }. */
  initialPosition?: Position;
  /** Reset position when this value changes (e.g., screenMode or activeChapter). */
  resetKey?: string | number;
}

interface UseDraggableReturn {
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Enables drag-to-reposition for floating widgets.
 * Clamps to viewport bounds. Resets position on `resetKey` change.
 * Uses `cursor: grab` / `cursor: grabbing` convention.
 */
export function useDraggable<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  options: UseDraggableOptions = {},
): UseDraggableReturn {
  const { initialPosition = { x: 0, y: 0 }, resetKey } = options;

  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elX: number; elY: number } | null>(null);

  // Reset position when resetKey changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clamp position to viewport bounds
  const clampToViewport = useCallback(
    (x: number, y: number): Position => {
      if (!elementRef.current) return { x, y };
      const rect = elementRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      return {
        x: Math.max(0, Math.min(x, maxX)),
        y: Math.max(0, Math.min(y, maxY)),
      };
    },
    [elementRef],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elX: position.x,
        elY: position.y,
      };
    },
    [position],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = dragStartRef.current.elX + dx;
      const newY = dragStartRef.current.elY + dy;
      setPosition(clampToViewport(newX, newY));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, clampToViewport]);

  // Re-clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => clampToViewport(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampToViewport]);

  return { position, isDragging, handleMouseDown };
}
