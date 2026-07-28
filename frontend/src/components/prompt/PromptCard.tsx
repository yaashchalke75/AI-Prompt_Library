import { useState } from 'react';
import clsx from 'clsx';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  Copy,
  Edit2,
  GripVertical,
  MoreVertical,
  Pin,
  PinOff,
  Star,
  Trash2,
  Copy as CopyIcon,
} from 'lucide-react';
import type { Prompt } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { useAppDispatch } from '@/app/hooks';
import { toggleFavorite, togglePin, duplicatePrompt } from '@/features/prompts/promptsSlice';
import { openEditModal, openDetailsModal, requestDelete } from '@/features/ui/uiSlice';
import { useClipboard } from '@/hooks/useClipboard';
import toast from 'react-hot-toast';

interface PromptCardProps {
  prompt: Prompt;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const dispatch = useAppDispatch();
  const { copy, copiedId } = useClipboard();
  const [menuOpen, setMenuOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: prompt.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCopied = copiedId === prompt.id;

  const handleDuplicate = async () => {
    setMenuOpen(false);
    const result = await dispatch(duplicatePrompt(prompt.id));
    if (duplicatePrompt.fulfilled.match(result)) {
      toast.success('Prompt duplicated');
    } else {
      toast.error(result.payload || 'Failed to duplicate prompt');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative flex flex-col rounded-xl border bg-white dark:bg-ink-900 p-4 shadow-[var(--shadow-card)] transition-shadow',
        'hover:shadow-[var(--shadow-card-hover)]',
        isDragging ? 'opacity-50 z-10' : 'opacity-100',
        prompt.isPinned ? 'border-amber-400/60 dark:border-amber-500/40' : 'border-ink-100 dark:border-ink-800'
      )}
    >
      {prompt.isPinned && (
        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
          <Pin size={11} className="text-ink-950" fill="currentColor" />
        </span>
      )}

      <div className="flex items-start gap-2 mb-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="mt-0.5 p-1 -ml-1 rounded text-ink-300 hover:text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={() => dispatch(openDetailsModal(prompt))}
          className="flex-1 min-w-0 text-left"
        >
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50 truncate">
            {prompt.title}
          </h3>
        </button>

        <button
          type="button"
          onClick={() => dispatch(toggleFavorite(prompt))}
          aria-label={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={prompt.isFavorite}
          className="p-1 rounded text-ink-300 hover:text-amber-500 dark:hover:text-amber-400 shrink-0"
        >
          <Star size={16} fill={prompt.isFavorite ? 'currentColor' : 'none'} className={prompt.isFavorite ? 'text-amber-500' : ''} />
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
            aria-expanded={menuOpen}
            className="p-1 rounded text-ink-300 hover:text-ink-600 hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} role="presentation" />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-[var(--shadow-card-hover)] py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    dispatch(openEditModal(prompt));
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 text-left"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 text-left"
                >
                  <CopyIcon size={14} /> Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    dispatch(togglePin(prompt));
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 text-left"
                >
                  {prompt.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                  {prompt.isPinned ? 'Unpin' : 'Pin to top'}
                </button>
                <div className="h-px bg-ink-100 dark:bg-ink-700 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    dispatch(requestDelete(prompt));
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-signal-danger hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {prompt.description && (
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-3 line-clamp-2">{prompt.description}</p>
      )}

      <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-3 mb-3">
        <p className="font-mono text-xs text-ink-600 dark:text-ink-300 line-clamp-4 whitespace-pre-wrap break-words">
          {prompt.content}
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <CategoryBadge category={prompt.category} />
        {prompt.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400"
          >
            #{tag}
          </span>
        ))}
        {prompt.tags.length > 3 && (
          <span className="text-xs text-ink-400">+{prompt.tags.length - 3}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink-100 dark:border-ink-800">
        <span className="text-xs text-ink-400">Updated {formatDate(prompt.updatedAt)}</span>
        <button
          type="button"
          onClick={() => copy(prompt.content, prompt.id)}
          className={clsx(
            'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
            isCopied
              ? 'bg-signal-success/15 text-signal-success'
              : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700'
          )}
        >
          {isCopied ? <Check size={13} /> : <Copy size={13} />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
