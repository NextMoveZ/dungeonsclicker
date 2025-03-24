import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDungeon } from "@/lib/stores/useDungeon";
import { usePlayer } from "@/lib/stores/usePlayer";
import GameCanvas from "@/components/game/GameCanvas";
import GameUI from "@/components/game/GameUI";

export default function Fight() {
  const { currentDungeon, currentBoss } = useDungeon();
  const navigate = useNavigate();
  const [damageNumbers, setDamageNumbers] = useState<any[]>([]);
  const [nextDamageId, setNextDamageId] = useState(1);
  
  // Check if dungeon and boss are loaded
  useEffect(() => {
    if (!currentDungeon || !currentBoss) {
      navigate("/game");
    }
  }, [currentDungeon, currentBoss, navigate]);
  
  const handleBossClick = (x: number, y: number) => {
    console.log("Boss clicked at", x, y);
  };
  
  if (!currentDungeon || !currentBoss) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 game-cursor">
      <GameCanvas onBossClick={handleBossClick} />
      <GameUI />
    </div>
  );
}
