import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/useAuth";
import { Users, Target, ShoppingBag, FileText, Home } from "lucide-react";
import PlayersManagement from "./players-management";
import DungeonsManagement from "./dungeons-management";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("players");
  const { player } = useAuth();
  const navigate = useNavigate();

  // If not admin, don't show admin panel
  if (!player || player.role !== "admin") {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>ไม่มีสิทธิ์เข้าถึง</CardTitle>
          <CardDescription>
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้าผู้ดูแลระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/")}>กลับไปหน้าหลัก</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">หน้าผู้ดูแลระบบ</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <Home className="h-4 w-4 mr-2" />
          กลับไปหน้าหลัก
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">จัดการผู้เล่น</span>
          </TabsTrigger>
          <TabsTrigger value="dungeons" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">จัดการดันเจี้ยน</span>
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">จัดการไอเทม</span>
          </TabsTrigger>
          <TabsTrigger value="quests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">จัดการภารกิจ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          <PlayersManagement />
        </TabsContent>

        <TabsContent value="dungeons" className="space-y-4">
          <DungeonsManagement />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จัดการไอเทม</CardTitle>
              <CardDescription>
                เพิ่ม แก้ไข หรือลบไอเทมในเกม
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                ฟีเจอร์นี้อยู่ระหว่างการพัฒนา
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จัดการภารกิจ</CardTitle>
              <CardDescription>
                เพิ่ม แก้ไข หรือลบภารกิจในเกม
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                ฟีเจอร์นี้อยู่ระหว่างการพัฒนา
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminPanel;
