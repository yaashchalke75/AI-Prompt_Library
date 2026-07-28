import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export const useClipboard = (resetAfterMs = 2000) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, id: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for non-secure contexts (older browsers, http://).
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        setCopiedId(id);
        toast.success('Copied to clipboard');
        window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), resetAfterMs);
      } catch {
        toast.error('Could not copy to clipboard');
      }
    },
    [resetAfterMs]
  );

  return { copy, copiedId };
};
