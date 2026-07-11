'use client'

import { useRef, useEffect } from 'react'

interface FadingVideoProps {
  src: string | string[]
  className?: string
  style?: React.CSSProperties
}

export default function FadingVideo({ src, className = '', style }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const indexRef = useRef(0)
  const fadeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sources = Array.isArray(src) ? src : [src]

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.style.opacity = '0'

    const fadeIn = () => {
      let start: number | null = null
      const duration = 500

      const step = (timestamp: number) => {
        if (start === null) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        video.style.opacity = String(progress)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const fadeOut = (onDone: () => void) => {
      let start: number | null = null
      const duration = 550
      const step = (timestamp: number) => {
        if (start === null) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        video.style.opacity = String(1 - progress)
        if (progress < 1) requestAnimationFrame(step)
        else onDone()
      }
      requestAnimationFrame(step)
    }

    const handleLoaded = () => fadeIn()

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const remaining = video.duration - video.currentTime
      if (remaining <= 0.55 && !fadeOutRef.current) {
        fadeOutRef.current = setTimeout(() => {}, 0)
        fadeOut(() => {
          fadeOutRef.current = null
        })
      }
    }

    const handleEnded = () => {
      if (sources.length === 1) {
        video.currentTime = 0
        void video.play()
        fadeIn()
      } else {
        indexRef.current = (indexRef.current + 1) % sources.length
        video.src = sources[indexRef.current]!
        video.load()
        void video.play()
        fadeIn()
      }
    }

    video.addEventListener('loadeddata', handleLoaded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadeddata', handleLoaded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [sources])

  return (
    <video
      ref={videoRef}
      src={sources[0]}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  )
}
