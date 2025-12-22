'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { getWeatherInfo, type GetWeatherInfoOutput } from '@/ai/flows/weather-search';
import { WeatherIcon } from '@/components/weather-icon';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Droplets, Wind, Thermometer, MapPin, CloudOff, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { saveWeatherData } from '@/lib/actions/ai-results';

// Temperature-based Analogous Nature Themes
const getTemperatureTheme = (temp: number) => {
  if (temp <= 10) {
    // Very Cold - Sky/Blue (Nature: Frost, Sky)
    return {
      gradient: 'from-sky-500/20 via-card to-blue-600/15',
      hoverGradient: 'hover:from-sky-500/25 hover:to-blue-600/20',
      iconBg: 'from-sky-400/25 to-blue-500/25',
      iconColor: 'text-sky-400',
      shadow: 'shadow-sky-500/10',
      border: 'border-sky-500/15',
      statBorder: 'border-sky-500/15',
      accent1: 'text-sky-400',
      accent2: 'text-blue-400',
      accent3: 'text-cyan-400',
    };
  } else if (temp <= 20) {
    // Cool - Cyan/Teal (Nature: Water, Mist)
    return {
      gradient: 'from-cyan-500/20 via-card to-teal-600/15',
      hoverGradient: 'hover:from-cyan-500/25 hover:to-teal-600/20',
      iconBg: 'from-cyan-400/25 to-teal-500/25',
      iconColor: 'text-cyan-400',
      shadow: 'shadow-cyan-500/10',
      border: 'border-cyan-500/15',
      statBorder: 'border-cyan-500/15',
      accent1: 'text-cyan-400',
      accent2: 'text-teal-400',
      accent3: 'text-emerald-400',
    };
  } else if (temp <= 28) {
    // Pleasant -  Emerald/Green (Nature: Lush growth)
    return {
      gradient: 'from-emerald-500/20 via-card to-green-600/15',
      hoverGradient: 'hover:from-emerald-500/25 hover:to-green-600/20',
      iconBg: 'from-emerald-400/25 to-green-500/25',
      iconColor: 'text-emerald-400',
      shadow: 'shadow-emerald-500/10',
      border: 'border-emerald-500/15',
      statBorder: 'border-emerald-500/15',
      accent1: 'text-emerald-400',
      accent2: 'text-green-400',
      accent3: 'text-lime-400',
    };
  } else if (temp <= 35) {
    // Warm - Lime/Amber (Nature: Sun, Harvest)
    return {
      gradient: 'from-lime-500/20 via-card to-amber-600/15',
      hoverGradient: 'hover:from-lime-500/25 hover:to-amber-600/20',
      iconBg: 'from-lime-400/25 to-amber-500/25',
      iconColor: 'text-lime-400',
      shadow: 'shadow-lime-500/10',
      border: 'border-lime-500/15',
      statBorder: 'border-lime-500/15',
      accent1: 'text-lime-400',
      accent2: 'text-amber-400',
      accent3: 'text-yellow-400',
    };
  } else {
    // Hot - Orange/Deep Amber (Nature: Heat, Dry Earth) - Avoid harsh Red
    return {
      gradient: 'from-amber-500/20 via-card to-orange-600/15',
      hoverGradient: 'hover:from-amber-500/25 hover:to-orange-600/20',
      iconBg: 'from-amber-400/25 to-orange-500/25',
      iconColor: 'text-orange-400',
      shadow: 'shadow-orange-500/10',
      border: 'border-orange-500/15',
      statBorder: 'border-orange-500/15',
      accent1: 'text-orange-400',
      accent2: 'text-amber-400',
      accent3: 'text-yellow-400',
    };
  }
};

