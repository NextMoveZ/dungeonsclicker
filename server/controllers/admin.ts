import { Request, Response } from "express";
import { storage } from "../storage";

// Check if user is admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists and is admin
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง" });
    }
    
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" });
  }
};

// Get all players
export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    // Get all users
    const users = Array.from((storage as any).users.values());
    
    // Return users without passwords
    const players = users.map(user => {
      const { password, ...playerWithoutPassword } = user;
      return playerWithoutPassword;
    });
    
    return res.status(200).json(players);
  } catch (error) {
    console.error("Get all players error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้เล่นทั้งหมดได้ในขณะนี้" });
  }
};

// Get player by ID
export const getPlayerById = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate playerId
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ message: "ไอดีผู้เล่นไม่ถูกต้อง" });
    }
    
    const user = await storage.getUser(playerId);
    
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Return user without password
    const { password, ...playerWithoutPassword } = user;
    
    return res.status(200).json(playerWithoutPassword);
  } catch (error) {
    console.error("Get player by ID error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้เล่นได้ในขณะนี้" });
  }
};

// Update player
export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate playerId
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ message: "ไอดีผู้เล่นไม่ถูกต้อง" });
    }
    
    // Get allowed fields to update
    const { level, gold, attackPower, maxDungeonLevel } = req.body;
    
    // Create update object with only allowed fields
    const updateData: any = {};
    
    if (level !== undefined && typeof level === 'number' && level > 0) {
      updateData.level = level;
    }
    
    if (gold !== undefined && typeof gold === 'number' && gold >= 0) {
      updateData.gold = gold;
    }
    
    if (attackPower !== undefined && typeof attackPower === 'number' && attackPower > 0) {
      updateData.attackPower = attackPower;
    }
    
    if (maxDungeonLevel !== undefined && typeof maxDungeonLevel === 'number' && maxDungeonLevel > 0) {
      updateData.maxDungeonLevel = maxDungeonLevel;
    }
    
    // Add lastActive timestamp
    updateData.lastActive = new Date();
    
    // If no valid fields to update
    if (Object.keys(updateData).length === 1) { // Only lastActive
      return res.status(400).json({ message: "ไม่มีข้อมูลที่จะอัปเดต" });
    }
    
    const updatedUser = await storage.updateUser(playerId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Return updated user without password
    const { password, ...playerWithoutPassword } = updatedUser;
    
    return res.status(200).json(playerWithoutPassword);
  } catch (error) {
    console.error("Update player error:", error);
    return res.status(500).json({ message: "ไม่สามารถอัปเดตข้อมูลผู้เล่นได้ในขณะนี้" });
  }
};

// Reset player score
export const resetPlayerScore = async (req: Request, res: Response) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate playerId
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ message: "ไอดีผู้เล่นไม่ถูกต้อง" });
    }
    
    const updatedUser = await storage.updateUser(playerId, { 
      score: 0,
      lastActive: new Date()
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Return success
    return res.status(200).json({ 
      success: true,
      message: "รีเซ็ตคะแนนสำเร็จ"
    });
  } catch (error) {
    console.error("Reset player score error:", error);
    return res.status(500).json({ message: "ไม่สามารถรีเซ็ตคะแนนผู้เล่นได้ในขณะนี้" });
  }
};

// Update boss
export const updateBoss = async (req: Request, res: Response) => {
  try {
    const bossId = parseInt(req.params.id);
    
    // Validate bossId
    if (isNaN(bossId) || bossId <= 0) {
      return res.status(400).json({ message: "ไอดีบอสไม่ถูกต้อง" });
    }
    
    // Get allowed fields to update
    const { maxHealth, health, goldReward, scoreReward } = req.body;
    
    // Create update object with only allowed fields
    const updateData: any = {};
    
    if (maxHealth !== undefined && typeof maxHealth === 'number' && maxHealth > 0) {
      updateData.maxHealth = maxHealth;
    }
    
    if (health !== undefined && typeof health === 'number' && health > 0) {
      updateData.health = health;
    }
    
    if (goldReward !== undefined && typeof goldReward === 'number' && goldReward >= 0) {
      updateData.goldReward = goldReward;
    }
    
    if (scoreReward !== undefined && typeof scoreReward === 'number' && scoreReward >= 0) {
      updateData.scoreReward = scoreReward;
    }
    
    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "ไม่มีข้อมูลที่จะอัปเดต" });
    }
    
    // Get all bosses
    const bosses = Array.from((storage as any).bosses.values());
    
    // Find the boss to update
    const bossToUpdate = bosses.find(boss => boss.id === bossId);
    
    if (!bossToUpdate) {
      return res.status(404).json({ message: "ไม่พบบอส" });
    }
    
    // Update boss
    const updatedBoss = { ...bossToUpdate, ...updateData };
    (storage as any).bosses.set(bossId, updatedBoss);
    
    // Return updated boss
    return res.status(200).json(updatedBoss);
  } catch (error) {
    console.error("Update boss error:", error);
    return res.status(500).json({ message: "ไม่สามารถอัปเดตข้อมูลบอสได้ในขณะนี้" });
  }
};

export { isAdmin };
