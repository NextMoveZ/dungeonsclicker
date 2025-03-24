import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/stores/useAuth";
import { useLanguage } from "@/lib/stores/useLanguage";
import { Target, Award, Shield, User, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSelector } from "@/components/ui/language-selector";

export default function Home() {
  const { player, isAuthenticated, isAdmin, checkAuth } = useAuth();
  const { t } = useLanguage();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LanguageSelector />
      
      {/* Hero Section */}
      <section className="bg-background py-16 flex-grow flex items-center">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 text-center md:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold leading-tight mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {t("app.title")}
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {t("app.subtitle")}
              </motion.p>
              <motion.div 
                className="flex flex-wrap justify-center md:justify-start gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {isAuthenticated ? (
                  <>
                    <Button 
                      className="text-lg px-6 py-6 transition-transform duration-200 hover:scale-105" 
                      size="lg" 
                      asChild
                    >
                      <Link to="/game">{t("game.start")}</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-lg px-6 py-6 transition-transform duration-200 hover:scale-105" 
                      size="lg" 
                      asChild
                    >
                      <Link to="/shop">{t("shop.title")}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="text-lg px-6 py-6 transition-transform duration-200 hover:scale-105" 
                      size="lg" 
                      asChild
                    >
                      <Link to="/login">{t("auth.login")}</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-lg px-6 py-6 transition-transform duration-200 hover:scale-105" 
                      size="lg" 
                      asChild
                    >
                      <Link to="/register">{t("auth.register")}</Link>
                    </Button>
                  </>
                )}
              </motion.div>
              
              {isAdmin && (
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Button 
                    variant="secondary" 
                    className="transition-all duration-200 hover:bg-secondary/80"
                    asChild
                  >
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      {t("admin.title")}
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 mt-10 md:mt-0 flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="w-full max-w-md bg-secondary/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <CardTitle>{t("home.weeklyTitle")}</CardTitle>
                  <CardDescription>{t("home.topPlayers")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="space-y-4"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div 
                      className="flex items-center bg-secondary/40 p-3 rounded-lg hover:bg-secondary/60 transition-all duration-200 cursor-pointer"
                      variants={item}
                    >
                      <Award className="h-8 w-8 text-yellow-500 mr-3" />
                      <div>
                        <div className="font-bold">{t("home.rank")} 1</div>
                        <div className="text-muted-foreground">{t("home.player")}: Champion</div>
                      </div>
                      <div className="ml-auto font-bold">10,500</div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center bg-secondary/40 p-3 rounded-lg hover:bg-secondary/60 transition-all duration-200 cursor-pointer"
                      variants={item}
                    >
                      <Award className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="font-bold">{t("home.rank")} 2</div>
                        <div className="text-muted-foreground">{t("home.player")}: Runner Up</div>
                      </div>
                      <div className="ml-auto font-bold">8,750</div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center bg-secondary/40 p-3 rounded-lg hover:bg-secondary/60 transition-all duration-200 cursor-pointer"
                      variants={item}
                    >
                      <Award className="h-8 w-8 text-amber-600 mr-3" />
                      <div>
                        <div className="font-bold">{t("home.rank")} 3</div>
                        <div className="text-muted-foreground">{t("home.player")}: Newcomer</div>
                      </div>
                      <div className="ml-auto font-bold">6,200</div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <motion.section 
        className="py-12 bg-secondary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="container px-4 mx-auto">
          <motion.h2 
            className="text-3xl font-bold text-center mb-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {t("home.features")}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {t("home.clickingSystem")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t("home.clickingDesc")}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {t("home.dungeons")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t("home.dungeonsDesc")}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t("home.characterSystem")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t("home.characterDesc")}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Footer */}
      <motion.footer 
        className="py-6 bg-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="container px-4 mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2025 {t("app.title")} - {t("home.footerDesc")}
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
