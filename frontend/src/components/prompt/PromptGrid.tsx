import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { Prompt } from '@/types';
import { PromptCard } from './PromptCard';
import { useAppDispatch } from '@/app/hooks';
import { reorderLocally, reorderPrompts } from '@/features/prompts/promptsSlice';
import { FileQuestion } from 'lucide-react';

interface PromptGridProps {
  prompts: Prompt[];
  isLoading: boolean;
  hasActiveFilters: boolean;
}

export const PromptGrid = ({ prompts, isLoading, hasActiveFilters }: PromptGridProps) => {
  const dispatch = useAppDispatch();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = prompts.findIndex((p) => p.id === active.id);
    const newIndex = prompts.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...prompts];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic UI update, then persist the new order to the backend.
    dispatch(reorderLocally(reordered));
    dispatch(reorderPrompts(reordered.map((p) => p.id)));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4">
        <div className="w-14 h-14 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-400 mb-4">
          <FileQuestion size={24} />
        </div>
        <h3 className="font-display font-semibold text-ink-800 dark:text-ink-100 mb-1">
          {hasActiveFilters ? 'No prompts match your filters' : 'No prompts yet'}
        </h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm">
          {hasActiveFilters
            ? 'Try a different search term, category, or clear your filters.'
            : 'Create your first prompt to start building your library.'}
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={prompts.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
