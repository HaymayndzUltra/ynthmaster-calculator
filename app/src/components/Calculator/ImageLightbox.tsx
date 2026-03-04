import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ImageLightboxProps {
  imagePath: string;
  caption?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  imagePath,
  caption,
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

  const backdropStyle = isReducedMotion
    ? { opacity: 1 }
    : {
        opacity: hasEntered ? 1 : 0,
        backdropFilter: hasEntered ? 'blur(16px) saturate(1.1)' : 'blur(0px)',
        transition: 'opacity 400ms var(--ease-out-expo), backdrop-filter 400ms var(--ease-out-expo)',
      };

  const imageStyle = isReducedMotion
    ? {}
    : {
        transform: hasEntered ? 'scale(1)' : 'scale(0.8)',
        opacity: hasEntered ? 1 : 0,
        transition: 'transform 400ms var(--ease-out-expo), opacity 400ms var(--ease-out-expo)',
      };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 'var(--z-overlay)',
        background: 'rgba(6, 8, 12, 0.92)',
        ...backdropStyle,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={caption ? `Reference image: ${caption}` : 'Reference image'}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Close button — first in tab order */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full transition-colors"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-default)',
        }}
        aria-label="Close lightbox"
      >
        <X size={18} />
      </button>

      {/* Image */}
      <div className="flex flex-col items-center gap-4 px-8 max-w-[90vw] max-h-[90vh]" style={imageStyle}>
        <img
          src={imagePath}
          alt={caption || 'Reference image'}
          className="max-w-full max-h-[80vh] object-contain rounded-xl"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        />
        {caption && (
          <p
            className="text-sm text-center max-w-md"
            style={{ color: 'var(--text-secondary)' }}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};
