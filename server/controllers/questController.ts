import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerQuestRoutes(app: Express) {
  // Get all available quests
  app.get("/api/quests", async (req: Request, res: Response) => {
    try {
      // Optionally filter by player level
      const playerLevel = req.query.level ? parseInt(req.query.level as string) : undefined;
      
      const quests = await storage.getAvailableQuests(playerLevel);
      res.status(200).json(quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get specific quest
  app.get("/api/quests/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quest ID" });
      }

      const quest = await storage.getQuest(id);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      res.status(200).json(quest);
    } catch (error) {
      console.error("Error fetching quest:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Accept a quest
  app.post("/api/players/:playerId/quests/:questId/accept", async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const questId = parseInt(req.params.questId);
      
      if (isNaN(playerId) || isNaN(questId)) {
        return res.status(400).json({ message: "Invalid player or quest ID" });
      }

      // Check if player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Check if quest exists
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      // Check if player level is high enough
      if (player.level < quest.requiredLevel) {
        return res.status(403).json({ 
          message: `Player level too low. Required: ${quest.requiredLevel}, Current: ${player.level}` 
        });
      }

      // Check if player already has this quest
      const existingQuest = await storage.getPlayerQuest(playerId, questId);
      if (existingQuest) {
        return res.status(409).json({ message: "Player already has this quest" });
      }

      // Accept the quest
      const playerQuest = await storage.acceptQuest(playerId, questId);

      res.status(200).json({
        message: "Quest accepted",
        playerQuest
      });
    } catch (error) {
      console.error("Error accepting quest:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update quest progress
  app.post("/api/players/:playerId/quests/:questId/progress", async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const questId = parseInt(req.params.questId);
      
      if (isNaN(playerId) || isNaN(questId)) {
        return res.status(400).json({ message: "Invalid player or quest ID" });
      }

      // Check if player has the quest
      const playerQuest = await storage.getPlayerQuest(playerId, questId);
      if (!playerQuest) {
        return res.status(404).json({ message: "Quest not found for player" });
      }

      // Check if quest is already completed
      if (playerQuest.isCompleted) {
        return res.status(400).json({ message: "Quest already completed" });
      }

      // Update progress based on player's actions
      // In a real implementation, this would be called automatically
      // when relevant actions occur (clicks, boss defeats, etc.)
      const updatedQuest = await storage.updateQuestProgress(playerId, questId);

      res.status(200).json({
        message: "Quest progress updated",
        playerQuest: updatedQuest,
        isCompleted: updatedQuest.isCompleted
      });
    } catch (error) {
      console.error("Error updating quest progress:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}
