import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 transition-transform active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2';

    const variants = {
      primary:
        'bg-brand-gold text-white shadow-[0_2px_8px_rgba(1,69,242,0.2)] hover:scale-[1.04] hover:shadow-[0_6px_20px_rgba(1,69,242,0.35)] active:shadow-none',
      secondary:
        'bg-brand-navy text-white hover:scale-[1.04] hover:bg-brand-navy-light',
      outline:
        'border-2 border-brand-gold text-brand-gold transition-colors duration-200 hover:bg-brand-gold hover:text-white',
      ghost:
        'bg-transparent text-brand-gold border border-transparent hover:bg-brand-gold/10 hover:border-brand-gold/20',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading…</span>
          </>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
