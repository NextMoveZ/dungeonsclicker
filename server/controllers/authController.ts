import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export function registerAuthRoutes(app: Express) {
  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const userData = insertUserSchema.safeParse(req.body);
      
      if (!userData.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: userData.error.format() 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({
        username: userData.data.username,
        password: userData.data.password, // In a real app, this would be hashed
        isAdmin: false // Default to regular user
      });

      // Create player profile for the new user
      await storage.createPlayer({
        userId: newUser.id,
        level: 1,
        experience: 0,
        score: 0,
        totalClicks: 0,
        baseDamage: 1,
        gold: 0,
        highestDungeon: 1
      });

      // Don't send password back to client
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const loginSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(6)
      });
      
      const loginData = loginSchema.safeParse(req.body);
      
      if (!loginData.success) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: loginData.error.format() 
        });
      }

      // Find user by username
      const user = await storage.getUserByUsername(loginData.data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password (in a real app, would compare hash)
      if (user.password !== loginData.data.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Get player data
      const player = await storage.getPlayerByUserId(user.id);

      // Update last login time
      await storage.updateUserLastLogin(user.id);

      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        message: "Login successful",
        user: userWithoutPassword,
        player
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.status(200).json({ message: "Logout successful" });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    // In a real app, this would check the session/token
    // For now, we'll just return a placeholder
    res.status(200).json({ 
      message: "This would return the current authenticated user" 
    });
  });
}
