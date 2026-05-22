
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { liveFarmAdvisor, type LiveFarmAdvisorOutput } from "@/ai/flows/live-advisor-flow";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Languages, Mic, Bot, User, Volume2, Loader2, Video, Square, Camera, VolumeX, Eye, Info, Pin, PinOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function LiveAdvisorPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [lastResponse, setLastResponse] = useState<LiveFarmAdvisorOutput | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isResponsePinned, setIsResponsePinned] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const responseClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
      // Cleanup on unmount
      return () => { 
          stopSession();
          if (responseClearTimeoutRef.current) clearTimeout(responseClearTimeoutRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleSpeechEnd = () => setIsSpeaking(false);
    const synth = window.speechSynthesis;
    if (synth) {
      synth.addEventListener('end', handleSpeechEnd);
      synth.addEventListener('error', handleSpeechEnd);
    }
    return () => {
      if (synth) {
        synth.cancel();
        synth.removeEventListener('end', handleSpeechEnd);
        synth.removeEventListener('error', handleSpeechEnd);
      }
    };
  }, []);

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim() || !isSessionActive) return;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const videoFrameUri = frameToDataUri();
    if (!videoFrameUri) {
        setError("Could not capture video frame.");
        return;
    }
    
    setLastTranscript(text);
    setIsLoading(true);
    if(responseClearTimeoutRef.current) clearTimeout(responseClearTimeoutRef.current);
    setLastResponse(null);

    try {
      const langInfo = selectedLanguage === 'en-IN' ? 'English' : 'Kannada';
      const result = await liveFarmAdvisor({ videoFrameUri, farmerQuery: text, language: langInfo });
      setLastResponse(result);
      handleSpeak(result.responseToQuery, selectedLanguage);
      if (!isResponsePinned) {
          responseClearTimeoutRef.current = setTimeout(() => {
              setLastResponse(null);
          }, 8000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't get a response.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLastTranscript(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResponsePinned, isSessionActive, selectedLanguage]);


  const setupRecognition = useCallback(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            processTranscript(finalTranscript.trim());
        }
        if(speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = setTimeout(() => {
           if (recognitionRef.current && recognitionRef.current.listening) {
             recognition.stop();
           }
        }, 1500);
      };
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setLastResponse(null);
        setLastTranscript(null);
      };
      recognition.onend = () => {
        setIsListening(false);
        if (isSessionActive && !isLoading) {
          setTimeout(() => {
            try { recognition.start(); } catch(e) { /* ignore */ }
          }, 100);
        }
      };
      recognition.onerror = (event: any) => {
        setError(event.error === 'no-speech' ? 'No speech detected.' : 'Voice recognition error.');
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    } else {
      setError("Voice recognition not supported by your browser.");
    }
  }, [isSessionActive, isLoading, processTranscript]);


  useEffect(() => {
    setupRecognition();
  }, [setupRecognition]);


  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis && setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    loadVoices();
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const getPermissionsAndStartStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        variant: 'destructive',
        title: 'Permissions Denied',
        description: 'Please enable camera and microphone permissions in your browser settings.',
      });
      return false;
    }
  };

  const startSession = async () => {
    setError(null);
    setLastResponse(null);
    setLastTranscript(null);
    const permissionGranted = await getPermissionsAndStartStream();
    if (permissionGranted) {
      setIsSessionActive(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e) { console.error("Recognition start failed", e)}
      }
    }
  };

  const stopSession = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if(speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    if(responseClearTimeoutRef.current) clearTimeout(responseClearTimeoutRef.current);
    window.speechSynthesis?.cancel();
    setIsSessionActive(false);
    setIsListening(false);
    setIsLoading(false);
    setLastResponse(null);
    setLastTranscript(null);
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

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth.speaking) synth.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.lang === lang);
      if (voice) utterance.voice = voice;
      utterance.lang = lang;
      utterance.onstart = () => setIsSpeaking(true);
      synth.speak(utterance);
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'AI is thinking...';
    if (isListening) return 'Listening...';
    return 'Ready for your question';
  }

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] w-full flex flex-col items-center justify-center relative">
      <div className="w-full h-full relative flex items-center justify-center">
        {/* Video Player */}
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover rounded-3xl bg-muted border shadow-2xl shadow-black/30" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* UI overlays */}
        <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-4">
            
            {/* Top Bar - AI Response */}
            <AnimatePresence>
                {lastResponse && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-2xl mx-auto"
                    >
                        <div className="rounded-2xl border bg-card/80 p-4 text-card-foreground backdrop-blur-lg shadow-lg space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Eye className="h-4 w-4 text-primary" />
                                        <span>Visual Analysis</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{lastResponse.visualAnalysis}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSpeak(lastResponse.responseToQuery, selectedLanguage)}>
                                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                    <Button variant={isResponsePinned ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setIsResponsePinned(!isResponsePinned)}>
                                        {isResponsePinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Bot className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{lastResponse.responseToQuery}</p>
                            </div>
                            {lastResponse.proactiveAlert !== 'None' && (
                                <Alert className="text-xs">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Proactive Alert</AlertTitle>
                                    <AlertDescription>{lastResponse.proactiveAlert}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Middle - User transcript */}
            <AnimatePresence>
                {lastTranscript && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md text-card-foreground p-3 rounded-full shadow-lg">
                            <User className="h-5 w-5" />
                            <p className="italic text-sm">"{lastTranscript}"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Controls */}
            {isSessionActive ? (
                <div className="w-full max-w-md mx-auto rounded-full border bg-card/80 p-2 text-card-foreground backdrop-blur-lg shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1 pl-2">
                            <div className={cn("transition-colors", isListening ? "text-red-500" : "text-primary")}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Mic className="h-5 w-5"/>}
                            </div>
                            <span className="flex-1 text-xs font-medium">{getStatusText()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isListening || isLoading}>
                                <SelectTrigger className="w-auto h-8 text-xs border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                                    <Languages className="h-4 w-4" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en-IN">English</SelectItem>
                                    <SelectItem value="kn-IN">Kannada</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="h-8 rounded-full" variant="destructive" onClick={stopSession}><Square className="mr-2 h-4 w-4"/> End</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full flex justify-center">
                    <Button size="lg" className="rounded-full shadow-2xl shadow-black/40" onClick={startSession}>
                        <Camera className="mr-2 h-5 w-5"/> Start Live Session
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
