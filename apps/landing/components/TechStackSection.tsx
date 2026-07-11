'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import BlurText from './BlurText'

interface TechItem { name: string; role: string; color: string }

const TECH: TechItem[] = [
  { name: 'React Native', role: 'Mobile', color: '#38bdf8' },
  { name: 'Expo 52', role: 'Platform', color: '#a78bfa' },
  { name: 'Expo Router', role: 'Navigation', color: '#c4b5fd' },
  { name: 'Google Gemini', role: 'AI Engine', color: '#4ade80' },
  { name: 'Genkit', role: 'AI Flows', color: '#86efac' },
  { name: 'Firestore', role: 'Database', color: '#fb923c' },
  { name: 'Firebase Auth', role: 'Auth', color: '#fbbf24' },
  { name: 'Firebase Storage', role: 'Files', color: '#fcd34d' },
  { name: 'FCM', role: 'Push', color: '#f97316' },
  { name: 'Next.js 16', role: 'Web', color: '#ffffff' },
  { name: 'React 19', role: 'UI', color: '#67e8f9' },
  { name: 'Tailwind CSS', role: 'Styling', color: '#2dd4bf' },
  { name: 'TanStack Query', role: 'Server State', color: '#f87171' },
  { name: 'Zustand v5', role: 'UI State', color: '#fb923c' },
  { name: 'Zod', role: 'Validation', color: '#818cf8' },
  { name: 'React Hook Form', role: 'Forms', color: '#f472b6' },
  { name: 'Turborepo', role: 'Monorepo', color: '#4ade80' },
  { name: 'pnpm', role: 'Packages', color: '#a3e635' },
  { name: 'GitHub Actions', role: 'CI/CD', color: '#e2e8f0' },
  { name: 'TypeScript 5', role: 'Types', color: '#60a5fa' },
  { name: 'Google Maps', role: 'Mapping', color: '#4ade80' },
  { name: 'expo-camera', role: 'Camera', color: '#f87171' },
  { name: 'expo-location', role: 'GPS', color: '#38bdf8' },
  { name: 'Reanimated 3', role: 'Animation', color: '#a78bfa' },
]

export default function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="technology" className="min-h-screen bg-black relative py-32 px-8 md:px-16 lg:px-20 overflow-hidden">
      {/* Background Image */}
      <img
        src="/tech-bg.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.15] z-0 pointer-events-none"
      />
      
      {/* Subtle gradient */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74,222,128,0.04) 0%, transparent 60%)',
        }}
      />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-sm font-body text-white/70 mb-5"
        >
          // Technology
        </motion.p>

        {/* Heading */}
        <BlurText
          text="Built on a world-class stack, end to end."
          className="font-heading italic text-4xl md:text-6xl lg:text-[5rem] leading-[0.9] tracking-[-2px] text-white max-w-3xl mb-20"
          wordDelay={0.07}
        />

        {/* Badge grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          {TECH.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.03, ease: 'easeOut' }}
              className="liquid-glass rounded-xl px-4 py-3 flex flex-col"
              id={`tech-${tech.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="text-sm font-body font-light" style={{ color: tech.color }}>
                {tech.name}
              </span>
              <span className="text-[10px] text-white/30 font-body mt-0.5 uppercase tracking-wider">
                {tech.role}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
