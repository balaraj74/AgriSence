
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import type { User } from 'firebase/auth';
import { getFields } from '@/lib/actions/fields';
import type { Field } from '@/types';
import { getSatelliteHealthAnalysis, type GetSatelliteHealthOutput } from '@/ai/flows/satellite-health-flow';
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Satellite, Map, Bot, BarChartHorizontal, AlertCircle, Clock } from 'lucide-react';
import { MapComponent } from './MapComponent';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-background/90 border rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-bold text-base">NDVI: {payload[0].value.toFixed(3)}</p>
                <p className="text-sm text-muted-foreground">{format(parseISO(label!), 'MMM d, yyyy')}</p>
            </div>
        );
    }
    return null;
};

const statusStyles: { [key in "Healthy" | "Moderate" | "Stressed"]: string } = {
    "Healthy": "bg-green-600/20 text-green-400 border-green-500/30",
    "Moderate": "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    "Stressed": "bg-red-700/20 text-red-400 border-red-500/30",
};


export default function SatelliteHealthPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GetSatelliteHealthOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  useEffect(() => {
    const fetchFields = async (currentUser: User) => {
        setIsLoading(true);
        try {
            const fetchedFields = await getFields(currentUser.uid);
            setFields(fetchedFields);
            if (fetchedFields.length > 0) {
                // Automatically select the first field
                setSelectedFieldId(fetchedFields[0].id);
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch your fields." });
        } finally {
            setIsLoading(false);
        }
    };

    if (user) {
        fetchFields(user);
    } else {
        setIsLoading(false);
    }
  }, [user, toast]);
  
  const handleAnalysis = useCallback(async () => {
    if (!selectedField) {
        toast({ variant: 'destructive', title: 'No Field Selected' });
        return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
        const result = await getSatelliteHealthAnalysis({ field: selectedField, language: 'English' });
        setAnalysisResult(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: 'destructive', title: 'Analysis Failed', description: errorMessage });
    } finally {
        setIsAnalyzing(false);
    }
  }, [selectedField, toast]);
  
  // Automatically trigger analysis when a new field is selected
  useEffect(() => {
    if (selectedFieldId && !isAnalyzing) {
        handleAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId]);


  const trendData = analysisResult?.healthTrend.map(d => ({
    date: d.date,
    ndvi: d.ndvi
  }));

  const renderContent = () => {
    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }
    if (fields.length === 0) {
        return (
            <Alert>
                <Map className="h-4 w-4" />
                <AlertTitle>No Fields Found</AlertTitle>
                <AlertDescription>
                    You need to map your fields first. Please go to the 'My Records' tab and use the 'Field Mapping' tool.
                </AlertDescription>
            </Alert>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Field</CardTitle>
                <CardDescription>Choose one of your mapped fields to analyze its health.</CardDescription>
            </CardHeader>
            <CardContent>
                <Select onValueChange={setSelectedFieldId} value={selectedFieldId || ''} disabled={isAnalyzing}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a field..." />
                    </SelectTrigger>
                    <SelectContent>
                        {fields.map(field => (
                            <SelectItem key={field.id} value={field.id}>
                                {field.fieldName} ({field.area.toFixed(2)} acres)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Satellite className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Satellite Crop Health</h1>
          <p className="text-muted-foreground">Monitor your field's health using simulated satellite data.</p>
        </div>
      </div>
      
      {renderContent()}

      {isAnalyzing && (
         <div className="space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-80 w-full" />
         </div>
      )}

      {analysisResult && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in-50">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Field Health Map</CardTitle>
                        <CardDescription>Simulated NDVI overlay for {selectedField?.fieldName}</CardDescription>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                            <Clock className="h-3 w-3" />
                            Last updated: {format(parseISO(analysisResult.lastUpdated), 'd MMM yyyy, h:mm a')}
                        </p>
                    </div>
                     <div className={cn("p-2 rounded-lg text-sm font-semibold", statusStyles[analysisResult.overallHealth])}>
                        {analysisResult.overallHealth}
                    </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                   <MapComponent 
                        center={selectedField?.centroid || {lat: 0, lng: 0}}
                        field={selectedField}
                        healthMapUrl={analysisResult.healthMapBase64}
                   />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartHorizontal className="h-5 w-5" />
                        30-Day NDVI Trend
                    </CardTitle>
                    <CardDescription>Normalized Difference Vegetation Index over the last month.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MMM d')} />
                            <YAxis domain={[0, 1]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="ndvi" stroke="hsl(var(--primary))" strokeWidth={2} name="NDVI" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>AI Farmer Advice</CardTitle>
                    <CardDescription>Actionable insights based on the analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>AI Recommendation</AlertTitle>
                        <AlertDescription>
                            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                                {analysisResult.farmerAdvice}
                            </div>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
      )}

      {!isAnalyzing && !analysisResult && selectedFieldId && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>Could not retrieve satellite health data for the selected field. Please try again.</AlertDescription>
        </Alert>
      )}

    </div>
  );
}
