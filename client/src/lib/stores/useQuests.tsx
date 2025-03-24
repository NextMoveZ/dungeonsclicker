import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Quest, PlayerQuest } from "@shared/types";
import { apiRequest } from "../queryClient";

interface QuestsState {
  // Data
  quests: (PlayerQuest & { quest: Quest })[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadQuests: () => Promise<void>;
  updateQuestProgress: (questId: number, progress: number) => Promise<void>;
  claimQuestReward: (playerQuestId: number) => Promise<boolean>;
}

export const useQuests = create<QuestsState>()(
  subscribeWithSelector((set, get) => ({
    quests: [],
    loading: false,
    error: null,
    
    loadQuests: async () => {
      set({ loading: true, error: null });
      try {
        const res = await apiRequest("GET", "/api/player/quests");
        const quests = await res.json();
        set({ quests, loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to load quests", 
          loading: false 
        });
      }
    },
    
    updateQuestProgress: async (questId, progress) => {
      try {
        // First update the local state optimistically
        const updatedQuests = get().quests.map(playerQuest => {
          if (playerQuest.questId === questId) {
            const newProgress = playerQuest.progress + progress;
            const isCompleted = newProgress >= playerQuest.quest.targetValue;
            
            return {
              ...playerQuest,
              progress: newProgress,
              completed: isCompleted
            };
          }
          return playerQuest;
        });
        
        set({ quests: updatedQuests });
        
        // Then update the server
        await apiRequest("PUT", `/api/player/quests/${questId}/progress`, { progress });
      } catch (error) {
        console.error("Failed to update quest progress:", error);
        // If there's an error, reload quests to ensure state is correct
        get().loadQuests();
      }
    },
    
    claimQuestReward: async (playerQuestId) => {
      set({ loading: true, error: null });
      try {
        const res = await apiRequest("POST", `/api/player/quests/${playerQuestId}/claim`);
        const data = await res.json();
        
        if (data.success) {
          // Update local state
          const updatedQuests = get().quests.map(playerQuest => {
            if (playerQuest.id === playerQuestId) {
              return { ...playerQuest, claimed: true };
            }
            return playerQuest;
          });
          
          set({ quests: updatedQuests, loading: false });
          return true;
        } else {
          set({ error: data.message, loading: false });
          return false;
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to claim quest reward", 
          loading: false 
        });
        return false;
      }
    }
  }))
);
