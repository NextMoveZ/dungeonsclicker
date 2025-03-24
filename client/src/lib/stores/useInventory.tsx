import { create } from "zustand";
import { apiRequest } from "../queryClient";

interface Item {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
  effect: Record<string, any>;
  rarity: string;
  requiredLevel: number;
  image: string;
  isActive: boolean;
}

interface InventoryState {
  shopItems: Item[];
  loading: boolean;
  
  // Actions
  fetchShopItems: (playerLevel?: number) => Promise<void>;
}

export const useInventory = create<InventoryState>((set, get) => ({
  shopItems: [],
  loading: false,
  
  fetchShopItems: async (playerLevel) => {
    try {
      set({ loading: true });
      
      const url = playerLevel ? `/api/shop?level=${playerLevel}` : '/api/shop';
      const response = await apiRequest("GET", url);
      const shopItems = await response.json();
      
      set({ shopItems, loading: false });
    } catch (error) {
      console.error("Error fetching shop items:", error);
      set({ loading: false });
    }
  }
}));
