
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getWeatherInfo, type GetWeatherInfoOutput } from '@/ai/flows/weather-search';
import { Bot, CloudSun, Loader2, LocateFixed, AlertCircle, Wind, Droplets, ThermometerSun, ThermometerSnowflake, Sunrise, Sunset } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'fetching' | 'done' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    // Automatically fetch weather on page load
    handleGetWeatherForLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetWeatherForLocation = async () => {
    if (status === 'locating' || status === 'fetching') return;

    setStatus('locating');
    setError(null);
    setWeatherData(null);
    setIsLoading(true);

    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        setStatus('error');
        setIsLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            setStatus('fetching');
            try {
                const result = await getWeatherInfo({ lat: latitude, lon: longitude });
                setWeatherData(result);
                setStatus('done');
            } catch (err) {
                console.error('AI weather error:', err);
                const errorMessage = err instanceof Error ? err.message : 'Could not get a response from the weather service.';
                setError(errorMessage);
                setStatus('error');
                toast({
                    variant: 'destructive',
                    title: 'Weather Service Failed',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        },
        () => {
            setError("Permission to access location was denied. Please enable location services in your browser settings.");
            setStatus('error');
            setIsLoading(false);
        }
    );
  };

  const getStatusMessage = () => {
    switch (status) {
        case 'locating':
            return 'Getting your location...';
        case 'fetching':
            return 'Checking the skies...';
        default:
            return 'Get the latest weather for your current location.';
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-16 w-32" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg flex flex-col items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <CloudSun className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
           <p className="text-muted-foreground">{getStatusMessage()}</p>
        </div>
      </div>
      
      {error && !isLoading && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
             <Button variant="outline" size="sm" onClick={handleGetWeatherForLocation} className="mt-4">
                Try Again
            </Button>
        </Alert>
      )}

      {isLoading && renderSkeleton()}

      {weatherData && !isLoading && (
        <div className="space-y-6 animate-in fade-in-50">
            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="text-2xl">Current Weather in {weatherData.location.name}</CardTitle>
                    <CardDescription>
                         {format(new Date(), "EEEE, d MMM yyyy")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-6">
                        <WeatherIcon code={weatherData.current.weatherCode} className="h-24 w-24 text-accent" />
                        <div>
                            <p className="text-7xl font-bold">{weatherData.current.temperature}°C</p>
                            <p className="text-muted-foreground font-medium mt-1">{WeatherIcon.getDescription(weatherData.current.weatherCode)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Humidity</p>
                                <p className="text-muted-foreground">{weatherData.current.humidity}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Wind Speed</p>
                                <p className="text-muted-foreground">{weatherData.current.windSpeed} km/h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sunrise className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Sunrise</p>
                                <p className="text-muted-foreground">{weatherData.sunrise}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sunset className="h-5 w-5 text-primary"/>
                            <div>
                                <p className="font-semibold">Sunset</p>
                                <p className="text-muted-foreground">{weatherData.sunset}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle>5-Day Forecast</CardTitle>
                    <CardDescription>{weatherData.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {weatherData.daily.map((day, index) => (
                            <Card key={index} className="flex flex-col items-center p-4 text-center bg-muted/30 hover:bg-muted/80 transition-colors">
                                <p className="font-semibold text-base">{day.date}</p>
                                <WeatherIcon code={day.weatherCode} className="h-16 w-16 text-accent my-2" />
                                <p className="text-sm text-muted-foreground mb-2">{WeatherIcon.getDescription(day.weatherCode)}</p>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1.5" title="Max Temperature">
                                      <ThermometerSun className="h-4 w-4 text-red-500"/> {day.maxTemp}°
                                    </div>
                                    <div className="flex items-center gap-1.5" title="Min Temperature">
                                      <ThermometerSnowflake className="h-4 w-4 text-blue-500"/> {day.minTemp}°
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
