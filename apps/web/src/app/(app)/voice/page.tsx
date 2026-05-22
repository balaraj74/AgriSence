
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { farmingAdviceChatbot } from "@/ai/flows/farming-advice-chatbot";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Languages, Mic, Bot, User, Volume2, Loader2, AlertTriangle, ShieldCheck, ExternalLink, VolumeX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

type PermissionState = 'idle' | 'prompting' | 'granted' | 'denied';

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Effect to manage speech synthesis state
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

  // Effect to initialize Speech Recognition and check initial permission status
  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Voice recognition is not supported by your browser.");
      setPermissionState('denied');
      return;
    }
    
    // Check initial permission status quietly
    navigator.permissions?.query({ name: 'microphone' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
            setPermissionState('granted');
        } else if (permissionStatus.state === 'denied') {
            setPermissionState('denied');
            setError("Microphone access was denied. Please allow it in your browser settings.");
        }
    });

    // Initialize the recognition object
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      processTranscript(spokenText);
    };
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      let errorMessage = "An unknown error occurred.";
      if (event.error === 'no-speech') errorMessage = 'No speech was detected. Please try again.';
      else if (event.error === 'audio-capture') errorMessage = 'Microphone is busy or not found.';
      else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access was denied by the browser.';
        setPermissionState('denied');
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

  }, []);

  // Update language when user changes it
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  // Load TTS voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const handleRequestPermission = async () => {
    setPermissionState('prompting');
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      toast({ title: "Microphone Enabled", description: "You can now use the voice assistant." });
    } catch (err) {
      setError("Permission denied. Please allow microphone access in your browser's settings.");
      setPermissionState('denied');
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current || isListening || isLoading) {
      return;
    }
    setTranscript("");
    setResponse("");
    setError(null);
    try {
        recognitionRef.current.start();
    } catch (e) {
        setError("Could not start listening. Please try again.");
        setIsListening(false);
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    setTranscript(text);
    setIsLoading(true);
    setResponse("");
    try {
      const result = await farmingAdviceChatbot({ question: text });
      setResponse(result.answer);
      handleSpeak(result.answer, selectedLanguage);
    } catch (error) {
      const errorMessage = "Sorry, I couldn't get a response. Please try again.";
      setResponse(errorMessage);
      handleSpeak(errorMessage, selectedLanguage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      if (synth.speaking) {
        synth.cancel();
        // The onend handler will set isSpeaking to false
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find((v) => v.lang === lang);
      utterance.voice = selectedVoice || null;
      utterance.lang = lang;
      utterance.onstart = () => setIsSpeaking(true);
      synth.speak(utterance);
    }
  };

  const getMicButtonText = () => {
    if (isListening) return "Listening...";
    if (isLoading) return "Processing...";
    return "Tap to Speak";
  };

  const languageOptions = [
    { value: "en-IN", label: "English (India)" },
    { value: "kn-IN", label: "Kannada" },
    { value: "hi-IN", label: "Hindi" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg"><Mic className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Voice Assistant</h1>
          <p className="text-muted-foreground">Interact with AgriSence using your voice.</p>
        </div>
      </div>
      
       <Alert variant="default" className="w-full max-w-2xl text-left border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Running in a secure environment?</AlertTitle>
          <AlertDescription>
            Microphone access might be blocked in this preview window. For the best experience, please 
            <strong className="text-yellow-400"> click the "Open in app" button</strong> at the top of the screen to use the voice assistant in a new tab.
          </AlertDescription>
        </Alert>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          {permissionState === 'granted' ? (
            <div className="flex justify-center mb-4">
              <Button
                size="lg"
                className={`relative h-24 w-24 rounded-full transition-colors ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
                onClick={handleMicClick}
                disabled={isLoading}
              >
                <Mic className="h-12 w-12" />
                {isListening && <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping opacity-75"></span>}
              </Button>
            </div>
          ) : (
             <div className="flex justify-center mb-4">
                <Button onClick={handleRequestPermission} disabled={permissionState === 'prompting' || permissionState === 'denied'}>
                    <ShieldCheck className="mr-2 h-4 w-4"/>
                    {permissionState === 'prompting' ? 'Waiting for permission...' : 'Enable Microphone'}
                </Button>
            </div>
          )}
          <CardTitle className="text-2xl">
            {permissionState === 'granted' ? getMicButtonText() : "Microphone Access"}
          </CardTitle>
          <CardDescription>
            {permissionState === 'granted' ? "Ask about crops, weather, or farming techniques." : "Please enable your microphone to use the voice assistant."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={isListening || isLoading}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Language" /></SelectTrigger>
              <SelectContent>
                {languageOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Voice Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(transcript || response || isLoading) && permissionState === 'granted' && (
            <div className="text-left space-y-4 p-4 border rounded-lg bg-muted/50 min-h-[120px]">
              {transcript && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                  <div>
                    <p className="font-semibold">You asked:</p>
                    <p className="text-muted-foreground">{transcript}</p>
                  </div>
                </div>
              )}
              {isLoading && !response && (
                <div className="flex items-center justify-center pt-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                </div>
              )}
              {response && (
                <div className="flex items-start gap-3">
                  <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1"/>
                  <div>
                    <p className="font-semibold">AgriSence says:</p>
                    <p className="text-muted-foreground">{response}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
         {response && !isLoading && (
            <CardFooter className="justify-center">
                 <Button variant="outline" onClick={() => handleSpeak(response, selectedLanguage)}>
                    {isSpeaking ? <VolumeX className="mr-2 h-4 w-4"/> : <Volume2 className="mr-2 h-4 w-4"/>}
                    {isSpeaking ? 'Stop' : 'Listen Again'}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
