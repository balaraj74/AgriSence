
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import {
  Leaf,
  Stethoscope,
  CloudSun,
  LineChart,
  ScrollText,
  BrainCircuit,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  MessageCircle,
  Mic,
  ChevronRight,
  HeartPulse,
  BarChart,
  Handshake,
  Satellite,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';
import Autoplay from "embla-carousel-autoplay";
import { Input } from '@/components/ui/input';
import { NotificationBell } from '@/components/notification-bell';

interface QuickLink {
  href: string;
  title: string;
  icon: LucideIcon;
}

const allTools: QuickLink[] = [
  {
    href: '/records',
    title: 'Records',
    icon: Leaf,
  },
  {
    href: '/disease-check',
    title: 'Diagnosis',
    icon: Stethoscope,
  },
  {
    href: '/satellite-health',
    title: 'Satellite',
    icon: Satellite,
  },
  {
    href: '/analytics',
    title: 'Analytics',
    icon: BarChart,
  },
  {
    href: '/medicinal-plants',
    title: 'Medicinal',
    icon: HeartPulse,
  },
  {
    href: '/market-matchmaking',
    title: 'Buyers',
    icon: Handshake,
  },
   {
    href: '/market',
    title: 'Market',
    icon: LineChart,
  },
  {
    href: '/schemes',
    title: 'Schemes',
    icon: ScrollText,
  },
  {
    href: '/weather',
    title: 'Weather',
    icon: CloudSun,
  },
  {
    href: '/land-records',
    title: 'Land',
    icon: FileText,
  },
  {
    href: '/fertilizer-finder',
    title: 'Fertilizer',
    icon: MapPin,
  },
  {
    href: '/ai',
    title: 'AI Hub',
    icon: BrainCircuit,
  },
];

const AiToolsCard = () => (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl font-semibold">AI Hub</CardTitle>
            <CardDescription>Your intelligent farming assistants.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <Link href="/chatbot" className="block group">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                        <p className="font-semibold">AI Farming Chatbot</p>
                        <p className="text-sm text-muted-foreground">Get text-based advice.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
            </Link>
             <Link href="/voice" className="block group">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted">
                    <Mic className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                        <p className="font-semibold">Voice Assistant</p>
                        <p className="text-sm text-muted-foreground">Ask questions with your voice.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
            </Link>
        </CardContent>
    </Card>
);


export default function DashboardPage() {
  const { user } = useAuth();
  const plugin = React.useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true })
  );
  const date = new Date();
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">
            Hello, {user?.displayName || 'Farmer'}
            </h1>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-1">
            <div className="md:hidden">
                <NotificationBell />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <RefreshCw className="h-5 w-5"/>
            </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search crops, tools, or advice..." className="pl-10 h-12 rounded-full bg-card text-base" />
      </div>
      
      <WeatherWidget />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Your Farming Toolkit</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel 
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-2">
              {allTools.map((link) => (
                <CarouselItem key={link.href} className="pl-3 basis-1/4 md:basis-1/5 lg:basis-1/6">
                  <Link href={link.href} className="block h-full group">
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-3 bg-muted/50 rounded-2xl hover:bg-muted transition-colors active:scale-[0.98] group-hover:shadow-lg group-hover:shadow-primary/10">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <link.icon className="h-7 w-7 text-primary transition-transform group-hover:scale-105" />
                        </div>
                        <p className="text-xs font-medium mt-1">{link.title}</p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>

      <AiToolsCard />

    </div>
  );
}
