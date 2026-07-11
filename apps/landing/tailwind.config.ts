import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", 'serif'],
        body: ["'Barlow'", 'sans-serif'],
      },
      colors: {
        green: {
          400: '#4ade80',
          500: '#22c55e',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter2: '-0.03em',
      },
    },
  },
  plugins: [],
}

export default config
