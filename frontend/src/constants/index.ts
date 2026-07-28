import type { SortOption } from '@/types';

export { CATEGORIES } from '@/types/prompt.types';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'a-z', label: 'Title A → Z' },
  { value: 'z-a', label: 'Title Z → A' },
];

export const STORAGE_KEYS = {
  THEME: 'ai-prompt-library:theme',
} as const;

export const LIMITS = {
  TITLE_MAX: 150,
  DESCRIPTION_MAX: 500,
  CONTENT_MAX: 20000,
  TAG_MAX: 40,
  MAX_TAGS: 20,
} as const;

export const DEBOUNCE_MS = 300;

export const TOAST_DURATION_MS = 3000;
