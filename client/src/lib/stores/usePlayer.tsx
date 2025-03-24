import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PlayerStats, Item, PlayerItem } from "@shared/types";
import { apiRequest } from "../queryClient";

interface PlayerState {
  // Player data
  player: PlayerStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Player items
  inventory: (PlayerItem & { item: Item })[];
  equippedItems: (PlayerItem & { item: Item })[];
  
  // Player actions
  loadPlayer: () => Promise<void>;
  updatePlayer: (playerId: number, data: Partial<PlayerStats>) => Promise<void>;
  addScore: (amount: number) => Promise<void>;
  addGold: (amount: number) => Promise<void>;
  incrementTotalClicks: () => Promise<void>;
  incrementBossesDefeated: () => Promise<void>;
  
  // Item actions
  loadInventory: () => Promise<void>;
  equipItem: (playerItemId: number) => Promise<void>;
  unequipItem: (playerItemId: number) => Promise<void>;
  purchaseItem: (itemId: number) => Promise<boolean>;
  useItem: (playerItemId: number) => Promise<boolean>;

  // Computed values
  getTotalAttackPower: () => number;
  getTotalCritChance: () => number;
  getTotalCritMultiplier: () => number;
}

export const usePlayer = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    player: null,
    isLoading: false,
    error: null,
    inventory: [],
    equippedItems: [],
    
    loadPlayer: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await apiRequest("GET", "/api/player/me");
        const data = await res.json();
        set({ player: data, isLoading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to load player", isLoading: false });
      }
    },
    
    updatePlayer: async (playerId, data) => {
      set({ isLoading: true, error: null });
      try {
        const res = await apiRequest("PUT", `/api/player/${playerId}`, data);
        const updatedPlayer = await res.json();
        set({ player: updatedPlayer, isLoading: false });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to update player", isLoading: false });
      }
    },
    
    addScore: async (amount) => {
      const { player } = get();
      if (!player) return;
      
      // Update locally first for immediate feedback
      set({ player: { ...player, score: player.score + amount } });
      
      // Then update server
      try {
        await apiRequest("PUT", `/api/player/${player.id}/score`, { amount });
      } catch (error) {
        console.error("Failed to update score:", error);
        // Revert on failure
        set({ player: { ...player, score: player.score } });
      }
    },
    
    addGold: async (amount) => {
      const { player } = get();
      if (!player) return;
      
      // Update locally first for immediate feedback
      set({ player: { ...player, gold: player.gold + amount } });
      
      // Then update server
      try {
        await apiRequest("PUT", `/api/player/${player.id}/gold`, { amount });
      } catch (error) {
        console.error("Failed to update gold:", error);
        // Revert on failure
        set({ player: { ...player, gold: player.gold } });
      }
    },
    
    incrementTotalClicks: async () => {
      const { player } = get();
      if (!player) return;
      
      // Update locally first
      set({ player: { ...player, totalClicks: player.totalClicks + 1 } });
      
      // Update server every 10 clicks to reduce API calls
      if (player.totalClicks % 10 === 0) {
        try {
          await apiRequest("PUT", `/api/player/${player.id}/clicks`, { clicks: 10 });
        } catch (error) {
          console.error("Failed to update click count:", error);
        }
      }
    },
    
    incrementBossesDefeated: async () => {
      const { player } = get();
      if (!player) return;
      
      // Update locally first
      set({ player: { ...player, totalBossesDefeated: player.totalBossesDefeated + 1 } });
      
      // Then update server
      try {
        await apiRequest("PUT", `/api/player/${player.id}/bosses`, { count: 1 });
      } catch (error) {
        console.error("Failed to update bosses defeated:", error);
      }
    },
    
    loadInventory: async () => {
      const { player } = get();
      if (!player) return;
      
      set({ isLoading: true, error: null });
      try {
        const res = await apiRequest("GET", `/api/player/${player.id}/items`);
        const items = await res.json();
        
        // Split into inventory and equipped items
        const equipped = items.filter((item: PlayerItem) => item.isEquipped);
        
        set({ 
          inventory: items, 
          equippedItems: equipped,
          isLoading: false 
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to load inventory", isLoading: false });
      }
    },
    
    equipItem: async (playerItemId) => {
      set({ isLoading: true, error: null });
      try {
        await apiRequest("PUT", `/api/player/items/${playerItemId}/equip`, { equip: true });
        
        // Update local state
        const { inventory } = get();
        const updatedInventory = inventory.map(item => 
          item.id === playerItemId ? { ...item, isEquipped: true } : item
        );
        
        // Update equipped items
        const newEquippedItem = updatedInventory.find(item => item.id === playerItemId);
        const equippedItems = get().equippedItems;
        
        set({ 
          inventory: updatedInventory, 
          equippedItems: newEquippedItem ? [...equippedItems, newEquippedItem] : equippedItems,
          isLoading: false 
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to equip item", isLoading: false });
      }
    },
    
    unequipItem: async (playerItemId) => {
      set({ isLoading: true, error: null });
      try {
        await apiRequest("PUT", `/api/player/items/${playerItemId}/equip`, { equip: false });
        
        // Update local state
        const { inventory, equippedItems } = get();
        const updatedInventory = inventory.map(item => 
          item.id === playerItemId ? { ...item, isEquipped: false } : item
        );
        
        const updatedEquippedItems = equippedItems.filter(item => item.id !== playerItemId);
        
        set({ 
          inventory: updatedInventory, 
          equippedItems: updatedEquippedItems,
          isLoading: false 
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to unequip item", isLoading: false });
      }
    },
    
    purchaseItem: async (itemId) => {
      const { player } = get();
      if (!player) return false;
      
      set({ isLoading: true, error: null });
      try {
        const res = await apiRequest("POST", `/api/player/${player.id}/purchase`, { itemId });
        const data = await res.json();
        
        if (data.success) {
          // Update player gold
          set({ 
            player: { ...player, gold: data.remainingGold },
            isLoading: false 
          });
          
          // Reload inventory to show new item
          await get().loadInventory();
          return true;
        } else {
          set({ error: data.message, isLoading: false });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to purchase item", isLoading: false });
        return false;
      }
    },
    
    useItem: async (playerItemId) => {
      const { player, inventory } = get();
      if (!player) return false;
      
      // Find the item
      const playerItem = inventory.find(item => item.id === playerItemId);
      if (!playerItem || playerItem.isEquipped) return false;
      
      set({ isLoading: true, error: null });
      try {
        const res = await apiRequest("POST", `/api/player/items/${playerItemId}/use`);
        const data = await res.json();
        
        if (data.success) {
          // Update player stats
          set({ 
            player: { ...player, ...data.playerUpdate },
            isLoading: false 
          });
          
          // Update inventory (remove item if quantity becomes 0)
          const updatedInventory = inventory.map(item => {
            if (item.id === playerItemId) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return item;
          }).filter(item => item.quantity > 0);
          
          set({ inventory: updatedInventory });
          return true;
        } else {
          set({ error: data.message, isLoading: false });
          return false;
        }
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Failed to use item", isLoading: false });
        return false;
      }
    },
    
    // Computed values
    getTotalAttackPower: () => {
      const { player, equippedItems } = get();
      if (!player) return 0;
      
      let totalAttackPower = player.attackPower;
      
      // Add attack power from equipped items
      equippedItems.forEach(({ item }) => {
        if (item.effect === "attack_power") {
          totalAttackPower += item.value;
        }
      });
      
      return totalAttackPower;
    },
    
    getTotalCritChance: () => {
      const { player, equippedItems } = get();
      if (!player) return 0;
      
      let totalCritChance = player.critChance;
      
      // Add crit chance from equipped items
      equippedItems.forEach(({ item }) => {
        if (item.effect === "crit_chance") {
          totalCritChance += item.value;
        }
      });
      
      return totalCritChance;
    },
    
    getTotalCritMultiplier: () => {
      const { player, equippedItems } = get();
      if (!player) return 0;
      
      let totalCritMultiplier = player.critMultiplier;
      
      // Add crit multiplier from equipped items
      equippedItems.forEach(({ item }) => {
        if (item.effect === "crit_multiplier") {
          totalCritMultiplier += item.value;
        }
      });
      
      return totalCritMultiplier;
    }
  }))
);
