import { create } from 'zustand';

interface SidebarState {
  isSidebarOpen: boolean;
  setSidebar: () => void;
}

export const useSidebarState = create<SidebarState>((set) => ({
  isSidebarOpen: false,
  setSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
