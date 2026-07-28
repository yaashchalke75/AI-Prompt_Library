export const CATEGORIES = [
  'Coding',
  'Marketing',
  'Content Writing',
  'Email',
  'Resume',
  'SQL',
  'Design',
  'Social Media',
  'Productivity',
  'Others',
] as const;

export type Category = (typeof CATEGORIES)[number];

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

/**
 * The canonical Prompt shape as returned by the API (and used across the
 * frontend). `id` mirrors the backend's transformed `_id`.
 */
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  category: Category;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new prompt (server assigns id/timestamps/order). */
export interface CreatePromptInput {
  title: string;
  content: string;
  description?: string;
  category: Category;
  tags?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
}

/** Payload for updating an existing prompt; all fields optional. */
export type UpdatePromptInput = Partial<CreatePromptInput> & {
  order?: number;
};

export interface DashboardStats {
  totalPrompts: number;
  favoritePrompts: number;
  categoriesCount: number;
  categoryCounts: Record<string, number>;
  recentlyAdded: Prompt[];
}

export interface PromptFilters {
  search: string;
  category: Category | 'All';
  favoritesOnly: boolean;
  sort: SortOption;
}

/** Shape of the JSON file produced by Export and expected by Import. */
export interface PromptExportPayload {
  exportedAt: string;
  version: 1;
  prompts: Prompt[];
}
