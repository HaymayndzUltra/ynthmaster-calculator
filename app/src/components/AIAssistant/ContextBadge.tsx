import React, { useState } from 'react';
import type { CalculatorContext } from '../../types/ai';

interface ContextBadgeProps {
  context: CalculatorContext | undefined;
}

const badgeBaseStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: 12,
  fontSize: 11,
  lineHeight: '16px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  position: 'relative',
  cursor: 'default',
};

const activeBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  backgroundColor: 'rgba(31, 157, 85, 0.15)',
  color: '#1F9D55',
  border: '1px solid rgba(31, 157, 85, 0.3)',
};

const inactiveBadgeStyle: React.CSSProperties = {
  ...badgeBaseStyle,
  backgroundColor: 'rgba(156, 163, 175, 0.15)',
  color: '#9CA3AF',
  border: '1px solid rgba(156, 163, 175, 0.3)',
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginBottom: 6,
  padding: '4px 8px',
  backgroundColor: '#1F2937',
  color: '#E5E7EB',
  fontSize: 11,
  lineHeight: '14px',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
};

function formatBadgeLabel(context: CalculatorContext): string {
  const chapter = `Ch.${context.activeChapter}`;
  if (context.targetYieldGrams !== null) {
    return `${chapter} | Target: ${context.targetYieldGrams}g`;
  }
  return chapter;
}

export const ContextBadge: React.FC<ContextBadgeProps> = ({ context }) => {
  const [isHovered, setIsHovered] = useState(false);

  const hasContext = context !== undefined && context !== null;
  const label = hasContext ? formatBadgeLabel(context) : 'No context';
  const tooltipText = hasContext
    ? 'The AI sees your current chapter and yield calculations'
    : 'No calculator context — AI uses default quantities';

  return (
    <span
      style={hasContext ? activeBadgeStyle : inactiveBadgeStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={tooltipText}
    >
      {label}
      {isHovered && <span style={tooltipStyle}>{tooltipText}</span>}
    </span>
  );
};
