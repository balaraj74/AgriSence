'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import {
    Search,
    Leaf,
    Stethoscope,
    CloudSun,
    LineChart,
    ScrollText,
    BrainCircuit,
    FileText,
    MapPin,
    MessageCircle,
    Mic,
    HeartPulse,
    BarChart,
    Handshake,
    Satellite,
    Sprout,
    Zap,
    Calculator,
    Loader2,
    ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    category: 'tool' | 'ai' | 'page' | 'action';
    keywords: string[];
}

// All searchable items in the app
const searchableItems: SearchResult[] = [
    // AI Features
    {
        id: 'chatbot',
        title: 'AI Chatbot',
        description: 'Get instant farming advice from AI',
        href: '/chatbot',
        icon: MessageCircle,
        category: 'ai',
        keywords: ['chat', 'ask', 'question', 'advice', 'help', 'ai', 'assistant'],
    },
    {
        id: 'voice',
        title: 'Voice Assistant',
        description: 'Speak to get farming guidance',
        href: '/voice',
        icon: Mic,
        category: 'ai',
        keywords: ['voice', 'speak', 'talk', 'microphone', 'audio'],
    },
    {
        id: 'live-advisor',
        title: 'Live Advisor',
        description: 'Real-time video consultation with AI',
        href: '/live-advisor',
        icon: Zap,
        category: 'ai',
        keywords: ['live', 'video', 'camera', 'real-time', 'advisor'],
    },
    {
        id: 'disease-check',
        title: 'Disease Detection',
        description: 'Identify crop diseases from photos',
        href: '/disease-check',
        icon: Stethoscope,
        category: 'tool',
        keywords: ['disease', 'pest', 'diagnosis', 'plant', 'health', 'photo', 'scan', 'identify'],
    },
    // Tools
    {
        id: 'crops',
        title: 'My Crops',
        description: 'Manage your crop portfolio',
        href: '/crops',
        icon: Leaf,
        category: 'page',
        keywords: ['crops', 'plants', 'grow', 'farm', 'agriculture', 'my crops'],
    },
    {
        id: 'weather',
        title: 'Weather Forecast',
        description: 'Check local weather conditions',
        href: '/weather',
        icon: CloudSun,
        category: 'tool',
        keywords: ['weather', 'rain', 'temperature', 'forecast', 'climate', 'monsoon'],
    },
    {
        id: 'market',
        title: 'Market Prices',
        description: 'Check current mandi prices',
        href: '/market',
        icon: LineChart,
        category: 'tool',
        keywords: ['market', 'price', 'mandi', 'sell', 'buy', 'rate', 'cost'],
    },
    {
        id: 'schemes',
        title: 'Govt Schemes',
        description: 'Find government subsidies and schemes',
        href: '/schemes',
        icon: ScrollText,
        category: 'tool',
        keywords: ['scheme', 'government', 'subsidy', 'pm kisan', 'pmfby', 'loan', 'benefit'],
    },
    {
        id: 'satellite-health',
        title: 'Satellite Health',
        description: 'Monitor crop health via satellite',
        href: '/satellite-health',
        icon: Satellite,
        category: 'tool',
        keywords: ['satellite', 'ndvi', 'health', 'monitor', 'field', 'imagery'],
    },
    {
        id: 'soil-advisor',
        title: 'Soil Advisor',
        description: 'Get soil health recommendations',
        href: '/soil-advisor',
        icon: Sprout,
        category: 'tool',
        keywords: ['soil', 'fertilizer', 'nutrient', 'npk', 'ph', 'health'],
    },
    {
        id: 'crop-calendar',
        title: 'Crop Calendar',
        description: 'View farming tasks and timeline',
        href: '/crop-calendar',
        icon: HeartPulse,
        category: 'tool',
        keywords: ['calendar', 'schedule', 'task', 'timeline', 'plan', 'activity'],
    },
    {
        id: 'field-mapping',
        title: 'Field Mapping',
        description: 'Map and measure your fields',
        href: '/field-mapping',
        icon: MapPin,
        category: 'tool',
        keywords: ['field', 'map', 'area', 'measure', 'boundary', 'gps', 'land'],
    },
    {
        id: 'market-matchmaking',
        title: 'Find Buyers',
        description: 'Connect with crop buyers',
        href: '/market-matchmaking',
        icon: Handshake,
        category: 'tool',
        keywords: ['buyer', 'sell', 'connect', 'market', 'trade', 'matchmaking'],
    },
    {
        id: 'analytics',
        title: 'Farm Analytics',
        description: 'View expenses and harvest data',
        href: '/analytics',
        icon: BarChart,
        category: 'page',
        keywords: ['analytics', 'expense', 'harvest', 'data', 'report', 'statistics'],
    },
    {
        id: 'expenses',
        title: 'Expenses',
        description: 'Track farming expenses',
        href: '/expenses',
        icon: Calculator,
        category: 'page',
        keywords: ['expense', 'cost', 'money', 'spend', 'budget', 'finance'],
    },
    {
        id: 'loan-assistant',
        title: 'Loan Assistant',
        description: 'Get help with agricultural loans',
        href: '/loan-assistant',
        icon: FileText,
        category: 'tool',
        keywords: ['loan', 'credit', 'bank', 'finance', 'kcc', 'kisan'],
    },
    {
        id: 'medicinal-plants',
        title: 'Medicinal Plants',
        description: 'Identify medicinal plants',
        href: '/medicinal-plants',
        icon: BrainCircuit,
        category: 'tool',
        keywords: ['medicinal', 'plant', 'herb', 'ayurveda', 'identify'],
    },
];

