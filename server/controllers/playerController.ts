import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

export function registerPlayerRoutes(app: Express) {
  // Get player profile
  app.get("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.status(200).json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update player score and clicks
  app.post("/api/players/:id/click", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      // Validate request body
      const clickSchema = z.object({
        damage: z.number().int().positive().default(1),
        bossId: z.number().int().positive()
      });
      
      const clickData = clickSchema.safeParse(req.body);
      
      if (!clickData.success) {
        return res.status(400).json({ 
          message: "Invalid click data", 
          errors: clickData.error.format() 
        });
      }

      // Get player
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Get boss
      const boss = await storage.getBoss(clickData.data.bossId);
      if (!boss) {
        return res.status(404).json({ message: "Boss not found" });
      }

      // Update player stats
      const updatedPlayer = await storage.updatePlayerClickStats(
        id, 
        clickData.data.damage,
        boss.id
      );

      // Check if boss is defeated
      const bossHealth = await storage.getBossCurrentHealth(boss.id);
      let bossDefeated = false;
      let rewards = null;

      if (bossHealth <= 0) {
        bossDefeated = true;
        rewards = await storage.defeatBoss(player.id, boss.dungeonId);
        
        // Reset boss health for next attempt
        await storage.resetBossHealth(boss.id);
      }

      res.status(200).json({
        message: "Click registered",
        player: updatedPlayer,
        bossHealth,
        bossDefeated,
        rewards
      });
    } catch (error) {
      console.error("Error processing click:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get player inventory
  app.get("/api/players/:id/inventory", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      const inventory = await storage.getPlayerInventory(id);
      res.status(200).json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Equip an item
  app.post("/api/players/:id/equip", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      // Validate request body
      const equipSchema = z.object({
        inventoryId: z.number().int().positive()
      });
      
      const equipData = equipSchema.safeParse(req.body);
      
      if (!equipData.success) {
        return res.status(400).json({ 
          message: "Invalid equip data", 
          errors: equipData.error.format() 
        });
      }

      // Check if inventory item exists and belongs to player
      const inventoryItem = await storage.getInventoryItem(equipData.data.inventoryId);
      if (!inventoryItem || inventoryItem.playerId !== id) {
        return res.status(404).json({ message: "Item not found in player's inventory" });
      }

      // Equip the item
      const updatedInventoryItem = await storage.equipItem(equipData.data.inventoryId);
      
      // Update player stats based on equipped items
      const updatedPlayer = await storage.updatePlayerStatsFromEquippedItems(id);

      res.status(200).json({
        message: "Item equipped",
        inventoryItem: updatedInventoryItem,
        player: updatedPlayer
      });
    } catch (error) {
      console.error("Error equipping item:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get player quests
  app.get("/api/players/:id/quests", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      const quests = await storage.getPlayerQuests(id);
      res.status(200).json(quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Complete a quest
  app.post("/api/players/:id/quests/:questId/complete", async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.id);
      const questId = parseInt(req.params.questId);
      
      if (isNaN(playerId) || isNaN(questId)) {
        return res.status(400).json({ message: "Invalid player or quest ID" });
      }

      // Check if player has the quest and it's completed
      const playerQuest = await storage.getPlayerQuest(playerId, questId);
      if (!playerQuest) {
        return res.status(404).json({ message: "Quest not found for player" });
      }

      if (!playerQuest.isCompleted) {
        return res.status(400).json({ message: "Quest requirements not yet met" });
      }

      // If already claimed
      if (playerQuest.completedAt) {
        return res.status(400).json({ message: "Quest rewards already claimed" });
      }

      // Claim rewards
      const rewards = await storage.claimQuestRewards(playerId, questId);

      res.status(200).json({
        message: "Quest completed and rewards claimed",
        rewards
      });
    } catch (error) {
      console.error("Error completing quest:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}
