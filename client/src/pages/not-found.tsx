import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/stores/useLanguage";
import { LanguageSelector } from "@/components/ui/language-selector";
import { motion } from "framer-motion";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <LanguageSelector />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-4 overflow-hidden shadow-lg">
          <motion.div
            className="bg-primary h-2 w-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <CardContent className="pt-6">
            <motion.div 
              className="flex mb-4 gap-2 items-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, -10, 0],
                  scale: [1, 1.2, 1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3 
                }}
              >
                <AlertCircle className="h-8 w-8 text-red-500" />
              </motion.div>
              <h1 className="text-2xl font-bold">404 - {t("notFound.title")}</h1>
            </motion.div>

            <motion.p 
              className="mt-4 text-sm text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t("notFound.description")}
            </motion.p>
            
            <motion.div
              className="mt-6 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button 
                asChild 
                className="transition-all duration-300 hover:shadow-lg"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  {t("app.back")}
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
