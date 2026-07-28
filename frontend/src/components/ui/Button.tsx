import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-amber-500 text-ink-950 hover:bg-amber-400 active:bg-amber-600 disabled:bg-ink-300 dark:disabled:bg-ink-700',
  secondary:
    'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 dark:text-ink-200 dark:hover:bg-ink-800',
  danger:
    'bg-signal-danger text-white hover:bg-red-600 active:bg-red-700 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  icon: 'p-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
