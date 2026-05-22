"use client";

import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, Snowflake, Zap, CloudFog, CloudDrizzle, Cloudy, LucideProps } from 'lucide-react';

const weatherCodeMap: { [key: number]: { description: string, icon: React.ElementType<LucideProps> } } = {
    0: { description: 'Clear sky', icon: Sun },
    1: { description: 'Mainly clear', icon: Sun },
    2: { description: 'Partly cloudy', icon: CloudSun },
    3: { description: 'Overcast', icon: Cloud },
    45: { description: 'Fog', icon: CloudFog },
    48: { description: 'Rime fog', icon: CloudFog },
    51: { description: 'Light drizzle', icon: CloudDrizzle },
    53: { description: 'Drizzle', icon: CloudDrizzle },
    55: { description: 'Dense drizzle', icon: CloudDrizzle },
    56: { description: 'Light freezing drizzle', icon: CloudDrizzle },
    57: { description: 'Dense freezing drizzle', icon: CloudDrizzle },
    61: { description: 'Slight rain', icon: CloudRain },
    63: { description: 'Rain', icon: CloudRain },
    65: { description: 'Heavy rain', icon: CloudRain },
    66: { description: 'Light freezing rain', icon: CloudRain },
    67: { description: 'Heavy freezing rain', icon: CloudRain },
    71: { description: 'Slight snow', icon: Snowflake },
    73: { description: 'Snow', icon: Snowflake },
    75: { description: 'Heavy snow', icon: Snowflake },
    77: { description: 'Snow grains', icon: Snowflake },
    80: { description: 'Slight showers', icon: CloudRain },
    81: { description: 'Showers', icon: CloudRain },
    82: { description: 'Violent showers', icon: CloudRain },
    85: { description: 'Slight snow showers', icon: Snowflake },
    86: { description: 'Heavy snow showers', icon: Snowflake },
    95: { description: 'Thunderstorm', icon: Zap },
    96: { description: 'Thunderstorm, slight hail', icon: Zap },
    99: { description: 'Thunderstorm, heavy hail', icon: Zap },
};

interface WeatherIconProps extends LucideProps {
  code: number;
}

export function WeatherIcon({ code, ...props }: WeatherIconProps) {
  const IconComponent = weatherCodeMap[code]?.icon || Cloudy;
  return <IconComponent {...props} />;
}

WeatherIcon.getDescription = (code: number): string => {
  return weatherCodeMap[code]?.description || 'Unknown';
}
