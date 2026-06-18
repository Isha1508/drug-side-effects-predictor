import { create } from 'zustand';
import type { CompleteDrugData, DisplayMode } from '../types';

interface AppState {
  // Drug data
  drugData: CompleteDrugData | null;
  loading: boolean;
  error: string | null;
  
  // UI state
  mode: DisplayMode;
  darkMode: boolean;
  searchQuery: string;
  
  // Actions
  setDrugData: (data: CompleteDrugData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMode: (mode: DisplayMode) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

const initialState = {
  drugData: null,
  loading: false,
  error: null,
  mode: 'patient' as DisplayMode,
  darkMode: false,
  searchQuery: '',
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setDrugData: (data) => set({ drugData: data, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setMode: (mode) => set({ mode }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  reset: () => set(initialState),
}));
