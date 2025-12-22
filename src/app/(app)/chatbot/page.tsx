
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, Bot, User, Volume2, Languages, MessageCircle, VolumeX, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { farmingAdviceChatbot, type FarmingAdviceChatbotOutput } from "@/ai/flows/farming-advice-chatbot";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth";
import { getFarmerContext, contextToPromptString } from "@/lib/actions/farmer-context";
import Link from "next/link";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  suggestedFollowups?: string[];
  relatedFeatures?: Array<{ name: string; href: string; reason: string }>;
  confidence?: number;
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [farmerContextString, setFarmerContextString] = useState<string>("");
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [ttsLanguage, setTtsLanguage] = useState('en-IN');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load farmer context on mount
  useEffect(() => {
    const loadContext = async () => {
      if (user?.uid) {
        try {
          const context = await getFarmerContext(user.uid);
          if (context) {
            setFarmerContextString(contextToPromptString(context));
          }
        } catch (error) {
          console.error('Failed to load farmer context:', error);
        }
      }
      setIsLoadingContext(false);
    };
    loadContext();
  }, [user?.uid]);

  // Effect to manage speech synthesis state
  useEffect(() => {
    const handleSpeechEnd = () => setSpeakingMessageId(null);
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

  // Setup speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        toast({ variant: "destructive", title: "Voice Recognition Error", description: event.error });
        setIsListening(false);
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSubmit(undefined, transcript);
      };
    }
  }, [toast]);

  // Update language when user changes it
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = ttsLanguage;
    }
  }, [ttsLanguage]);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        const supportedVoices = availableVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('kn') || v.lang.startsWith('hi'));
        setVoices(supportedVoices);
      }
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollableNode = scrollAreaRef.current.querySelector('div');
      if (scrollableNode) {
        scrollableNode.scrollTo({
          top: scrollableNode.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleSpeak = (message: Message) => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;

      if (speakingMessageId === message.id && synth.speaking) {
        synth.cancel();
        setSpeakingMessageId(null);
        return;
      }

      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(message.text);
      const selectedVoice = voices.find(v => v.lang === ttsLanguage);
      utterance.voice = selectedVoice || null;
      utterance.lang = ttsLanguage;
      utterance.onstart = () => setSpeakingMessageId(message.id);
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: "destructive",
        title: "TTS Not Supported",
        description: "Your browser does not support text-to-speech.",
      });
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({
        variant: "destructive",
        title: "Voice Recognition Not Supported",
        description: "Your browser does not support voice recognition.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Get language name from code
  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      'en-IN': 'English',
      'hi-IN': 'Hindi',
      'kn-IN': 'Kannada',
    };
    return map[code] || 'English';
  };

  // Build conversation history for context
  const getConversationHistory = () => {
    return messages.slice(-6).map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent, voiceInput?: string) => {
    e?.preventDefault();
    const currentInput = voiceInput || input;
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), sender: "user", text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await farmingAdviceChatbot({
        question: currentInput,
        language: getLanguageName(ttsLanguage),
        farmerContext: farmerContextString || undefined,
        conversationHistory: getConversationHistory(),
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.answer,
        suggestedFollowups: response.suggestedFollowups,
        relatedFeatures: response.relatedFeatures,
        confidence: response.confidence,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { id: Date.now() + 1, sender: "bot", text: "Sorry, I couldn't get a response. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: "Failed to get a response from the AI assistant.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupClick = (question: string) => {
    setInput(question);
    handleSubmit(undefined, question);
  };

  const languageOptions = [
    { value: 'en-IN', label: 'English (India)' },
    { value: 'kn-IN', label: 'Kannada' },
    { value: 'hi-IN', label: 'Hindi' },
  ];

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-3 rounded-lg">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Farming Chatbot</h1>
          <p className="text-muted-foreground">
            Ask me anything about farming, crops, or techniques.
          </p>
        </div>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CardTitle>Chat with AgriSence AI</CardTitle>
              {isLoadingContext ? (
                <Badge variant="secondary" className="text-xs">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Loading context...
                </Badge>
              ) : farmerContextString ? (
                <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Personalized
                </Badge>
              ) : null}
            </div>
            <CardDescription>Get instant, personalized farming advice based on your crops.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={ttsLanguage} onValueChange={setTtsLanguage}>
              <SelectTrigger className="w-auto sm:w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                    <Bot className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Welcome to AgriSence AI!</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      I'm your intelligent farming assistant. Ask me about crop diseases, market prices,
                      weather impacts, or any farming question!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                    {[
                      "What crops are best for this season?",
                      "How to treat leaf curl in tomatoes?",
                      "When should I harvest my wheat?",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleFollowupClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      {message.confidence !== undefined && message.sender === "bot" && (
                        <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </p>
                      )}
                    </div>
                    {message.sender === 'bot' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSpeak(message)} aria-label="Read message aloud">
                        {speakingMessageId === message.id ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}
                    {message.sender === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || ""} alt="User avatar" />
                        <AvatarFallback>
                          <User />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Suggested follow-ups */}
                  {message.sender === "bot" && message.suggestedFollowups && message.suggestedFollowups.length > 0 && (
                    <div className="ml-10 flex flex-wrap gap-2">
                      {message.suggestedFollowups.map((followup, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 px-2"
                          onClick={() => handleFollowupClick(followup)}
                        >
                          {followup}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Related features */}
                  {message.sender === "bot" && message.relatedFeatures && message.relatedFeatures.length > 0 && (
                    <div className="ml-10 flex flex-wrap gap-2">
                      {message.relatedFeatures.map((feature, idx) => (
                        <Link key={idx} href={feature.href}>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary/20 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {feature.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-8 w-8 bg-primary/10 text-primary">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                  <div className="max-w-xs rounded-lg px-4 py-2 bg-muted">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question or use the mic..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="button" variant="secondary" size="icon" onClick={handleMicClick} disabled={isLoading} aria-label="Use Microphone">
              <Mic className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
            </Button>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send Message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
