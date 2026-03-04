import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C9EFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06080C] disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#4C9EFF] text-white hover:bg-[#3B8DEE] shadow-[0_0_20px_rgba(76,158,255,0.15)]',
        destructive: 'bg-[#E5484D] text-white hover:bg-[#D13438]',
        outline: 'border border-[#141920] bg-transparent text-[#8A95A8] hover:bg-[#111620] hover:text-[#E8ECF2]',
        secondary: 'bg-[#111620] text-[#8A95A8] hover:bg-[#161C28] hover:text-[#E8ECF2]',
        ghost: 'text-[#8A95A8] hover:bg-[#111620] hover:text-[#E8ECF2]',
        link: 'text-[#4C9EFF] underline-offset-4 hover:underline',
        success: 'bg-emerald-500/[0.08] border border-emerald-500/20 text-[#3FB950] hover:bg-emerald-500/[0.12]',
        danger: 'bg-red-500/[0.08] border border-red-500/20 text-[#E5484D] hover:bg-red-500/[0.12]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-6 text-sm',
        xl: 'h-14 rounded-xl px-8 text-sm font-semibold',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
