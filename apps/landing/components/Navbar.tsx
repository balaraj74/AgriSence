'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Leaf } from 'lucide-react'

const NAV_LINKS = ['Features', 'Technology', 'About', 'Download']

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* ─── Desktop Nav ──────────────────────────────────────────── */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16">
        {/* Logo mark */}
        <div className="liquid-glass h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/logo.png" alt="AgriSence Logo" className="w-8 h-8 object-contain" />
        </div>

        {/* Center pill — desktop only */}
        <div className="hidden md:flex liquid-glass rounded-full px-1.5 py-1.5 items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              id={`nav-${link.toLowerCase()}`}
              className="px-3 py-2 text-sm font-body font-medium text-white/90 hover:text-white transition-colors rounded-full"
            >
              {link}
            </a>
          ))}
          <a
            href="#download"
            id="nav-cta"
            className="ml-1 flex items-center gap-1.5 bg-white text-black text-sm font-body font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
          >
            Get the App <ArrowUpRight />
          </a>
        </div>

        {/* Spacer / hamburger */}
        <div className="h-12 w-12 flex items-center justify-center">
          <button
            className="md:hidden liquid-glass h-12 w-12 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            id="nav-hamburger"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile Menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-20 left-4 right-4 z-50 md:hidden liquid-glass-strong rounded-2xl py-8 flex flex-col items-center gap-5"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, ease: 'easeOut' }}
                className="text-white/90 text-sm font-body font-light uppercase tracking-widest hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </motion.a>
            ))}
            <a
              href="#download"
              className="bg-white text-black text-sm font-body font-medium px-6 py-2.5 rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              Get the App
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
