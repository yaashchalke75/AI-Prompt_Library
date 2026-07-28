import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  footer,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep latest onClose without causing the effect to rerun
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    const focusFirstElement = () => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      focusable?.focus();
    };

    const timeoutId = window.setTimeout(focusFirstElement, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableEls = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current();
      }}
    >
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px] animate-in fade-in duration-150" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={clsx(
          "relative w-full rounded-2xl bg-paper-50 dark:bg-ink-900 shadow-[var(--shadow-modal)]",
          "max-h-[90vh] flex flex-col animate-in zoom-in-95 fade-in duration-150",
          sizeClasses[size],
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-700 shrink-0">
          <h2
            id="modal-title"
            className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 dark:hover:text-ink-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin px-6 py-5 grow">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 dark:border-ink-700 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
