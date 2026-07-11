'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import BlurText from './BlurText'

export default function PlatformOverviewSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const fadeUp = {
    initial: { filter: 'blur(10px)', opacity: 0, y: 30 },
    animate: inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {},
  }

  return (
    <section id="web-platform" className="min-h-screen bg-black relative py-32 px-8 md:px-16 lg:px-20 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div
        className="absolute right-0 bottom-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none"
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
        
        {/* Left: Web Dashboard Mockup Visual */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex-1 w-full"
        >
          {/* Abstract Browser Window */}
          <div className="relative w-full aspect-video liquid-glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            {/* Browser Header */}
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500/50" />
               <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
               <div className="w-3 h-3 rounded-full bg-green-500/50" />
               <div className="ml-4 h-5 w-48 bg-white/5 rounded-md" />
            </div>
            
            {/* Dashboard Layout */}
            <div className="flex-1 flex bg-[#050505]">
              {/* Sidebar */}
              <div className="w-48 border-r border-white/5 p-4 flex flex-col gap-3">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-md bg-green-500/20" />
                    <div className="h-4 w-24 bg-white/20 rounded" />
                 </div>
                 <div className="h-6 w-full liquid-glass rounded" />
                 <div className="h-6 w-full bg-white/5 rounded" />
                 <div className="h-6 w-full bg-white/5 rounded" />
                 <div className="h-6 w-full bg-white/5 rounded" />
              </div>
              
              {/* Main Area */}
              <div className="flex-1 p-6 flex flex-col gap-6">
                {/* Top widgets */}
                <div className="flex gap-4">
                  <div className="flex-1 h-24 liquid-glass rounded-xl p-4 flex flex-col justify-between">
                     <div className="h-3 w-20 bg-white/10 rounded" />
                     <div className="h-8 w-32 bg-white/20 rounded" />
                  </div>
                  <div className="flex-1 h-24 liquid-glass rounded-xl p-4 flex flex-col justify-between">
                     <div className="h-3 w-20 bg-white/10 rounded" />
                     <div className="h-8 w-32 bg-green-400/20 rounded" />
                  </div>
                  <div className="flex-1 h-24 liquid-glass rounded-xl p-4 flex flex-col justify-between">
                     <div className="h-3 w-20 bg-white/10 rounded" />
                     <div className="h-8 w-32 bg-white/20 rounded" />
                  </div>
                </div>

                {/* Big Chart Area */}
                <div className="flex-1 liquid-glass rounded-xl p-4 relative overflow-hidden">
                   <div className="h-4 w-32 bg-white/10 rounded mb-6" />
                   
                   {/* Abstract Chart Lines */}
                   <svg className="absolute bottom-0 left-0 w-full h-3/4" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,100 L0,50 Q25,80 50,40 T100,20 L100,100 Z" fill="url(#grad)" opacity="0.1" />
                      <path d="M0,50 Q25,80 50,40 T100,20" fill="none" stroke="#4ade80" strokeWidth="1" />
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ade80" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                   </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Content */}
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-sm font-body text-green-400 mb-6 uppercase tracking-widest font-medium"
          >
            // Farm Management Platform
          </motion.p>

          <BlurText
            text="Your Entire Farm, on One Screen."
            className="font-heading italic text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-2px] text-white mb-8"
            wordDelay={0.08}
          />

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-white/70 font-body font-light leading-relaxed mb-12 max-w-xl"
          >
            Move from the field to the desk with the AgriSence Web Platform. Designed for farm operators to track expenses, map fields, and analyze historical data with enterprise-grade tools.
          </motion.p>

          <div className="flex flex-col gap-8">
            {/* Feature 1 */}
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.4 }} className="flex gap-4">
              <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading italic text-white mb-2">Financial & Harvest Records</h4>
                <p className="text-sm text-white/60 font-body font-light leading-snug">
                  Log seeds, fertilizers, labor, and machinery costs. Match them against your harvest yields and live Mandi prices to calculate true season profitability.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.5 }} className="flex gap-4">
              <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="M9 15l3-3 3 3" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading italic text-white mb-2">Government Scheme Matching</h4>
                <p className="text-sm text-white/60 font-body font-light leading-snug">
                  Our database continuously syncs with state and central agricultural schemes. Based on your land size and crop types, we highlight subsidies you qualify for.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div {...fadeUp} transition={{ duration: 0.8, delay: 0.6 }} className="flex gap-4">
              <div className="liquid-glass w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m13 7 5 5-6 6-5-5" />
                  <path d="M14 6l3-3 3 3-3 3" />
                  <path d="m3 21 2.5-2.5" />
                  <path d="M5.5 18.5 8 16" />
                  <path d="M13 7L9 3 3 9l4 4" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading italic text-white mb-2">Satellite NDVI Field Mapping</h4>
                <p className="text-sm text-white/60 font-body font-light leading-snug">
                  Draw your farm boundaries on our interactive map. We fetch historical and current satellite imagery to show crop health variance, helping you spot underperforming zones.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  )
}
