import { create } from 'zustand';

type Language = 'en' | 'th';

interface LanguageState {
  language: Language;
  translations: Record<string, Record<string, string>>;
  
  // Actions
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Define translations
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    "app.title": "Dungeon Clicker",
    "app.subtitle": "Click your way through dungeons and defeat mighty bosses",
    "app.loading": "Loading...",
    "app.error": "An error occurred",
    "app.back": "Back to Home",
    
    // Home
    "home.weeklyTitle": "This Week",
    "home.topPlayers": "Top Players",
    "home.rank": "Rank",
    "home.player": "Player",
    "home.features": "Game Features",
    "home.clickingSystem": "Clicking System",
    "home.clickingDesc": "Click on bosses to deal damage and earn score. Critical hits will deal more damage.",
    "home.dungeons": "100 Dungeons",
    "home.dungeonsDesc": "Fight in each dungeon with limited time. Collect rewards to upgrade your character.",
    "home.characterSystem": "Character System",
    "home.characterDesc": "Improve your character with items and equipment to increase attack power and critical chance.",
    "home.footerDesc": "The clicker game that will have you hooked",
    
    // Auth
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.usernameRequired": "Username is required",
    "auth.passwordRequired": "Password is required",
    "auth.passwordMismatch": "Passwords don't match",
    "auth.loginError": "Username or password is incorrect",
    "auth.registerError": "Username already exists",
    "auth.loginTitle": "Login",
    "auth.loginSubtitle": "Login to play Dungeon Clicker",
    "auth.registerTitle": "Register",
    "auth.registerSubtitle": "Create an account to start your adventure",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.usernamePlaceholder": "Enter your username",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.confirmPasswordPlaceholder": "Confirm your password",
    "auth.loggingIn": "Logging in...",
    "auth.registering": "Registering...",
    
    // Game
    "game.start": "Start Game",
    "game.level": "Level",
    "game.gold": "Gold",
    "game.score": "Score",
    "game.attackPower": "Attack Power",
    "game.critChance": "Critical Chance",
    "game.critMultiplier": "Critical Multiplier",
    "game.totalClicks": "Total Clicks",
    "game.bossesDefeated": "Bosses Defeated",
    "game.clickToAttack": "Click to attack!",
    "game.timeRemaining": "Time Remaining",
    
    // Dungeon
    "dungeon.title": "Dungeons",
    "dungeon.level": "Level",
    "dungeon.required": "Required Level",
    "dungeon.select": "Select Dungeon",
    "dungeon.enter": "Enter Dungeon",
    "dungeon.boss": "Boss",
    "dungeon.health": "Health",
    "dungeon.time": "Time",
    "dungeon.victory": "Victory",
    "dungeon.defeat": "Defeat",
    "dungeon.reward": "Reward",
    "dungeon.locked": "Locked",
    
    // Shop
    "shop.title": "Shop",
    "shop.buy": "Buy",
    "shop.price": "Price",
    "shop.description": "Description",
    "shop.notEnoughGold": "Not enough gold",
    "shop.purchaseSuccess": "Purchase successful!",
    
    // Inventory
    "inventory.title": "Inventory",
    "inventory.equip": "Equip",
    "inventory.unequip": "Unequip",
    "inventory.use": "Use",
    "inventory.quantity": "Quantity",
    "inventory.empty": "Your inventory is empty",
    
    // Quests
    "quest.title": "Quests",
    "quest.progress": "Progress",
    "quest.reward": "Reward",
    "quest.complete": "Complete",
    "quest.claim": "Claim Reward",
    "quest.noQuests": "No quests available",
    
    // Admin
    "admin.title": "Admin Panel",
    "admin.players": "Players",
    "admin.dungeons": "Dungeons",
    "admin.bosses": "Bosses",
    "admin.items": "Items",
    "admin.quests": "Quests",
    "admin.update": "Update",
    "admin.reset": "Reset",
    "admin.confirm": "Are you sure?",
    
    // Language
    "language.title": "Language",
    "language.en": "English",
    "language.th": "Thai",
    
