'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
  Sprout,
  TrendingUp,
  Droplets,
  Sun,
  Sparkles,
  ArrowRight,
  Calendar,
  Bell,
  Zap,
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { WeatherWidget } from '@/components/weather-widget';
import { Input } from '@/components/ui/input';
import { NotificationBell } from '@/components/notification-bell';
import { getDashboardStats, type DashboardStats } from '@/lib/actions/farmer-context';
import { Skeleton } from '@/components/ui/skeleton';
import { CommandPalette } from '@/components/command-palette';

interface QuickLink {
  href: string;
  title: string;
  icon: LucideIcon;
  shade: string;
  iconColor: string;
  bgColor?: string;
}

// Analogous Nature Palette: Blue -> Cyan -> Teal -> Green -> Lime -> Amber
// This provides variety (not just green) while staying close on the color wheel for harmony.
const allTools: QuickLink[] = [
  {
    href: '/disease-check',
    title: 'Diagnosis',
    icon: Stethoscope,
    // Teal: Clinical, clean, nature-aligned
    shade: 'from-teal-500/20 to-teal-600/10 border-teal-500/20 hover:border-teal-400/40',
    iconColor: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
  },
  {
    href: '/satellite-health',
    title: 'Satellite',
    icon: Satellite,
    // Sky/Blue: Sky context, tech vibe
    shade: 'from-sky-500/20 to-sky-600/10 border-sky-500/20 hover:border-sky-400/40',
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
  },
  {
    href: '/analytics',
    title: 'Analytics',
    icon: BarChart,
    // Cyan: Data, modern, cool tone
    shade: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-400/40',
    iconColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    href: '/medicinal-plants',
    title: 'Medicinal',
    icon: HeartPulse,
    // Emerald: Deep healing green
    shade: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-400/40',
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  {
    href: '/market-matchmaking',
    title: 'Buyers',
    icon: Handshake,
    // Amber: Wheat, harvest, gold/money
    shade: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-400/40',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  {
    href: '/market',
    title: 'Market',
    icon: LineChart,
    // Lime: Growth, active, energetic green
    shade: 'from-lime-500/20 to-lime-600/10 border-lime-500/20 hover:border-lime-400/40',
    iconColor: 'text-lime-400',
    bgColor: 'bg-lime-500/20',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const AiToolsCard = () => (
  <motion.div variants={itemVariants}>
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-teal-900/10 via-card to-emerald-900/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20">
            <BrainCircuit className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">AI Hub</CardTitle>
            <CardDescription className="text-xs">
              Your intelligent farming assistants
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <Link href="/chatbot" className="block group">
          <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 to-transparent border border-teal-500/20 hover:border-teal-400/40 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/30 to-teal-600/20 shadow-lg shadow-teal-500/10">
              <MessageCircle className="h-5 w-5 text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">AI Farming Chatbot</p>
              <p className="text-xs text-muted-foreground">
                Get instant, text-based farming advice
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-teal-400" />
          </motion.div>
        </Link>
        <Link href="/voice" className="block group">
          <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 shadow-lg shadow-cyan-500/10">
              <Mic className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Voice Assistant</p>
              <p className="text-xs text-muted-foreground">
                Ask questions using your voice
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
          </motion.div>
        </Link>
        <Link href="/live-advisor" className="block group">
          <motion.div
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-lime-500/10 to-transparent border border-lime-500/20 hover:border-lime-400/40 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-lime-500/30 to-lime-600/20 shadow-lg shadow-lime-500/10">
              <Zap className="h-5 w-5 text-lime-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Live Advisor</p>
              <p className="text-xs text-muted-foreground">
                Real-time expert guidance
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-lime-400" />
          </motion.div>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);

interface QuickStatsCardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const QuickStatsCard = ({ stats, isLoading }: QuickStatsCardProps) => {
  const quickStats = [
    {
      label: 'Active Crops',
      value: stats?.activeCrops?.toString() || '0',
      icon: Sprout,
      color: 'text-emerald-400'
    },
    {
      label: 'Health Score',
      value: stats?.healthScore !== undefined ? `${stats.healthScore}%` : '—',
      icon: HeartPulse,
      color: 'text-teal-400'
    },
    {
      label: 'Yield Forecast',
      value: stats?.yieldForecast || 'N/A',
      icon: TrendingUp,
      color: 'text-lime-400'
    },
  ];

  if (isLoading) {
    return (
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-br from-emerald-500/5 via-card to-transparent border border-white/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5">
                  <Skeleton className="h-5 w-5 mx-auto mb-1 rounded-full" />
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-0 bg-gradient-to-br from-emerald-500/5 via-card to-transparent border border-white/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5"
              >
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Hello');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user?.uid) {
      setIsLoadingStats(false);
      return;
    }
    try {
      const fetchedStats = await getDashboardStats(user.uid);
      setStats(fetchedStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchStats();
    }
  }, [user?.uid, fetchStats]);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  const date = new Date();
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      className="space-y-5 pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-start justify-between"
      >
        <div className="space-y-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-emerald-400 bg-clip-text">
              {greeting},{' '}
              <span className="text-emerald-400">
                {user?.displayName?.split(' ')[0] || 'Farmer'}
              </span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground flex items-center gap-2"
          >
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </motion.p>
        </div>
        <div className="flex items-center gap-1">
          <div className="md:hidden">
            <NotificationBell />
          </div>
          <motion.div whileHover={{ rotate: isRefreshing ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-emerald-500/10"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative w-full flex items-center gap-3 pl-12 pr-4 h-14 rounded-full bg-card/80 backdrop-blur-sm text-base border-2 border-transparent hover:border-emerald-500/30 transition-all duration-300 shadow-lg shadow-black/5 text-left"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground flex-1">Search crops, tools, or advice...</span>
          <kbd className="hidden sm:inline-flex h-7 select-none items-center gap-1 rounded-lg border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </motion.div>

      {/* Command Palette */}
      <CommandPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Weather Widget */}
      <motion.div variants={itemVariants}>
        <WeatherWidget />
      </motion.div>

      {/* Quick Stats */}
      <QuickStatsCard stats={stats} isLoading={isLoadingStats} />

      {/* Farming Toolkit */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
                <CardTitle className="text-lg font-bold">
                  Your Farming Toolkit
                </CardTitle>
              </div>
              <Link href="/tools">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-emerald-400 gap-1"
                >
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {allTools.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link href={link.href} className="block group">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center justify-center text-center gap-2 p-4 bg-gradient-to-br ${link.shade} rounded-2xl border transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-green-500/10`}
                    >
                      <div className={`p-3 backdrop-blur-sm rounded-xl transition-colors ${link.bgColor || 'bg-background/50'}`}>
                        <link.icon
                          className={`h-6 w-6 ${link.iconColor} transition-transform group-hover:scale-110`}
                        />
                      </div>
                      <p className="text-xs font-medium">{link.title}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Hub */}
      <AiToolsCard />

      {/* Quick Actions Footer */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/records" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 hover:border-blue-400/40 flex items-center gap-3 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-blue-500/30">
                <Leaf className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">My Records</p>
                <p className="text-[10px] text-muted-foreground">
                  View crop data
                </p>
              </div>
            </motion.div>
          </Link>
          <Link href="/schemes" className="block">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/20 hover:border-amber-400/40 flex items-center gap-3 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-amber-500/30">
                <ScrollText className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Govt Schemes</p>
                <p className="text-[10px] text-muted-foreground">
                  Explore benefits
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
