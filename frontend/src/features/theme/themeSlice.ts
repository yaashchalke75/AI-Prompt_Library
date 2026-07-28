import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
}

const getInitialTheme = (): ThemeMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable (e.g. privacy mode); fall back below.
  }
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, action.payload);
      } catch {
        // Ignore persistence failures; theme still applies for this session.
      }
    },
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, state.mode);
      } catch {
        // Ignore persistence failures; theme still applies for this session.
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
