import * as React from 'react';
import { cn } from '@/lib/utils';

export const AgrisenceLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-center', className)} {...props}>
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 120 120" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop stopColor="hsl(var(--accent))" offset="0%"></stop>
          <stop stopColor="hsl(var(--primary))" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        {/* Abstract A / Seedling Shape */}
        <path d="M60,10 L95,110 L75,110 L68,90 L52,90 L45,110 L25,110 L60,10 Z" fill="url(#logo-gradient)" />
        
        {/* AI Circuit Veins */}
        <g stroke="hsl(var(--background))" strokeWidth="3" strokeLinecap="round">
          {/* Main stem */}
          <line x1="60" y1="95" x2="60" y2="60" />

          {/* Branch 1 */}
          <line x1="60" y1="80" x2="70" y2="70" />
          <line x1="70" y1="70" x2="70" y2="65" />
          <line x1="70" y1="70" x2="75" y2="75" />
          
          {/* Branch 2 */}
          <line x1="60" y1="70" x2="50" y2="60" />
          <line x1="50" y1="60" x2="50" y2="55" />
          <line x1="50" y1="60" x2="45" y2="65" />

           {/* Top Node */}
          <circle cx="60" cy="55" r="4" fill="hsl(var(--background))" />
        </g>
      </g>
    </svg>
  </div>
);