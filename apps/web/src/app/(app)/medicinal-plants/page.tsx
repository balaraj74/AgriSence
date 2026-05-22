
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wand2, RefreshCw, HeartPulse, Microscope, AlertTriangle, Pill, BookText, Languages, Video, Square, Loader2, Upload, X, Sprout } from "lucide-react";
import {
  identifyMedicinalPlant,
  type IdentifyMedicinalPlantOutput,
} from "@/ai/flows/medicinal-plant-identifier";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const ANALYSIS_INTERVAL = 3000; // 3 seconds

export default function MedicinalPlantPage() {
  const [finalResult, setFinalResult] = useState<IdentifyMedicinalPlantOutput | null>(null);
  const [liveResult, setLiveResult] = useState<IdentifyMedicinalPlantOutput | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // States for file upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    return () => {
      stopAnalysisLoop();
      stopCameraStream();
      previewUrls.forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCameraStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const frameToDataUri = (): string | null => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if(video.videoWidth === 0 || video.videoHeight === 0) return null;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };
  
  const startAnalysisLoop = useCallback(() => {
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);

    analysisIntervalRef.current = setInterval(async () => {
      if (isAnalyzing) return; 

      const frameUri = frameToDataUri();
      if (!frameUri) return;

      setIsAnalyzing(true);
      try {
        const identificationResult = await identifyMedicinalPlant({ 
            imageUris: [frameUri],
        });
        
        if (identificationResult.isMedicinal) {
            setLiveResult(identificationResult);
            setError(null);
        } else {
            setError(`Identified as "${identificationResult.commonName}", not a known medicinal plant.`);
            setLiveResult(null);
        }
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Analysis failed. ${errorMessage}`);
      } finally {
        setIsAnalyzing(false);
      }
    }, ANALYSIS_INTERVAL);
  }, [isAnalyzing]);


  const stopAnalysisLoop = () => {
      if (analysisIntervalRef.current) {
          clearInterval(analysisIntervalRef.current);
          analysisIntervalRef.current = null;
      }
  };


  const handleStartStreaming = async () => {
    setError(null);
    setFinalResult(null);
    setLiveResult(null);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }});
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
            startAnalysisLoop();
        }
    } catch (err) {
        console.error("Camera error:", err);
        setError("Could not access camera. Please check permissions.");
    }
  };
  
  const handleStopStreaming = () => {
      stopAnalysisLoop();
      stopCameraStream();
      setIsStreaming(false);
      setIsAnalyzing(false);
      if (liveResult) {
          setFinalResult(liveResult);
      }
  };

  const handleReset = () => {
    handleStopStreaming();
    setFinalResult(null);
    setLiveResult(null);
    setError(null);
    setImageFiles([]);
    previewUrls.forEach(URL.revokeObjectURL);
    setPreviewUrls([]);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const allFiles = [...imageFiles, ...newFiles].slice(0, 5);
      setImageFiles(allFiles);
      
      previewUrls.forEach(URL.revokeObjectURL);
      const newUrls = allFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newUrls);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    previewUrls.forEach(URL.revokeObjectURL);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadDiagnosis = async () => {
    if (imageFiles.length === 0) {
        toast({ variant: 'destructive', title: "Missing Image", description: "Please upload at least one image."});
        return;
    }
    
    setIsUploading(true);
    setFinalResult(null);
    setError(null);

    try {
        const imageUris = await Promise.all(imageFiles.map(fileToDataUri));
        const identificationResult = await identifyMedicinalPlant({ imageUris });
        
        if (!identificationResult.isMedicinal) {
            setError(`The AI identified this as "${identificationResult.commonName}", which is not a known medicinal plant. Please try again with a different image.`);
        }
        setFinalResult(identificationResult);
    } catch(e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Identification failed. ${errorMessage}`);
    } finally {
        setIsUploading(false);
    }
  };

  const ResultSection = ({ title, content, icon: Icon }: { title: string, content: string, icon: React.ElementType }) => (
    <div>
        <Label className="text-lg font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</Label>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap prose prose-sm max-w-none">{content}</p>
    </div>
  );
  
  const LiveResultDisplay = ({ result }: { result: IdentifyMedicinalPlantOutput | null }) => {
    if (!result) {
      return (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-muted-foreground">Searching for plants...</p>
        </div>
      );
    }
    return (
      <div className="space-y-4 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <Sprout className="h-6 w-6 text-primary" />
            <p className="text-xl font-bold">{result.commonName}</p>
          </div>
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-primary" />
            <p className="text-xl font-bold">{result.isMedicinal ? "Medicinal" : "Not Medicinal"}</p>
          </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg"><HeartPulse className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Medicinal Plant Identifier</h1>
          <p className="text-muted-foreground">Use live scan or upload an image for AI analysis.</p>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Setup & Reset</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleReset} disabled={isStreaming || isUploading} className="w-full"><RefreshCw className="mr-2 h-4 w-4" /> Reset All</Button>
            </CardFooter>
        </Card>

        <canvas ref={canvasRef} className="hidden"></canvas>
        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />

        <div className="lg:col-span-3">
          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="live">Live Scan</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
            </TabsList>
            <TabsContent value="live">
              <Card>
                <CardHeader>
                    <CardTitle>Live Camera Scan</CardTitle>
                    <CardDescription>Point your camera at a plant for real-time identification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg border aspect-video object-cover bg-muted"></video>
                    <div className="p-4 rounded-lg border bg-card min-h-[120px] flex items-center justify-center">
                        {!isStreaming ? (
                            <p className="text-muted-foreground text-center">Click "Start Live Scan" to begin.</p>
                        ) : error ? (
                             <p className="text-destructive text-center">{error}</p>
                        ) : (
                           <LiveResultDisplay result={liveResult} />
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                  {isStreaming ? (
                     <Button onClick={handleStopStreaming} variant="destructive" className="w-full"><Square className="mr-2 h-4 w-4" /> Stop Scan</Button>
                  ) : (
                     <Button onClick={handleStartStreaming} disabled={isUploading} className="w-full"><Video className="mr-2 h-4 w-4" /> Start Live Scan</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
               <Card>
                 <CardHeader>
                    <CardTitle>Upload from Device</CardTitle>
                    <CardDescription>Select up to 5 images for identification.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Upload className="mr-2 h-4 w-4"/> Select Images
                    </Button>
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square">
                                    <Image src={url} alt={`Preview ${index + 1}`} fill sizes="100px" className="object-cover rounded-md"/>
                                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                 </CardContent>
                 <CardFooter>
                    <Button className="w-full" onClick={handleUploadDiagnosis} disabled={isUploading || imageFiles.length === 0}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        {isUploading ? "Identifying..." : `Identify ${imageFiles.length} Image(s)`}
                    </Button>
                 </CardFooter>
               </Card>
            </TabsContent>
          </Tabs>

            {isUploading && (
                <Card className="mt-6">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="space-y-2 pt-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {finalResult && !isUploading && (
            <Card className="animate-in fade-in-50 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg"><Sprout className="text-primary" /></div>
                      <span>{finalResult.commonName}</span>
                    </CardTitle>
                    <CardDescription>
                        <strong>Botanical Name:</strong> {finalResult.botanicalName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <ResultSection title="Medicinal Uses" content={finalResult.medicinalUses} icon={Microscope} />
                     <ResultSection title="Parts Used" content={finalResult.partsUsed} icon={Pill} />
                     <ResultSection title="Preparation Methods" content={finalResult.preparationMethods} icon={BookText} />
                     <ResultSection title="Regional Names" content={finalResult.regionalNames} icon={Languages} />
                    <Alert variant={finalResult.precautions?.toLowerCase().trim() === 'none' ? 'default' : 'destructive'}>
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>Precautions & Warnings</AlertTitle>
                        <AlertDescription>{finalResult.precautions}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
}
