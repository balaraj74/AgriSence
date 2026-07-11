import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
  Image,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  Animated,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../../src/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDashboardStats } from '../../../src/hooks/useFarmerContext';
import { getFields } from '../../../src/services/firestore';
import {
  Sprout,
  HeartPulse,
  TrendingUp,
  DollarSign,
  Sparkles,
  CloudSun,
  ChevronRight,
  Search,
  MapPin,
  Star,
  Heart,
  ArrowUpRight,
  ChevronDown,
  Sun,
  Droplets,
  Wind,
  Thermometer,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── Static data ────────────────────────────────────────────────────────────
const DEFAULT_CROPS = [
  { name: 'Wheat',  image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=150', color: '#f59e0b' },
  { name: 'Grapes', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=150', color: '#8b5cf6' },
  { name: 'Potato', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=150', color: '#d97706' },
  { name: 'Mango',  image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=150', color: '#eab308' },
  { name: 'Corn',   image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=150', color: '#10b981' },
  { name: 'Rice',   image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=150', color: '#0ea5e9' },
];

const FALLBACK_FIELDS = [
  {
    id: 'f1',
    fieldName: 'Emerald Valley Plot F5',
    area: 4.5,
    surveyNumber: 'SR-773',
    village: 'Hassan',
    coordinatesText: '12.9343 N | 77.5347 E',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800',
    rating: '4.5',
    crop: 'Wheat',
  },
  {
    id: 'f2',
    fieldName: 'Golden Harvest Zone A',
    area: 6.2,
    surveyNumber: 'SR-892',
    village: 'Hassan',
    coordinatesText: '13.0638 N | 76.1557 E',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800',
    rating: '4.8',
    crop: 'Paddy',
  },
  {
    id: 'f3',
    fieldName: 'Riverbank Terraces',
    area: 3.8,
    surveyNumber: 'SR-102',
    village: 'Salagame',
    coordinatesText: '13.1251 N | 76.0841 E',
    image: 'https://images.unsplash.com/photo-1627920757717-d2e46d88f6a9?q=80&w=800',
    rating: '4.3',
    crop: 'Sugarcane',
  },
];

// ─── Initials Avatar ─────────────────────────────────────────────────────────
function InitialsAvatar({ name }: { name: string }) {
  const cleanName = (name || 'Farmer').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = '';
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    const firstChar = parts[0][0] || '';
    const lastChar = parts[parts.length - 1]![0] || '';
    initials = `${firstChar}${lastChar}`.toUpperCase();
  } else if (parts[0]) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else {
    initials = 'FA';
  }
  return (
    <View style={avatarStyles.container}>
      <Text style={avatarStyles.text}>{initials}</Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ff7a00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

// ─── Field Card Item Component ──────────────────────────────────────────────
interface FieldCardItemProps {
  field: any;
  isFav: boolean;
  onToggleFav: () => void;
  onPress: () => void;
  isDark: boolean;
  typography: any;
}

function FieldCardItem({ field, isFav, onToggleFav, onPress, isDark, typography }: FieldCardItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const glassBg = isDark ? 'rgba(20,24,32,0.92)' : 'rgba(255,255,255,0.92)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <Animated.View
      style={[
        styles.fieldCardContainer,
        {
          transform: [{ scale: scaleAnim }],
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.3 : 0.12,
              shadowRadius: 10,
            },
            android: {
              elevation: 6,
            },
          }),
        },
      ]}
    >
      <View style={styles.fieldCardInner}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ flex: 1 }}
        >
          <ImageBackground
            source={{ uri: field.image }}
            style={styles.fieldBg}
          >
            {/* Top row */}
            <View style={styles.fieldTop}>
              <View style={styles.ratingPill}>
                <Star size={11} color="#fbbf24" fill="#fbbf24" />
                <Text style={[styles.ratingTxt, { fontFamily: typography.fontFamily.sansBold }]}> {field.rating}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={onToggleFav} style={styles.heartBtn}>
                <Heart size={17} color={isFav ? '#ef4444' : '#fff'} fill={isFav ? '#ef4444' : 'transparent'} />
              </TouchableOpacity>
            </View>

            {/* Glassmorphic info footer */}
            <View style={[styles.fieldGlassFooter, { backgroundColor: glassBg, borderColor: glassBorder }]}>
              <View style={styles.fieldGlassInner}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.fieldCoord, { fontFamily: typography.fontFamily.sans, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]} numberOfLines={1}>
                    📍 {field.coordinatesText}
                  </Text>
                  <Text
                    style={[styles.fieldName, { fontFamily: typography.fontFamily.sansBold, color: isDark ? '#ffffff' : '#1f2937' }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {field.fieldName}
                  </Text>
                  <View style={styles.fieldMeta}>
                    <View style={[styles.cropTag, { backgroundColor: '#ff7a0018' }]}>
                      <Sprout size={10} color="#ff7a00" />
                      <Text style={[styles.cropTagText, { fontFamily: typography.fontFamily.sansMedium, color: '#ff7a00' }]}>
                        {field.crop ?? 'Mixed Crop'}
                      </Text>
                    </View>
                    <Text style={[styles.areaTag, { fontFamily: typography.fontFamily.sansMedium, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                      📐 {parseFloat(Number(field.area).toFixed(2))} ac
                    </Text>
                  </View>
                </View>
                <View
                  style={[styles.arrowBtn, { backgroundColor: '#ff7a00' }]}
                >
                  <ArrowUpRight size={18} color="#ffffff" />
                </View>
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, typography, spacing, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const { stats, context, isLoading, refetch } = useDashboardStats(user?.uid);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ f1: true, f3: true });
  const [selectedDayId, setSelectedDayId] = useState(2);

  // Firestore fields
  const { data: fieldsList, refetch: refetchFields } = useQuery({
    queryKey: ['fields-list', user?.uid],
    queryFn: () => (user?.uid ? getFields(user.uid) : Promise.resolve([])),
    enabled: !!user?.uid,
  });

  // 6-day weather timeline
  const weatherDays = React.useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseTemp = 28;
    return Array.from({ length: 6 }, (_, i) => {
      const offset = i - 2;
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return {
        id: i,
        day: dayNames[d.getDay()]!,
        dayNum: d.getDate().toString().padStart(2, '0'),
        dateStr: `${dayNames[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        temp: baseTemp + offset * 2,
        humidity: 62 + offset * 3,
        wind: 12 + Math.abs(offset) * 2,
        weatherStatus: offset === 0 ? 'Bright & Sunny' : offset % 2 === 0 ? 'Partly Cloudy' : 'Light Showers',
        advice: offset === 0 ? 'Stable for plant growth' : offset % 2 === 0 ? 'Ideal for spraying' : 'Rain expected',
        icon: offset % 2 === 0 ? Sun : CloudSun,
        isToday: offset === 0,
      };
    });
  }, []);

  const activeDay = weatherDays[selectedDayId] ?? weatherDays[2]!;

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFields()]);
    setRefreshing(false);
  };

  const toggleFavorite = (id: string) =>
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLocationTarget = () =>
    Alert.alert('Location', 'Navigating to your nearest field.', [
      { text: 'OK', onPress: () => router.push('/(app)/field-mapping') },
    ]);

  // Merge DB fields with fallback visuals
  const finalFields = React.useMemo(() => {
    if (fieldsList && fieldsList.length > 0) {
      return fieldsList.map((f, i) => {
        const fb = FALLBACK_FIELDS[i % FALLBACK_FIELDS.length]!;
        return {
          id: f.id,
          fieldName: f.fieldName,
          area: parseFloat(f.area.toFixed(2)),
          village: f.village,
          coordinatesText: f.centroid
            ? `${f.centroid.latitude.toFixed(4)} N | ${f.centroid.longitude.toFixed(4)} E`
            : fb.coordinatesText,
          image: fb.image,
          rating: (4.2 + (i * 0.2) % 0.8).toFixed(1),
          crop: fb.crop,
        };
      });
    }
    return FALLBACK_FIELDS;
  }, [fieldsList]);

  const filteredFields = finalFields.filter(
    f =>
      f.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.village.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Crop filter list
  const activeCropNames = context?.crops?.names ?? [];
  const cropItems =
    activeCropNames.length > 0
      ? activeCropNames.map(name => {
          const m = DEFAULT_CROPS.find(c => c.name.toLowerCase() === name.toLowerCase());
          return { name, image: m?.image ?? DEFAULT_CROPS[0]!.image, color: m?.color ?? colors.primary };
        })
      : DEFAULT_CROPS;

  const quickTools = [
    { name: 'Disease Check', desc: 'Scan crops with camera',  icon: HeartPulse, href: '/(app)/disease-check' as const, color: '#10b981' },
    { name: 'AI Chatbot',    desc: 'Ask AgriSence AI',        icon: Sparkles,   href: '/(app)/chatbot'       as const, color: '#8b5cf6' },
    { name: 'Market Prices', desc: 'View price forecasts',    icon: TrendingUp, href: '/(app)/market'        as const, color: '#f59e0b' },
  ];

  // Avatar
  const hasPhoto = !!user?.photoURL;
  const displayName = user?.displayName ?? 'Farmer';
  const firstName = displayName.split(' ')[0] ?? displayName;

  const screenBg = isDark ? '#0f1117' : '#f4f6f9';

  return (
    <View style={[styles.root, { backgroundColor: screenBg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ff7a00"
            progressViewOffset={insets.top + 10}
          />
        }
      >
        {/* ── FULL-BLEED HEADER ─────────────────────────────────────────── */}
        <View style={styles.headerWrapper}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200' }}
            style={styles.headerBg}
            resizeMode="cover"
          >
            {/* Gradient overlay */}
            <View style={[styles.headerOverlay, { paddingTop: insets.top + 14 }]}>

              {/* Profile row */}
              <View style={styles.profileRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helloText, { fontFamily: typography.fontFamily.sansSemiBold }]}>
                    Hello {firstName} 👋
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} style={styles.dateRow}>
                    <Text style={[styles.dateText, { fontFamily: typography.fontFamily.sans }]}>
                      {activeDay.dateStr}
                    </Text>
                    <ChevronDown size={13} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>

                {/* Avatar — photo or initials */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/profile')}
                  style={styles.avatarRing}
                >
                  {hasPhoto ? (
                    <Image source={{ uri: user!.photoURL! }} style={styles.avatarImg} />
                  ) : (
                    <InitialsAvatar name={displayName} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Slogan */}
              <Text style={[styles.slogan, { fontFamily: typography.fontFamily.sansBold }]}>
                Farming Made Simple,{'\n'}Smarter, and Sustainable
              </Text>

              {/* Search bar */}
              <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                  <Search size={18} color="rgba(255,255,255,0.75)" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { fontFamily: typography.fontFamily.sans }]}
                    placeholder="Search fields..."
                    placeholderTextColor="rgba(255,255,255,0.65)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <TouchableOpacity activeOpacity={0.85} onPress={handleLocationTarget} style={styles.locationBtn}>
                  <MapPin size={20} color="#1f2937" />
                </TouchableOpacity>
              </View>

              {/* ── Glass Weather Card ──────────────────────────────────── */}
              <View style={styles.weatherCard}>
                {/* Day pills — horizontal scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPillsRow}>
                  {weatherDays.map(d => {
                    const active = d.id === selectedDayId;
                    const Icon = d.icon;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        onPress={() => setSelectedDayId(d.id)}
                        activeOpacity={0.8}
                        style={[styles.dayPill, active ? styles.dayPillActive : styles.dayPillInactive]}
                      >
                        <Text style={[styles.dayPillName, { fontFamily: typography.fontFamily.sansMedium }, active && styles.whiteText]}>
                          {d.day}
                        </Text>
                        <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.85)'} />
                        <Text style={[styles.dayPillTemp, { fontFamily: typography.fontFamily.sansBold }, active && styles.whiteText]}>
                          {d.temp}°
                        </Text>
                        {d.isToday && (
                          <View style={styles.todayDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Weather summary */}
                <View style={styles.weatherSummaryRow}>
                  <View>
                    <Text style={[styles.wTempText, { fontFamily: typography.fontFamily.sansBold }]}>
                      {activeDay.temp}°C
                    </Text>
                    <Text style={[styles.wDateText, { fontFamily: typography.fontFamily.sansMedium }]}>
                      {activeDay.isToday ? 'Today' : activeDay.day}
                    </Text>
                    <View style={styles.wLabel}>
                      <CloudSun size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={[styles.wLabelText, { fontFamily: typography.fontFamily.sans }]}> {activeDay.weatherStatus}</Text>
                    </View>
                  </View>

                  <View style={styles.wRight}>
                    {/* Humidity */}
                    <View style={styles.weatherMetaRow}>
                      <Droplets size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={[styles.weatherMetaText, { fontFamily: typography.fontFamily.sans }]}>
                        {activeDay.humidity}% Humidity
                      </Text>
                    </View>
                    {/* Wind */}
                    <View style={styles.weatherMetaRow}>
                      <Wind size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={[styles.weatherMetaText, { fontFamily: typography.fontFamily.sans }]}>
                        {activeDay.wind} km/h Wind
                      </Text>
                    </View>
                    {/* Growth badge */}
                    <View style={styles.growthBadge}>
                      <View style={styles.greenDot} />
                      <Text style={[styles.growthText, { fontFamily: typography.fontFamily.sansMedium }]}>
                        {activeDay.advice}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

            </View>
          </ImageBackground>
        </View>

        {/* ── CROPS FILTER ─────────────────────────────────────────────── */}
        <View style={{ marginVertical: 16 }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 16, marginBottom: 10 }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#f0f4f8' : '#1f2937', fontFamily: typography.fontFamily.sansBold }]}>
              Crop Types
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cropsRow}>
            {cropItems.map((crop, idx) => {
              const sel = selectedCrop === crop.name;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCrop(sel ? null : crop.name)}
                  style={[
                    styles.cropChip,
                    sel
                      ? { backgroundColor: '#ff7a00' }
                      : { backgroundColor: isDark ? '#1a2030' : '#ffffff', borderWidth: 1.2, borderColor: isDark ? '#1e2533' : '#e5e7eb' },
                  ]}
                >
                  <View style={styles.cropThumbWrap}>
                    <Image source={{ uri: crop.image }} style={styles.cropThumb} />
                  </View>
                  <Text
                    style={[
                      styles.cropChipLabel,
                      { fontFamily: typography.fontFamily.sansSemiBold },
                      sel ? { color: '#fff' } : { color: isDark ? '#f0f4f8' : '#374151' },
                    ]}
                  >
                    {crop.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── MY FIELDS SLIDER ─────────────────────────────────────────── */}
        <View style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#f0f4f8' : '#1f2937', fontFamily: typography.fontFamily.sansBold }]}>
              My Fields
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/field-mapping')} style={styles.seeAllRow}>
              <Text style={[styles.seeAllText, { fontFamily: typography.fontFamily.sansMedium }]}>See all</Text>
              <ChevronRight size={16} color="#ff7a00" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fieldsRow}>
            {filteredFields.length === 0 ? (
              <View style={[styles.emptyFieldCard, { backgroundColor: isDark ? '#141820' : '#ffffff', borderColor: isDark ? '#1e2533' : '#e5e7eb' }]}>
                <Text style={[styles.emptyFieldText, { color: isDark ? '#8899aa' : '#6b7280', fontFamily: typography.fontFamily.sans }]}>
                  No fields match "{searchQuery}"
                </Text>
              </View>
            ) : (
              filteredFields.map(f => (
                <FieldCardItem
                  key={f.id}
                  field={f}
                  isFav={!!favorites[f.id]}
                  onToggleFav={() => toggleFavorite(f.id)}
                  onPress={() => router.push('/(app)/field-mapping')}
                  isDark={isDark}
                  typography={typography}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* ── FARM INSIGHTS ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f0f4f8' : '#1f2937', fontFamily: typography.fontFamily.sansBold, marginBottom: 12 }]}>
            Farm Insights
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#ff7a00" style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.metricsGrid}>
              {[
                { label: 'Active Crops',   value: String(stats?.activeCrops ?? 0),                         icon: Sprout,     bg: '#4ade8018', fg: '#16a34a' },
                { label: 'Health Score',   value: `${stats?.healthScore ?? 100}%`,                          icon: HeartPulse, bg: '#2dd4bf18', fg: '#0d9488' },
                { label: 'Yield Forecast', value: stats?.yieldForecast ?? 'N/A',                             icon: TrendingUp, bg: '#fbbf2418', fg: '#d97706' },
                { label: 'This Month',     value: `₹${(stats?.monthlyExpenses ?? 0).toLocaleString('en-IN')}`, icon: DollarSign, bg: '#fb718518', fg: '#e11d48' },
              ].map(({ label, value, icon: Icon, bg, fg }) => (
                <View
                  key={label}
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: isDark ? '#141820' : '#ffffff',
                      borderColor: isDark ? '#1e2533' : '#f0f2f6',
                      ...Platform.select({
                        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 8 },
                        android: { elevation: isDark ? 0 : 3 },
                      }),
                    },
                  ]}
                >
                  <View style={[styles.metricIcon, { backgroundColor: bg }]}>
                    <Icon size={20} color={fg} />
                  </View>
                  <Text style={[styles.metricLabel, { color: isDark ? '#8899aa' : '#4b5563', fontFamily: typography.fontFamily.sans }]}>
                    {label}
                  </Text>
                  <Text style={[styles.metricValue, { color: isDark ? '#f0f4f8' : '#1f2937', fontFamily: typography.fontFamily.sansBold }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── QUICK TOOLS ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#f0f4f8' : '#1f2937', fontFamily: typography.fontFamily.sansBold, marginBottom: 12 }]}>
            Quick Tools
          </Text>
          <View style={{ gap: 10 }}>
            {quickTools.map((tool, idx) => (
              <Pressable
                key={idx}
                onPress={() => router.push(tool.href)}
                android_ripple={{ color: 'rgba(255,122,0,0.08)', borderless: false }}
                style={({ pressed }) => [
                  styles.toolRow,
                  {
                    backgroundColor: isDark ? '#141820' : '#ffffff',
                    borderColor: isDark ? '#1e2533' : '#e5e7eb',
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    ...Platform.select({
                      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 6 },
                      android: { elevation: isDark ? 0 : 2 },
                    }),
                  },
                ]}
              >
                <View style={[styles.toolIcon, { backgroundColor: `${tool.color}15` }]}>
                  <tool.icon size={22} color={tool.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toolName, { color: isDark ? '#f0f4f8' : '#1f2937', fontFamily: typography.fontFamily.sansSemiBold }]}>
                    {tool.name}
                  </Text>
                  <Text style={[styles.toolDesc, { color: isDark ? '#8899aa' : '#6b7280', fontFamily: typography.fontFamily.sans }]}>
                    {tool.desc}
                  </Text>
                </View>
                <ChevronRight size={18} color={isDark ? '#8899aa' : '#9ca3af'} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // ── HEADER ──────────────────────────────────────
  headerWrapper: {
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      android: { elevation: 12 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 14 },
    }),
  },
  headerBg: {
    width: '100%',
    minHeight: 580,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 5, 0, 0.35)',
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  helloText: {
    fontSize: 22,
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    overflow: 'hidden',
    marginLeft: 12,
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  slogan: {
    fontSize: 23,
    color: '#ffffff',
    lineHeight: 31,
    letterSpacing: -0.3,
    marginBottom: 22,
  },

  // ── SEARCH ──────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  locationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  // ── WEATHER CARD ────────────────────────────────
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    borderRadius: 24,
    padding: 14,
  },
  dayPillsRow: {
    gap: 8,
    paddingBottom: 14,
  },
  dayPill: {
    width: 56,
    height: 92,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
    position: 'relative',
  },
  dayPillActive: {
    backgroundColor: '#ff7a00',
  },
  dayPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  dayPillName: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
  dayPillTemp: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  whiteText: { color: '#ffffff' },
  todayDot: {
    position: 'absolute',
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  weatherSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 14,
  },
  wDateText: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  wTempText: { fontSize: 34, color: '#ffffff' },
  wLabel: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  wLabelText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  wRight: { alignItems: 'flex-end', gap: 6 },
  weatherMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  weatherMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.18)',
    borderWidth: 1.2,
    borderColor: '#4ade80',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 5,
    marginTop: 2,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  growthText: { fontSize: 11, color: '#ffffff' },

  // ── CROPS ───────────────────────────────────────
  cropsRow: { paddingHorizontal: 16, gap: 10 },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 23,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  cropThumbWrap: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden', marginRight: 7 },
  cropThumb: { width: '100%', height: '100%' },
  cropChipLabel: { fontSize: 13 },

  // ── FIELDS ──────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, letterSpacing: -0.3 },
  seeAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 14, color: '#ff7a00' },
  fieldsRow: { paddingHorizontal: 16, gap: 14 },
  fieldCardContainer: {
    width: width * 0.78,
    height: 220,
  },
  fieldCardInner: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
  },
  fieldBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    padding: 14,
  },
  fieldTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingTxt: { fontSize: 12, color: '#fff' },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Glassmorphic field footer
  fieldGlassFooter: {
    borderRadius: 16,
    borderWidth: 1,
  },
  fieldGlassInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  fieldCoord: { fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  fieldName: { fontSize: 16, color: '#fff', marginTop: 2 },
  fieldMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  cropTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cropTagText: { fontSize: 10, color: '#ff7a00' },
  areaTag: { fontSize: 10, color: 'rgba(255,255,255,0.65)' },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFieldCard: {
    width: 260,
    height: 220,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyFieldText: { fontSize: 14, textAlign: 'center' },

  // ── METRICS ─────────────────────────────────────
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 20 },

  // ── QUICK TOOLS ─────────────────────────────────
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
    gap: 12,
  },
  toolIcon: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  toolName: { fontSize: 15, marginBottom: 1 },
  toolDesc: { fontSize: 12 },
});
