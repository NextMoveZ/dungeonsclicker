import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type SoundEffect = 
  | "hit"           // เสียงโจมตีปกติ
  | "critical"      // เสียงโจมตีคริติคอล
  | "victory"       // เสียงชนะ
  | "defeat"        // เสียงแพ้
  | "levelup"       // เสียงเลเวลอัพ
  | "purchase"      // เสียงซื้อไอเทม
  | "equip"         // เสียงสวมใส่ไอเทม
  | "questComplete" // เสียงเควสสำเร็จ
  | "boss"          // เสียงบอส
  | "select"        // เสียงเลือก/กดปุ่ม
  | "error";        // เสียงข้อผิดพลาด

export type DungeonBGM =
  | "main"            // เพลงพื้นฐาน
  | "forest"          // เพลงดันเจี้ยนป่า
  | "castle"          // เพลงดันเจี้ยนปราสาท
  | "cave"            // เพลงดันเจี้ยนถ้ำ
  | "boss";           // เพลงบอส

interface AudioState {
  // เสียงพื้นหลัง
  backgroundMusic: HTMLAudioElement | null;
  currentBGM: DungeonBGM;
  bgmVolume: number;
  
  // เสียงเอฟเฟกต์
  soundEffects: Record<SoundEffect, HTMLAudioElement | null>;
  effectVolume: number;
  
  // สถานะเสียง
  isMuted: boolean;
  isBGMMuted: boolean;
  isEffectsMuted: boolean;
  
  // ฟังก์ชันตั้งค่า
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setSoundEffect: (type: SoundEffect, sound: HTMLAudioElement) => void;
  setBGMVolume: (volume: number) => void;
  setEffectVolume: (volume: number) => void;
  
  // ฟังก์ชันควบคุม
  toggleMute: () => void;
  toggleBGMMute: () => void;
  toggleEffectsMute: () => void;
  
  // ฟังก์ชันเล่นเสียง
  playBGM: (type?: DungeonBGM) => void;
  stopBGM: () => void;
  playSound: (type: SoundEffect) => void;
}

export const useAudio = create<AudioState>()(
  subscribeWithSelector((set, get) => ({
    // เสียงพื้นหลัง
    backgroundMusic: null,
    currentBGM: "main",
    bgmVolume: 0.3,
    
    // เสียงเอฟเฟกต์
    soundEffects: {
      hit: null,
      critical: null,
      victory: null,
      defeat: null,
      levelup: null,
      purchase: null,
      equip: null,
      questComplete: null,
      boss: null,
      select: null,
      error: null
    },
    effectVolume: 0.5,
    
    // สถานะเสียง
    isMuted: true, // เริ่มต้นปิดเสียง
    isBGMMuted: true,
    isEffectsMuted: true,
    
    // ฟังก์ชันตั้งค่า
    setBackgroundMusic: (music) => set({ backgroundMusic: music }),
    
    setSoundEffect: (type, sound) => 
      set(state => ({
        soundEffects: {
          ...state.soundEffects,
          [type]: sound
        }
      })),
    
    setBGMVolume: (volume) => {
      const { backgroundMusic } = get();
      if (backgroundMusic) {
        backgroundMusic.volume = volume;
      }
      set({ bgmVolume: volume });
    },
    
    setEffectVolume: (volume) => set({ effectVolume: volume }),
    
    // ฟังก์ชันควบคุม
    toggleMute: () => {
      const { isMuted } = get();
      const newMutedState = !isMuted;
      
      // อัปเดตสถานะปิดเสียงทั้งหมด
      set({ 
        isMuted: newMutedState,
        isBGMMuted: newMutedState,
        isEffectsMuted: newMutedState
      });
      
      // หากกำลังเล่นเพลงอยู่ ให้หยุดเมื่อปิดเสียง หรือเล่นเมื่อเปิดเสียง
      const { backgroundMusic } = get();
      if (backgroundMusic) {
        if (newMutedState) {
          backgroundMusic.pause();
        } else {
          backgroundMusic.play().catch(error => {
            console.log("BGM play prevented:", error);
          });
        }
      }
      
      // แสดงข้อความสถานะ
      console.log(`เสียงทั้งหมด${newMutedState ? 'ปิด' : 'เปิด'}`);
    },
    
    toggleBGMMute: () => {
      const { isBGMMuted, backgroundMusic } = get();
      const newMutedState = !isBGMMuted;
      
      set({ isBGMMuted: newMutedState });
      
      if (backgroundMusic) {
        if (newMutedState) {
          backgroundMusic.pause();
        } else {
          backgroundMusic.play().catch(error => {
            console.log("BGM play prevented:", error);
          });
        }
      }
      
      console.log(`เสียงพื้นหลัง${newMutedState ? 'ปิด' : 'เปิด'}`);
    },
    
    toggleEffectsMute: () => {
      const { isEffectsMuted } = get();
      const newMutedState = !isEffectsMuted;
      
      set({ isEffectsMuted: newMutedState });
      
      console.log(`เสียงเอฟเฟกต์${newMutedState ? 'ปิด' : 'เปิด'}`);
    },
    
    // ฟังก์ชันเล่นเสียง
    playBGM: (type = "main") => {
      const { backgroundMusic, isBGMMuted, bgmVolume } = get();
      
      // ถ้าปิดเสียงอยู่ หรือ ไม่มีเสียงพื้นหลัง ไม่ต้องเล่น
      if (isBGMMuted || !backgroundMusic) {
        console.log("BGM skipped (muted or not loaded)");
        return;
      }
      
      // อัปเดตประเภทเพลงปัจจุบัน
      set({ currentBGM: type });
      
      // ตั้งค่าความดังและเล่นเพลง
      backgroundMusic.volume = bgmVolume;
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(error => {
        console.log("BGM play prevented:", error);
      });
    },
    
    stopBGM: () => {
      const { backgroundMusic } = get();
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    },
    
    playSound: (type: SoundEffect) => {
      const { soundEffects, isEffectsMuted, effectVolume } = get();
      const sound = soundEffects[type];
      
      // ถ้าปิดเสียงอยู่ หรือ ไม่มีเสียงเอฟเฟกต์ ไม่ต้องเล่น
      if (isEffectsMuted || !sound) {
        console.log(`${type} sound skipped (muted or not loaded)`);
        return;
      }
      
      // ทำสำเนาเสียงเพื่อให้สามารถเล่นเสียงซ้อนกันได้
      const soundClone = sound.cloneNode() as HTMLAudioElement;
      soundClone.volume = effectVolume;
      soundClone.play().catch(error => {
        console.log(`${type} sound play prevented:`, error);
      });
    }
  }))
);
