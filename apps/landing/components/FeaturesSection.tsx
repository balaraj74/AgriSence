'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import FadingVideo from './FadingVideo'
import BlurText from './BlurText'

const CAP_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_093722_ccfc7ebf-182f-419f-8a62-2dc02db7dd9d.mp4'

/* ─── SVG Icons ─────────────────────────────────────────────────── */
function BrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    </svg>
  )
}

function SatelliteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
      <path d="M13 7L9 3 3 9l4 4" />
      <path d="m13 7 5 5-6 6-5-5" />
      <path d="M14 6l3-3 3 3-3 3" />
      <path d="m3 21 2.5-2.5" />
      <path d="M5.5 18.5 8 16" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

/* ─── Capability Data ────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    id: 'intelligence',
    icon: <BrainIcon />,
    tags: ['Disease Detection', 'Soil Advisor', 'AI Chatbot', 'Voice Interface'],
    title: 'AI Intelligence',
    body: 'Snap a leaf photo and get instant disease diagnosis. Describe soil symptoms and receive tailored fertilizer plans. Ask your bilingual AI advisor anything — in English or Kannada — 24 hours a day, 7 days a week.',
  },
  {
    id: 'data',
    icon: <SatelliteIcon />,
    tags: ['Satellite NDVI', 'Live Weather', 'Market Prices', 'Field Mapping'],
    title: 'Real-Time Data',
    body: 'Monitor your fields from orbit using NDVI satellite imagery. Track hyper-local weather, rain probability, and UV index. Follow live mandi prices across 100+ crops and map your field boundaries with GPS precision.',
  },
  {
    id: 'management',
    icon: <ChartIcon />,
    tags: ['Expense Tracker', 'Harvest Records', 'Govt. Schemes', 'Land Records'],
    title: 'Farm Management',
    body: 'Log every cost, record every harvest, store every document — securely in the cloud. Discover eligible government schemes filtered to your profile. Track profit and loss across seasons with your own farm data.',
  },
]

interface CapCardProps {
  cap: (typeof CAPABILITIES)[0]
  index: number
}

function CapCard({ cap, index }: CapCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ filter: 'blur(8px)', opacity: 0, y: 30 }}
      animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: 'easeOut' }}
      className="cap-card p-6 min-h-[380px] flex flex-col"
      id={`cap-card-${cap.id}`}
    >
      {/* Top row: icon + tags */}
      <div className="flex items-start justify-between gap-4">
        <div className="liquid-glass h-11 w-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0">
          {cap.icon}
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end">
          {cap.tags.map((tag) => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: title + body */}
      <div className="mt-8">
        <h3 className="font-heading italic text-3xl md:text-4xl tracking-tight leading-none text-white mb-3">
          {cap.title}
        </h3>
        <p className="text-sm text-white/70 font-body font-light leading-snug max-w-[32ch]">
          {cap.body}
        </p>
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <section id="features" className="min-h-screen overflow-hidden bg-black relative">
      {/* Background video */}
      <FadingVideo
        src={CAP_VIDEO}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

      {/* Content */}
      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-32 pb-16 flex flex-col min-h-screen">
        {/* Header */}
        <div ref={headerRef} className="mb-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-sm font-body text-white/70 mb-5"
          >
            // Capabilities
          </motion.p>

          <BlurText
            text="Everything a farmer needs, end to end."
            className="font-heading italic text-5xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px] text-white max-w-3xl"
            wordDelay={0.08}
          />
        </div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap, i) => (
            <CapCard key={cap.id} cap={cap} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
