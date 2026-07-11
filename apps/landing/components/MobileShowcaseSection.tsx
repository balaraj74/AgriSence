'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import BlurText from './BlurText'

export default function MobileShowcaseSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const fadeUp = {
    initial: { filter: 'blur(10px)', opacity: 0, y: 30 },
    animate: inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {},
  }

  return (
    <section id="mobile-app" className="min-h-screen bg-black relative py-32 px-8 md:px-16 lg:px-20 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div
        className="absolute left-0 top-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Content */}
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-sm font-body text-green-400 mb-6 uppercase tracking-widest font-medium"
          >
            // The Mobile App
          </motion.p>

          <BlurText
            text="Field Intelligence in Your Pocket."
            className="font-heading italic text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-2px] text-white mb-8"
            wordDelay={0.08}
          />

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-white/70 font-body font-light leading-relaxed mb-12 max-w-xl"
          >
            The AgriSence mobile app is designed for the field. It works flawlessly in low-connectivity areas, bringing advanced AI models directly to your smartphone. Speak in your local language and let the app do the heavy lifting.
          </motion.p>

          <div className="flex flex-col gap-8">
            {/* Feature 1 */}
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.4 }} className="flex gap-4">
              <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading italic text-white mb-2">Gemini Vision Scanning</h4>
                <p className="text-sm text-white/60 font-body font-light leading-snug">
                  Point your camera at a diseased crop. The integrated Gemini Vision AI instantly identifies the pathogen and recommends organic and chemical treatments.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.5 }} className="flex gap-4">
              <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading italic text-white mb-2">Voice-First Multilingual UI</h4>
                <p className="text-sm text-white/60 font-body font-light leading-snug">
                  Don't type. Just talk. Our Voice AI understands natural language queries in English, Kannada, and Hindi. Ask about weather, prices, or farming techniques.
                </p>
              </div>
            </motion.div>

             {/* Feature 3 */}
             <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.6 }} className="flex gap-4">
              <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.5 19v-2a4 4 0 0 0-4-4H4" />
                  <path d="M8 17l-4-4 4-4" />
                  <path d="M20 9v-2" />
                  <path d="M20 1v2" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading italic text-white mb-2">Offline-First Architecture</h4>
                <p className="text-sm text-white/60 font-body font-light leading-snug">
                  No 4G? No problem. Core features, recent market prices, and critical AI logic are cached locally. Sync automatically when you return to coverage.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Phone Mockup Visual */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex-1 w-full flex justify-center lg:justify-end relative"
        >
          {/* Abstract Phone Shape */}
          <div className="relative w-[300px] h-[600px] md:w-[320px] md:h-[650px] liquid-glass-strong rounded-[3rem] border border-white/10 p-4 shadow-2xl flex flex-col items-center">
             {/* Notch */}
             <div className="w-24 h-6 bg-black rounded-b-xl absolute top-0" />
             
             {/* Screen Content Mock */}
             <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden relative flex flex-col p-6 pt-12">
               {/* App Header */}
               <div className="flex items-center justify-between mb-8">
                 <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                 </div>
                 <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-white/20" />
                   <div className="w-2 h-2 rounded-full bg-white/20" />
                 </div>
               </div>

               {/* Greeting */}
               <div className="h-6 w-32 bg-white/10 rounded-md mb-2" />
               <div className="h-10 w-48 bg-white/20 rounded-md mb-8" />

               {/* Scanner Card */}
               <div className="w-full h-48 liquid-glass rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-500/5 mix-blend-overlay" />
                  <div className="w-16 h-16 rounded-full border border-green-400/50 flex items-center justify-center">
                     <div className="w-12 h-12 rounded-full border border-green-400/30 flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                     </div>
                  </div>
                  <div className="absolute bottom-4 left-4 font-body text-xs text-white/50 tracking-widest uppercase">
                    Scan Crop
                  </div>
               </div>

               {/* Grid items */}
               <div className="flex gap-4 mb-4">
                 <div className="flex-1 h-24 liquid-glass rounded-2xl p-4">
                   <div className="w-6 h-6 rounded-full bg-blue-500/20 mb-2" />
                   <div className="h-3 w-16 bg-white/10 rounded-md mb-1" />
                   <div className="h-4 w-12 bg-white/20 rounded-md" />
                 </div>
                 <div className="flex-1 h-24 liquid-glass rounded-2xl p-4">
                   <div className="w-6 h-6 rounded-full bg-orange-500/20 mb-2" />
                   <div className="h-3 w-16 bg-white/10 rounded-md mb-1" />
                   <div className="h-4 w-12 bg-white/20 rounded-md" />
                 </div>
               </div>
               
               {/* Bottom Nav */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-14 liquid-glass rounded-full flex items-center justify-around px-4">
                 <div className="w-6 h-6 rounded-full bg-white/20" />
                 <div className="w-6 h-6 rounded-full bg-white/10" />
                 <div className="w-6 h-6 rounded-full bg-white/10" />
                 <div className="w-6 h-6 rounded-full bg-white/10" />
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
