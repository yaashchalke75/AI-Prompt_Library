import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Prompt } from '@/types';

interface UiState {
  isFormModalOpen: boolean;
  editingPrompt: Prompt | null; // null = create mode
  isDetailsModalOpen: boolean;
  viewingPrompt: Prompt | null;
  deleteTarget: Prompt | null; // drives the confirmation dialog
  isSidebarOpen: boolean; // for mobile off-canvas sidebar
}

const initialState: UiState = {
  isFormModalOpen: false,
  editingPrompt: null,
  isDetailsModalOpen: false,
  viewingPrompt: null,
  deleteTarget: null,
  isSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateModal(state) {
      state.isFormModalOpen = true;
      state.editingPrompt = null;
    },
    openEditModal(state, action: PayloadAction<Prompt>) {
      state.isFormModalOpen = true;
      state.editingPrompt = action.payload;
    },
    closeFormModal(state) {
      state.isFormModalOpen = false;
      state.editingPrompt = null;
    },
    openDetailsModal(state, action: PayloadAction<Prompt>) {
      state.isDetailsModalOpen = true;
      state.viewingPrompt = action.payload;
    },
    closeDetailsModal(state) {
      state.isDetailsModalOpen = false;
      state.viewingPrompt = null;
    },
    requestDelete(state, action: PayloadAction<Prompt>) {
      state.deleteTarget = action.payload;
    },
    cancelDelete(state) {
      state.deleteTarget = null;
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar(state) {
      state.isSidebarOpen = false;
    },
  },
});

export const {
  openCreateModal,
  openEditModal,
  closeFormModal,
  openDetailsModal,
  closeDetailsModal,
  requestDelete,
  cancelDelete,
  toggleSidebar,
  closeSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