const categoryColors = {
    ai: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    tool: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    page: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    action: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
};

const categoryLabels = {
    ai: 'AI',
    tool: 'Tool',
    page: 'Page',
    action: 'Action',
};

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter();
    const [search, setSearch] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Filter results based on search query
    const results = React.useMemo(() => {
        if (!search.trim()) {
            // Show popular items when no search
            return searchableItems.slice(0, 8);
        }

        const query = search.toLowerCase().trim();

        return searchableItems
            .filter((item) => {
                const titleMatch = item.title.toLowerCase().includes(query);
                const descMatch = item.description.toLowerCase().includes(query);
                const keywordMatch = item.keywords.some((k) => k.includes(query));
                return titleMatch || descMatch || keywordMatch;
            })
            .sort((a, b) => {
                // Prioritize title matches
                const aTitle = a.title.toLowerCase().includes(query) ? 0 : 1;
                const bTitle = b.title.toLowerCase().includes(query) ? 0 : 1;
                return aTitle - bTitle;
            });
    }, [search]);

    // Reset selection when results change
    React.useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    // Focus input when opened
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearch('');
        }
    }, [open]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                navigateTo(results[selectedIndex].href);
            }
        }
    };

    const navigateTo = (href: string) => {
        onOpenChange(false);
        router.push(href);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-lg border-white/10">
                <VisuallyHidden.Root>
                    <DialogTitle>Search AgriSence</DialogTitle>
                    <DialogDescription>
                        Search for crops, tools, AI features, and more
                    </DialogDescription>
                </VisuallyHidden.Root>
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-white/10 px-4">
                        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                        <Input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search crops, tools, or advice..."
                            className="h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                        />
                        <kbd className="hidden sm:inline-flex h-6 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[300px] overflow-y-auto p-2">
                        {results.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>No results found for "{search}"</p>
                                <p className="text-xs mt-1">Try searching for crops, weather, market, etc.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {!search && (
                                    <p className="px-2 py-1 text-xs text-muted-foreground font-medium">
                                        Quick Access
                                    </p>
                                )}
                                {results.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => navigateTo(item.href)}
                                        className={cn(
                                            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                                            index === selectedIndex
                                                ? 'bg-emerald-500/20 text-foreground'
                                                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <div className={cn(
                                            'p-2 rounded-lg shrink-0',
                                            index === selectedIndex ? 'bg-emerald-500/30' : 'bg-muted'
                                        )}>
                                            <item.icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {item.description}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={cn('text-[10px] shrink-0', categoryColors[item.category])}
                                        >
                                            {categoryLabels[item.category]}
                                        </Badge>
                                        {index === selectedIndex && (
                                            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
                                Select
                            </span>
                        </div>
                        <span>AgriSence Search</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
