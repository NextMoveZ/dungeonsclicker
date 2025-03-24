import { create } from "zustand";
import { Item } from "@shared/types";
import { apiRequest } from "../queryClient";

interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
  
  loadItems: () => Promise<void>;
  getItemById: (id: number) => Item | undefined;
}

export const useItems = create<ItemsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  
  loadItems: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest("GET", "/api/items");
      const items = await res.json();
      set({ items, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to load items", 
        loading: false 
      });
    }
  },
  
  getItemById: (id) => {
    return get().items.find(item => item.id === id);
  }
}));
