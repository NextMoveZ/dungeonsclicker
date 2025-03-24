import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/lib/stores/usePlayer";
import { Button } from "@/components/ui/button";
import { Home, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerStats from "@/components/ui/player-stats";
import ItemShop from "@/components/ui/item-shop";

export default function Shop() {
  const { player, loadPlayer } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">กำลังโหลดข้อมูล...</h1>
          <p className="text-muted-foreground mb-4">
            กรุณารอสักครู่
          </p>
          <Button onClick={() => navigate("/login")}>
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ร้านค้า</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/game")}>
            <Target className="h-4 w-4 mr-2" />
            ไปดันเจี้ยน
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            กลับหน้าหลัก
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ItemShop />
        </div>
        
        <div>
          <PlayerStats />
        </div>
      </div>
    </div>
  );
}
