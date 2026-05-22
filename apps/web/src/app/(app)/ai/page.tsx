
'use client';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { MessageCircle, Mic, ChevronRight, Mail, Phone, Globe, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';


interface AiItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const aiItems: AiItem[] = [
  {
    href: '/chatbot',
    title: 'AI Farming Chatbot',
    description: 'Get instant, text-based farming advice.',
    icon: MessageCircle,
  },
  {
    href: '/voice',
    title: 'Voice Assistant',
    description: 'Interact with AgriSence using your voice.',
    icon: Mic,
  },
];

const DeveloperContactCard = () => (
    <Card>
        <CardHeader>
             <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">BR</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base text-muted-foreground">Developed & Maintained by</CardTitle>
                    <p className="text-xl font-bold">Balaraj R</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
           <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href="mailto:balarajr483@gmail.com" className="hover:underline">balarajr483@gmail.com</a>
           </div>
            <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href="tel:+918431206594" className="hover:underline">+91 8431206594</a>
           </div>
           <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <a href="https://balarajr.b12sites.com/index" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    balarajr.b12sites.com
                </a>
           </div>
           <Separator className="my-4" />
            <div className="space-y-2">
                <h4 className="flex items-center gap-3 font-semibold">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Supported By
                </h4>
                <p className="text-muted-foreground pl-8">
                    Bharath C D <br />
                    Mahesh Kumar B <br />
                    Basavaraj M
                </p>
            </div>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <a href="mailto:balarajr483@gmail.com">
                    <Mail className="mr-2 h-4 w-4" /> Contact Developer
                </a>
            </Button>
        </CardFooter>
    </Card>
);

export default function AiPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {aiItems.map((item) => (
            <Link href={item.href} key={item.href} className="block group">
            <Card className="interactive-element group-hover:border-primary/50">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardHeader>
            </Card>
            </Link>
        ))}
      </div>
      <div className="pt-4">
        <DeveloperContactCard />
      </div>
    </div>
  );
}
