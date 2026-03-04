import React from 'react';

interface ProgressRingProps {
  checked: number;
  total: number;
  size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ checked, total, size = 40 }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? checked / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      className="shrink-0"
      aria-label={`${checked} of ${total} checked`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-elevated)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--accent-green)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-300"
        style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text-secondary)"
        fontSize="10"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {checked}/{total}
      </text>
    </svg>
  );
};
