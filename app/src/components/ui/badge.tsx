import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#4C9EFF] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#111620] text-[#8A95A8]',
        info: 'border-[rgba(76,158,255,0.1)] bg-[rgba(76,158,255,0.04)] text-[#93C5FD]',
        warning: 'border-[rgba(212,160,23,0.1)] bg-[rgba(212,160,23,0.03)] text-[rgba(212,160,23,0.7)]',
        critical: 'border-[rgba(249,115,22,0.2)] bg-[rgba(249,115,22,0.04)] text-[#FDBA74]',
        emergency: 'border-[rgba(229,72,77,0.2)] bg-[rgba(229,72,77,0.06)] text-[#FCA5A5]',
        success: 'border-[rgba(63,185,80,0.2)] bg-[rgba(63,185,80,0.04)] text-[#3FB950]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
