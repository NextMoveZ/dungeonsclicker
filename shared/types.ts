// Player types
export interface Player {
  id: number;
  username: string;
  level: number;
  score: number;
  gold: number;
  attackPower: number;
  critChance: number;
  critMultiplier: number;
  lastActive: Date;
  role: "user" | "admin";
  maxDungeonLevel: number;
  totalClicks: number;
  totalBossesDefeated: number;
}

export interface PlayerStats extends Omit<Player, "id" | "username" | "password" | "role"> {
  username: string;
}

// Dungeon types
export interface Dungeon {
  id: number;
  level: number;
  name: string;
  description: string;
  requiredPlayerLevel: number;
  background: string;
  timeLimit: number; // in seconds
}

// Boss types
export interface Boss {
  id: number;
  dungeonId: number;
  name: string;
  health: number;
  maxHealth: number;
  goldReward: number;
  scoreReward: number;
  texture: string;
}

// Item types
export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  effect: ItemEffect;
  value: number;
  icon: string;
  isUnique: boolean;
}

export interface PlayerItem {
  id: number;
  playerId: number;
  itemId: number;
  quantity: number;
  isEquipped: boolean;
}

export type ItemEffect = 
  | "attack_power" 
  | "crit_chance" 
  | "crit_multiplier" 
  | "gold_bonus"
  | "score_bonus"
  | "click_efficiency";

// Quest types
export interface Quest {
  id: number;
  name: string;
  description: string;
  requirement: QuestRequirement;
  targetValue: number;
  goldReward: number;
  scoreReward: number;
}

export type QuestRequirement = 
  | "defeat_bosses" 
  | "reach_level" 
  | "perform_clicks"
  | "earn_gold"
  | "earn_score";

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface AuthResponse {
  player: Player;
  token: string;
}
