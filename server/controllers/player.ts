import { Request, Response } from "express";
import { storage } from "../storage";

// Get player data
export const getPlayerData = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Update last active timestamp
    await storage.updateUser(user.id, { lastActive: new Date() });
    
    // Return player data (excluding password)
    const { password, ...playerData } = user;
    return res.status(200).json(playerData);
  } catch (error) {
    console.error("Get player data error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้เล่นได้ในขณะนี้" });
  }
};

// Update player score
export const updatePlayerScore = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const { amount } = req.body;
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: "จำนวนคะแนนไม่ถูกต้อง" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Update score
    const newScore = user.score + amount;
    
    // Check if player should level up (simple level calculation)
    let newLevel = user.level;
    const scoreForNextLevel = user.level * 1000;
    
    if (newScore >= scoreForNextLevel) {
      newLevel = Math.floor(newScore / 1000) + 1;
    }
    
    // Update user
    const updatedUser = await storage.updateUser(user.id, { 
      score: newScore,
      level: newLevel,
      lastActive: new Date()
    });
    
    if (!updatedUser) {
      return res.status(500).json({ message: "ไม่สามารถอัปเดตคะแนนได้" });
    }
    
    // Return updated score and level
    return res.status(200).json({ 
      score: updatedUser.score,
      level: updatedUser.level,
      levelUp: newLevel > user.level
    });
  } catch (error) {
    console.error("Update player score error:", error);
    return res.status(500).json({ message: "ไม่สามารถอัปเดตคะแนนได้ในขณะนี้" });
  }
};

// Update player gold
export const updatePlayerGold = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const { amount } = req.body;
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: "จำนวนทองไม่ถูกต้อง" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Update gold
    const updatedUser = await storage.updateUser(user.id, { 
      gold: user.gold + amount,
      lastActive: new Date()
    });
    
    if (!updatedUser) {
      return res.status(500).json({ message: "ไม่สามารถอัปเดตทองได้" });
    }
    
    // Return updated gold
    return res.status(200).json({ gold: updatedUser.gold });
  } catch (error) {
    console.error("Update player gold error:", error);
    return res.status(500).json({ message: "ไม่สามารถอัปเดตทองได้ในขณะนี้" });
  }
};

// Update player click count
export const updatePlayerClicks = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const { clicks } = req.body;
    
    // Validate clicks
    if (typeof clicks !== 'number' || clicks <= 0) {
      return res.status(400).json({ message: "จำนวนคลิกไม่ถูกต้อง" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Update clicks
    const updatedUser = await storage.updateUser(user.id, { 
      totalClicks: user.totalClicks + clicks,
      lastActive: new Date()
    });
    
    if (!updatedUser) {
      return res.status(500).json({ message: "ไม่สามารถอัปเดตจำนวนคลิกได้" });
    }
    
    // Return updated clicks
    return res.status(200).json({ totalClicks: updatedUser.totalClicks });
  } catch (error) {
    console.error("Update player clicks error:", error);
    return res.status(500).json({ message: "ไม่สามารถอัปเดตจำนวนคลิกได้ในขณะนี้" });
  }
};

// Update bosses defeated count
export const updateBossesDefeated = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const { count } = req.body;
    
    // Validate count
    if (typeof count !== 'number' || count <= 0) {
      return res.status(400).json({ message: "จำนวนบอสไม่ถูกต้อง" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Update bosses defeated
    const updatedUser = await storage.updateUser(user.id, { 
      totalBossesDefeated: user.totalBossesDefeated + count,
      lastActive: new Date()
    });
    
    if (!updatedUser) {
      return res.status(500).json({ message: "ไม่สามารถอัปเดตจำนวนบอสที่กำจัดได้" });
    }
    
    // Return updated bosses defeated
    return res.status(200).json({ totalBossesDefeated: updatedUser.totalBossesDefeated });
  } catch (error) {
    console.error("Update bosses defeated error:", error);
    return res.status(500).json({ message: "ไม่สามารถอัปเดตจำนวนบอสที่กำจัดได้ในขณะนี้" });
  }
};

// Get player items
export const getPlayerItems = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    // Get player items
    const playerItems = await storage.getPlayerItems(req.session.userId);
    
    return res.status(200).json(playerItems);
  } catch (error) {
    console.error("Get player items error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลไอเทมของผู้เล่นได้ในขณะนี้" });
  }
};

