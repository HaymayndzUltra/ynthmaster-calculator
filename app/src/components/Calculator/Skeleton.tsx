import React from 'react';

type SkeletonVariant = 'rect' | 'circle' | 'text';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  diameter?: number;
  lines?: number;
  lineWidths?: (number | string)[];
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  diameter = 40,
  lines = 3,
  lineWidths,
  className = '',
}) => {
  if (variant === 'circle') {
    return (
      <div
        className={`skeleton shrink-0 ${className}`}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: '50%',
        }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'text') {
    const defaultWidths = ['100%', '90%', '75%'];
    const widths = lineWidths ?? defaultWidths;

    return (
      <div className={`space-y-2 ${className}`} aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              width: widths[i % widths.length],
              height: 12,
            }}
          />
        ))}
      </div>
    );
  }

  // rect (default)
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? 20,
      }}
      aria-hidden="true"
    />
  );
};

interface SkeletonContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  isLoading,
  children,
  fallback,
}) => {
  return (
    <div aria-busy={isLoading}>
      {isLoading ? fallback : children}
    </div>
  );
};
