'use client'

import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2 text-white/40 font-light uppercase" style={{ letterSpacing: '0.25em' }}>
          <Leaf size={14} className="text-green-400/60" />
          <span className="text-sm">AgriSence</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          {['Features', 'Technology', 'Download'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-white/25 hover:text-white/60 uppercase text-xs font-light transition-colors duration-300"
              style={{ letterSpacing: '0.15em' }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-white/20 text-xs font-light" style={{ letterSpacing: '0.06em' }}>
          © 2026 AgriSence. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
