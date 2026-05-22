import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { getWeather, WeatherOutput } from '../../src/services/ai';
import {
  CloudSun,
  Cloud,
  Sun,
  CloudRain,
  Snowflake,
  Zap,
  CloudFog,
  CloudDrizzle,
  Cloudy,
  AlertCircle,
  Wind,
  Droplets,
  ThermometerSun,
  ThermometerSnowflake,
  Sunrise,
  Sunset,
  RefreshCw,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const weatherCodeMap: { [key: number]: { description: string; icon: React.ElementType } } = {
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

function WeatherIconComponent({ code, size, color }: { code: number; size: number; color: string }) {
  const IconComponent = weatherCodeMap[code]?.icon || Cloudy;
  return <IconComponent size={size} color={color} />;
}

function getWeatherDescription(code: number): string {
  return weatherCodeMap[code]?.description || 'Unknown';
}

export default function WeatherScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [weatherData, setWeatherData] = useState<WeatherOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Getting your location...');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setWeatherData(null);
    setStatusText('Getting your location...');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Enable location to view weather forecast.');
        setIsLoading(false);
        return;
      }

      setStatusText('Locating farm coords...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setStatusText('Checking the skies...');
      const result = await getWeather({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });

      setWeatherData(result);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Unable to retrieve weather forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Weather Forecast" subtitle="Plan your field tasks with real-time forecast" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Error Alert */}
        {errorMsg && (
          <Card style={[styles.errorCard, { borderColor: `${colors.destructive}45` }]}>
            <CardContent style={styles.errorContent}>
              <AlertCircle size={24} color={colors.destructive} style={{ marginRight: spacing[3] }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.errorTitle, { color: colors.destructive, fontFamily: typography.fontFamily.sansBold }]}>
                  Weather Update Failed
                </Text>
                <Text style={[styles.errorText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                  {errorMsg}
                </Text>
                <Button
                  label="Try Again"
                  size="sm"
                  onPress={fetchWeather}
                  style={{ marginTop: spacing[3], alignSelf: 'flex-start' }}
                  icon={<RefreshCw size={14} color={colors.primaryForeground} />}
                />
              </View>
            </CardContent>
          </Card>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing[2] }} />
            <Text style={[styles.statusText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              {statusText}
            </Text>
            <View style={{ width: '100%', gap: 16, marginTop: 16 }}>
              <Skeleton width="100%" height={160} style={{ borderRadius: borderRadius.md }} />
              <Skeleton width="100%" height={240} style={{ borderRadius: borderRadius.md }} />
            </View>
          </View>
        )}

        {/* Weather Content */}
        {weatherData && !isLoading && (
          <View style={styles.weatherContainer}>
            {/* Current Weather Card */}
            <Card style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <CardHeader>
                <View style={styles.currentHeader}>
                  <View>
                    <CardTitle style={styles.locationTitle}>
                      {weatherData.location?.name || 'Your Farm'}
                    </CardTitle>
                    <CardDescription style={{ fontFamily: typography.fontFamily.sans }}>
                      {todayStr}
                    </CardDescription>
                  </View>
                  <TouchableOpacity onPress={fetchWeather} style={[styles.refreshBtn, { backgroundColor: colors.secondary }]}>
                    <RefreshCw size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </CardHeader>
              <CardContent>
                <View style={styles.currentBody}>
                  <View style={styles.currentTempRow}>
                    <WeatherIconComponent code={weatherData.current.weatherCode} size={64} color={colors.accent} />
                    <View style={{ marginLeft: spacing[4] }}>
                      <Text style={[styles.tempText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        {Math.round(weatherData.current.temperature)}°C
                      </Text>
                      <Text
                        style={[
                          styles.weatherDesc,
                          { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                        ]}
                      >
                        {getWeatherDescription(weatherData.current.weatherCode)}
                      </Text>
                    </View>
                  </View>

                  {/* Conditions Grid */}
                  <View style={[styles.grid, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
                    <View style={styles.gridItem}>
                      <Droplets size={20} color={colors.primary} style={{ marginBottom: 4 }} />
                      <Text
                        style={[
                          styles.gridLabel,
                          { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                        ]}
                      >
                        Humidity
                      </Text>
                      <Text
                        style={[
                          styles.gridVal,
                          { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                        ]}
                      >
                        {weatherData.current.humidity}%
                      </Text>
                    </View>

                    <View style={styles.gridItem}>
                      <Wind size={20} color={colors.primary} style={{ marginBottom: 4 }} />
                      <Text
                        style={[
                          styles.gridLabel,
                          { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                        ]}
                      >
                        Wind Speed
                      </Text>
                      <Text
                        style={[
                          styles.gridVal,
                          { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                        ]}
                      >
                        {weatherData.current.windSpeed} km/h
                      </Text>
                    </View>

                    {/* Sunrise (if available in payload) */}
                    {(weatherData as any).sunrise && (
                      <View style={styles.gridItem}>
                        <Sunrise size={20} color={colors.primary} style={{ marginBottom: 4 }} />
                        <Text
                          style={[
                            styles.gridLabel,
                            { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                          ]}
                        >
                          Sunrise
                        </Text>
                        <Text
                          style={[
                            styles.gridVal,
                            { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                          ]}
                        >
                          {(weatherData as any).sunrise}
                        </Text>
                      </View>
                    )}

                    {/* Sunset (if available in payload) */}
                    {(weatherData as any).sunset && (
                      <View style={styles.gridItem}>
                        <Sunset size={20} color={colors.primary} style={{ marginBottom: 4 }} />
                        <Text
                          style={[
                            styles.gridLabel,
                            { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                          ]}
                        >
                          Sunset
                        </Text>
                        <Text
                          style={[
                            styles.gridVal,
                            { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                          ]}
                        >
                          {(weatherData as any).sunset}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* 5-Day Forecast Card */}
            <Card style={{ borderColor: colors.border, backgroundColor: colors.card }}>
              <CardHeader>
                <CardTitle>5-Day Forecast</CardTitle>
                {(weatherData as any).summary && (
                  <CardDescription style={{ fontFamily: typography.fontFamily.sans }}>
                    {(weatherData as any).summary}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastRow}>
                  {weatherData.daily?.map((day, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.forecastItem,
                        {
                          backgroundColor: colors.secondary,
                          borderColor: colors.border,
                          borderRadius: borderRadius.md,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.forecastDay,
                          { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold },
                        ]}
                      >
                        {getDayName(day.date)}
                      </Text>
                      <View style={styles.forecastIconBox}>
                        <WeatherIconComponent code={day.weatherCode} size={36} color={colors.accent} />
                      </View>
                      <Text
                        style={[
                          styles.forecastDesc,
                          { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
                        ]}
                        numberOfLines={1}
                      >
                        {getWeatherDescription(day.weatherCode)}
                      </Text>

                      <View style={styles.forecastTemps}>
                        <View style={styles.tempMinMax}>
                          <ThermometerSun size={12} color={colors.destructive} style={{ marginRight: 2 }} />
                          <Text
                            style={[
                              styles.tempValue,
                              { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                            ]}
                          >
                            {Math.round(day.maxTemp)}°
                          </Text>
                        </View>
                        <View style={styles.tempMinMax}>
                          <ThermometerSnowflake size={12} color={colors.info} style={{ marginRight: 2 }} />
                          <Text
                            style={[
                              styles.tempValue,
                              { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                            ]}
                          >
                            {Math.round(day.minTemp)}°
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </CardContent>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  errorCard: {
    borderWidth: 1,
    backgroundColor: '#fef2f2',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  errorTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  statusText: {
    fontSize: 14,
  },
  weatherContainer: {
    gap: 16,
  },
  currentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 20,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentBody: {
    gap: 16,
  },
  currentTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 48,
    lineHeight: 52,
  },
  weatherDesc: {
    fontSize: 16,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  gridItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  gridVal: {
    fontSize: 14,
    marginTop: 1,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  forecastItem: {
    width: 110,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  forecastDay: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  forecastIconBox: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forecastDesc: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    height: 14,
  },
  forecastTemps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  tempMinMax: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempValue: {
    fontSize: 11,
  },
});
