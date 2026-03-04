import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ProTipProps {
  content: string;
}

export const ProTip: React.FC<ProTipProps> = ({ content }) => {
  return (
    <div
      className="flex gap-2.5 items-start px-3 py-2.5 rounded-lg"
      style={{
        backgroundColor: 'rgba(167,139,250, 0.04)',
        borderLeft: '3px solid var(--accent-purple)',
        border: '1px solid rgba(167,139,250, 0.1)',
        borderLeftWidth: '3px',
        borderLeftColor: 'var(--accent-purple)',
      }}
    >
      <Lightbulb size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-purple)' }} />
      <div>
        <div
          className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
          style={{ color: 'var(--accent-purple)' }}
        >
          Operator Tip
        </div>
        <div className="text-xs leading-relaxed" style={{ color: 'rgba(167,139,250, 0.8)' }}>
          {content}
        </div>
      </div>
    </div>
  );
};
