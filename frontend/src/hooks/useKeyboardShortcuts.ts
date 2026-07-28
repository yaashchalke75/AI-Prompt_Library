import { useEffect } from 'react';

interface ShortcutHandlers {
  onCreateNew?: () => void;
  onFocusSearch?: () => void;
}

/**
 * Registers global keyboard shortcuts:
 * - "n" creates a new prompt
 * - "/" focuses the search input
 * Both are ignored while the user is typing in a form field to avoid
 * hijacking normal text entry.
 */
export const useKeyboardShortcuts = ({ onCreateNew, onFocusSearch }: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isTyping) return;

      if (e.key === 'n' && onCreateNew) {
        e.preventDefault();
        onCreateNew();
      }

      if (e.key === '/' && onFocusSearch) {
        e.preventDefault();
        onFocusSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCreateNew, onFocusSearch]);
};
