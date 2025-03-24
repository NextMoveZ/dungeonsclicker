import { Request, Response } from "express";
import { storage } from "../storage";
import { loginSchema, registerSchema, insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Login handler
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({ message: validationError.message });
    }
    
    const { username, password } = result.data;
    
    // Find user by username
    const user = await storage.getUserByUsername(username);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    
    // Check password (compare plain password with hashed password in db)
    // In a real app this would be using bcrypt.compare() or similar
    if (user.password !== password) {
      return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
    
    // Update last active timestamp
    await storage.updateUser(user.id, { lastActive: new Date() });
    
    // Store user in session
    if (req.session) {
      req.session.userId = user.id;
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({ player: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง" });
  }
};

// Register handler
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      const validationError = fromZodError(result.error);
      return res.status(400).json({ message: validationError.message });
    }
    
    const { username, password, confirmPassword } = result.data;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "รหัสผ่านไม่ตรงกัน" });
    }
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }
    
    // Create user
    // In a real app, we would hash the password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await storage.createUser({
      username,
      password, // In a real app, this would be hashedPassword
    });
    
    // Store user in session
    if (req.session) {
      req.session.userId = newUser.id;
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ player: userWithoutPassword });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "ไม่สามารถสมัครสมาชิกได้ในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง" });
  }
};

// Logout handler
export const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "ไม่สามารถออกจากระบบได้ในขณะนี้" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      return res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
    });
  } else {
    return res.status(200).json({ message: "ออกจากระบบสำเร็จ" });
  }
};

// Get current user handler
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "ไม่ได้เข้าสู่ระบบ" });
    }
    
    // Get user by ID
    const user = await storage.getUser(req.session.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "ไม่พบผู้ใช้" });
    }
    
    // Update last active timestamp
    await storage.updateUser(user.id, { lastActive: new Date() });
    
    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้ในขณะนี้" });
  }
};
