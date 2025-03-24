import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sword, 
  Zap, 
  Gauge, 
  Coins, 
  ShoppingBag, 
  Package 
} from "lucide-react";
import { useItems } from "@/lib/stores/useItems";
import { usePlayer } from "@/lib/stores/usePlayer";
import { toast } from "sonner";
import { ItemEffect } from "@shared/types";

const ItemShop = () => {
  const { items, loading, loadItems } = useItems();
  const { 
    player, 
    inventory, 
    loadInventory, 
    purchaseItem, 
    equipItem, 
    unequipItem, 
    useItem 
  } = usePlayer();
  
  const [selectedTab, setSelectedTab] = useState("shop");
  
  useEffect(() => {
    loadItems();
    loadInventory();
  }, [loadItems, loadInventory]);
  
  const handlePurchase = async (itemId: number, price: number) => {
    if (!player) return;
    
    if (player.gold < price) {
      toast.error("ทองไม่เพียงพอ");
      return;
    }
    
    const success = await purchaseItem(itemId);
    
    if (success) {
      toast.success("ซื้อไอเทมสำเร็จ");
    } else {
      toast.error("ไม่สามารถซื้อไอเทมได้");
    }
  };
  
  const handleEquipToggle = async (playerItemId: number, isEquipped: boolean) => {
    if (isEquipped) {
      await unequipItem(playerItemId);
      toast.success("ถอดไอเทมแล้ว");
    } else {
      await equipItem(playerItemId);
      toast.success("สวมใส่ไอเทมแล้ว");
    }
  };
  
  const handleUseItem = async (playerItemId: number) => {
    const success = await useItem(playerItemId);
    
    if (success) {
      toast.success("ใช้ไอเทมสำเร็จ");
    } else {
      toast.error("ไม่สามารถใช้ไอเทมได้");
    }
  };
  
  const getEffectIcon = (effect: ItemEffect) => {
    switch (effect) {
      case "attack_power":
        return <Sword className="h-5 w-5 text-red-500" />;
      case "crit_chance":
        return <Zap className="h-5 w-5 text-amber-500" />;
      case "crit_multiplier":
        return <Gauge className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          <span>ร้านค้าไอเทม</span>
        </CardTitle>
        <CardDescription>
          ซื้อไอเทมเพื่อเพิ่มพลังต่อสู้
          {player && (
            <span className="ml-1 text-sm font-medium">
              (ทองปัจจุบัน: <span className="text-yellow-400">{player.gold}</span>)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="shop">ร้านค้า</TabsTrigger>
            <TabsTrigger value="inventory">กระเป๋า</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shop" className="space-y-4">
            {loading ? (
              <p className="text-center py-4">กำลังโหลดไอเทม...</p>
            ) : !items.length ? (
              <p className="text-center py-4">ไม่พบไอเทมในร้านค้า</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <Card key={item.id} className="item-card overflow-hidden">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getEffectIcon(item.effect)}
                        <span>{item.name}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardFooter className="p-3 pt-0 flex justify-between items-center">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{item.price}</span>
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={() => handlePurchase(item.id, item.price)}
                        disabled={!player || player.gold < item.price}
                      >
                        ซื้อ
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            {loading ? (
              <p className="text-center py-4">กำลังโหลดไอเทม...</p>
            ) : !inventory.length ? (
              <p className="text-center py-4">ไม่มีไอเทมในกระเป๋า</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.map(playerItem => (
                  <Card 
                    key={playerItem.id} 
                    className={`item-card overflow-hidden ${playerItem.isEquipped ? 'border-primary' : ''}`}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getEffectIcon(playerItem.item.effect)}
                        <span>
                          {playerItem.item.name}
                          {playerItem.quantity > 1 && (
                            <span className="text-xs ml-1">x{playerItem.quantity}</span>
                          )}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {playerItem.item.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardFooter className="p-3 pt-0 flex justify-end items-center gap-2">
                      {playerItem.item.isUnique ? (
                        <Button 
                          size="sm"
                          variant={playerItem.isEquipped ? "default" : "outline"}
                          onClick={() => handleEquipToggle(playerItem.id, playerItem.isEquipped)}
                        >
                          {playerItem.isEquipped ? "ถอด" : "สวมใส่"}
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleUseItem(playerItem.id)}
                        >
                          ใช้งาน
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ItemShop;
