import React from 'react';
import { useLanguage } from '@/lib/stores/useLanguage';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.div 
      className="fixed top-4 right-4 flex gap-2 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button 
        variant={language === 'en' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setLanguage('en')}
        className="transition-all hover:scale-105"
      >
        {t('language.en')}
      </Button>
      <Button 
        variant={language === 'th' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setLanguage('th')}
        className="transition-all hover:scale-105"
      >
        {t('language.th')}
      </Button>
    </motion.div>
  );
}