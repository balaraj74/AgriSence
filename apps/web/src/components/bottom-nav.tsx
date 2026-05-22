
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, BrainCircuit, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/records", label: "Records", icon: ClipboardList },
  { href: "/tools", label: "Tools", icon: BrainCircuit },
  { href: "/ai", label: "AI Hub", icon: Bot },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden p-4">
      <nav className={cn(
        "h-16 border backdrop-blur-lg shadow-2xl shadow-black/40 rounded-full",
        "border-border bg-background/30 dark:bg-black/30"
      )}>
        <div className="grid h-full grid-cols-5 mx-auto">
          {navItems.map((item) => {
              const isActive =
                  (item.href === '/dashboard' && pathname === item.href) ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                  <Link
                      href={item.href}
                      key={item.href}
                      className={cn(
                          "group inline-flex flex-col items-center justify-center p-2 rounded-full transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                      )}
                  >
                      <item.icon className={cn("h-5 w-5 mb-0.5 transition-all", isActive && "text-primary scale-110")} />
                      <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
              )
          })}
        </div>
      </nav>
    </div>
  );
}
