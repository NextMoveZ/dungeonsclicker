import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

export function registerItemRoutes(app: Express) {
  // Get all items
  app.get("/api/items", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllItems();
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get specific item
  app.get("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const item = await storage.getItem(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      res.status(200).json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get available shop items
  app.get("/api/shop", async (req: Request, res: Response) => {
    try {
      // Optionally filter by player level
      const playerLevel = req.query.level ? parseInt(req.query.level as string) : undefined;
      
      const shopItems = await storage.getShopItems(playerLevel);
      res.status(200).json(shopItems);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Purchase an item
  app.post("/api/shop/purchase", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const purchaseSchema = z.object({
        playerId: z.number().int().positive(),
        itemId: z.number().int().positive(),
        quantity: z.number().int().positive().default(1)
      });
      
      const purchaseData = purchaseSchema.safeParse(req.body);
      
      if (!purchaseData.success) {
        return res.status(400).json({ 
          message: "Invalid purchase data", 
          errors: purchaseData.error.format() 
        });
      }

      // Get player
      const player = await storage.getPlayer(purchaseData.data.playerId);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      // Get item
      const item = await storage.getItem(purchaseData.data.itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Check if player level is high enough
      if (player.level < item.requiredLevel) {
        return res.status(403).json({ 
          message: `Player level too low. Required: ${item.requiredLevel}, Current: ${player.level}` 
        });
      }

      // Check if player has enough gold
      const totalCost = item.price * purchaseData.data.quantity;
      if (player.gold < totalCost) {
        return res.status(403).json({ 
          message: `Not enough gold. Required: ${totalCost}, Current: ${player.gold}` 
        });
      }

      // Process purchase
      const result = await storage.purchaseItem(
        purchaseData.data.playerId, 
        purchaseData.data.itemId, 
        purchaseData.data.quantity
      );

      res.status(200).json({
        message: "Item purchased successfully",
        player: result.updatedPlayer,
        inventory: result.inventoryItem
      });
    } catch (error) {
      console.error("Error purchasing item:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}
