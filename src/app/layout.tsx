
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/app-providers';

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter' 
});

// Metadata and viewport can be exported from a server component
export const metadata: Metadata = {
  title: 'AgriSence - AI Farming Assistant',
  description: 'AI-powered agriculture assistant for Indian farmers',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#74B72E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
         <meta name="google-site-verification" content="w70z_ATdIg4qVVOUaY_qEugfjiWapembai-9s-AVzBM" />
         <link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192" />
         <meta name="theme-color" content="#74B72E" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AppProviders>
            {children}
            <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
