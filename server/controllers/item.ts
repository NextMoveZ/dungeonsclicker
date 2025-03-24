import { Request, Response } from "express";
import { storage } from "../storage";

// Get all items
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await storage.getItems();
    return res.status(200).json(items);
  } catch (error) {
    console.error("Get all items error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลไอเทมได้ในขณะนี้" });
  }
};

// Get item by ID
export const getItemById = async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    
    // Validate itemId
    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({ message: "ไอดีไอเทมไม่ถูกต้อง" });
    }
    
    const item = await storage.getItem(itemId);
    
    if (!item) {
      return res.status(404).json({ message: "ไม่พบไอเทม" });
    }
    
    return res.status(200).json(item);
  } catch (error) {
    console.error("Get item by ID error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลไอเทมได้ในขณะนี้" });
  }
};
