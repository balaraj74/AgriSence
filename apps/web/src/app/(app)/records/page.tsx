
'use client';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Leaf,
  DollarSign,
  Package,
  Map,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface RecordItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const recordItems: RecordItem[] = [
  {
    href: '/crops',
    title: 'Crop Management',
    description: 'Track your crop planting and growth cycles.',
    icon: Leaf,
  },
   {
    href: '/crop-calendar',
    title: 'Crop Calendar',
    description: 'View and manage your crop task schedules.',
    icon: CalendarDays,
  },
  {
    href: '/expenses',
    title: 'Expense Tracking',
    description: 'Log and manage all your farm expenses.',
    icon: DollarSign,
  },
  {
    href: '/harvest',
    title: 'Harvest Records',
    description: 'Record your yield and production output.',
    icon: Package,
  },
  {
    href: '/field-mapping',
    title: 'Field Mapping',
    description: 'Map and manage your field boundaries.',
    icon: Map,
  },
];

export default function RecordsPage() {
  return (
    <div className="space-y-4">
      {recordItems.map((item) => (
        <Link href={item.href} key={item.title} className="block group">
          <Card className="interactive-element group-hover:border-primary/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
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
  );
}
