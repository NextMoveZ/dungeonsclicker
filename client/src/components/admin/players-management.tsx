import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/stores/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Search, RefreshCw, UserCog, Trash, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function PlayersManagement() {
  const { 
    players, 
    selectedPlayer, 
    loading, 
    totalPlayers,
    activePlayers,
    loadPlayers, 
    getPlayer, 
    updatePlayer,
    resetPlayerScore
  } = useAdmin();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    level: 0,
    gold: 0,
    attackPower: 0,
    maxDungeonLevel: 0
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetPlayerId, setResetPlayerId] = useState<number | null>(null);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Filter players based on search query
  const filteredPlayers = players.filter(player => 
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewPlayer = async (playerId: number) => {
    await getPlayer(playerId);
    if (selectedPlayer) {
      setEditForm({
        level: selectedPlayer.level,
        gold: selectedPlayer.gold,
        attackPower: selectedPlayer.attackPower,
        maxDungeonLevel: selectedPlayer.maxDungeonLevel
      });
    }
  };

  const handleEditClick = (playerId: number) => {
    setEditingPlayer(playerId);
    const player = players.find(p => p.id === playerId);
    if (player) {
      setEditForm({
        level: player.level,
        gold: player.gold,
        attackPower: player.attackPower,
        maxDungeonLevel: player.maxDungeonLevel
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlayer) return;
    
    // Validate inputs
    if (editForm.level < 1 || editForm.gold < 0 || editForm.attackPower < 1 || editForm.maxDungeonLevel < 1) {
      toast.error("กรุณาใส่ค่าที่ถูกต้อง");
      return;
    }
    
    const success = await updatePlayer(editingPlayer, {
      level: editForm.level,
      gold: editForm.gold,
      attackPower: editForm.attackPower,
      maxDungeonLevel: editForm.maxDungeonLevel
    });
    
    if (success) {
      toast.success("อัปเดตผู้เล่นสำเร็จ");
      setEditingPlayer(null);
    } else {
      toast.error("ไม่สามารถอัปเดตผู้เล่นได้");
    }
  };

  const handleResetScoreClick = (playerId: number) => {
    setResetPlayerId(playerId);
    setShowResetDialog(true);
  };

  const confirmResetScore = async () => {
    if (!resetPlayerId) return;
    
    const success = await resetPlayerScore(resetPlayerId);
    
    if (success) {
      toast.success("รีเซ็ตคะแนนสำเร็จ");
      setShowResetDialog(false);
      setResetPlayerId(null);
    } else {
      toast.error("ไม่สามารถรีเซ็ตคะแนนได้");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">ผู้เล่นทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPlayers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">ผู้เล่นที่ยังใช้งานอยู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activePlayers}</div>
            <div className="text-sm text-muted-foreground">ภายใน 24 ชั่วโมงที่ผ่านมา</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">คะแนนสูงสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {players.length > 0 ? Math.max(...players.map(p => p.score)) : 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>รายชื่อผู้เล่น</span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => loadPlayers()}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            ดูและจัดการข้อมูลผู้เล่นทั้งหมด
          </CardDescription>
          
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาผู้เล่น..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-8">
              <p>ไม่พบผู้เล่น</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อผู้ใช้</TableHead>
                    <TableHead>เลเวล</TableHead>
                    <TableHead>คะแนน</TableHead>
                    <TableHead>ทอง</TableHead>
                    <TableHead>ออนไลน์ล่าสุด</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.username}</TableCell>
                      <TableCell>{player.level}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-yellow-500" />
                          {player.score}
                        </div>
                      </TableCell>
                      <TableCell>{player.gold}</TableCell>
                      <TableCell>
                        {new Date(player.lastActive).toLocaleString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(player.id)}
                              >
                                <UserCog className="h-4 w-4 mr-1" />
                                แก้ไข
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>แก้ไขข้อมูลผู้เล่น: {player.username}</DialogTitle>
                                <DialogDescription>
                                  แก้ไขสถานะและคุณสมบัติต่าง ๆ ของผู้เล่น
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-right">เลเวล</label>
                                  <Input
                                    type="number"
                                    className="col-span-3"
                                    value={editForm.level}
                                    onChange={(e) => setEditForm({...editForm, level: parseInt(e.target.value) || 0})}
                                    min={1}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-right">ทอง</label>
                                  <Input
                                    type="number"
                                    className="col-span-3"
                                    value={editForm.gold}
                                    onChange={(e) => setEditForm({...editForm, gold: parseInt(e.target.value) || 0})}
                                    min={0}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-right">พลังโจมตี</label>
                                  <Input
                                    type="number"
                                    className="col-span-3"
                                    value={editForm.attackPower}
                                    onChange={(e) => setEditForm({...editForm, attackPower: parseInt(e.target.value) || 0})}
                                    min={1}
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <label className="text-right">ดันเจี้ยนสูงสุด</label>
                                  <Input
                                    type="number"
                                    className="col-span-3"
                                    value={editForm.maxDungeonLevel}
                                    onChange={(e) => setEditForm({...editForm, maxDungeonLevel: parseInt(e.target.value) || 0})}
                                    min={1}
                                  />
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingPlayer(null)}>
                                  ยกเลิก
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  บันทึก
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleResetScoreClick(player.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            รีเซ็ตคะแนน
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reset Score Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ยืนยันการรีเซ็ตคะแนน
            </DialogTitle>
            <DialogDescription>
              การกระทำนี้จะรีเซ็ตคะแนนของผู้เล่นเป็น 0 และไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={confirmResetScore}>
              ยืนยันการรีเซ็ต
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PlayersManagement;
