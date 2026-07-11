import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme';
import {
  ChevronRight,
  Stethoscope,
  Satellite,
  Video,
  TestTube,
  HeartPulse,
  Landmark,
  Handshake,
  CloudSun,
  LineChart,
  ScrollText,
  FileText,
  MapPin,
  Wrench,
} from 'lucide-react-native';

export default function ToolsHubScreen() {
  const router = useRouter();
  const { colors, typography, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const toolCategories = [
    {
      title: 'Crop Diagnosis',
      desc: 'Identify crop diseases from images',
      icon: Stethoscope,
      href: '/(app)/disease-check' as const,
      color: '#10b981',
    },
    {
      title: 'Satellite Health',
      desc: 'Monitor crop health via satellite',
      icon: Satellite,
      href: '/(app)/satellite-health' as const,
      color: '#0ea5e9',
    },
    {
      title: 'Live Farm Advisor',
      desc: 'Get real-time AI advice via video',
      icon: Video,
      href: '/(app)/live-advisor' as const,
      color: '#f59e0b',
    },
    {
      title: 'Soil Advisor',
      desc: 'Get fertilizer advice from soil data',
      icon: TestTube,
      href: '/(app)/soil-advisor' as const,
      color: '#ff7a00',
    },
    {
      title: 'Medicinal Plants',
      desc: 'Identify medicinal plants with camera',
      icon: HeartPulse,
      href: '/(app)/medicinal-plants' as const,
      color: '#34d399',
    },
    {
      title: 'Loan & Insurance',
      desc: 'Check eligibility for loans and schemes',
      icon: Landmark,
      href: '/(app)/loan-assistant' as const,
      color: '#818cf8',
    },
    {
      title: 'Market Matchmaking',
      desc: 'Find the best buyers for your crops',
      icon: Handshake,
      href: '/(app)/market-matchmaking' as const,
      color: '#f59e0b',
    },
    {
      title: 'Weather Forecast',
      desc: 'Get real-time weather information',
      icon: CloudSun,
      href: '/(app)/weather' as const,
      color: '#2563eb',
    },
    {
      title: 'Market Prices',
      desc: 'Track prices of key crops by region',
      icon: LineChart,
      href: '/(app)/market' as const,
      color: '#c084fc',
    },
    {
      title: 'Government Schemes',
      desc: 'Find relevant agricultural schemes',
      icon: ScrollText,
      href: '/(app)/schemes' as const,
      color: '#fb7185',
    },
    {
      title: 'Land Records',
      desc: 'Access official land record details',
      icon: FileText,
      href: '/(app)/land-records' as const,
      color: '#8899aa',
    },
    {
      title: 'Fertilizer Finder',
      desc: 'Locate nearby fertilizer shops',
      icon: MapPin,
      href: '/(app)/fertilizer-finder' as const,
      color: '#d97706',
    },
  ];

  const cardBg = isDark ? '#141820' : '#ffffff';
  const cardBorder = isDark ? '#1e2533' : '#f0f2f6';
  const screenBg = isDark ? '#0f1117' : '#f4f6f9';

  return (
    <View style={[styles.safe, { backgroundColor: screenBg }]}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: screenBg, paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.headerIconBox, { backgroundColor: '#ff7a0015' }]}>
            <Wrench size={24} color="#ff7a00" />
          </View>
          <View>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
              ]}
            >
              Farming Tools
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
              ]}
            >
              Smart AI modules to optimise yields
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
          paddingTop: 8,
          gap: 12,
        }}
      >
        {toolCategories.map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() => router.push(item.href)}
            android_ripple={{ color: `${item.color}15`, borderless: false }}
            style={({ pressed }) => ({
              borderRadius: 18,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              style={[
                styles.glassCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDark ? 0 : 0.07,
                      shadowRadius: 10,
                    },
                    android: { elevation: isDark ? 0 : 3 },
                  }),
                },
              ]}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={24} color={item.color} />
                </View>
                <View style={styles.cardTextContent}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.cardDesc,
                      { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
                <View style={[styles.chevronBox, { backgroundColor: isDark ? '#1a2030' : '#f4f6f9' }]}>
                  <ChevronRight size={16} color={colors.mutedForeground} />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  glassCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
