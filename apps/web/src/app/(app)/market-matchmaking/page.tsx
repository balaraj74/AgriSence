
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, LocateFixed, Phone, Mail } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { findBestBuyers, type FindBestBuyersOutput, type BuyerMatch } from '@/ai/flows/market-matchmaking-flow';
import { findBestSellers, type FindBestSellersOutput, type SellerMatch } from '@/ai/flows/find-best-sellers-flow';
import { Loader2, Handshake, Bot, Star, MapPin, Truck, IndianRupee, ShoppingCart, Tractor } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


const MAP_ID = "AGRISENCE_MATCHMAKING_MAP";

// #region MapComponent
const MapComponent = ({
  center,
  matches,
}: {
  center: google.maps.LatLngLiteral;
  matches: (BuyerMatch | SellerMatch)[];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom: 10,
        mapId: MAP_ID,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(newMap);
      infoWindowRef.current = new google.maps.InfoWindow();
      
      new google.maps.Marker({
        position: center,
        map: newMap,
        title: "Your Location",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "white"
        }
      });
    }
  }, [ref, map, center]);

  useEffect(() => {
    if (map) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(center);
      
      matches.forEach(match => {
        if (match.coordinates) {
          const marker = new google.maps.Marker({
              position: match.coordinates,
              map,
              title: 'sellerName' in match ? match.sellerName : match.buyerName,
          });

          marker.addListener('click', () => {
             if (infoWindowRef.current) {
                const name = 'sellerName' in match ? match.sellerName : match.buyerName;
                const price = 'price' in match ? `₹${match.price}/${match.unit}` : `₹${match.offerPrice}/${match.offerUnit}`;
                const contentString = `
                    <div style="font-family: sans-serif; color: black;">
                        <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 4px;">${name}</h4>
                        <p style="font-size: 0.9rem; margin: 0;"><strong>Offer:</strong> ${price}</p>
                        <p style="font-size: 0.8rem; margin-top: 4px;">${match.location}</p>
                    </div>`;
                infoWindowRef.current.setContent(contentString);
                infoWindowRef.current.open(map, marker);
            }
          });

          markersRef.current.push(marker);
          bounds.extend(match.coordinates);
        }
      });
      
      if (matches.length > 0) {
        map.fitBounds(bounds);
      } else {
        map.setCenter(center);
        map.setZoom(10);
      }
    }
  }, [map, matches, center]);


  return <div ref={ref} id="map" className="h-full w-full rounded-lg" />;
}
// #endregion MapComponent

const sellSchema = z.object({
  cropType: z.string().min(1, "Crop type is required."),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number."),
  unit: z.enum(["kg", "quintal", "tonne"]),
  location: z.string().min(1, "Location is required."),
  sellByDate: z.string().min(1, "Sell-by date is required."),
});

const buySchema = z.object({
  cropType: z.string().min(1, "Crop to buy is required."),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number."),
  unit: z.enum(["kg", "quintal", "tonne"]),
  location: z.string().min(1, "Location is required."),
  purchaseByDate: z.string().min(1, "Purchase-by date is required."),
});

type MatchType = BuyerMatch | SellerMatch;

const ContactDialog = ({ match, children }: { match: MatchType, children: React.ReactNode }) => (
    <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Contact Details</DialogTitle>
                <DialogDescription>
                    These are simulated contact details for "{'sellerName' in match ? match.sellerName : match.buyerName}". In a real app, these would be verified.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${match.contactPhone}`} className="hover:underline">{match.contactPhone}</a>
                </div>
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${match.contactEmail}`} className="hover:underline">{match.contactEmail}</a>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);


const BuyerResultCard = ({ match }: { match: BuyerMatch }) => {
    const rating = Math.round(match.rating * 2) / 2;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{match.buyerName}</span>
                    <div className="flex items-center gap-1 text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md">
                        <Star className="h-4 w-4" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                </CardTitle>
                <CardDescription>{match.buyerType} from {match.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-around items-center text-center p-3 bg-muted rounded-lg">
                    <div>
                        <Label>Offer Price</Label>
                        <p className="text-xl font-bold flex items-center justify-center"><IndianRupee className="h-5 w-5 mr-1" />{match.offerPrice} / {match.offerUnit}</p>
                    </div>
                    <div>
                        <Label>Logistics</Label>
                        <p className="text-xl font-bold flex items-center justify-center gap-2">{match.pickupOrDelivery === 'Pickup' ? <Truck className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}{match.pickupOrDelivery}</p>
                    </div>
                </div>
                <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertDescription>{match.summary}</AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <ContactDialog match={match}>
                    <Button className="w-full">Contact Buyer</Button>
                </ContactDialog>
            </CardFooter>
        </Card>
    );
};

