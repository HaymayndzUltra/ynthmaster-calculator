import React from 'react';
import { FlaskConical } from 'lucide-react';
import { WindowControls } from './WindowControls';

export const Titlebar: React.FC = () => {
  const handleMinimize = () => {
    window.windowControls?.minimize();
  };

  const handleMaximize = () => {
    window.windowControls?.maximize();
  };

  const handleClose = () => {
    window.windowControls?.close();
  };

  return (
    <div
      className="flex items-center justify-between shrink-0 select-none border-b"
      style={{
        height: '32px',
        backgroundColor: 'var(--bg-deep)',
        borderColor: 'var(--border-default)',
        WebkitAppRegion: 'drag',
      } as React.CSSProperties}
    >
      {/* Left: App icon + title */}
      <div className="flex items-center gap-2 pl-3">
        <FlaskConical size={13} className="text-blue-400" />
        <span
          className="text-[11px] font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Project Alpha
        </span>
      </div>

      {/* Right: Window controls */}
      <WindowControls
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
    </div>
  );
};
