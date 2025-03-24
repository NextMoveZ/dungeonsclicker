import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

export function registerDungeonRoutes(app: Express) {
  // Get all dungeons
  app.get("/api/dungeons", async (req: Request, res: Response) => {
    try {
      const dungeons = await storage.getAllDungeons();
      res.status(200).json(dungeons);
    } catch (error) {
      console.error("Error fetching dungeons:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get specific dungeon
  app.get("/api/dungeons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }

      const dungeon = await storage.getDungeon(id);
      if (!dungeon) {
        return res.status(404).json({ message: "Dungeon not found" });
      }

      res.status(200).json(dungeon);
    } catch (error) {
      console.error("Error fetching dungeon:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get dungeon boss
  app.get("/api/dungeons/:id/boss", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }

      const boss = await storage.getDungeonBoss(id);
      if (!boss) {
        return res.status(404).json({ message: "Boss not found" });
      }

      res.status(200).json(boss);
    } catch (error) {
      console.error("Error fetching boss:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Enter a dungeon
  app.post("/api/dungeons/:id/enter", async (req: Request, res: Response) => {
    try {
      const dungeonId = parseInt(req.params.id);
      if (isNaN(dungeonId)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }

      // Validate request body
      const enterDungeonSchema = z.object({
        playerId: z.number().int().positive()
      });
      
      const enterData = enterDungeonSchema.safeParse(req.body);
      
      if (!enterData.success) {
        return res.status(400).json({ 
          message: "Invalid enter dungeon data", 
          errors: enterData.error.format() 
        });
      }

      // Get player
      const player = await storage.getPlayer(enterData.data.playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Get dungeon
      const dungeon = await storage.getDungeon(dungeonId);
      if (!dungeon) {
        return res.status(404).json({ message: "Dungeon not found" });
      }

      // Check if player level is high enough
      if (player.level < dungeon.requiredPlayerLevel) {
        return res.status(403).json({ 
          message: `Player level too low. Required: ${dungeon.requiredPlayerLevel}, Current: ${player.level}` 
        });
      }

      // Get boss and reset health
      const boss = await storage.getDungeonBoss(dungeonId);
      if (!boss) {
        return res.status(404).json({ message: "Boss not found" });
      }

      // Reset boss health for new attempt
      await storage.resetBossHealth(boss.id);

      // Record dungeon entry
      await storage.recordDungeonEntry(player.id, dungeonId);

      res.status(200).json({
        message: "Entered dungeon successfully",
        dungeon,
        boss: {
          ...boss,
          currentHealth: boss.health // Reset health
        },
        timeLimit: dungeon.timeLimit
      });
    } catch (error) {
      console.error("Error entering dungeon:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Complete a dungeon
  app.post("/api/dungeons/:id/complete", async (req: Request, res: Response) => {
    try {
      const dungeonId = parseInt(req.params.id);
      if (isNaN(dungeonId)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }

      // Validate request body
      const completeDungeonSchema = z.object({
        playerId: z.number().int().positive(),
        timeTaken: z.number().int().positive() // in seconds
      });
      
      const completeData = completeDungeonSchema.safeParse(req.body);
      
      if (!completeData.success) {
        return res.status(400).json({ 
          message: "Invalid complete dungeon data", 
          errors: completeData.error.format() 
        });
      }

      // Get player
      const player = await storage.getPlayer(completeData.data.playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Get dungeon
      const dungeon = await storage.getDungeon(dungeonId);
      if (!dungeon) {
        return res.status(404).json({ message: "Dungeon not found" });
      }

      // Check if dungeon was completed in time
      if (completeData.data.timeTaken > dungeon.timeLimit) {
        return res.status(400).json({ 
          message: "Dungeon time limit exceeded" 
        });
      }

      // Record dungeon completion and get rewards
      const rewards = await storage.completeDungeon(
        player.id, 
        dungeonId, 
        completeData.data.timeTaken
      );

      // Update player progression if this is a new highest dungeon
      if (dungeon.level > player.highestDungeon) {
        await storage.updatePlayerHighestDungeon(player.id, dungeon.level);
      }

      res.status(200).json({
        message: "Dungeon completed successfully",
        rewards,
        nextDungeon: dungeon.level + 1
      });
    } catch (error) {
      console.error("Error completing dungeon:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}
