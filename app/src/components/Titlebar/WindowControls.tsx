import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="flex items-center gap-0 -webkit-app-region-no-drag">
      <button
        onClick={onMinimize}
        className="flex items-center justify-center w-[46px] h-[32px] transition-colors hover:bg-[#111620] cursor-pointer"
        aria-label="Minimize window"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Minus size={14} className="text-[#8A95A8]" />
      </button>
      <button
        onClick={onMaximize}
        className="flex items-center justify-center w-[46px] h-[32px] transition-colors hover:bg-[#111620] cursor-pointer"
        aria-label="Maximize window"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Square size={11} className="text-[#8A95A8]" />
      </button>
      <button
        onClick={onClose}
        className="flex items-center justify-center w-[46px] h-[32px] transition-colors hover:bg-[#E5484D] hover:text-white cursor-pointer"
        aria-label="Close window"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <X size={14} className="text-[#8A95A8] hover:text-white" />
      </button>
    </div>
  );
};
