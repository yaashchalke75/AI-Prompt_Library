import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/app/hooks';
import { importPrompts, fetchPrompts, fetchStats } from '@/features/prompts/promptsSlice';
import { parseImportFile } from '@/utils/promptImportExport';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setClientError(null);
    setIsProcessing(true);

    const parseResult = await parseImportFile(file);

    if (!parseResult.valid) {
      setClientError(parseResult.error);
      setIsProcessing(false);
      return;
    }

    const result = await dispatch(importPrompts(parseResult.prompts));

    if (importPrompts.fulfilled.match(result)) {
      const { imported, failed } = result.payload;
      if (imported > 0) {
        toast.success(`Imported ${imported} prompt${imported === 1 ? '' : 's'}`);
        dispatch(fetchPrompts());
        dispatch(fetchStats());
      }
      if (failed > 0) {
        toast.error(`${failed} prompt${failed === 1 ? '' : 's'} failed validation`);
      }
      if (imported > 0) onClose();
    } else {
      setClientError(result.payload || 'Import failed. Please check the file and try again.');
    }

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import prompts" size="md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Upload a JSON file exported from this app (or any array of prompt objects with{' '}
          <code className="font-mono text-xs bg-ink-100 dark:bg-ink-800 px-1 py-0.5 rounded">
            title
          </code>
          ,{' '}
          <code className="font-mono text-xs bg-ink-100 dark:bg-ink-800 px-1 py-0.5 rounded">
            content
          </code>
          , and{' '}
          <code className="font-mono text-xs bg-ink-100 dark:bg-ink-800 px-1 py-0.5 rounded">
            category
          </code>{' '}
          fields).
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600'
          }`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
        >
          <UploadCloud size={28} className="text-ink-400" />
          <p className="text-sm text-ink-600 dark:text-ink-300">
            {isProcessing ? 'Processing...' : 'Drag & drop a .json file here, or click to browse'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>

        {clientError && (
          <p role="alert" className="text-sm text-signal-danger">
            {clientError}
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
