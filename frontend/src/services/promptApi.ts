import { apiClient } from './apiClient';
import type {
  ApiSuccessResponse,
  CreatePromptInput,
  DashboardStats,
  Prompt,
  PromptFilters,
  UpdatePromptInput,
} from '@/types';

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
}

const unwrap = <T>(response: { data: ApiSuccessResponse<T> }): T => response.data.data;

export const promptApi = {
  async getAll(filters: Partial<PromptFilters> = {}): Promise<Prompt[]> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category && filters.category !== 'All') params.category = filters.category;
    if (filters.favoritesOnly) params.favoritesOnly = 'true';
    if (filters.sort) params.sort = filters.sort;

    const response = await apiClient.get<ApiSuccessResponse<Prompt[]>>('/prompts', { params });
    return unwrap(response);
  },

  async getById(id: string): Promise<Prompt> {
    const response = await apiClient.get<ApiSuccessResponse<Prompt>>(`/prompts/${id}`);
    return unwrap(response);
  },

  async create(input: CreatePromptInput): Promise<Prompt> {
    const response = await apiClient.post<ApiSuccessResponse<Prompt>>('/prompts', input);
    return unwrap(response);
  },

  async update(id: string, input: UpdatePromptInput): Promise<Prompt> {
    const response = await apiClient.put<ApiSuccessResponse<Prompt>>(`/prompts/${id}`, input);
    return unwrap(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<null>>(`/prompts/${id}`);
  },

  async duplicate(id: string): Promise<Prompt> {
    const response = await apiClient.post<ApiSuccessResponse<Prompt>>(`/prompts/${id}/duplicate`);
    return unwrap(response);
  },

  async reorder(orderedIds: string[]): Promise<Prompt[]> {
    const response = await apiClient.patch<ApiSuccessResponse<Prompt[]>>('/prompts/reorder', { orderedIds });
    return unwrap(response);
  },

  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiSuccessResponse<DashboardStats>>('/prompts/stats');
    return unwrap(response);
  },

  async exportAll(): Promise<Prompt[]> {
    const response = await apiClient.get<ApiSuccessResponse<Prompt[]>>('/prompts/export');
    return unwrap(response);
  },

  async importMany(prompts: unknown[]): Promise<ImportResult> {
    const response = await apiClient.post<ApiSuccessResponse<ImportResult>>('/prompts/import', { prompts });
    return unwrap(response);
  },
};
