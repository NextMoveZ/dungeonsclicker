import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import * as authController from "./controllers/auth";
import * as playerController from "./controllers/player";
import * as dungeonController from "./controllers/dungeon";
import * as itemController from "./controllers/item";
import * as adminController from "./controllers/admin";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: "dungeon-clicker-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
  }));

  // Auth routes
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/me", authController.getCurrentUser);

  // Player routes
  app.get("/api/player/me", playerController.getPlayerData);
  app.put("/api/player/:id/score", playerController.updatePlayerScore);
  app.put("/api/player/:id/gold", playerController.updatePlayerGold);
  app.put("/api/player/:id/clicks", playerController.updatePlayerClicks);
  app.put("/api/player/:id/bosses", playerController.updateBossesDefeated);
  app.get("/api/player/:id/items", playerController.getPlayerItems);
  app.post("/api/player/:id/purchase", playerController.purchaseItem);
  app.put("/api/player/items/:id/equip", playerController.toggleEquipItem);
  app.post("/api/player/items/:id/use", playerController.useItem);

  // Dungeon routes
  app.get("/api/dungeons", dungeonController.getAllDungeons);
  app.get("/api/dungeons/:id", dungeonController.getDungeonById);
  app.get("/api/dungeons/level/:level", dungeonController.getDungeonByLevel);
  app.get("/api/dungeons/:id/boss", dungeonController.getBossByDungeonId);
  app.post("/api/dungeons/level/:level/unlock", dungeonController.unlockDungeon);

  // Item routes
  app.get("/api/items", itemController.getAllItems);
  app.get("/api/items/:id", itemController.getItemById);

  // Admin routes (protected by admin middleware)
  app.get("/api/admin/players", adminController.isAdmin, adminController.getAllPlayers);
  app.get("/api/admin/players/:id", adminController.isAdmin, adminController.getPlayerById);
  app.put("/api/admin/players/:id", adminController.isAdmin, adminController.updatePlayer);
  app.post("/api/admin/players/:id/reset-score", adminController.isAdmin, adminController.resetPlayerScore);
  app.put("/api/admin/bosses/:id", adminController.isAdmin, adminController.updateBoss);

  const httpServer = createServer(app);

  return httpServer;
}
