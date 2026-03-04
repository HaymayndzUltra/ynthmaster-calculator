import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface StepImageProps {
  imagePath: string | null;
  caption?: string;
  onLightboxOpen?: () => void;
}

export const StepImage: React.FC<StepImageProps> = ({ imagePath, caption, onLightboxOpen }) => {
  const [hasError, setHasError] = useState(false);

  if (!imagePath || hasError) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <ImageIcon size={20} />
        <span className="text-xs">Reference image not available</span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={onLightboxOpen}
        className="block w-full rounded-xl overflow-hidden cursor-pointer group"
        type="button"
        aria-label={caption ? `View reference image: ${caption}` : 'View reference image'}
      >
        <img
          src={`/images/${imagePath}`}
          alt={caption ?? 'Reference image for this step'}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full max-h-[300px] object-cover transition-transform duration-150 group-hover:scale-[1.02]"
          style={{ borderRadius: 'var(--radius-md)' }}
        />
      </button>
      {caption && (
        <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
          {caption}
        </p>
      )}
    </div>
  );
};
