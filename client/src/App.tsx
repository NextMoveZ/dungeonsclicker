import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAudio, type SoundEffect } from "./lib/stores/useAudio";
import { useAuth } from "./lib/stores/useAuth";
import { useLanguage } from "./lib/stores/useLanguage";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// Lazy-loaded pages for better performance
const Home = lazy(() => import("./pages/home"));
const Game = lazy(() => import("./pages/game"));
const Shop = lazy(() => import("./pages/shop"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const Admin = lazy(() => import("./pages/admin"));
const NotFound = lazy(() => import("./pages/not-found"));

// Loading fallback component
const Loading = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h2 
          className="text-2xl font-bold mb-2 text-primary"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t("app.title")}
        </motion.h2>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {t("app.loading")}
        </motion.p>
        <motion.div 
          className="mt-4 h-2 w-48 bg-secondary rounded-full overflow-hidden mx-auto"
          initial={{ width: 0 }}
          animate={{ width: "12rem" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

// Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// เสียงที่มีอยู่แล้วและต้องโหลด (เพิ่มเติมในอนาคต)
const SOUND_EFFECTS: Partial<Record<SoundEffect, string>> = {
  hit: "/sounds/hit.mp3",
  victory: "/sounds/success.mp3" // ใช้ success.mp3 ที่มีอยู่แล้ว
};

// เพลงสำหรับดันเจี้ยนต่างๆ
const BGM_PATHS = {
  main: "/sounds/background.mp3", // ใช้เพลงพื้นหลังที่มีอยู่
  forest: "/sounds/bgm/forest.mp3",
  castle: "/sounds/bgm/castle.mp3",
  cave: "/sounds/bgm/cave.mp3",
  boss: "/sounds/bgm/boss.mp3"
};

function App() {
  const { 
    setBackgroundMusic, 
    setSoundEffect, 
    playSound 
  } = useAudio();
  
  // โหลดเสียงทั้งหมดเมื่อแอพเริ่มต้น
  useEffect(() => {
    // ฟังก์ชันสำหรับโหลดและตั้งค่าเสียงพื้นหลัง
    const loadBackgroundMusic = () => {
      try {
        const bgMusic = new Audio(BGM_PATHS.main);
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        setBackgroundMusic(bgMusic);
        console.log("โหลดเพลงพื้นหลังสำเร็จ");
      } catch (error) {
        console.error("ไม่สามารถโหลดเพลงพื้นหลังได้:", error);
      }
    };
    
    // ฟังก์ชันสำหรับโหลดและตั้งค่าเสียงเอฟเฟกต์
    const loadSoundEffects = async () => {
      // โหลดเสียงทั้งหมดใน SOUND_EFFECTS
      for (const [type, path] of Object.entries(SOUND_EFFECTS) as [SoundEffect, string][]) {
        try {
          // ใช้ฟังก์ชัน preloadAudio เพื่อตรวจสอบว่าเสียงโหลดได้หรือไม่
          const audio = await preloadAudio(path);
          setSoundEffect(type as SoundEffect, audio);
          console.log(`โหลดเสียง ${type} สำเร็จ`);
        } catch (error) {
          console.error(`ไม่สามารถโหลดเสียง ${type} ได้:`, error);
        }
      }
      
      // แสดงข้อความว่าโหลดเสียงเสร็จแล้ว
      toast.success("โหลดเสียงสำเร็จ", {
        description: "ระบบเสียงพร้อมใช้งาน คลิกที่ไอคอนลำโพงเพื่อเปิดเสียง",
        duration: 3000
      });
      
      // เล่นเสียงเลือกเมื่อโหลดเสร็จ
      setTimeout(() => {
        playSound("select");
      }, 500);
    };
    
    // ฟังก์ชันสำหรับ preload audio และตรวจสอบว่าโหลดได้หรือไม่
    const preloadAudio = (path: string): Promise<HTMLAudioElement> => {
      return new Promise((resolve, reject) => {
        const audio = new Audio(path);
        
        // เมื่อโหลดเสร็จแล้ว
        audio.addEventListener('canplaythrough', () => {
          resolve(audio);
        }, { once: true });
        
        // เมื่อเกิดข้อผิดพลาด
        audio.addEventListener('error', (e) => {
          reject(new Error(`ไม่สามารถโหลดเสียง ${path}: ${e}`));
        }, { once: true });
        
        // เริ่มต้นโหลด
        audio.load();
      });
    };
    
    // โหลดเสียงทั้งหมด
    loadBackgroundMusic();
    loadSoundEffects();
    
    // Cleanup function
    return () => {
      // ไม่ต้องทำอะไร เพราะจะทำให้เสียงหยุดเล่นเมื่อออกจากแอป
    };
  }, [setBackgroundMusic, setSoundEffect, playSound]);

  // โหลดการตั้งค่าภาษาจาก localStorage
  useEffect(() => {
    const { setLanguage } = useLanguage.getState();
    const savedLanguage = localStorage.getItem('language');
    
    if (savedLanguage === 'en' || savedLanguage === 'th') {
      setLanguage(savedLanguage);
    }
  }, []);
  
  // บันทึกการตั้งค่าภาษาเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    const unsubscribe = useLanguage.subscribe(
      (state) => {
        localStorage.setItem('language', state.language);
      }
    );
    
    return () => unsubscribe();
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            <PageTransition>
              <Home />
            </PageTransition>
          } />
          <Route path="/login" element={
            <PageTransition>
              <Login />
            </PageTransition>
          } />
          <Route path="/register" element={
            <PageTransition>
              <Register />
            </PageTransition>
          } />
          
          {/* Protected routes */}
          <Route path="/game" element={
            <ProtectedRoute>
              <PageTransition>
                <Game />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/shop" element={
            <ProtectedRoute>
              <PageTransition>
                <Shop />
              </PageTransition>
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <PageTransition>
                <Admin />
              </PageTransition>
            </AdminRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </Suspense>
  );
}

export default App;
