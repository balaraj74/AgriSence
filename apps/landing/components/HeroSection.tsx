'use client'

import { motion } from 'framer-motion'
import FadingVideo from './FadingVideo'
import BlurText from './BlurText'

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4'

const fadeUp = {
  initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
  animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
}
const transition = (delay: number) => ({ duration: 0.8, delay, ease: 'easeOut' })

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.42C2.5 21.4 5 23 7 22c2-1 4-2 6-6 0 0-2 0-4-3 0 0 8 0 10-5 0 0-1 5-5 7 0 0 6-2 7-8 0 0-2 7-10 9" />
    </svg>
  )
}

const STATS = [
  {
    icon: <ClockIcon />,
    value: '16',
    label: 'AI-Powered Tools\nIn One App',
  },
  {
    icon: <LeafIcon />,
    value: '100+',
    label: 'Crops & Markets\nTracked Live',
  },
]

const TRUST_NAMES = ['Gemini AI', 'Firebase', 'Google Maps', 'Expo', 'Next.js']

export default function HeroSection() {
  return (
    <section id="hero" className="h-screen overflow-hidden bg-black relative">
      {/* Background video */}
      <FadingVideo
        src={HERO_VIDEO}
        className="absolute object-cover object-top z-0"
        style={{ left: '50%', top: 0, transform: 'translateX(-50%)', width: '120%', height: '120%' }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4 text-center">
          {/* Badge */}
          <motion.div {...fadeUp} transition={transition(0.4)}>
            <div className="liquid-glass rounded-full inline-flex items-center gap-2 px-1.5 py-1.5">
              <span className="bg-green-400 text-black text-[10px] font-body font-semibold px-2.5 py-1 rounded-full leading-none">
                NEW
              </span>
              <span className="text-white/80 text-xs font-body pr-3">
                AI-powered farming — built for Indian farmers
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <div className="mt-6 max-w-4xl">
            <BlurText
              text="Grow Smarter. Farm Wiser. Powered by AI."
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] tracking-[-3px]"
              wordDelay={0.1}
            />
          </div>

          {/* Subtext */}
          <motion.p
            {...fadeUp}
            transition={transition(0.8)}
            className="mt-5 text-sm md:text-base text-white/80 max-w-2xl font-body font-light leading-tight"
          >
            AgriSence gives every farmer AI disease detection, real-time market prices,
            satellite field health, soil analysis, and live weather — all in one Android app.
            Precision farming, finally accessible.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            {...fadeUp}
            transition={transition(1.1)}
            className="mt-7 flex items-center gap-6"
          >
            <a
              href="#download"
              id="hero-cta-primary"
              className="liquid-glass-strong rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-body font-medium text-white"
            >
              Download APK <ArrowUpRight />
            </a>
            <a
              href="#features"
              id="hero-cta-secondary"
              className="flex items-center gap-2 text-sm font-body font-light text-white/70 hover:text-white transition-colors"
            >
              <PlayIcon /> See all features
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp}
            transition={transition(1.3)}
            className="mt-8 flex gap-4 flex-wrap justify-center"
          >
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className="liquid-glass p-5 w-[200px] sm:w-[220px] rounded-[1.25rem] flex flex-col text-left"
              >
                {stat.icon}
                <div className="text-4xl font-heading italic tracking-tight leading-none mt-4">
                  {stat.value}
                </div>
                <div className="text-xs text-white/60 font-body font-light mt-1.5 leading-snug whitespace-pre-line">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Trust bar */}
        <motion.div
          {...fadeUp}
          transition={transition(1.4)}
          className="flex flex-col items-center gap-4 pb-8"
        >
          <div className="liquid-glass rounded-full px-5 py-2">
            <span className="text-xs text-white/60 font-body font-light">
              Built on trusted infrastructure
            </span>
          </div>
          <div className="flex items-center gap-8 md:gap-12">
            {TRUST_NAMES.map((name) => (
              <span
                key={name}
                className="font-heading italic text-xl md:text-2xl tracking-tight text-white/40"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