const SellerResultCard = ({ match }: { match: SellerMatch }) => {
    const rating = Math.round(match.rating * 2) / 2;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{match.sellerName}</span>
                     <div className="flex items-center gap-1 text-sm bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md">
                        <Star className="h-4 w-4" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                </CardTitle>
                <CardDescription>{match.sellerType} from {match.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex justify-around items-center text-center p-3 bg-muted rounded-lg">
                    <div>
                        <Label>Asking Price</Label>
                        <p className="text-xl font-bold flex items-center justify-center"><IndianRupee className="h-5 w-5 mr-1" />{match.price} / {match.unit}</p>
                    </div>
                    <div>
                        <Label>Available</Label>
                        <p className="text-xl font-bold flex items-center justify-center gap-2"><Tractor className="h-5 w-5" />{match.availableQuantity} {match.unit}</p>
                    </div>
                </div>
                <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertDescription>{match.summary}</AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                 <ContactDialog match={match}>
                    <Button className="w-full">Contact Seller</Button>
                </ContactDialog>
            </CardFooter>
        </Card>
    );
};


export default function MarketMatchmakingPage() {
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');
  const [result, setResult] = useState<FindBestBuyersOutput | FindBestSellersOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>({ lat: 20.5937, lng: 78.9629 });
  const { toast } = useToast();

  const sellForm = useForm<z.infer<typeof sellSchema>>({
    resolver: zodResolver(sellSchema),
    defaultValues: { cropType: '', quantity: 100, unit: 'quintal', location: '', sellByDate: format(new Date(), 'yyyy-MM-dd') },
  });

  const buyForm = useForm<z.infer<typeof buySchema>>({
    resolver: zodResolver(buySchema),
    defaultValues: { cropType: '', quantity: 10, unit: 'quintal', location: '', purchaseByDate: format(new Date(), 'yyyy-MM-dd') },
  });
  
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => console.warn("Could not get initial user location.")
    );
  }, []);


  const handleGetLocation = async (form: typeof sellForm | typeof buyForm) => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'Geolocation is not supported.' });
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        if (!response.ok) throw new Error("Failed to fetch address.");
        const data = await response.json();
        const { city, town, village, state_district, state } = data.address;
        const locationString = `${city || town || village || state_district}, ${state}`;
        form.setValue('location', locationString);
        toast({ title: 'Location Fetched!' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Could not get address from coordinates.' });
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast({ variant: 'destructive', title: 'Location access denied.' });
      setIsLocating(false);
    });
  };

  const onSellSubmit = async (data: z.infer<typeof sellSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await findBestBuyers(data);
      setResult(analysisResult);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'The AI could not find buyers. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onBuySubmit = async (data: z.infer<typeof buySchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await findBestSellers(data);
      setResult(analysisResult);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: 'The AI could not find sellers. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const currentMatches = result?.matches || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Handshake className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Market Matchmaking</h1>
          <p className="text-muted-foreground">Find the best buyers and sellers for your harvest.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value as 'sell' | 'buy');
                setResult(null);
            }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sell">Sell Crops</TabsTrigger>
                <TabsTrigger value="buy">Buy Crops</TabsTrigger>
            </TabsList>
            <TabsContent value="sell">
                <Card>
                    <Form {...sellForm}>
                    <form onSubmit={sellForm.handleSubmit(onSellSubmit)}>
                        <CardHeader>
                        <CardTitle>Enter Your Crop Details</CardTitle>
                        <CardDescription>Provide details about your produce to find buyers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={sellForm.control} name="cropType" render={({ field }) => ( <FormItem> <FormLabel>Crop Type</FormLabel> <FormControl><Input placeholder="e.g., 'Tomatoes'" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                            <div className="grid grid-cols-3 gap-2">
                                <FormField control={sellForm.control} name="quantity" render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel>Quantity</FormLabel> <FormControl><Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={sellForm.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel>Unit</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="kg">kg</SelectItem> <SelectItem value="quintal">quintal</SelectItem> <SelectItem value="tonne">tonne</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            </div>
                             <FormField control={sellForm.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Your Location</FormLabel> <div className="flex gap-2"> <FormControl><Input placeholder="e.g., 'Nashik, Maharashtra'" {...field} /></FormControl> <Button type="button" size="icon" onClick={() => handleGetLocation(sellForm)} disabled={isLocating}>{isLocating ? <Loader2 className="h-4 w-4 animate-spin"/> : <LocateFixed className="h-4 w-4"/>}</Button> </div> <FormMessage /> </FormItem> )}/>
                             <FormField
                                control={sellForm.control}
                                name="sellByDate"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Preferred Sell By Date</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                            format(new Date(field.value), "PPP")
                                            ) : (
                                            <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={
                                            field.value ? new Date(field.value) : undefined
                                        }
                                        onSelect={(date) =>
                                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                                        }
                                        disabled={(date) =>
                                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                                        }
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" disabled={isLoading}> {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />} {isLoading ? 'Finding Buyers...' : 'Find Best Buyers'} </Button>
                        </CardFooter>
                    </form>
                    </Form>
                </Card>
            </TabsContent>
            <TabsContent value="buy">
                 <Card>
                    <Form {...buyForm}>
                    <form onSubmit={buyForm.handleSubmit(onBuySubmit)}>
                        <CardHeader>
                        <CardTitle>What are you looking for?</CardTitle>
                        <CardDescription>Tell us what crop you need to find nearby sellers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField control={buyForm.control} name="cropType" render={({ field }) => ( <FormItem> <FormLabel>Crop to Buy</FormLabel> <FormControl><Input placeholder="e.g., 'Wheat'" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
                             <div className="grid grid-cols-3 gap-2">
                                <FormField control={buyForm.control} name="quantity" render={({ field }) => ( <FormItem className="col-span-2"> <FormLabel>Quantity</FormLabel> <FormControl><Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={buyForm.control} name="unit" render={({ field }) => ( <FormItem> <FormLabel>Unit</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="kg">kg</SelectItem> <SelectItem value="quintal">quintal</SelectItem> <SelectItem value="tonne">tonne</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            </div>
                             <FormField control={buyForm.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Your Location</FormLabel> <div className="flex gap-2"> <FormControl><Input placeholder="e.g., 'Pune, Maharashtra'" {...field} /></FormControl> <Button type="button" size="icon" onClick={() => handleGetLocation(buyForm)} disabled={isLocating}>{isLocating ? <Loader2 className="h-4 w-4 animate-spin"/> : <LocateFixed className="h-4 w-4"/>}</Button> </div> <FormMessage /> </FormItem> )}/>
                             <FormField
                                control={buyForm.control}
                                name="purchaseByDate"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Preferred Purchase By Date</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                            format(new Date(field.value), "PPP")
                                            ) : (
                                            <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={
                                            field.value ? new Date(field.value) : undefined
                                        }
                                        onSelect={(date) =>
                                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                                        }
                                        disabled={(date) =>
                                            date < new Date(new Date().setDate(new Date().getDate() - 1))
                                        }
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" disabled={isLoading}> {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />} {isLoading ? 'Finding Sellers...' : 'Find Best Sellers'} </Button>
                        </CardFooter>
                    </form>
                    </Form>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
        <div className="lg:col-span-3 min-h-[400px] lg:h-auto rounded-lg bg-muted flex items-center justify-center">
             <MapComponent center={userLocation} matches={currentMatches} />
        </div>
      </div>
      
      {isLoading && (
        <div className="space-y-6">
            <Skeleton className="h-10 w-2/3" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
           <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>AI Analysis Complete</AlertTitle>
                <AlertDescription>{result.overallSummary}</AlertDescription>
            </Alert>
            <div className="grid lg:grid-cols-3 gap-6">
                {result.matches.length > 0 ? (
                    result.matches.map((match) => (
                        activeTab === 'sell'
                          ? <BuyerResultCard key={(match as BuyerMatch).buyerId} match={match as BuyerMatch} />
                          : <SellerResultCard key={(match as SellerMatch).sellerId} match={match as SellerMatch} />
                    ))
                ) : (
                    <div className="lg:col-span-3 text-center py-12 bg-card rounded-lg border">
                        <p className="text-muted-foreground font-semibold">
                            No suitable {activeTab === 'sell' ? 'buyers' : 'sellers'} found at this moment.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your quantity or location.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
