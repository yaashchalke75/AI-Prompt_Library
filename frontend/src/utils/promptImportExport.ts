import type { Prompt, PromptExportPayload } from '@/types';

export const downloadPromptsAsJson = (prompts: Prompt[]): void => {
  const payload: PromptExportPayload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    prompts,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-prompt-library-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Parses and structurally validates an uploaded JSON file before it's sent
 * to the backend for full validation. Catches malformed files early so the
 * user gets immediate feedback instead of a vague server error.
 */
export const parseImportFile = (
  file: File
): Promise<{ valid: true; prompts: unknown[] } | { valid: false; error: string }> => {
  return new Promise((resolve) => {
    if (file.type && file.type !== 'application/json' && !file.name.endsWith('.json')) {
      resolve({ valid: false, error: 'Please select a .json file.' });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const prompts = Array.isArray(parsed) ? parsed : parsed?.prompts;

        if (!Array.isArray(prompts)) {
          resolve({
            valid: false,
            error: 'File must contain an array of prompts, or an object with a "prompts" array.',
          });
          return;
        }

        if (prompts.length === 0) {
          resolve({ valid: false, error: 'The file contains no prompts to import.' });
          return;
        }

        resolve({ valid: true, prompts });
      } catch {
        resolve({ valid: false, error: 'The file is not valid JSON.' });
      }
    };

    reader.onerror = () => {
      resolve({ valid: false, error: 'Could not read the selected file.' });
    };

    reader.readAsText(file);
  });
};
