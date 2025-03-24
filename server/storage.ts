import { and, eq } from "drizzle-orm";
import { 
  users, User, InsertUser, 
  dungeons, Dungeon, 
  bosses, Boss, 
  items, Item, 
  playerItems, PlayerItem,
  quests, Quest,
  playerQuests, PlayerQuest
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getTopPlayers(limit: number): Promise<User[]>;
  
  // Dungeon methods
  getDungeons(): Promise<Dungeon[]>;
  getDungeon(id: number): Promise<Dungeon | undefined>;
  getDungeonByLevel(level: number): Promise<Dungeon | undefined>;
  
  // Boss methods
  getBossByDungeonId(dungeonId: number): Promise<Boss | undefined>;
  
  // Item methods
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  
  // Player Items methods
  getPlayerItems(playerId: number): Promise<(PlayerItem & { item: Item })[]>;
  addItemToPlayer(playerId: number, itemId: number): Promise<PlayerItem>;
  updatePlayerItem(id: number, data: Partial<PlayerItem>): Promise<PlayerItem | undefined>;
  
  // Quest methods
  getQuests(): Promise<Quest[]>;
  getPlayerQuests(playerId: number): Promise<(PlayerQuest & { quest: Quest })[]>;
  updatePlayerQuest(id: number, data: Partial<PlayerQuest>): Promise<PlayerQuest | undefined>;
}

