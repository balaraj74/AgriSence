
"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { usePathname } from 'next/navigation';
import { AgrisenceLogo } from '@/components/agrisence-logo';
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";
import { FcmInitializer } from "@/components/fcm-initializer";
import { AuthProvider } from "@/hooks/use-auth";

const MAPS_PAGES = ['/fertilizer-finder', '/field-mapping', '/market-matchmaking', '/satellite-health'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pathname = usePathname();

  const needsMapWrapper = MAPS_PAGES.includes(pathname);

  const renderContent = () => {
    if (needsMapWrapper) {
      if (apiKey) {
        return <Wrapper apiKey={apiKey} libraries={["drawing", "geometry", "places"]}>{children}</Wrapper>;
      }
      return (
        <div className="text-center text-red-500 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
          Google Maps API key is not configured. This feature is unavailable.
        </div>
      );
    }
    return children;
  }

  return (
    <AuthProvider>
      <div className="flex flex-col h-dvh">
        <FcmInitializer />
        <header className={cn(
          "sticky top-0 z-40 hidden h-16 items-center justify-between border-b px-4 backdrop-blur-lg sm:px-6 md:flex",
          "border-border bg-background/30 dark:bg-black/30"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2">
              <AgrisenceLogo className="h-8 w-auto" />
              <span className="text-xl font-semibold">AgriSence</span>
          </Link>
          <TopNav />
          <div className="flex items-center gap-4">
              <NotificationBell />
              <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
          {renderContent()}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
