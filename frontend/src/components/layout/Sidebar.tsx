import clsx from 'clsx';
import { LayoutGrid, Star, X } from 'lucide-react';
import { CATEGORIES } from '@/constants';
import type { Category } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCategory, setFavoritesOnly } from '@/features/prompts/promptsSlice';
import { closeSidebar } from '@/features/ui/uiSlice';

const categoryEmphasis: Record<string, string> = {
  Coding: 'bg-[#5b7a9d]',
  Marketing: 'bg-[#c0714f]',
  'Content Writing': 'bg-[#8a7ab8]',
  Email: 'bg-[#4a8a6f]',
  Resume: 'bg-[#a68a4a]',
  SQL: 'bg-[#6b8e8e]',
  Design: 'bg-[#b8558c]',
  'Social Media': 'bg-[#d19c4a]',
  Productivity: 'bg-[#5a9370]',
  Others: 'bg-ink-400',
};

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const { category, favoritesOnly } = useAppSelector((state) => state.prompts.filters);
  const stats = useAppSelector((state) => state.prompts.stats);

  const content = (
    <nav aria-label="Filter prompts" className="flex flex-col gap-1 p-4">
      <div className="flex items-center justify-between mb-2 lg:hidden">
        <span className="font-display font-semibold text-ink-900 dark:text-ink-50">Filters</span>
        <button
          type="button"
          onClick={() => dispatch(closeSidebar())}
          aria-label="Close filters"
          className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          <X size={18} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          dispatch(setCategory('All'));
          dispatch(setFavoritesOnly(false));
        }}
        className={clsx(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
          category === 'All' && !favoritesOnly
            ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400'
            : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
        )}
      >
        <LayoutGrid size={16} />
        All Prompts
      </button>

      <button
        type="button"
        onClick={() => dispatch(setFavoritesOnly(!favoritesOnly))}
        aria-pressed={favoritesOnly}
        className={clsx(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
          favoritesOnly
            ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400'
            : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
        )}
      >
        <Star size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
        Favorites
      </button>

      <div className="h-px bg-ink-100 dark:bg-ink-700 my-3" />

      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1">Categories</p>

      {CATEGORIES.map((cat: Category) => {
        const count = stats?.categoryCounts?.[cat] ?? 0;
        const isActive = category === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => dispatch(setCategory(isActive ? 'All' : cat))}
            aria-pressed={isActive}
            className={clsx(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left justify-between group',
              isActive
                ? 'bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400'
                : 'text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
            )}
          >
            <span className="flex items-center gap-2.5">
              <span className={clsx('w-2 h-2 rounded-full shrink-0', categoryEmphasis[cat])} />
              {cat}
            </span>
            {count > 0 && (
              <span className="text-xs text-ink-400 group-hover:text-ink-500 tabular-nums">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-ink-100 dark:border-ink-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto scrollbar-thin">
        {content}
      </aside>

      {/* Mobile off-canvas sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40"
            onClick={() => dispatch(closeSidebar())}
            role="presentation"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-paper-50 dark:bg-ink-900 shadow-xl overflow-y-auto animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