// Purchase item
export const purchaseItem = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const { itemId } = req.body;
    
    // Validate itemId
    if (typeof itemId !== 'number' || itemId <= 0) {
      return res.status(400).json({ message: "ไอดีไอเทมไม่ถูกต้อง" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้เล่น" });
    }
    
    // Get item by ID
    const item = await storage.getItem(itemId);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: "ไม่พบไอเทม" });
    }
    
    // Check if player has enough gold
    if (user.gold < item.price) {
      return res.status(400).json({ 
        success: false,
        message: "ทองไม่เพียงพอ" 
      });
    }
    
    // Add item to player inventory
    await storage.addItemToPlayer(user.id, item.id);
    
    // Update player gold
    const updatedUser = await storage.updateUser(user.id, { 
      gold: user.gold - item.price,
      lastActive: new Date()
    });
    
    if (!updatedUser) {
      return res.status(500).json({ 
        success: false,
        message: "ไม่สามารถซื้อไอเทมได้" 
      });
    }
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: "ซื้อไอเทมสำเร็จ",
      remainingGold: updatedUser.gold
    });
  } catch (error) {
    console.error("Purchase item error:", error);
    return res.status(500).json({ 
      success: false,
      message: "ไม่สามารถซื้อไอเทมได้ในขณะนี้" 
    });
  }
};

// Equip/unequip item
export const toggleEquipItem = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const playerItemId = parseInt(req.params.id);
    const { equip } = req.body;
    
    // Validate playerItemId
    if (isNaN(playerItemId) || playerItemId <= 0) {
      return res.status(400).json({ message: "ไอดีไอเทมไม่ถูกต้อง" });
    }
    
    // Get player items
    const playerItems = await storage.getPlayerItems(req.session.userId);
    
    // Check if player owns this item
    const playerItem = playerItems.find(item => item.id === playerItemId);
    
    if (!playerItem) {
      return res.status(404).json({ message: "ไม่พบไอเทมในกระเป๋าของผู้เล่น" });
    }
    
    // Update equip status
    const updatedPlayerItem = await storage.updatePlayerItem(playerItemId, { isEquipped: equip });
    
    if (!updatedPlayerItem) {
      return res.status(500).json({ 
        message: equip ? "ไม่สามารถสวมใส่ไอเทมได้" : "ไม่สามารถถอดไอเทมได้" 
      });
    }
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: equip ? "สวมใส่ไอเทมสำเร็จ" : "ถอดไอเทมสำเร็จ"
    });
  } catch (error) {
    console.error("Toggle equip item error:", error);
    return res.status(500).json({ 
      message: "ไม่สามารถจัดการไอเทมได้ในขณะนี้" 
    });
  }
};

// Use item
export const useItem = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    const playerItemId = parseInt(req.params.id);
    
    // Validate playerItemId
    if (isNaN(playerItemId) || playerItemId <= 0) {
      return res.status(400).json({ message: "ไอดีไอเทมไม่ถูกต้อง" });
    }
    
    // Get player items
    const playerItems = await storage.getPlayerItems(req.session.userId);
    
    // Check if player owns this item
    const playerItem = playerItems.find(item => item.id === playerItemId);
    
    if (!playerItem) {
      return res.status(404).json({ 
        success: false,
        message: "ไม่พบไอเทมในกระเป๋าของผู้เล่น" 
      });
    }
    
    // Check if item is equipped
    if (playerItem.isEquipped) {
      return res.status(400).json({ 
        success: false,
        message: "ไม่สามารถใช้ไอเทมที่สวมใส่อยู่ได้" 
      });
    }
    
    // Get user
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "ไม่พบผู้เล่น" 
      });
    }
    
    // Apply item effect
    let playerUpdate: Partial<typeof user> = { lastActive: new Date() };
    
    switch (playerItem.item.effect) {
      case "attack_power":
        playerUpdate.attackPower = user.attackPower + playerItem.item.value;
        break;
      case "crit_chance":
        playerUpdate.critChance = user.critChance + playerItem.item.value;
        break;
      case "crit_multiplier":
        playerUpdate.critMultiplier = user.critMultiplier + playerItem.item.value;
        break;
      case "gold_bonus":
        playerUpdate.gold = user.gold + playerItem.item.value;
        break;
      case "score_bonus":
        playerUpdate.score = user.score + playerItem.item.value;
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: "ไม่รู้จักประเภทของไอเทม" 
        });
    }
    
    // Update player
    const updatedUser = await storage.updateUser(user.id, playerUpdate);
    
    if (!updatedUser) {
      return res.status(500).json({ 
        success: false,
        message: "ไม่สามารถอัปเดตสถานะผู้เล่นได้" 
      });
    }
    
    // Update player item (decrease quantity or remove if quantity is 0)
    if (playerItem.quantity > 1) {
      await storage.updatePlayerItem(playerItemId, { quantity: playerItem.quantity - 1 });
    } else {
      // In a real app, we would delete the item, but for simplicity we'll just set quantity to 0
      await storage.updatePlayerItem(playerItemId, { quantity: 0 });
    }
    
    // Return success with updated player stats
    const { password, ...playerWithoutPassword } = updatedUser;
    
    return res.status(200).json({ 
      success: true, 
      message: "ใช้ไอเทมสำเร็จ",
      playerUpdate: playerWithoutPassword
    });
  } catch (error) {
    console.error("Use item error:", error);
    return res.status(500).json({ 
      success: false,
      message: "ไม่สามารถใช้ไอเทมได้ในขณะนี้" 
    });
  }
};
