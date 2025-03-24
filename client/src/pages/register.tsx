import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/useAuth";
import RegisterForm from "@/components/ui/register-form";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Register() {
  const { isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = await checkAuth();
      if (authenticated) {
        navigate("/game");
      }
    };
    
    checkAuthStatus();
  }, [checkAuth, navigate]);

  if (isAuthenticated) {
    navigate("/game");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="container flex-1 flex flex-col justify-center items-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              กลับหน้าหลัก
            </Button>
            <h1 className="text-3xl font-bold mb-2">ดันเจี้ยนคลิกเกอร์</h1>
            <p className="text-muted-foreground">สมัครสมาชิกและเริ่มผจญภัยในดันเจี้ยน</p>
          </div>
          
          <RegisterForm />
        </div>
      </div>
      
      <footer className="py-4 text-center text-sm text-muted-foreground">
        &copy; 2023 ดันเจี้ยนคลิกเกอร์ - All rights reserved
      </footer>
    </div>
  );
}
