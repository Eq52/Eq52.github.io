import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Navigation
  currentView: string
  viewParams: Record<string, string>
  navigate: (view: string, params?: Record<string, string>) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string | null
  setSelectedCategory: (c: string | null) => void
  selectedTag: string | null
  setSelectedTag: (t: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'home',
      viewParams: {},
      navigate: (view, params = {}) => set({ currentView: view, viewParams: params }),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: null,
      setSelectedCategory: (c) => set({ selectedCategory: c, selectedTag: null }),
      selectedTag: null,
      setSelectedTag: (t) => set({ selectedTag: t, selectedCategory: null }),
    }),
    {
      name: 'blog-storage',
      partialize: (state) => ({}),
    }
  )
)
