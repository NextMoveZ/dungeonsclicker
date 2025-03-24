import { create } from "zustand";
import { Player, Dungeon, Boss, Item, Quest } from "@shared/types";
import { apiRequest } from "../queryClient";

interface AdminState {
  // Players management
  players: Player[];
  selectedPlayer: Player | null;
  
  // Stats
  totalPlayers: number;
  activePlayers: number; // Active in last 24 hours
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Player actions
  loadPlayers: () => Promise<void>;
  getPlayer: (id: number) => Promise<void>;
  updatePlayer: (id: number, data: Partial<Player>) => Promise<boolean>;
  resetPlayerScore: (id: number) => Promise<boolean>;
  
  // Dungeon/Boss actions
  updateBoss: (bossId: number, data: Partial<Boss>) => Promise<boolean>;
  
  // Item actions
  addItem: (item: Omit<Item, "id">) => Promise<boolean>;
  updateItem: (id: number, data: Partial<Omit<Item, "id">>) => Promise<boolean>;
  
  // Quest actions
  addQuest: (quest: Omit<Quest, "id">) => Promise<boolean>;
  updateQuest: (id: number, data: Partial<Omit<Quest, "id">>) => Promise<boolean>;
}

export const useAdmin = create<AdminState>((set, get) => ({
  players: [],
  selectedPlayer: null,
  totalPlayers: 0,
  activePlayers: 0,
  loading: false,
  error: null,
  
  loadPlayers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest("GET", "/api/admin/players");
      const data = await res.json();
      
      // Calculate stats
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const active = data.filter((player: Player) => new Date(player.lastActive) > oneDayAgo).length;
      
      set({ 
        players: data, 
        totalPlayers: data.length,
        activePlayers: active,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to load players", 
        loading: false 
      });
    }
  },
  
  getPlayer: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiRequest("GET", `/api/admin/players/${id}`);
      const player = await res.json();
      set({ selectedPlayer: player, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to get player", 
        loading: false 
      });
    }
  },
  
  updatePlayer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("PUT", `/api/admin/players/${id}`, data);
      
      // Update local players list
      const updatedPlayers = get().players.map(player => 
        player.id === id ? { ...player, ...data } : player
      );
      
      set({ 
        players: updatedPlayers,
        selectedPlayer: get().selectedPlayer?.id === id 
          ? { ...get().selectedPlayer!, ...data }
          : get().selectedPlayer,
        loading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to update player", 
        loading: false 
      });
      return false;
    }
  },
  
  resetPlayerScore: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("POST", `/api/admin/players/${id}/reset-score`);
      
      // Update local players list
      const updatedPlayers = get().players.map(player => 
        player.id === id ? { ...player, score: 0 } : player
      );
      
      set({ 
        players: updatedPlayers,
        selectedPlayer: get().selectedPlayer?.id === id 
          ? { ...get().selectedPlayer!, score: 0 }
          : get().selectedPlayer,
        loading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to reset player score", 
        loading: false 
      });
      return false;
    }
  },
  
  updateBoss: async (bossId, data) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("PUT", `/api/admin/bosses/${bossId}`, data);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to update boss", 
        loading: false 
      });
      return false;
    }
  },
  
  addItem: async (item) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("POST", "/api/admin/items", item);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to add item", 
        loading: false 
      });
      return false;
    }
  },
  
  updateItem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("PUT", `/api/admin/items/${id}`, data);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to update item", 
        loading: false 
      });
      return false;
    }
  },
  
  addQuest: async (quest) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("POST", "/api/admin/quests", quest);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to add quest", 
        loading: false 
      });
      return false;
    }
  },
  
  updateQuest: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await apiRequest("PUT", `/api/admin/quests/${id}`, data);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Failed to update quest", 
        loading: false 
      });
      return false;
    }
  }
}));
