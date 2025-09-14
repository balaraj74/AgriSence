
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { User } from 'firebase/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Satellite, Bot, Languages } from 'lucide-react';
import { getFields } from '@/lib/actions/fields';
import type { Field } from '@/types';
import { getSatelliteHealthAnalysis, type GetSatelliteHealthOutput } from '@/ai/flows/satellite-health-flow';
import Image from 'next/image';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapComponent } from './MapComponent';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
        <div className="p-2 bg-background/90 border rounded-lg shadow-lg backdrop-blur-sm">
            <p className="font-bold text-base">NDVI: {payload[0].value.toFixed(3)}</p>
            <p className="text-sm text-muted-foreground">{format(parseISO(label), 'MMM d, yyyy')}</p>
        </div>
        );
    }
    return null;
};

export default function SatelliteHealthPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GetSatelliteHealthOutput | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  useEffect(() => {
    async function loadFields(currentUser: User) {
      setIsLoading(true);
      try {
        const userFields = await getFields(currentUser.uid);
        setFields(userFields);
        if (userFields.length > 0) {
            setSelectedFieldId(userFields[0].id);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load your saved fields.' });
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
      loadFields(user);
    }
  }, [user, toast]);
  
  const handleAnalyze = async () => {
    if (!selectedField) {
        toast({ variant: 'destructive', title: 'No Field Selected', description: 'Please select a field to analyze.'});
        return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
        const result = await getSatelliteHealthAnalysis({
            field: {
                fieldName: selectedField.fieldName,
                area: selectedField.area,
                cropName: selectedField.cropName,
                coordinates: selectedField.coordinates,
            },
            language
        });
        setAnalysisResult(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: 'destructive', title: 'Analysis Failed', description: errorMessage });
    } finally {
        setIsAnalyzing(false);
    }
  };

  const trendData = analysisResult?.healthTrend.map(d => ({ date: d.date, ndvi: d.ndvi }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Satellite className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Satellite Health Monitoring</h1>
          <p className="text-muted-foreground">Monitor your crop health from space.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Analysis Setup</CardTitle>
            <CardDescription>Select one of your saved fields to analyze its health.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
             <Select value={selectedFieldId} onValueChange={setSelectedFieldId} disabled={isLoading || isAnalyzing}>
              <SelectTrigger>
                <SelectValue placeholder="Select a saved field" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? <SelectItem value="loading" disabled>Loading fields...</SelectItem> :
                 fields.length > 0 ? fields.map(field => (
                    <SelectItem key={field.id} value={field.id}>{field.fieldName} ({field.area.toFixed(2)} acres)</SelectItem>
                 )) : <SelectItem value="no-fields" disabled>No fields saved yet.</SelectItem>}
              </SelectContent>
            </Select>
             <Select value={language} onValueChange={setLanguage} disabled={isAnalyzing}>
                <SelectTrigger>
                    <div className="flex items-center gap-2"><Languages className="h-4 w-4" /> <SelectValue /></div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Kannada">Kannada</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
        <CardFooter>
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !selectedFieldId}>
                {isAnalyzing ? <><Bot className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Satellite className="mr-2 h-4 w-4"/> Analyze Field</>}
            </Button>
        </CardFooter>
      </Card>
      
      {isAnalyzing && (
        <div className="space-y-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="grid lg:grid-cols-2 gap-6">
                 <Card className="h-[400px]">
                    <MapComponent center={selectedField?.centroid || {lat: 20, lng: 78}} field={selectedField} healthMapUrl={`data:image/png;base64,${analysisResult.healthMapBase64}`} />
                 </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Health Status & Legend</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className={cn("p-4 rounded-lg text-center font-bold text-xl", 
                            analysisResult.overallHealth === 'Healthy' && 'bg-green-500/20 text-green-300',
                            analysisResult.overallHealth === 'Moderate' && 'bg-yellow-500/20 text-yellow-300',
                            analysisResult.overallHealth === 'Stressed' && 'bg-red-500/20 text-red-300'
                        )}>
                            Overall Health: {analysisResult.overallHealth}
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-green-500"/> Healthy (NDVI > 0.6)</li>
                            <li className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-yellow-500"/> Moderate (NDVI 0.3 - 0.6)</li>
                            <li className="flex items-center gap-2"><div className="h-4 w-4 rounded-full bg-red-500"/> Stressed (NDVI < 0.3)</li>
                        </ul>
                    </CardContent>
                 </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"> 30-Day Health Trend</CardTitle>
                    <CardDescription>Normalized Difference Vegetation Index (NDVI) over the last month.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(str) => format(parseISO(str), 'MMM d')} />
                            <YAxis domain={[0, 1]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="ndvi" stroke="hsl(var(--primary))" strokeWidth={2} name="NDVI" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> AI-Generated Advice</CardTitle>
                </CardHeader>
                <CardContent>
                     <Alert>
                        <AlertDescription className="text-base whitespace-pre-line">{analysisResult.farmerAdvice}</AlertDescription>
                     </Alert>
                </CardContent>
            </Card>
        </div>
      )}

    </div>
  );
}
