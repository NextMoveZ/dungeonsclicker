import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/stores/useAuth";
import { useLanguage } from "@/lib/stores/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login({ username, password });
      if (success) {
        navigate("/game");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t("auth.loginTitle")}</CardTitle>
          <CardDescription className="text-center">
            {t("auth.loginSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <motion.div 
              className="space-y-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder={t("auth.usernamePlaceholder")}
                className="transition-all duration-200 focus:scale-102"
              />
            </motion.div>
            
            <motion.div 
              className="space-y-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder={t("auth.passwordPlaceholder")}
                className="transition-all duration-200 focus:scale-102"
              />
            </motion.div>
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button 
                type="submit" 
                className="w-full transition-transform duration-200 hover:scale-105 active:scale-95" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
              </Button>
            </motion.div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {t("auth.noAccount")}{" "}
            <Button
              variant="link"
              className="p-0 h-auto transition-all duration-200 hover:text-primary/80"
              onClick={() => navigate("/register")}
            >
              {t("auth.register")}
            </Button>
          </motion.p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default LoginForm;
