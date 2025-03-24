import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Dungeon, Boss } from "@shared/types";
import { apiRequest } from "../queryClient";

export type DungeonPhase = "select" | "fighting" | "victory" | "defeat";

interface DungeonState {
  // Data
  dungeons: Dungeon[];
  currentDungeon: Dungeon | null;
  currentBoss: Boss | null;
  phase: DungeonPhase;
  timeRemaining: number;
  timerId: number | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadDungeons: () => Promise<void>;
  selectDungeon: (dungeonId: number) => Promise<void>;
  startFight: () => void;
  resetFight: () => void;
  endFight: (success: boolean) => void;
  damageCurrentBoss: (amount: number) => void;
  
  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

export const useDungeon = create<DungeonState>()(
  subscribeWithSelector((set, get) => ({
    dungeons: [],
    currentDungeon: null,
    currentBoss: null,
    phase: "select",
    timeRemaining: 0,
    timerId: null,
    loading: false,
    error: null,
    
    loadDungeons: async () => {
      set({ loading: true, error: null });
      try {
        const res = await apiRequest("GET", "/api/dungeons");
        const dungeons = await res.json();
        set({ dungeons, loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to load dungeons", 
          loading: false 
        });
      }
    },
    
    selectDungeon: async (dungeonId) => {
      set({ loading: true, error: null });
      try {
        // Get dungeon details
        const dungeonRes = await apiRequest("GET", `/api/dungeons/${dungeonId}`);
        const dungeon = await dungeonRes.json();
        
        // Get boss details
        const bossRes = await apiRequest("GET", `/api/dungeons/${dungeonId}/boss`);
        const boss = await bossRes.json();
        
        // Reset boss health to max
        boss.health = boss.maxHealth;
        
        set({ 
          currentDungeon: dungeon, 
          currentBoss: boss,
          timeRemaining: dungeon.timeLimit,
          phase: "select", // Start in select phase
          loading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Failed to select dungeon", 
          loading: false 
        });
      }
    },
    
    startFight: () => {
      set({ phase: "fighting" });
      get().startTimer();
    },
    
    resetFight: () => {
      const { currentBoss, currentDungeon } = get();
      
      if (currentBoss && currentDungeon) {
        // Reset boss health
        const resetBoss = { ...currentBoss, health: currentBoss.maxHealth };
        // Reset timer
        get().resetTimer();
        
        set({ 
          currentBoss: resetBoss,
          timeRemaining: currentDungeon.timeLimit,
          phase: "select" 
        });
      }
    },
    
    endFight: (success) => {
      // Pause the timer
      get().pauseTimer();
      
      // Set phase based on result
      set({ phase: success ? "victory" : "defeat" });
    },
    
    damageCurrentBoss: (amount) => {
      const { currentBoss, phase } = get();
      
      // Only allow damage during fighting phase
      if (phase !== "fighting" || !currentBoss) return;
      
      // Calculate new health, ensuring it doesn't go below 0
      const newHealth = Math.max(0, currentBoss.health - amount);
      const updatedBoss = { ...currentBoss, health: newHealth };
      
      set({ currentBoss: updatedBoss });
      
      // Check if boss is defeated
      if (newHealth <= 0) {
        get().endFight(true);
      }
    },
    
    startTimer: () => {
      // Clear any existing timer first
      get().pauseTimer();
      
      // Create a new timer that decrements every second
      const timerId = window.setInterval(() => {
        const { timeRemaining, phase } = get();
        
        if (timeRemaining <= 0 || phase !== "fighting") {
          // Time ran out, end the fight
          get().pauseTimer();
          if (phase === "fighting") {
            get().endFight(false);
          }
          return;
        }
        
        set({ timeRemaining: timeRemaining - 1 });
      }, 1000);
      
      set({ timerId });
    },
    
    pauseTimer: () => {
      const { timerId } = get();
      if (timerId !== null) {
        clearInterval(timerId);
        set({ timerId: null });
      }
    },
    
    resetTimer: () => {
      const { currentDungeon } = get();
      get().pauseTimer();
      
      if (currentDungeon) {
        set({ timeRemaining: currentDungeon.timeLimit });
      }
    }
  }))
);
