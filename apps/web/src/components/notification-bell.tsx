
"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight, LineChart, ScrollText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import Link from "next/link";

// Note: This component is now primarily for displaying notifications.
// The logic for receiving notifications is handled by the FcmInitializer component.
// In a full application, this component would fetch historical notifications from Firestore.

interface Notification {
  id: number;
  type: 'price' | 'scheme';
  title: string;
  description: string;
  isRead: boolean;
  link: string;
}

const mockNotifications: Notification[] = [
   {
    id: 1,
    type: 'price',
    title: 'Wheat Price Alert',
    description: 'The market price for Wheat has increased by 5% in your region.',
    isRead: false,
    link: '/market'
  },
  {
    id: 2,
    type: 'scheme',
    title: 'New Subsidy Available',
    description: 'A new government scheme for drip irrigation has been announced for Karnataka.',
    isRead: false,
    link: '/schemes'
  },
];


export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({...n, isRead: true })));
  };

  const Icon = ({type}: {type: 'price' | 'scheme'}) => {
    if (type === 'price') return <LineChart className="h-6 w-6 text-accent" />;
    return <ScrollText className="h-6 w-6 text-primary" />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>{unreadCount} unread</CardDescription>
                </div>
                {unreadCount > 0 && (
                     <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>Mark all as read</Button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-72">
                    <div className="p-2 space-y-1">
                    {notifications.length > 0 ? notifications.map(notification => (
                        <Link
                          key={notification.id}
                          href={notification.link}
                          className="block rounded-lg hover:bg-muted"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3 p-3">
                            <div className="relative">
                              <Icon type={notification.type} />
                              {!notification.isRead && (
                                <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground self-center" />
                          </div>
                        </Link>
                    )) : (
                        <p className="text-center text-sm text-muted-foreground py-10">No new notifications.</p>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-2">
                <Button variant="ghost" className="w-full">View All Notifications</Button>
            </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
