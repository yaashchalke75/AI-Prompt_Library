import { configureStore } from '@reduxjs/toolkit';
import promptsReducer from '@/features/prompts/promptsSlice';
import themeReducer from '@/features/theme/themeSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    prompts: promptsReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
