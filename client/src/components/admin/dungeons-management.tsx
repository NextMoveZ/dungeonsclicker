import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Clock, Heart, Coins, Award, Edit } from "lucide-react";
import { useDungeon } from "@/lib/stores/useDungeon";
import { useAdmin } from "@/lib/stores/useAdmin";
import { toast } from "sonner";
import { Boss } from "@shared/types";

export function DungeonsManagement() {
  const { dungeons, loadDungeons } = useDungeon();
  const { updateBoss } = useAdmin();
  
  const [loading, setLoading] = useState(true);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null);
  const [editForm, setEditForm] = useState({
    health: 0,
    goldReward: 0,
    scoreReward: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadDungeons();
      await loadBosses();
      setLoading(false);
    };
    
    fetchData();
  }, [loadDungeons]);

  const loadBosses = async () => {
    try {
      const promises = dungeons.map(async (dungeon) => {
        const res = await fetch(`/api/dungeons/${dungeon.id}/boss`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`Failed to load boss for dungeon ${dungeon.id}`);
        return await res.json();
      });
      
      const bossesData = await Promise.all(promises);
      setBosses(bossesData);
    } catch (error) {
      console.error("Failed to load bosses:", error);
      toast.error("ไม่สามารถโหลดข้อมูลบอสได้");
    }
  };

  const handleEditClick = (boss: Boss) => {
    setEditingBoss(boss);
    setEditForm({
      health: boss.maxHealth,
      goldReward: boss.goldReward,
      scoreReward: boss.scoreReward
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBoss) return;
    
    // Validate inputs
    if (editForm.health < 1 || editForm.goldReward < 0 || editForm.scoreReward < 0) {
      toast.error("กรุณาใส่ค่าที่ถูกต้อง");
      return;
    }
    
    try {
      const success = await updateBoss(editingBoss.id, {
        maxHealth: editForm.health,
        health: editForm.health, // Reset current health to max
        goldReward: editForm.goldReward,
        scoreReward: editForm.scoreReward
      });
      
      if (success) {
        toast.success("อัปเดตบอสสำเร็จ");
        
        // Update local state
        const updatedBosses = bosses.map(b => 
          b.id === editingBoss.id 
            ? { 
                ...b, 
                maxHealth: editForm.health,
                health: editForm.health,
                goldReward: editForm.goldReward,
                scoreReward: editForm.scoreReward
              } 
            : b
        );
        setBosses(updatedBosses);
        setEditingBoss(null);
      } else {
        toast.error("ไม่สามารถอัปเดตบอสได้");
      }
    } catch (error) {
      console.error("Failed to update boss:", error);
      toast.error("ไม่สามารถอัปเดตบอสได้");
    }
  };

  const getDungeonForBoss = (dungeonId: number) => {
    return dungeons.find(d => d.id === dungeonId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>จัดการดันเจี้ยนและบอส</span>
        </CardTitle>
        <CardDescription>
          แก้ไขค่าต่าง ๆ ของดันเจี้ยนและบอส
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : dungeons.length === 0 ? (
          <div className="text-center py-8">
            <p>ไม่พบดันเจี้ยน</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชั้น</TableHead>
                  <TableHead>ชื่อดันเจี้ยน</TableHead>
                  <TableHead>ชื่อบอส</TableHead>
                  <TableHead>พลังชีวิต</TableHead>
                  <TableHead>เวลา</TableHead>
                  <TableHead>รางวัล</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bosses.map(boss => {
                  const dungeon = getDungeonForBoss(boss.dungeonId);
                  return dungeon ? (
                    <TableRow key={boss.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          {dungeon.level}
                        </div>
                      </TableCell>
                      <TableCell>{dungeon.name}</TableCell>
                      <TableCell className="font-medium">{boss.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          {boss.maxHealth}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          {Math.floor(dungeon.timeLimit / 60)}:{(dungeon.timeLimit % 60).toString().padStart(2, '0')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{boss.scoreReward}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs">{boss.goldReward}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(boss)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              แก้ไข
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>แก้ไขข้อมูลบอส: {boss.name}</DialogTitle>
                              <DialogDescription>
                                แก้ไขค่าพลังชีวิตและรางวัลของบอส
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right">พลังชีวิต</label>
                                <Input
                                  type="number"
                                  className="col-span-3"
                                  value={editForm.health}
                                  onChange={(e) => setEditForm({...editForm, health: parseInt(e.target.value) || 0})}
                                  min={1}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right">รางวัลทอง</label>
                                <Input
                                  type="number"
                                  className="col-span-3"
                                  value={editForm.goldReward}
                                  onChange={(e) => setEditForm({...editForm, goldReward: parseInt(e.target.value) || 0})}
                                  min={0}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right">รางวัลคะแนน</label>
                                <Input
                                  type="number"
                                  className="col-span-3"
                                  value={editForm.scoreReward}
                                  onChange={(e) => setEditForm({...editForm, scoreReward: parseInt(e.target.value) || 0})}
                                  min={0}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingBoss(null)}>
                                ยกเลิก
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                บันทึก
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ) : null;
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DungeonsManagement;
