import { Copy, Check, Edit2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from './CategoryBadge';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closeDetailsModal, openEditModal } from '@/features/ui/uiSlice';
import { useClipboard } from '@/hooks/useClipboard';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const PromptDetailsModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isDetailsModalOpen);
  const prompt = useAppSelector((state) => state.ui.viewingPrompt);
  const { copy, copiedId } = useClipboard();

  if (!prompt) return null;

  const isCopied = copiedId === prompt.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeDetailsModal())}
      title={prompt.title}
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              dispatch(closeDetailsModal());
              dispatch(openEditModal(prompt));
            }}
          >
            <Edit2 size={14} /> Edit
          </Button>
          <Button onClick={() => copy(prompt.content, prompt.id)}>
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            {isCopied ? 'Copied' : 'Copy prompt'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={prompt.category} />
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {prompt.description && (
          <p className="text-sm text-ink-600 dark:text-ink-300">{prompt.description}</p>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Prompt content</p>
          <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 p-4">
            <pre className="font-mono text-xs text-ink-700 dark:text-ink-200 whitespace-pre-wrap break-words">
              {prompt.content}
            </pre>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs text-ink-400 pt-2 border-t border-ink-100 dark:border-ink-800">
          <span>Created {formatDate(prompt.createdAt)}</span>
          <span>Last updated {formatDate(prompt.updatedAt)}</span>
        </div>
      </div>
    </Modal>
  );
};
