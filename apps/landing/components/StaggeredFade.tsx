'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface StaggeredFadeProps {
  text: string
  className?: string
  charDelay?: number
  startDelay?: number
}

export default function StaggeredFade({
  text,
  className = '',
  charDelay = 0.07,
  startDelay = 0,
}: StaggeredFadeProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <span ref={ref} className={`inline-block ${className}`} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{
            duration: 0.5,
            delay: startDelay + i * charDelay,
            ease: 'easeOut',
          }}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}
