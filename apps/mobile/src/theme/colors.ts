// Design tokens mirroring the web app's CSS variables
// Light mode ↔ Dark mode matching globals.css

export const Colors = {
  light: {
    background: '#fafafa',
    foreground: '#1e2633',
    card: '#ffffff',
    cardForeground: '#1e2633',
    primary: '#2d8a50',
    primaryForeground: '#ffffff',
    secondary: '#f0f2f5',
    secondaryForeground: '#2a3545',
    muted: '#eff1f4',
    mutedForeground: '#667788',
    accent: '#d97706',
    accentForeground: '#ffffff',
    destructive: '#dc2626',
    destructiveForeground: '#ffffff',
    border: '#dde3ea',
    input: '#dde3ea',
    // Semantic
    success: '#2d8a50',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
    // Gradients
    emerald400: '#34d399',
    teal400: '#2dd4bf',
    cyan400: '#22d3ee',
    lime400: '#a3e635',
    blue400: '#60a5fa',
    amber400: '#fbbf24',
    indigo400: '#818cf8',
    purple400: '#c084fc',
    rose400: '#fb7185',
    amber500: '#f59e0b',
  },
  dark: {
    background: '#0f1117',
    foreground: '#f0f4f8',
    card: '#141820',
    cardForeground: '#f0f4f8',
    primary: '#4ade80',
    primaryForeground: '#ffffff',
    secondary: '#1a2030',
    secondaryForeground: '#c5d0dd',
    muted: '#161d2a',
    mutedForeground: '#8899aa',
    accent: '#f59e0b',
    accentForeground: '#1a1200',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#1e2533',
    input: '#1a2030',
    // Semantic
    success: '#4ade80',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#60a5fa',
    // Gradients
    emerald400: '#34d399',
    teal400: '#2dd4bf',
    cyan400: '#22d3ee',
    lime400: '#a3e635',
    blue400: '#60a5fa',
    amber400: '#fbbf24',
    indigo400: '#818cf8',
    purple400: '#c084fc',
    rose400: '#fb7185',
    amber500: '#f59e0b',
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = Record<keyof typeof Colors.light, string>;

