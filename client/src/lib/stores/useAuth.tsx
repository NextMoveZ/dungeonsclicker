import { create } from "zustand";
import { Player, LoginCredentials, RegisterCredentials } from "@shared/types";
import { apiRequest } from "../queryClient";
import { subscribeWithSelector } from "zustand/middleware";

interface AuthState {
  player: Player | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  
  // Methods
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    player: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    error: null,
    
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const res = await apiRequest("POST", "/api/auth/login", credentials);
        const data = await res.json();
        
        set({ 
          player: data.player, 
          isAuthenticated: true,
          isAdmin: data.player.role === "admin",
          loading: false 
        });
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Login failed", 
          loading: false,
          isAuthenticated: false,
          isAdmin: false
        });
        return false;
      }
    },
    
    register: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const res = await apiRequest("POST", "/api/auth/register", credentials);
        const data = await res.json();
        
        set({ 
          player: data.player, 
          isAuthenticated: true,
          isAdmin: data.player.role === "admin",
          loading: false 
        });
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : "Registration failed", 
          loading: false 
        });
        return false;
      }
    },
    
    logout: async () => {
      set({ loading: true });
      try {
        await apiRequest("POST", "/api/auth/logout");
        
        set({ 
          player: null, 
          isAuthenticated: false,
          isAdmin: false,
          loading: false 
        });
      } catch (error) {
        console.error("Logout error:", error);
        // Still clear state even if API call fails
        set({ 
          player: null, 
          isAuthenticated: false,
          isAdmin: false,
          loading: false 
        });
      }
    },
    
    checkAuth: async () => {
      set({ loading: true });
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        const player = await res.json();
        
        set({ 
          player, 
          isAuthenticated: true,
          isAdmin: player.role === "admin",
          loading: false 
        });
        
        return true;
      } catch (error) {
        set({ 
          player: null, 
          isAuthenticated: false,
          isAdmin: false,
          loading: false 
        });
        return false;
      }
    }
  }))
);
