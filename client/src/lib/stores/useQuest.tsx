import { create } from "zustand";
import { apiRequest } from "../queryClient";

interface Quest {
  id: number;
  title: string;
  description: string;
  type: string;
  requirements: Record<string, any>;
  goldReward: number;
  scoreReward: number;
  experienceReward: number;
  itemRewardId: number | null;
  requiredLevel: number;
  expiresIn: number | null;
  isActive: boolean;
}

interface QuestState {
  availableQuests: Quest[];
  loading: boolean;
  
  // Actions
  fetchAvailableQuests: (playerLevel?: number) => Promise<void>;
}

export const useQuest = create<QuestState>((set, get) => ({
  availableQuests: [],
  loading: false,
  
  fetchAvailableQuests: async (playerLevel) => {
    try {
      set({ loading: true });
      
      const url = playerLevel ? `/api/quests?level=${playerLevel}` : '/api/quests';
      const response = await apiRequest("GET", url);
      const availableQuests = await response.json();
      
      set({ availableQuests, loading: false });
    } catch (error) {
      console.error("Error fetching available quests:", error);
      set({ loading: false });
    }
  }
}));
