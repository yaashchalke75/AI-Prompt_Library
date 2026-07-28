import { forwardRef, useEffect, useState } from 'react';
import { Search, Download, Upload, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSearch, setSort } from '@/features/prompts/promptsSlice';
import { openCreateModal } from '@/features/ui/uiSlice';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { SORT_OPTIONS } from '@/constants';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { SortOption } from '@/types';

interface SearchToolbarProps {
  onExport: () => void;
  onImportClick: () => void;
}

export const SearchToolbar = forwardRef<HTMLInputElement, SearchToolbarProps>(
  ({ onExport, onImportClick }, ref) => {
    const dispatch = useAppDispatch();
    const { search, sort } = useAppSelector((state) => state.prompts.filters);
    const [localSearch, setLocalSearch] = useState(search);
    const debouncedSearch = useDebouncedValue(localSearch, 300);

    useEffect(() => {
      dispatch(setSearch(debouncedSearch));
    }, [debouncedSearch, dispatch]);

    return (
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            ref={ref}
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by title or prompt content... (press / to focus)"
            aria-label="Search prompts"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 pl-9 pr-3 py-2.5 text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <Select
          aria-label="Sort prompts"
          value={sort}
          onChange={(e) => dispatch(setSort(e.target.value as SortOption))}
          className="sm:w-48"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={onImportClick} aria-label="Import prompts">
            <Upload size={16} />
            <span className="hidden md:inline">Import</span>
          </Button>
          <Button variant="secondary" size="md" onClick={onExport} aria-label="Export prompts">
            <Download size={16} />
            <span className="hidden md:inline">Export</span>
          </Button>
          <Button size="md" onClick={() => dispatch(openCreateModal())} aria-label="Add new prompt">
            <Plus size={16} />
            <span className="hidden md:inline">New prompt</span>
          </Button>
        </div>
      </div>
    );
  }
);

SearchToolbar.displayName = 'SearchToolbar';
