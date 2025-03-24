import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/useAuth";
import LoginForm from "@/components/ui/login-form";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLanguage } from "@/lib/stores/useLanguage";
import { LanguageSelector } from "@/components/ui/language-selector";
import { motion } from "framer-motion";

export default function Login() {
  const { isAuthenticated, checkAuth } = useAuth();
  const { t } = useLanguage();
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
      <LanguageSelector />
      
      <div className="container flex-1 flex flex-col justify-center items-center py-12">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="mb-6 text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              variant="ghost" 
              className="mb-4 transition-transform hover:scale-105" 
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 h-4 w-4" />
              {t("app.back")}
            </Button>
            <motion.h1 
              className="text-3xl font-bold mb-2"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
            >
              {t("app.title")}
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t("app.subtitle")}
            </motion.p>
          </motion.div>
          
          <LoginForm />
        </motion.div>
      </div>
      
      <motion.footer 
        className="py-4 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        &copy; 2025 {t("app.title")} - All rights reserved
      </motion.footer>
    </div>
  );
}
