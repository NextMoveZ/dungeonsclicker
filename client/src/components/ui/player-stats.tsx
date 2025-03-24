import { useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Sword, 
  Zap, 
  Award, 
  Coins, 
  MousePointer, 
  Skull, 
  Gauge
} from "lucide-react";
import { usePlayer } from "@/lib/stores/usePlayer";
import { Progress } from "@/components/ui/progress";

const PlayerStats = () => {
  const { 
    player, 
    loadPlayer, 
    loadInventory,
    getTotalAttackPower,
    getTotalCritChance,
    getTotalCritMultiplier,
    equippedItems
  } = usePlayer();
  
  useEffect(() => {
    if (!player) {
      loadPlayer();
    }
    
    loadInventory();
  }, [player, loadPlayer, loadInventory]);
  
  if (!player) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>สถานะผู้เล่น</CardTitle>
          <CardDescription>กำลังโหลดข้อมูลผู้เล่น...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Calculate XP and next level requirements (simplified formula)
  const currentLevelXp = player.level * 1000;
  const nextLevelXp = (player.level + 1) * 1000;
  const xpProgress = ((player.score - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>สถานะผู้เล่น</span>
          <span className="text-lg font-semibold bg-primary/20 text-primary px-2 py-1 rounded">
            เลเวล {player.level}
          </span>
        </CardTitle>
        <CardDescription>
          ข้อมูลความก้าวหน้าของ {player.username}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>EXP</span>
            <span>{player.score} / {nextLevelXp}</span>
          </div>
          <Progress value={xpProgress} />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-sm font-medium">คะแนน</div>
              <div className="font-semibold">{player.score}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <div>
              <div className="text-sm font-medium">ทอง</div>
              <div className="font-semibold">{player.gold}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sword className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-medium">พลังโจมตี</div>
              <div className="font-semibold">
                {getTotalAttackPower()}
                {player.attackPower < getTotalAttackPower() && (
                  <span className="text-green-500 text-xs ml-1">
                    (+{getTotalAttackPower() - player.attackPower})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <div>
              <div className="text-sm font-medium">โอกาสคริติคอล</div>
              <div className="font-semibold">
                {getTotalCritChance()}%
                {player.critChance < getTotalCritChance() && (
                  <span className="text-green-500 text-xs ml-1">
                    (+{(getTotalCritChance() - player.critChance).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-sm font-medium">ตัวคูณคริติคอล</div>
              <div className="font-semibold">
                {getTotalCritMultiplier()}x
                {player.critMultiplier < getTotalCritMultiplier() && (
                  <span className="text-green-500 text-xs ml-1">
                    (+{(getTotalCritMultiplier() - player.critMultiplier).toFixed(1)}x)
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Skull className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium">บอสที่กำจัด</div>
              <div className="font-semibold">{player.totalBossesDefeated}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MousePointer className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">คลิกทั้งหมด</div>
              <div className="font-semibold">{player.totalClicks}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">ดันเจี้ยนสูงสุด</div>
              <div className="font-semibold">{player.maxDungeonLevel}</div>
            </div>
          </div>
        </div>
        
        {/* Equipped Items */}
        <div className="space-y-2">
          <h3 className="font-semibold">ไอเทมที่สวมใส่ ({equippedItems.length})</h3>
          {equippedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {equippedItems.map(({ id, item }) => (
                <div key={id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded bg-black/20">
                      {item.effect === "attack_power" && <Sword className="h-4 w-4 text-red-500" />}
                      {item.effect === "crit_chance" && <Zap className="h-4 w-4 text-amber-500" />}
                      {item.effect === "crit_multiplier" && <Gauge className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ไม่มีไอเทมที่สวมใส่</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
