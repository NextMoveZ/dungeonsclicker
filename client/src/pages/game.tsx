import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDungeon } from "@/lib/stores/useDungeon";
import { usePlayer } from "@/lib/stores/usePlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import DungeonSelector from "@/components/ui/dungeon-selector";
import PlayerStats from "@/components/ui/player-stats";

export default function Game() {
  const { player, loadPlayer } = usePlayer();
  const { loadDungeons } = useDungeon();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlayer();
    loadDungeons();
  }, [loadPlayer, loadDungeons]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">กำลังโหลดข้อมูล...</h1>
              <p className="text-muted-foreground">
                กรุณารอสักครู่ หรือ <Button variant="link" onClick={() => navigate("/login")}>เข้าสู่ระบบ</Button> อีกครั้ง
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container min-h-screen py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ดันเจี้ยนคลิกเกอร์</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <Home className="h-4 w-4 mr-2" />
          กลับหน้าหลัก
        </Button>
      </div>
      
      <Tabs defaultValue="dungeons" className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="dungeons">เลือกดันเจี้ยน</TabsTrigger>
          <TabsTrigger value="stats">สถานะผู้เล่น</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dungeons">
          <DungeonSelector />
          <Outlet />
        </TabsContent>
        
        <TabsContent value="stats">
          <PlayerStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
