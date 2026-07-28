import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { cancelDelete } from '@/features/ui/uiSlice';
import { deletePrompt } from '@/features/prompts/promptsSlice';

export const DeleteConfirmDialog = () => {
  const dispatch = useAppDispatch();
  const target = useAppSelector((state) => state.ui.deleteTarget);

  const handleConfirm = async () => {
    if (!target) return;
    const result = await dispatch(deletePrompt(target.id));
    if (deletePrompt.fulfilled.match(result)) {
      toast.success('Prompt deleted');
    } else {
      toast.error(result.payload || 'Failed to delete prompt');
    }
    dispatch(cancelDelete());
  };

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={() => dispatch(cancelDelete())}
      title="Delete prompt"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={() => dispatch(cancelDelete())}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Delete permanently
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-signal-danger-soft flex items-center justify-center text-signal-danger shrink-0">
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300 pt-1.5">
          Are you sure you want to delete <strong className="text-ink-900 dark:text-ink-50">{target?.title}</strong>?
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
};
