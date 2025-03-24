import { Request, Response } from "express";
import { storage } from "../storage";

// Get all dungeons
export const getAllDungeons = async (req: Request, res: Response) => {
  try {
    const dungeons = await storage.getDungeons();
    return res.status(200).json(dungeons);
  } catch (error) {
    console.error("Get all dungeons error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลดันเจี้ยนได้ในขณะนี้" });
  }
};

// Get dungeon by ID
export const getDungeonById = async (req: Request, res: Response) => {
  try {
    const dungeonId = parseInt(req.params.id);
    
    // Validate dungeonId
    if (isNaN(dungeonId) || dungeonId <= 0) {
      return res.status(400).json({ message: "ไอดีดันเจี้ยนไม่ถูกต้อง" });
    }
    
    const dungeon = await storage.getDungeon(dungeonId);
    
    if (!dungeon) {
      return res.status(404).json({ message: "ไม่พบดันเจี้ยน" });
    }
    
    return res.status(200).json(dungeon);
  } catch (error) {
    console.error("Get dungeon by ID error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลดันเจี้ยนได้ในขณะนี้" });
  }
};

// Get dungeon by level
export const getDungeonByLevel = async (req: Request, res: Response) => {
  try {
    const level = parseInt(req.params.level);
    
    // Validate level
    if (isNaN(level) || level <= 0) {
      return res.status(400).json({ message: "ระดับดันเจี้ยนไม่ถูกต้อง" });
    }
    
    const dungeon = await storage.getDungeonByLevel(level);
    
    if (!dungeon) {
      return res.status(404).json({ message: "ไม่พบดันเจี้ยน" });
    }
    
    return res.status(200).json(dungeon);
  } catch (error) {
    console.error("Get dungeon by level error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลดันเจี้ยนได้ในขณะนี้" });
  }
};

// Get boss by dungeon ID
export const getBossByDungeonId = async (req: Request, res: Response) => {
  try {
    const dungeonId = parseInt(req.params.id);
    
    // Validate dungeonId
    if (isNaN(dungeonId) || dungeonId <= 0) {
      return res.status(400).json({ message: "ไอดีดันเจี้ยนไม่ถูกต้อง" });
    }
    
    const boss = await storage.getBossByDungeonId(dungeonId);
    
    if (!boss) {
      return res.status(404).json({ message: "ไม่พบบอสของดันเจี้ยนนี้" });
    }
    
    return res.status(200).json(boss);
  } catch (error) {
    console.error("Get boss by dungeon ID error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลบอสได้ในขณะนี้" });
  }
};

// Unlock dungeon
export const unlockDungeon = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const dungeonLevel = parseInt(req.params.level);
    
    // Validate dungeonLevel
    if (isNaN(dungeonLevel) || dungeonLevel <= 0) {
      return res.status(400).json({ message: "ระดับดันเจี้ยนไม่ถูกต้อง" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Check if dungeon exists
    const dungeon = await storage.getDungeonByLevel(dungeonLevel);
    
    if (!dungeon) {
      return res.status(404).json({ message: "ไม่พบดันเจี้ยน" });
    }
    
    // Check if player has required level
    if (user.level < dungeon.requiredPlayerLevel) {
      return res.status(403).json({ 
        success: false,
        message: `ต้องการเลเวล ${dungeon.requiredPlayerLevel} เพื่อปลดล็อคดันเจี้ยนนี้` 
      });
    }
    
    // Check if the dungeon level is higher than player's current max dungeon level
    if (dungeonLevel > user.maxDungeonLevel) {
      // Update max dungeon level
      await storage.updateUser(user.id, { 
        maxDungeonLevel: dungeonLevel,
        lastActive: new Date()
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: `ปลดล็อคดันเจี้ยนชั้นที่ ${dungeonLevel} สำเร็จ`
    });
  } catch (error) {
    console.error("Unlock dungeon error:", error);
    return res.status(500).json({ 
      success: false,
      message: "ไม่สามารถปลดล็อคดันเจี้ยนได้ในขณะนี้" 
    });
  }
};
