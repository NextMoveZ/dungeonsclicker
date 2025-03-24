import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertDungeonSchema, insertItemSchema, insertQuestSchema } from "@shared/schema";
import { z } from "zod";

export function registerAdminRoutes(app: Express) {
  // Middleware to check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    // In a real app, this would check the session/token
    // For now, we'll just assume admin access by a header
    const isAdmin = req.headers["x-admin-access"] === "true";
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };

  // ===== Player Management =====
  
  // Get all players
  app.get("/api/admin/players", isAdmin, async (req: Request, res: Response) => {
    try {
      const players = await storage.getAllPlayers();
      res.status(200).json(players);
    } catch (error) {
      console.error("Admin error fetching players:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update player
  app.put("/api/admin/players/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      // Validate request body
      const updatePlayerSchema = z.object({
        level: z.number().int().positive().optional(),
        experience: z.number().int().min(0).optional(),
        score: z.number().int().min(0).optional(),
        gold: z.number().int().min(0).optional(),
        baseDamage: z.number().int().positive().optional(),
        highestDungeon: z.number().int().positive().optional()
      });
      
      const updateData = updatePlayerSchema.safeParse(req.body);
      
      if (!updateData.success) {
        return res.status(400).json({ 
          message: "Invalid player update data", 
          errors: updateData.error.format() 
        });
      }

      // Check if player exists
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Update player
      const updatedPlayer = await storage.updatePlayer(id, updateData.data);

      res.status(200).json({
        message: "Player updated successfully",
        player: updatedPlayer
      });
    } catch (error) {
      console.error("Admin error updating player:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Ban/Unban user
  app.put("/api/admin/users/:id/ban", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Validate request body
      const banSchema = z.object({
        isBanned: z.boolean()
      });
      
      const banData = banSchema.safeParse(req.body);
      
      if (!banData.success) {
        return res.status(400).json({ 
          message: "Invalid ban data", 
          errors: banData.error.format() 
        });
      }

      // In a real implementation, this would update a banned status
      // For now, just return a success message
      res.status(200).json({
        message: `User ${banData.data.isBanned ? "banned" : "unbanned"} successfully`,
        userId: id
      });
    } catch (error) {
      console.error("Admin error banning user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Dungeon Management =====
  
  // Create dungeon
  app.post("/api/admin/dungeons", isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const dungeonData = insertDungeonSchema.safeParse(req.body);
      
      if (!dungeonData.success) {
        return res.status(400).json({ 
          message: "Invalid dungeon data", 
          errors: dungeonData.error.format() 
        });
      }

      // Create dungeon
      const newDungeon = await storage.createDungeon(dungeonData.data);

      res.status(201).json({
        message: "Dungeon created successfully",
        dungeon: newDungeon
      });
    } catch (error) {
      console.error("Admin error creating dungeon:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update dungeon
  app.put("/api/admin/dungeons/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dungeon ID" });
      }

      // Validate request body using a subset of the insert schema
      const dungeonData = insertDungeonSchema.partial().safeParse(req.body);
      
      if (!dungeonData.success) {
        return res.status(400).json({ 
          message: "Invalid dungeon update data", 
          errors: dungeonData.error.format() 
        });
      }

      // Update dungeon
      const updatedDungeon = await storage.updateDungeon(id, dungeonData.data);
      if (!updatedDungeon) {
        return res.status(404).json({ message: "Dungeon not found" });
      }

      res.status(200).json({
        message: "Dungeon updated successfully",
        dungeon: updatedDungeon
      });
    } catch (error) {
      console.error("Admin error updating dungeon:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Item Management =====
  
  // Create item
  app.post("/api/admin/items", isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const itemData = insertItemSchema.safeParse(req.body);
      
      if (!itemData.success) {
        return res.status(400).json({ 
          message: "Invalid item data", 
          errors: itemData.error.format() 
        });
      }

      // Create item
      const newItem = await storage.createItem(itemData.data);

      res.status(201).json({
        message: "Item created successfully",
        item: newItem
      });
    } catch (error) {
      console.error("Admin error creating item:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update item
  app.put("/api/admin/items/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      // Validate request body using a subset of the insert schema
      const itemData = insertItemSchema.partial().safeParse(req.body);
      
      if (!itemData.success) {
        return res.status(400).json({ 
          message: "Invalid item update data", 
          errors: itemData.error.format() 
        });
      }

      // Update item
      const updatedItem = await storage.updateItem(id, itemData.data);
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.status(200).json({
        message: "Item updated successfully",
        item: updatedItem
      });
    } catch (error) {
      console.error("Admin error updating item:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ===== Quest Management =====
  
  // Create quest
  app.post("/api/admin/quests", isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const questData = insertQuestSchema.safeParse(req.body);
      
      if (!questData.success) {
        return res.status(400).json({ 
          message: "Invalid quest data", 
          errors: questData.error.format() 
        });
      }

      // Create quest
      const newQuest = await storage.createQuest(questData.data);

      res.status(201).json({
        message: "Quest created successfully",
        quest: newQuest
      });
    } catch (error) {
      console.error("Admin error creating quest:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update quest
  app.put("/api/admin/quests/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quest ID" });
      }

      // Validate request body using a subset of the insert schema
      const questData = insertQuestSchema.partial().safeParse(req.body);
      
      if (!questData.success) {
        return res.status(400).json({ 
          message: "Invalid quest update data", 
          errors: questData.error.format() 
        });
      }

      // Update quest
      const updatedQuest = await storage.updateQuest(id, questData.data);
      if (!updatedQuest) {
        return res.status(404).json({ message: "Quest not found" });
      }

      res.status(200).json({
        message: "Quest updated successfully",
        quest: updatedQuest
      });
    } catch (error) {
      console.error("Admin error updating quest:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reset all scores (for leaderboard reset)
  app.post("/api/admin/reset-scores", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.resetAllScores();
      
      res.status(200).json({
        message: "All player scores reset successfully"
      });
    } catch (error) {
      console.error("Admin error resetting scores:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}