export function WeatherWidget() {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<GetWeatherInfoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get theme based on current temperature
  const theme = useMemo(() => {
    if (weatherData?.current?.temperature !== undefined) {
      return getTemperatureTheme(weatherData.current.temperature);
    }
    return getTemperatureTheme(25); // Default to pleasant green
  }, [weatherData?.current?.temperature]);

  useEffect(() => {
    const fetchWeather = () => {
      setIsLoading(true);
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const result = await getWeatherInfo({ lat: latitude, lon: longitude });
            setWeatherData(result);

            // Save to Firestore for cross-feature integration
            if (user?.uid && result) {
              await saveWeatherData(user.uid, {
                location: {
                  name: result.location.name,
                  latitude: latitude,
                  longitude: longitude,
                },
                current: {
                  temperature: result.current.temperature,
                  humidity: result.current.humidity,
                  windSpeed: result.current.windSpeed,
                  weatherCode: result.current.weatherCode,
                  description: result.summary || 'Weather data available',
                },
                daily: result.daily.map(d => ({
                  date: d.date,
                  maxTemp: d.maxTemp,
                  minTemp: d.minTemp,
                  weatherCode: d.weatherCode,
                })),
              });
            }
          } catch (err) {
            console.error('AI weather error:', err);
            setError('Could not fetch weather data.');
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setError('Location access denied.');
          setIsLoading(false);
        },
        { timeout: 10000 }
      );
    };

    fetchWeather();
  }, [user?.uid]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12 w-14" />
              <Skeleton className="h-12 w-14" />
              <Skeleton className="h-12 w-14" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-500/20 via-card to-slate-600/10 border border-slate-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-slate-500/20">
                <CloudOff className="h-8 w-8 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Weather Unavailable</p>
                <p className="text-sm text-muted-foreground">{error || 'Could not load weather data.'}</p>
              </div>
              <motion.button
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                onClick={() => window.location.reload()}
                className="p-2 rounded-full hover:bg-slate-500/10 transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-slate-400" />
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`overflow-hidden border-0 bg-gradient-to-br ${theme.gradient} ${theme.hoverGradient} transition-all duration-500 ${theme.border}`}>
        <Link href="/weather" className="block">
          <CardContent className="p-4 sm:p-5 relative overflow-hidden">
            {/* Animated background accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.iconBg} rounded-full blur-3xl opacity-50`} />

            <div className="flex flex-row items-center gap-3 sm:gap-4 relative">
              {/* Left: Weather icon and main info */}
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${theme.iconBg} shadow-lg ${theme.shadow}`}
                >
                  <WeatherIcon code={weatherData.current.weatherCode} className={`h-8 w-8 sm:h-10 sm:w-10 ${theme.iconColor}`} />
                </motion.div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <p className="text-xs font-medium truncate max-w-[100px] sm:max-w-[120px]">
                      {weatherData.location.name}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-0.5 sm:gap-1">
                    <span className={`text-3xl sm:text-4xl font-bold ${theme.iconColor}`}>
                      {weatherData.current.temperature}
                    </span>
                    <span className="text-lg sm:text-xl text-muted-foreground">°C</span>
                  </div>
                </div>
              </div>

              {/* Right: Weather stats */}
              <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-background/40 backdrop-blur-sm min-w-[44px] sm:min-w-[52px] border ${theme.statBorder}`}
                >
                  <Droplets className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${theme.accent1} mb-0.5 sm:mb-1`} />
                  <p className="font-bold text-xs sm:text-sm">{weatherData.current.humidity}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">Hum.</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-background/40 backdrop-blur-sm min-w-[44px] sm:min-w-[52px] border ${theme.statBorder}`}
                >
                  <Wind className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${theme.accent2} mb-0.5 sm:mb-1`} />
                  <p className="font-bold text-xs sm:text-sm">{weatherData.current.windSpeed}</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">km/h</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-background/40 backdrop-blur-sm min-w-[44px] sm:min-w-[52px] border ${theme.statBorder}`}
                >
                  <Thermometer className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${theme.accent3} mb-0.5 sm:mb-1`} />
                  <p className="font-bold text-xs sm:text-sm">{weatherData.daily[0].maxTemp}°</p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground">Max</p>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}