// Memory Storage implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dungeons: Map<number, Dungeon>;
  private bosses: Map<number, Boss>;
  private items: Map<number, Item>;
  private playerItems: Map<number, PlayerItem>;
  private quests: Map<number, Quest>;
  private playerQuests: Map<number, PlayerQuest>;
  
  private userIdCounter: number;
  private dungeonIdCounter: number;
  private bossIdCounter: number;
  private itemIdCounter: number;
  private playerItemIdCounter: number;
  private questIdCounter: number;
  private playerQuestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.dungeons = new Map();
    this.bosses = new Map();
    this.items = new Map();
    this.playerItems = new Map();
    this.quests = new Map();
    this.playerQuests = new Map();
    
    this.userIdCounter = 1;
    this.dungeonIdCounter = 1;
    this.bossIdCounter = 1;
    this.itemIdCounter = 1;
    this.playerItemIdCounter = 1;
    this.questIdCounter = 1;
    this.playerQuestIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    const adminUser: InsertUser = {
      username: "nextmovez_admin",
      password: "ADMIN_PANEL_NMZ_202737", // In a real app, this would be hashed
      role: "admin"
    };
    this.createUser(adminUser);
    
    // Create initial dungeons (10 for now)
    for (let i = 1; i <= 10; i++) {
      const dungeon: Dungeon = {
        id: this.dungeonIdCounter++,
        level: i,
        name: `ดันเจี้ยนชั้นที่ ${i}`,
        description: `ดันเจี้ยนสำหรับผู้เล่นระดับ ${i}`,
        requiredPlayerLevel: i,
        background: i % 3 === 0 ? "sand.jpg" : i % 2 === 0 ? "wood.jpg" : "grass.png",
        timeLimit: 60 + (i * 5), // Time increases with level
      };
      this.dungeons.set(dungeon.id, dungeon);
      
      // Create boss for each dungeon
      const boss: Boss = {
        id: this.bossIdCounter++,
        dungeonId: dungeon.id,
        name: `บอสชั้น ${i}`,
        health: 50 * i,
        maxHealth: 50 * i,
        goldReward: 10 * i,
        scoreReward: 100 * i,
        texture: "boss_" + (i % 5 + 1),
      };
      this.bosses.set(boss.id, boss);
    }
    
    // Create initial items
    const itemsData = [
      {
        name: "ดาบไม้",
        description: "เพิ่มพลังโจมตี 2 หน่วย",
        price: 50,
        effect: "attack_power" as const,
        value: 2,
        icon: "sword_1",
        isUnique: true
      },
      {
        name: "ดาบเหล็ก",
        description: "เพิ่มพลังโจมตี 5 หน่วย",
        price: 150,
        effect: "attack_power" as const,
        value: 5,
        icon: "sword_2",
        isUnique: true
      },
      {
        name: "ถุงมือคริติคอล",
        description: "เพิ่มโอกาสคริติคอล 3%",
        price: 100,
        effect: "crit_chance" as const,
        value: 3,
        icon: "glove_1",
        isUnique: true
      },
      {
        name: "น้ำยาพลัง",
        description: "เพิ่มพลังโจมตี 1 หน่วย",
        price: 25,
        effect: "attack_power" as const,
        value: 1,
        icon: "potion_1",
        isUnique: false
      },
      {
        name: "น้ำยาโชค",
        description: "เพิ่มโอกาสคริติคอล 1%",
        price: 30,
        effect: "crit_chance" as const,
        value: 1,
        icon: "potion_2",
        isUnique: false
      }
    ];
    
    itemsData.forEach(itemData => {
      const item: Item = {
        id: this.itemIdCounter++,
        ...itemData
      };
      this.items.set(item.id, item);
    });
    
    // Create initial quests
    const questsData = [
      {
        name: "นักสะสมทอง",
        description: "สะสมทอง 100 ชิ้น",
        requirement: "earn_gold" as const,
        targetValue: 100,
        goldReward: 50,
        scoreReward: 100
      },
      {
        name: "นักฆ่ามือใหม่",
        description: "กำจัดบอส 5 ตัว",
        requirement: "defeat_bosses" as const,
        targetValue: 5,
        goldReward: 75,
        scoreReward: 150
      },
      {
        name: "นักคลิกมือเซียน",
        description: "คลิก 200 ครั้ง",
        requirement: "perform_clicks" as const,
        targetValue: 200,
        goldReward: 60,
        scoreReward: 120
      }
    ];
    
    questsData.forEach(questData => {
      const quest: Quest = {
        id: this.questIdCounter++,
        ...questData
      };
      this.quests.set(quest.id, quest);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      id,
      level: 1,
      score: 0,
      gold: 0,
      attackPower: 1,
      critChance: 5.0, // 5% default
      critMultiplier: 2.0, // 2x default
      lastActive: new Date(),
      maxDungeonLevel: 1,
      totalClicks: 0,
      totalBossesDefeated: 0,
      ...user
    };
    
    this.users.set(id, newUser);
    
    // Add default quests for new user
    this.quests.forEach(quest => {
      const playerQuest: PlayerQuest = {
        id: this.playerQuestIdCounter++,
        playerId: id,
        questId: quest.id,
        progress: 0,
        completed: false,
        claimed: false
      };
      this.playerQuests.set(playerQuest.id, playerQuest);
    });
    
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data, lastActive: new Date() };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }

  async getTopPlayers(limit: number): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role !== "admin") // Exclude admins
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Dungeon methods
  async getDungeons(): Promise<Dungeon[]> {
    return Array.from(this.dungeons.values())
      .sort((a, b) => a.level - b.level);
  }

  async getDungeon(id: number): Promise<Dungeon | undefined> {
    return this.dungeons.get(id);
  }

  async getDungeonByLevel(level: number): Promise<Dungeon | undefined> {
    for (const dungeon of this.dungeons.values()) {
      if (dungeon.level === level) {
        return dungeon;
      }
    }
    return undefined;
  }

  // Boss methods
  async getBossByDungeonId(dungeonId: number): Promise<Boss | undefined> {
    for (const boss of this.bosses.values()) {
      if (boss.dungeonId === dungeonId) {
        return boss;
      }
    }
    return undefined;
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  // Player Items methods
  async getPlayerItems(playerId: number): Promise<(PlayerItem & { item: Item })[]> {
    const result: (PlayerItem & { item: Item })[] = [];
    
    for (const playerItem of this.playerItems.values()) {
      if (playerItem.playerId === playerId) {
        const item = this.items.get(playerItem.itemId);
        if (item) {
          result.push({ ...playerItem, item });
        }
      }
    }
    
    return result;
  }

  async addItemToPlayer(playerId: number, itemId: number): Promise<PlayerItem> {
    // Check if player already has this item (for unique items)
    const item = this.items.get(itemId);
    let existingPlayerItem: PlayerItem | undefined;
    
    if (item && item.isUnique) {
      for (const playerItem of this.playerItems.values()) {
        if (playerItem.playerId === playerId && playerItem.itemId === itemId) {
          existingPlayerItem = playerItem;
          break;
        }
      }
    }
    
    if (existingPlayerItem) {
      // Increment quantity for non-unique items
      if (!item?.isUnique) {
        const updatedPlayerItem = { 
          ...existingPlayerItem, 
          quantity: existingPlayerItem.quantity + 1 
        };
        this.playerItems.set(existingPlayerItem.id, updatedPlayerItem);
        return updatedPlayerItem;
      }
      return existingPlayerItem;
    } else {
      // Create new player item
      const newPlayerItem: PlayerItem = {
        id: this.playerItemIdCounter++,
        playerId,
        itemId,
        quantity: 1,
        isEquipped: false
      };
      this.playerItems.set(newPlayerItem.id, newPlayerItem);
      return newPlayerItem;
    }
  }

  async updatePlayerItem(id: number, data: Partial<PlayerItem>): Promise<PlayerItem | undefined> {
    const playerItem = this.playerItems.get(id);
    if (!playerItem) return undefined;
    
    const updatedPlayerItem = { ...playerItem, ...data };
    this.playerItems.set(id, updatedPlayerItem);
    
    return updatedPlayerItem;
  }

  // Quest methods
  async getQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  async getPlayerQuests(playerId: number): Promise<(PlayerQuest & { quest: Quest })[]> {
    const result: (PlayerQuest & { quest: Quest })[] = [];
    
    for (const playerQuest of this.playerQuests.values()) {
      if (playerQuest.playerId === playerId) {
        const quest = this.quests.get(playerQuest.questId);
        if (quest) {
          result.push({ ...playerQuest, quest });
        }
      }
    }
    
    return result;
  }

  async updatePlayerQuest(id: number, data: Partial<PlayerQuest>): Promise<PlayerQuest | undefined> {
    const playerQuest = this.playerQuests.get(id);
    if (!playerQuest) return undefined;
    
    const updatedPlayerQuest = { ...playerQuest, ...data };
    this.playerQuests.set(id, updatedPlayerQuest);
    
    return updatedPlayerQuest;
  }
}

// Export the storage instance
export const storage = new MemStorage();
