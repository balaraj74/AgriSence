
"use client";

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Loading from '@/app/(app)/loading';

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This timer ensures the loading animation is shown for a bit.
    const timer = setTimeout(() => setLoading(false), 2000); 
    
    // Register the service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(err => {
            console.error('Service Worker registration failed:', err);
          });
      });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Loading />}
      
      <div style={{ display: loading ? 'none' : 'block' }}>
        <div className="animated-bg" />
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </div>
    </>
  );
}
