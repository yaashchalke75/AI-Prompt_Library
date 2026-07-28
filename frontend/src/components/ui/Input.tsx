import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

const baseClasses =
  'w-full rounded-lg border bg-paper-50 dark:bg-ink-900 px-3 py-2 text-sm text-ink-900 dark:text-ink-100 ' +
  'placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        baseClasses,
        hasError ? 'border-signal-danger' : 'border-ink-200 dark:border-ink-700',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={clsx(
        baseClasses,
        'resize-y min-h-[96px]',
        hasError ? 'border-signal-danger' : 'border-ink-200 dark:border-ink-700',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(baseClasses, 'cursor-pointer', hasError ? 'border-signal-danger' : 'border-ink-200 dark:border-ink-700', className)}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
