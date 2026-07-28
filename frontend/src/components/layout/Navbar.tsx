import { Menu, Moon, Sparkles, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTheme } from '@/features/theme/themeSlice';
import { toggleSidebar } from '@/features/ui/uiSlice';

export const Navbar = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-ink-100 dark:border-ink-800 bg-paper-50/90 dark:bg-ink-950/90 backdrop-blur-sm">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle filters menu"
            className="lg:hidden p-2 -ml-2 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-ink-950 shrink-0">
              <Sparkles size={16} strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold text-lg text-ink-900 dark:text-ink-50 hidden sm:block">
              Prompt Library
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
        >
          {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
