import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPrompts, fetchStats } from '@/features/prompts/promptsSlice';
import { openCreateModal } from '@/features/ui/uiSlice';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SearchToolbar } from '@/components/common/SearchToolbar';
import { PromptGrid } from '@/components/prompt/PromptGrid';
import { PromptFormModal } from '@/components/prompt/PromptFormModal';
import { PromptDetailsModal } from '@/components/prompt/PromptDetailsModal';
import { DeleteConfirmDialog } from '@/components/prompt/DeleteConfirmDialog';
import { ImportModal } from '@/components/prompt/ImportModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { downloadPromptsAsJson } from '@/utils/promptImportExport';
import { promptApi } from '@/services/promptApi';
import { normalizeApiError } from '@/services/apiClient';

export const LibraryPage = () => {
  const dispatch = useAppDispatch();
  const { items, status, filters } = useAppSelector((state) => state.prompts);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    filters.search.trim().length > 0 || filters.category !== 'All' || filters.favoritesOnly;

  // Single source of truth for re-fetching: any filter change (search,
  // category, favoritesOnly, sort) triggers exactly one fetch here, rather
  // than scattering fetch calls across multiple child components.
  useEffect(() => {
    dispatch(fetchPrompts());
  }, [dispatch, filters.search, filters.category, filters.favoritesOnly, filters.sort]);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch, items.length]);

  useKeyboardShortcuts({
    onCreateNew: () => dispatch(openCreateModal()),
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const handleExport = async () => {
    try {
      const allPrompts = await promptApi.exportAll();
      if (allPrompts.length === 0) {
        toast.error('No prompts to export yet');
        return;
      }
      downloadPromptsAsJson(allPrompts);
      toast.success(`Exported ${allPrompts.length} prompt${allPrompts.length === 1 ? '' : 's'}`);
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 lg:p-6">
        <DashboardStats />

        <SearchToolbar
          ref={searchInputRef}
          onExport={handleExport}
          onImportClick={() => setIsImportOpen(true)}
        />

        {status === 'failed' && (
          <div className="mb-4 rounded-lg border border-signal-danger/30 bg-signal-danger-soft px-4 py-3 text-sm text-signal-danger">
            Couldn't load your prompts. Check your connection and try refreshing.
          </div>
        )}

        <PromptGrid prompts={items} isLoading={status === 'loading'} hasActiveFilters={hasActiveFilters} />
      </main>

      <PromptFormModal />
      <PromptDetailsModal />
      <DeleteConfirmDialog />
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
};
