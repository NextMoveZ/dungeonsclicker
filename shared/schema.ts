import { pgTable, serial, text, integer, timestamp, boolean, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const itemEffectEnum = pgEnum("item_effect", [
  "attack_power", 
  "crit_chance", 
  "crit_multiplier", 
  "gold_bonus",
  "score_bonus",
  "click_efficiency"
]);
export const questRequirementEnum = pgEnum("quest_requirement", [
  "defeat_bosses", 
  "reach_level", 
  "perform_clicks",
  "earn_gold",
  "earn_score"
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  level: integer("level").notNull().default(1),
  score: integer("score").notNull().default(0),
  gold: integer("gold").notNull().default(0),
  attackPower: integer("attack_power").notNull().default(1),
  critChance: real("crit_chance").notNull().default(5.0), // 5% default crit chance
  critMultiplier: real("crit_multiplier").notNull().default(2.0), // 2x default crit multiplier
  lastActive: timestamp("last_active").notNull().defaultNow(),
  role: userRoleEnum("role").notNull().default("user"),
  maxDungeonLevel: integer("max_dungeon_level").notNull().default(1),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalBossesDefeated: integer("total_bosses_defeated").notNull().default(0),
});

// Dungeons table
export const dungeons = pgTable("dungeons", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requiredPlayerLevel: integer("required_player_level").notNull(),
  background: text("background").notNull(),
  timeLimit: integer("time_limit").notNull(), // in seconds
});

// Bosses table
export const bosses = pgTable("bosses", {
  id: serial("id").primaryKey(),
  dungeonId: integer("dungeon_id").notNull().references(() => dungeons.id),
  name: text("name").notNull(),
  health: integer("health").notNull(),
  maxHealth: integer("max_health").notNull(),
  goldReward: integer("gold_reward").notNull(),
  scoreReward: integer("score_reward").notNull(),
  texture: text("texture").notNull(),
});

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  effect: itemEffectEnum("effect").notNull(),
  value: real("value").notNull(),
  icon: text("icon").notNull(),
  isUnique: boolean("is_unique").notNull().default(false),
});

// Player Items table (many-to-many relation between players and items)
export const playerItems = pgTable("player_items", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
  isEquipped: boolean("is_equipped").notNull().default(false),
});

// Quests table
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  requirement: questRequirementEnum("requirement").notNull(),
  targetValue: integer("target_value").notNull(),
  goldReward: integer("gold_reward").notNull(),
  scoreReward: integer("score_reward").notNull(),
});

// Player Quests table (many-to-many relation between players and quests)
export const playerQuests = pgTable("player_quests", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  questId: integer("quest_id").notNull().references(() => quests.id),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  claimed: boolean("claimed").notNull().default(false),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  level: true,
  score: true,
  gold: true,
  attackPower: true,
  critChance: true,
  critMultiplier: true,
  lastActive: true,
  role: true,
  maxDungeonLevel: true,
  totalClicks: true,
  totalBossesDefeated: true,
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Types for database entities
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Dungeon = typeof dungeons.$inferSelect;
export type Boss = typeof bosses.$inferSelect;
export type Item = typeof items.$inferSelect;
export type PlayerItem = typeof playerItems.$inferSelect;
export type Quest = typeof quests.$inferSelect;
export type PlayerQuest = typeof playerQuests.$inferSelect;
