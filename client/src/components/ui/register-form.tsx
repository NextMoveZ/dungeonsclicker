import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordError("");
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      setPasswordError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register({ 
        username, 
        password, 
        confirmPassword 
      });
      
      if (success) {
        navigate("/game");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">สมัครสมาชิก</CardTitle>
        <CardDescription className="text-center">
          สร้างบัญชีเพื่อเล่นเกมดันเจี้ยนคลิกเกอร์
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="เลือกชื่อผู้ใช้ของคุณ"
              minLength={3}
              maxLength={20}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="เลือกรหัสผ่านของคุณ"
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="ใส่รหัสผ่านอีกครั้ง"
            />
            {passwordError && (
              <p className="text-sm text-destructive mt-1">{passwordError}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => navigate("/login")}
          >
            เข้าสู่ระบบ
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default RegisterForm;
