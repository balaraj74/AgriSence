
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Satellite,
  Map,
  Bot,
  BarChartHorizontal,
  AlertCircle,
  Clock,
  Layers,
  Radar,
  Sprout,
  Leaf,
  Flower2,
  Wheat,
  Activity,
  Gauge,
  Info,
  Droplets,
  CloudOff,
} from 'lucide-react';
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

const priorityStyles: { [key: string]: string } = {
    "Critical": "bg-red-700/20 text-red-400 border-red-500/30",
    "High": "bg-orange-600/20 text-orange-400 border-orange-500/30",
    "Medium": "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
    "Low": "bg-green-600/20 text-green-400 border-green-500/30",
};

const stageMeta: Record<string, { icon: any; color: string; order: number }> = {
    Sowing: { icon: Sprout, color: "#a3a3a3", order: 0 },
    Vegetative: { icon: Leaf, color: "#22c55e", order: 1 },
    Flowering: { icon: Flower2, color: "#ec4899", order: 2 },
    Maturity: { icon: Wheat, color: "#f59e0b", order: 3 },
};
const STAGE_ORDER = ["Sowing", "Vegetative", "Flowering", "Maturity"] as const;

const verdictColor = (v?: "Healthy" | "Moderate" | "Stressed") =>
    v === "Healthy" ? "#22c55e" : v === "Moderate" ? "#eab308" : "#ef4444";


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

  useEffect(() => {
    if (selectedFieldId && !isAnalyzing) {
        handleAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId]);


  const trendData = analysisResult?.healthTrend.map(d => ({
    date: d.date,
    ndvi: d.ndvi,
    cloudObscured: d.cloudObscured,
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

  // Novel-claim banner.
  const renderClaimBanner = () => (
    <Alert className="border-primary/30 bg-primary/5">
        <Layers className="h-4 w-4 text-primary" />
        <AlertDescription className="italic text-sm text-foreground">
            We fuse optical and SAR at the feature level per growth stage, so what counts as stress changes
            with the crop stage, and every verdict is explainable down to the contributing indices.
        </AlertDescription>
    </Alert>
  );

  // Stage 1: Crop classification with SHAP-style feature bars.
  const renderCropClassification = () => {
    const cc = analysisResult?.cropClassification;
    if (!cc) return null;
    const maxContribution = Math.max(...cc.topFeatures.map(f => Math.abs(f.contribution)), 0.0001);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Radar className="h-5 w-5" /> Crop Classification</CardTitle>
                <CardDescription>Multi-temporal optical + SAR signature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">{cc.cropLabel}</span>
                    <span className={cn("px-2 py-1 rounded-md text-sm font-semibold border", cc.confidence >= 0.75 ? statusStyles.Healthy : statusStyles.Moderate)}>
                        {(cc.confidence * 100).toFixed(0)}% confidence
                    </span>
                </div>
                <div>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">TOP CONTRIBUTING FEATURES (SHAP)</p>
                    <div className="space-y-3">
                        {cc.topFeatures.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-40 shrink-0">
                                    <p className="text-sm font-medium truncate">{f.feature}</p>
                                    <p className="text-xs text-muted-foreground">{f.value}</p>
                                </div>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full", f.contribution >= 0 ? "bg-primary" : "bg-muted-foreground")}
                                        style={{ width: `${(Math.abs(f.contribution) / maxContribution) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };

  // Stage 2: Phenology growth-stage timeline.
  const renderPhenology = () => {
    const ph = analysisResult?.phenology;
    if (!ph) return null;
    const currentOrder = stageMeta[ph.currentStage]?.order ?? 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Growth Stage</CardTitle>
                <CardDescription>Phenology engine: SOS, peak NDVI and growing period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    {STAGE_ORDER.map((stage, i) => {
                        const meta = stageMeta[stage];
                        const StageIcon = meta.icon;
                        const isCurrent = ph.currentStage === stage;
                        const isPast = currentOrder > meta.order;
                        const active = isCurrent || isPast;
                        return (
                            <div key={stage} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="h-10 w-10 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor: active ? `${meta.color}20` : "hsl(var(--muted))",
                                            border: isCurrent ? `2px solid ${meta.color}` : "none",
                                        }}
                                    >
                                        <StageIcon className="h-5 w-5" style={{ color: active ? meta.color : "hsl(var(--muted-foreground))" }} />
                                    </div>
                                    <span className="text-xs mt-1" style={{ color: isCurrent ? meta.color : "hsl(var(--muted-foreground))", fontWeight: isCurrent ? 700 : 400 }}>
                                        {stage}
                                    </span>
                                </div>
                                {i < STAGE_ORDER.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-1 mb-5" style={{ backgroundColor: isPast ? meta.color : "hsl(var(--muted))" }} />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Stage progress</span>
                        <span>{ph.stageProgressPercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={ph.stageProgressPercent} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="font-bold">{(() => { try { return format(parseISO(ph.startOfSeason), 'd MMM'); } catch { return ph.startOfSeason; } })()}</p>
                        <p className="text-xs text-muted-foreground">Start of season</p>
                    </div>
                    <div>
                        <p className="font-bold">{(() => { try { return format(parseISO(ph.peakNdviDate), 'd MMM'); } catch { return ph.peakNdviDate; } })()}</p>
                        <p className="text-xs text-muted-foreground">Peak NDVI</p>
                    </div>
                    <div>
                        <p className="font-bold">{ph.lengthOfGrowingPeriodDays}d</p>
                        <p className="text-xs text-muted-foreground">Growing period</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };

  // Stage 3: Phenology-conditioned stress model + Why flagged explainability.
  const renderStressModel = () => {
    const sm = analysisResult?.stressModel;
    if (!sm) return null;
    const vColor = verdictColor(sm.verdict);
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> Stress Verdict</CardTitle>
                    <CardDescription>Stage-conditioned fusion of optical + SAR</CardDescription>
                </div>
                <div className={cn("px-2 py-1 rounded-lg text-sm font-semibold border", statusStyles[sm.verdict])}>{sm.verdict}</div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-muted-foreground tracking-wide">STRESS SCORE</span>
                        <span className="text-xl font-bold" style={{ color: vColor }}>{sm.stressScore.toFixed(2)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${sm.stressScore * 100}%`, backgroundColor: vColor }} />
                    </div>
                </div>

                <div className="rounded-lg border p-3" style={{ borderColor: `${vColor}40`, backgroundColor: `${vColor}0d` }}>
                    <p className="flex items-center gap-1.5 text-sm font-bold mb-1" style={{ color: vColor }}>
                        <Info className="h-3.5 w-3.5" /> Why flagged?
                    </p>
                    <p className="text-sm text-foreground">{sm.explanation}</p>
                </div>

                <div>
                    <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3">CONTRIBUTING INDICES (ATTENTION)</p>
                    <div className="space-y-3">
                        {sm.contributingIndices.map((ci, i) => (
                            <div key={i}>
                                <div className="flex items-baseline justify-between">
                                    <p className="text-sm font-medium">{ci.index}</p>
                                    <span className="text-xs text-muted-foreground">{(ci.weight * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">{ci.detail}</p>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(ci.weight * 100, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };

  // Stage 4: Water balance & deficit.
  const renderWaterBalance = () => {
    const wb = analysisResult?.waterBalance;
    if (!wb) return null;
    const hasDeficit = wb.deficitMm > 0;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Water Balance</CardTitle>
                <CardDescription>ETc vs rainfall (FAO-56, stage Kc = {wb.kc.toFixed(2)})</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="font-bold">{wb.etcMm.toFixed(0)}mm</p>
                        <p className="text-xs text-muted-foreground">Crop demand (ETc)</p>
                    </div>
                    <div>
                        <p className="font-bold">{wb.effectiveRainfallMm.toFixed(0)}mm</p>
                        <p className="text-xs text-muted-foreground">Effective rainfall</p>
                    </div>
                    <div>
                        <p className="font-bold" style={{ color: hasDeficit ? "#ef4444" : "#22c55e" }}>
                            {hasDeficit ? "-" : "+"}{Math.abs(wb.deficitMm).toFixed(0)}mm
                        </p>
                        <p className="text-xs text-muted-foreground">{hasDeficit ? "Deficit" : "Surplus"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  };

  // Stage 5: Priority-scored irrigation advisory.
  const renderIrrigationAdvisory = () => {
    const ia = analysisResult?.irrigationAdvisory;
    if (!ia) return null;
    let recDate = ia.recommendedDate;
    try { recDate = format(parseISO(ia.recommendedDate), 'd MMM yyyy'); } catch {}
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Irrigation Advisory</CardTitle>
                    <CardDescription>Priority = stress x stage-criticality + deficit + area</CardDescription>
                </div>
                <div className={cn("px-2 py-1 rounded-lg text-sm font-semibold border", priorityStyles[ia.priorityRank])}>{ia.priorityRank}</div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold">{(ia.priorityScore * 100).toFixed(0)}</span>
                    <div className="flex-1">
                        <Progress value={ia.priorityScore * 100} />
                        <p className="text-xs text-muted-foreground mt-1.5">Stage criticality weight: {ia.stageCriticalityWeight.toFixed(1)}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                        <p className="font-bold">{recDate}</p>
                        <p className="text-xs text-muted-foreground">Recommended date</p>
                    </div>
                    <div>
                        <p className="font-bold">{ia.recommendedVolumeMm.toFixed(0)}mm</p>
                        <p className="text-xs text-muted-foreground">Recommended volume</p>
                    </div>
                </div>
                <p className="text-sm text-foreground">{ia.rationale}</p>
            </CardContent>
        </Card>
    );
  };

  const cloudDays = analysisResult?.healthTrend.filter(d => d.cloudObscured).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Satellite className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Satellite Crop Health</h1>
          <p className="text-muted-foreground">Feature-level optical + SAR fusion, conditioned on crop growth stage.</p>
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
            {renderClaimBanner()}

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

            {renderCropClassification()}
            {renderPhenology()}
            {renderStressModel()}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartHorizontal className="h-5 w-5" />
                        30-Day NDVI Trend
                    </CardTitle>
                    <CardDescription>Fused optical (NDVI) + SAR (VH) over the last month.</CardDescription>
                    {cloudDays > 0 && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                            <CloudOff className="h-3 w-3 text-primary" />
                            {cloudDays} cloud-obscured day(s) gap-filled from SAR VH backscatter.
                        </p>
                    )}
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

            {renderWaterBalance()}
            {renderIrrigationAdvisory()}

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
