import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { promptApi, type ImportResult } from '@/services/promptApi';
import { normalizeApiError } from '@/services/apiClient';
import type {
  Category,
  CreatePromptInput,
  DashboardStats,
  Prompt,
  PromptFilters,
  UpdatePromptInput,
} from '@/types';

interface PromptsState {
  items: Prompt[];
  stats: DashboardStats | null;
  filters: PromptFilters;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationStatus: 'idle' | 'loading';
  error: string | null;
  lastImportResult: ImportResult | null;
}

const initialState: PromptsState = {
  items: [],
  stats: null,
  filters: {
    search: '',
    category: 'All',
    favoritesOnly: false,
    sort: 'newest',
  },
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
  lastImportResult: null,
};

// --- Async thunks -----------------------------------------------------

export const fetchPrompts = createAsyncThunk<Prompt[], void, { state: { prompts: PromptsState }; rejectValue: string }>(
  'prompts/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().prompts;
      return await promptApi.getAll(filters);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const fetchStats = createAsyncThunk<DashboardStats, void, { rejectValue: string }>(
  'prompts/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await promptApi.getStats();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const createPrompt = createAsyncThunk<Prompt, CreatePromptInput, { rejectValue: string }>(
  'prompts/create',
  async (input, { rejectWithValue }) => {
    try {
      return await promptApi.create(input);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const updatePrompt = createAsyncThunk<
  Prompt,
  { id: string; input: UpdatePromptInput },
  { rejectValue: string }
>('prompts/update', async ({ id, input }, { rejectWithValue }) => {
  try {
    return await promptApi.update(id, input);
  } catch (error) {
    return rejectWithValue(normalizeApiError(error).message);
  }
});

export const deletePrompt = createAsyncThunk<string, string, { rejectValue: string }>(
  'prompts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await promptApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const duplicatePrompt = createAsyncThunk<Prompt, string, { rejectValue: string }>(
  'prompts/duplicate',
  async (id, { rejectWithValue }) => {
    try {
      return await promptApi.duplicate(id);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const toggleFavorite = createAsyncThunk<Prompt, Prompt, { rejectValue: string }>(
  'prompts/toggleFavorite',
  async (prompt, { rejectWithValue }) => {
    try {
      return await promptApi.update(prompt.id, { isFavorite: !prompt.isFavorite });
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const togglePin = createAsyncThunk<Prompt, Prompt, { rejectValue: string }>(
  'prompts/togglePin',
  async (prompt, { rejectWithValue }) => {
    try {
      return await promptApi.update(prompt.id, { isPinned: !prompt.isPinned });
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const reorderPrompts = createAsyncThunk<Prompt[], string[], { rejectValue: string }>(
  'prompts/reorder',
  async (orderedIds, { rejectWithValue }) => {
    try {
      return await promptApi.reorder(orderedIds);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

export const importPrompts = createAsyncThunk<ImportResult, unknown[], { rejectValue: string }>(
  'prompts/import',
  async (prompts, { rejectWithValue }) => {
    try {
      return await promptApi.importMany(prompts);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error).message);
    }
  }
);

// --- Slice --------------------------------------------------------------

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload;
    },
    setCategory(state, action: PayloadAction<Category | 'All'>) {
      state.filters.category = action.payload;
    },
    setFavoritesOnly(state, action: PayloadAction<boolean>) {
      state.filters.favoritesOnly = action.payload;
    },
    setSort(state, action: PayloadAction<PromptFilters['sort']>) {
      state.filters.sort = action.payload;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    /** Optimistic local reorder while dragging, before the API call resolves. */
    reorderLocally(state, action: PayloadAction<Prompt[]>) {
      state.items = action.payload;
    },
    clearImportResult(state) {
      state.lastImportResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPrompts
      .addCase(fetchPrompts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load prompts';
      })
      // fetchStats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // create
      .addCase(createPrompt.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.mutationStatus = 'idle';
        state.items.unshift(action.payload);
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.mutationStatus = 'idle';
        state.error = action.payload ?? 'Failed to create prompt';
      })
      // update / toggleFavorite / togglePin share the same fulfilled shape
      .addCase(updatePrompt.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(togglePin.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      // delete
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      // duplicate
      .addCase(duplicatePrompt.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // reorder
      .addCase(reorderPrompts.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      // import
      .addCase(importPrompts.fulfilled, (state, action) => {
        state.lastImportResult = action.payload;
      });
  },
});

export const {
  setSearch,
  setCategory,
  setFavoritesOnly,
  setSort,
  resetFilters,
  reorderLocally,
  clearImportResult,
} = promptsSlice.actions;

export default promptsSlice.reducer;