    // Not Found Page
    "notFound.title": "Page Not Found",
    "notFound.description": "The page you're looking for doesn't exist or has been moved.",
  },
  th: {
    // Common
    "app.title": "เกมคลิกเกอร์ดันเจี้ยน",
    "app.subtitle": "คลิกผ่านดันเจี้ยนและเอาชนะบอสผู้ทรงพลัง",
    "app.loading": "กำลังโหลด...",
    "app.error": "เกิดข้อผิดพลาด",
    "app.back": "กลับหน้าหลัก",
    
    // Home
    "home.weeklyTitle": "สัปดาห์นี้",
    "home.topPlayers": "ผู้เล่นระดับสูงสุด",
    "home.rank": "อันดับ",
    "home.player": "ผู้เล่น",
    "home.features": "ฟีเจอร์เกม",
    "home.clickingSystem": "ระบบการคลิก",
    "home.clickingDesc": "คลิกที่บอสเพื่อสร้างความเสียหาย และเก็บคะแนน โอกาสคริติคอลจะทำให้สร้างความเสียหายได้มากขึ้น",
    "home.dungeons": "ดันเจี้ยน 100 ชั้น",
    "home.dungeonsDesc": "ต่อสู้ในดันเจี้ยนแต่ละชั้นโดยมีเวลาจำกัด เก็บรางวัลเพื่อพัฒนาตัวละครของคุณ",
    "home.characterSystem": "ระบบตัวละคร",
    "home.characterDesc": "พัฒนาตัวละครของคุณด้วยไอเทมและอุปกรณ์ต่าง ๆ เพื่อเพิ่มพลังโจมตีและโอกาสคริติคอล",
    "home.footerDesc": "เกมคลิกเกอร์ที่จะทำให้คุณติดงอมแงม",
    
    // Auth
    "auth.username": "ชื่อผู้ใช้",
    "auth.password": "รหัสผ่าน",
    "auth.confirmPassword": "ยืนยันรหัสผ่าน",
    "auth.login": "เข้าสู่ระบบ",
    "auth.register": "สมัครสมาชิก",
    "auth.logout": "ออกจากระบบ",
    "auth.usernameRequired": "กรุณากรอกชื่อผู้ใช้",
    "auth.passwordRequired": "กรุณากรอกรหัสผ่าน",
    "auth.passwordMismatch": "รหัสผ่านไม่ตรงกัน",
    "auth.loginError": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
    "auth.registerError": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว",
    "auth.loginTitle": "เข้าสู่ระบบ",
    "auth.loginSubtitle": "เข้าสู่ระบบเพื่อเล่นเกมดันเจี้ยนคลิกเกอร์",
    "auth.registerTitle": "สมัครสมาชิก",
    "auth.registerSubtitle": "สร้างบัญชีเพื่อเริ่มการผจญภัย",
    "auth.noAccount": "ยังไม่มีบัญชี?",
    "auth.haveAccount": "มีบัญชีอยู่แล้ว?",
    "auth.usernamePlaceholder": "ใส่ชื่อผู้ใช้ของคุณ",
    "auth.passwordPlaceholder": "ใส่รหัสผ่านของคุณ",
    "auth.confirmPasswordPlaceholder": "ยืนยันรหัสผ่านของคุณ",
    "auth.loggingIn": "กำลังเข้าสู่ระบบ...",
    "auth.registering": "กำลังสมัครสมาชิก...",
    
    // Game
    "game.start": "เริ่มเกม",
    "game.level": "เลเวล",
    "game.gold": "ทอง",
    "game.score": "คะแนน",
    "game.attackPower": "พลังโจมตี",
    "game.critChance": "โอกาสคริติคอล",
    "game.critMultiplier": "ตัวคูณคริติคอล",
    "game.totalClicks": "จำนวนคลิกทั้งหมด",
    "game.bossesDefeated": "บอสที่กำจัดแล้ว",
    "game.clickToAttack": "คลิกเพื่อโจมตี!",
    "game.timeRemaining": "เวลาที่เหลือ",
    
    // Dungeon
    "dungeon.title": "ดันเจี้ยน",
    "dungeon.level": "ระดับ",
    "dungeon.required": "ระดับที่ต้องการ",
    "dungeon.select": "เลือกดันเจี้ยน",
    "dungeon.enter": "เข้าดันเจี้ยน",
    "dungeon.boss": "บอส",
    "dungeon.health": "พลังชีวิต",
    "dungeon.time": "เวลา",
    "dungeon.victory": "ชัยชนะ",
    "dungeon.defeat": "พ่ายแพ้",
    "dungeon.reward": "รางวัล",
    "dungeon.locked": "ล็อค",
    
    // Shop
    "shop.title": "ร้านค้า",
    "shop.buy": "ซื้อ",
    "shop.price": "ราคา",
    "shop.description": "รายละเอียด",
    "shop.notEnoughGold": "ทองไม่เพียงพอ",
    "shop.purchaseSuccess": "ซื้อสำเร็จ!",
    
    // Inventory
    "inventory.title": "กระเป๋า",
    "inventory.equip": "สวมใส่",
    "inventory.unequip": "ถอด",
    "inventory.use": "ใช้",
    "inventory.quantity": "จำนวน",
    "inventory.empty": "กระเป๋าของคุณว่างเปล่า",
    
    // Quests
    "quest.title": "เควส",
    "quest.progress": "ความคืบหน้า",
    "quest.reward": "รางวัล",
    "quest.complete": "สำเร็จ",
    "quest.claim": "รับรางวัล",
    "quest.noQuests": "ไม่มีเควสที่ใช้งานได้",
    
    // Admin
    "admin.title": "หน้าผู้ดูแลระบบ",
    "admin.players": "ผู้เล่น",
    "admin.dungeons": "ดันเจี้ยน",
    "admin.bosses": "บอส",
    "admin.items": "ไอเทม",
    "admin.quests": "เควส",
    "admin.update": "อัปเดต",
    "admin.reset": "รีเซ็ต",
    "admin.confirm": "ยืนยันหรือไม่?",
    
    // Language
    "language.title": "ภาษา",
    "language.en": "อังกฤษ",
    "language.th": "ไทย",
    
    // Not Found Page
    "notFound.title": "ไม่พบหน้าที่คุณกำลังหา",
    "notFound.description": "ขออภัย หน้าที่คุณพยายามเข้าถึงไม่มีอยู่หรือถูกย้ายไปแล้ว",
  },
};

export const useLanguage = create<LanguageState>((set, get) => ({
  language: 'en', // Default language
  translations,
  
  setLanguage: (language) => set({ language }),
  t: (key) => {
    const { language, translations } = get();
    return translations[language][key] || key;
  },
}));