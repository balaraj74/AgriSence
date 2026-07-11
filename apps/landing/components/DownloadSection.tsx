'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import BlurText from './BlurText'

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
    </svg>
  )
}

const HIGHLIGHTS = [
  { value: 'Android 8+', sub: 'Compatible' },
  { value: 'Offline', sub: 'Works without internet' },
  { value: 'Free', sub: 'No subscription' },
]

export default function DownloadSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="download" className="min-h-screen bg-black relative flex flex-col items-center justify-center py-32 px-8 md:px-16 overflow-hidden">
      {/* Background Image */}
      <img
        src="/download-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.25] z-0 pointer-events-none"
      />
      
      {/* Green radial glow */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(74,222,128,0.05) 0%, transparent 70%)',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-sm font-body text-white/70 mb-5"
        >
          // Download
        </motion.p>

        {/* Heading */}
        <BlurText
          text="Start farming with AI today."
          className="font-heading italic text-5xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] text-white mb-8"
          wordDelay={0.1}
        />

        {/* Subtext */}
        <motion.p
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-base text-white/60 font-body font-light leading-tight max-w-xl mx-auto mb-10"
        >
          Download the AgriSence APK directly — no app store required.
          Install in seconds and transform how you farm.
        </motion.p>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {HIGHLIGHTS.map((h) => (
            <div key={h.value} className="liquid-glass rounded-xl px-5 py-3 text-center">
              <div className="text-white font-heading italic text-xl tracking-tight">{h.value}</div>
              <div className="text-white/40 text-xs font-body mt-0.5">{h.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#download"
            id="download-apk-main"
            className="liquid-glass-strong rounded-full px-8 py-3.5 flex items-center gap-2 text-sm font-body font-medium text-white"
          >
            Download AgriSence APK <ArrowUpRight />
          </a>
          <span className="text-white/25 text-xs font-body">
            Enable "Install from unknown sources" in Settings
          </span>
        </motion.div>
      </div>
    </section>
  )
}
