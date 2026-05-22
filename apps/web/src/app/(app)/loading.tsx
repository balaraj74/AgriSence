'use client';

import { motion } from 'framer-motion';
import { AgrisenceLogo } from '@/components/agrisence-logo';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-32 h-32">
          <AgrisenceLogo />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AgriSence
        </h1>
        <p className="text-lg text-muted-foreground">
          Your AI Farming Partner
        </p>
      </motion.div>
      
      {/* Plant Growing Animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 1.2 }}
        className="relative w-24 h-24 mt-4"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-primary rounded-t-full origin-bottom animate-[grow-stem_1s_ease-out_1.5s_forwards]" />
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-accent rounded-full origin-bottom-left animate-[grow-leaf-left_0.7s_ease-out_2.5s_forwards]" 
             style={{ clipPath: 'ellipse(50% 50% at 0% 100%)', transformOrigin: 'bottom left', marginLeft: '-1px', marginTop: '-12px' }} />
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-accent rounded-full origin-bottom-right animate-[grow-leaf-right_0.7s_ease-out_2.5s_forwards]" 
             style={{ clipPath: 'ellipse(50% 50% at 100% 100%)', transformOrigin: 'bottom right', marginLeft: '-31px', marginTop: '-12px' }} />
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
