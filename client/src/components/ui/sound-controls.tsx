import { useState } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { Slider } from "./slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";
import { 
  Settings, 
  VolumeX, 
  Volume2, 
  Volume1, 
  Music, 
  Music3
} from "lucide-react";
import { Switch } from "./switch";
import { Label } from "./label";

export function SoundControls() {
  const [open, setOpen] = useState(false);
  
  const {
    isMuted,
    isBGMMuted,
    isEffectsMuted,
    bgmVolume,
    effectVolume,
    toggleMute,
    toggleBGMMute,
    toggleEffectsMute,
    setBGMVolume,
    setEffectVolume,
    playSound,
  } = useAudio();
  
  const handleEffectVolumeChange = (value: number[]) => {
    setEffectVolume(value[0]);
    // เล่นเสียงตัวอย่างเมื่อปรับระดับเสียง
    if (!isEffectsMuted) {
      playSound("hit");
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-white hover:text-primary hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>การตั้งค่าเสียง</SheetTitle>
          <SheetDescription>
            ปรับแต่งเสียงเพื่อประสบการณ์ที่ดีที่สุด
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Master Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
                <Label htmlFor="master-volume">เสียงทั้งหมด</Label>
              </div>
              <Switch 
                id="master-mute"
                checked={!isMuted}
                onCheckedChange={() => toggleMute()}
              />
            </div>
          </div>
          
          {/* BGM Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isBGMMuted ? (
                  <Music3 className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Music className="h-5 w-5" />
                )}
                <Label htmlFor="bgm-volume">เพลงพื้นหลัง</Label>
              </div>
              <Switch 
                id="bgm-mute"
                checked={!isBGMMuted}
                disabled={isMuted}
                onCheckedChange={() => toggleBGMMute()}
              />
            </div>
            <Slider
              id="bgm-volume"
              disabled={isMuted || isBGMMuted}
              min={0}
              max={1}
              step={0.01}
              defaultValue={[bgmVolume]}
              onValueChange={(value) => setBGMVolume(value[0])}
            />
          </div>
          
          {/* SFX Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isEffectsMuted ? (
                  <Volume1 className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume1 className="h-5 w-5" />
                )}
                <Label htmlFor="sfx-volume">เสียงเอฟเฟกต์</Label>
              </div>
              <Switch 
                id="sfx-mute"
                checked={!isEffectsMuted}
                disabled={isMuted}
                onCheckedChange={() => toggleEffectsMute()}
              />
            </div>
            <Slider
              id="sfx-volume"
              disabled={isMuted || isEffectsMuted}
              min={0}
              max={1}
              step={0.01}
              defaultValue={[effectVolume]}
              onValueChange={handleEffectVolumeChange}
            />
          </div>
          
          {/* Test Sounds (Only visible when not muted) */}
          {!isMuted && !isEffectsMuted && (
            <div className="pt-4">
              <Button 
                size="sm"
                onClick={() => playSound("hit")}
                className="mr-2 mb-2"
              >
                ทดสอบเสียงโจมตี
              </Button>
              <Button 
                size="sm"
                onClick={() => playSound("victory")}
              >
                ทดสอบเสียงชัยชนะ
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}