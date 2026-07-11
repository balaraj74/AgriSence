import type { Metadata } from 'next'
import { Instrument_Serif, Barlow } from 'next/font/google'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-heading-next',
  display: 'swap',
})

const barlow = Barlow({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body-next',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgriSence — AI-Powered Smart Farming Platform',
  description:
    'AgriSence transforms farming with AI-driven disease detection, soil analysis, market intelligence, satellite field health, and real-time weather — built for the modern farmer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  )
}
