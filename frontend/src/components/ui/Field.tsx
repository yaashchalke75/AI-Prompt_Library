import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export const Field = ({ label, htmlFor, error, required, hint, children }: FieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700 dark:text-ink-200">
        {label}
        {required && <span className="text-signal-danger ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-signal-danger">
          {error}
        </p>
      )}
    </div>
  );
};
