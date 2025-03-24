import { useState, useEffect } from "react";
import { useDungeon } from "@/lib/stores/useDungeon";
import { usePlayer } from "@/lib/stores/usePlayer";
import { useAudio, type SoundEffect } from "@/lib/stores/useAudio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Award, 
  Coins, 
  Heart, 
  ShoppingBag,
  VolumeX,
  Volume
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import DamageNumbers from "./DamageNumbers";
import { SoundControls } from "@/components/ui/sound-controls";

interface DamageNumber {
  id: number;
  amount: number;
  x: number;
  y: number;
  isCritical: boolean;
}

const GameUI = () => {
  const { 
    currentDungeon, 
    currentBoss, 
    phase, 
    timeRemaining, 
    startFight, 
    resetFight, 
    endFight 
  } = useDungeon();
  
  const { 
    player, 
    addScore, 
    addGold, 
    incrementTotalClicks,
    incrementBossesDefeated,
    getTotalAttackPower,
    getTotalCritChance,
    getTotalCritMultiplier
  } = usePlayer();
  
  const { 
    playSound,
    isMuted, 
    toggleMute 
  } = useAudio();
  
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [nextDamageId, setNextDamageId] = useState(1);
  const navigate = useNavigate();
  
  // Handle boss defeat
  useEffect(() => {
    if (currentBoss && currentBoss.health <= 0 && phase === "victory") {
      // Play victory sound
      playSound("victory");
      
      // Award score and gold
      addScore(currentBoss.scoreReward);
      addGold(currentBoss.goldReward);
      
      // Increment bosses defeated
      incrementBossesDefeated();
    } else if (phase === "defeat") {
      // Play defeat sound when available
      // Note: defeat sound will be added in future
      console.log("Player defeated");
    }
  }, [phase, currentBoss, playSound, addScore, addGold, incrementBossesDefeated]);
  
  // Handle boss click
  const handleBossClick = (x: number, y: number) => {
    if (!currentBoss || phase !== "fighting") return;
    
    // Calculate damage
    const attackPower = getTotalAttackPower();
    const critChance = getTotalCritChance();
    
    // Check for critical hit
    const isCritical = Math.random() * 100 < critChance;
    const critMultiplier = isCritical ? getTotalCritMultiplier() : 1;
    
    // Apply damage
    const damage = Math.floor(attackPower * critMultiplier);
    
    // Add damage numbers
    // Convert 3D position to screen coordinates
    // This is a simple approximation - in a real game, you'd project 3D->2D
    const viewportX = (x * 100) + window.innerWidth / 2;
    const viewportY = (-y * 100) + window.innerHeight / 2;
    
    // Create new damage number
    const newDamageNumber: DamageNumber = {
      id: nextDamageId,
      amount: damage,
      x: viewportX,
      y: viewportY,
      isCritical,
    };
    
    // Update state
    setDamageNumbers(prev => [...prev, newDamageNumber]);
    setNextDamageId(prev => prev + 1);
    
    // Play hit sound based on whether it's a critical hit
    if (isCritical) {
      // Play critical hit sound if available
      playSound("hit"); // จะเปลี่ยนเป็น "critical" เมื่อมีไฟล์เสียงพร้อม
    } else {
      // Play normal hit sound
      playSound("hit");
    }
    
    // Apply damage to boss via dungeon store
    useDungeon.getState().damageCurrentBoss(damage);
    
    // Increment click counter
    incrementTotalClicks();
  };
  
  const handleRemoveDamageNumber = (id: number) => {
    setDamageNumbers(prev => prev.filter(num => num.id !== id));
  };
  
  if (!currentDungeon || !currentBoss || !player) {
    return null;
  }
  
  const renderPhaseContent = () => {
    switch (phase) {
      case "select":
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold">เตรียมพร้อมต่อสู้</h2>
            <p>คุณต้องกำจัด {currentBoss.name} ภายในเวลา {formatTime(currentDungeon.timeLimit)}</p>
            <p>พลังโจมตี: {getTotalAttackPower()} | โอกาสคริติคอล: {getTotalCritChance()}%</p>
            <Button 
              className="w-full" 
              onClick={startFight}
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              เริ่มต่อสู้!
            </Button>
          </div>
        );
        
      case "fighting":
        return (
          <div className="space-y-2 text-center">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span>{currentBoss.health}/{currentBoss.maxHealth}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <div className="boss-health-bar">
              <div 
                className="boss-health-fill" 
                style={{ width: `${(currentBoss.health / currentBoss.maxHealth) * 100}%` }}
              />
            </div>
            <p className="text-sm">คลิกที่บอสเพื่อโจมตี!</p>
          </div>
        );
        
      case "victory":
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-green-500">ชัยชนะ!</h2>
            <p>คุณได้กำจัด {currentBoss.name} สำเร็จ</p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-1" />
                <span>+{currentBoss.scoreReward} คะแนน</span>
              </div>
              <div className="flex items-center">
                <Coins className="h-5 w-5 text-yellow-400 mr-1" />
                <span>+{currentBoss.goldReward} ทอง</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1" 
                onClick={resetFight}
                variant="outline"
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                เล่นอีกครั้ง
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => navigate("/game")}
              >
                เลือกดันเจี้ยนอื่น
              </Button>
            </div>
          </div>
        );
        
      case "defeat":
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-red-500">พ่ายแพ้!</h2>
            <p>เวลาหมดก่อนที่คุณจะกำจัด {currentBoss.name} ได้สำเร็จ</p>
            <p>บอสยังมีพลังชีวิตเหลือ {currentBoss.health} หน่วย</p>
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1" 
                onClick={resetFight}
                variant="outline"
              >
                <RotateCcw className="mr-1 h-4 w-4" />
                ลองอีกครั้ง
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => navigate("/game")}
              >
                เลือกดันเจี้ยนอื่น
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Damage numbers overlay */}
      <DamageNumbers 
        damageNumbers={damageNumbers} 
        onNumberRemoved={handleRemoveDamageNumber} 
      />
      
      {/* UI Cards */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar with player info */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <Card className="p-3 bg-black/70 text-white border-none">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-bold">{player.username}</div>
                  <div className="text-sm text-gray-300">เลเวล {player.level}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-yellow-500 mr-1" />
                  <span>{player.score}</span>
                </div>
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-yellow-400 mr-1" />
                  <span>{player.gold}</span>
                </div>
                {/* ปุ่มปิด/เปิดเสียง */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:text-primary hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume className="h-5 w-5" />}
                </Button>
                
                {/* ปุ่มการตั้งค่าเสียง */}
                <SoundControls />
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/shop")}
                  className="text-white hover:text-primary hover:bg-white/10"
                >
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Dungeon info */}
        <div className="absolute top-20 left-4 pointer-events-auto">
          <Card className="p-3 bg-black/70 text-white border-none max-w-[200px]">
            <div className="flex flex-col">
              <div className="font-bold">{currentDungeon.name}</div>
              <div className="text-sm text-gray-300 mt-1 line-clamp-2">{currentDungeon.description}</div>
            </div>
          </Card>
        </div>
        
        {/* Boss info and controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <Card className="p-4 bg-black/70 text-white border-none">
            {renderPhaseContent()}
          </Card>
        </div>
      </div>
    </>
  );
};

export default GameUI;
