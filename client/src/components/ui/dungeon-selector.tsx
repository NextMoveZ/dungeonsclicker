import { useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDungeon } from "@/lib/stores/useDungeon";
import { usePlayer } from "@/lib/stores/usePlayer";
import { Lock, Clock, Trophy, Coins } from "lucide-react";

const DungeonSelector = () => {
  const { dungeons, loading, selectDungeon } = useDungeon();
  const { player } = usePlayer();
  const navigate = useNavigate();
  
  const sortedDungeons = useMemo(() => {
    if (!dungeons.length) return [];
    
    return [...dungeons].sort((a, b) => a.level - b.level);
  }, [dungeons]);
  
  const handleSelectDungeon = async (dungeonId: number) => {
    await selectDungeon(dungeonId);
    navigate("/game/fight");
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>กำลังโหลดดันเจี้ยน...</p>
      </div>
    );
  }
  
  if (!sortedDungeons.length) {
    return (
      <div className="text-center py-4">
        <p>ไม่พบดันเจี้ยน</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedDungeons.map(dungeon => {
        const isLocked = player ? player.level < dungeon.requiredPlayerLevel : true;
        
        // Get boss info for this dungeon (in a real app this would be from an API)
        const bossInfo = {
          scoreReward: dungeon.level * 100,
          goldReward: dungeon.level * 10,
        };
        
        return (
          <Card 
            key={dungeon.id} 
            className={`dungeon-card relative overflow-hidden ${isLocked ? 'dungeon-locked' : ''}`}
          >
            {isLocked && (
              <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center">
                <Lock className="h-8 w-8 text-white mb-2" />
                <p className="text-white text-center">
                  ต้องการเลเวล {dungeon.requiredPlayerLevel}
                </p>
              </div>
            )}
            
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{dungeon.name}</span>
                <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                  ชั้น {dungeon.level}
                </span>
              </CardTitle>
              <CardDescription>{dungeon.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">เวลา: {Math.floor(dungeon.timeLimit / 60)}:{(dungeon.timeLimit % 60).toString().padStart(2, '0')} นาที</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{bossInfo.scoreReward} คะแนน</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-400" />
                  <span>{bossInfo.goldReward} ทอง</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-4 py-3 pt-2">
              <Button 
                className="w-full" 
                onClick={() => handleSelectDungeon(dungeon.id)}
                disabled={isLocked}
              >
                เริ่มต่อสู้
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default DungeonSelector;
