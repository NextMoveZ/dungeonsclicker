import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import DungeonScene from "./DungeonScene";
import Boss from "./Boss";
import { useDungeon } from "@/lib/stores/useDungeon";
import { usePlayer } from "@/lib/stores/usePlayer";

type GameCanvasProps = {
  onBossClick: (x: number, y: number) => void;
}

const GameCanvas = ({ onBossClick }: GameCanvasProps) => {
  const { currentDungeon, currentBoss, phase } = useDungeon();
  const getTotalAttackPower = usePlayer(state => state.getTotalAttackPower);
  
  if (!currentDungeon || !currentBoss) {
    return null;
  }
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Environment lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1}
          position={[5, 8, 3]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Controls - limited to horizontal rotation only */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.5}
        />
        
        <Suspense fallback={null}>
          {/* Render the dungeon background */}
          <DungeonScene 
            background={currentDungeon.background}
          />
          
          {/* Render the boss */}
          <Boss
            name={currentBoss.name}
            bossTexture={currentBoss.texture}
            health={currentBoss.health}
            maxHealth={currentBoss.maxHealth}
            position={[0, 0, 0]}
            onClick={onBossClick}
            attackPower={getTotalAttackPower()}
            isActive={phase === "fighting"}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameCanvas;
