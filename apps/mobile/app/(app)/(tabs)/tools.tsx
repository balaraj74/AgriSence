import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Card, CardHeader, CardTitle, CardDescription } from '../../../src/components/ui/Card';
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
  const { colors, typography, spacing } = useTheme();

  const toolCategories = [
    {
      title: 'Crop Diagnosis',
      desc: 'Identify crop diseases from images',
      icon: Stethoscope,
      href: '/(app)/disease-check' as const,
      color: colors.success,
    },
    {
      title: 'Satellite Health',
      desc: 'Monitor crop health via satellite',
      icon: Satellite,
      href: '/(app)/satellite-health' as const,
      color: colors.cyan400,
    },
    {
      title: 'Live Farm Advisor',
      desc: 'Get real-time AI advice via video',
      icon: Video,
      href: '/(app)/live-advisor' as const,
      color: colors.accent,
    },
    {
      title: 'Soil Advisor',
      desc: 'Get fertilizer advice from soil data',
      icon: TestTube,
      href: '/(app)/soil-advisor' as const,
      color: colors.primary,
    },
    {
      title: 'Medicinal Plants',
      desc: 'Identify medicinal plants with your camera',
      icon: HeartPulse,
      href: '/(app)/medicinal-plants' as const,
      color: colors.emerald400,
    },
    {
      title: 'Loan & Insurance',
      desc: 'Check eligibility for loans and schemes',
      icon: Landmark,
      href: '/(app)/loan-assistant' as const,
      color: colors.indigo400,
    },
    {
      title: 'Market Matchmaking',
      desc: 'Find the best buyers for your crops',
      icon: Handshake,
      href: '/(app)/market-matchmaking' as const,
      color: colors.amber500,
    },
    {
      title: 'Weather Forecast',
      desc: 'Get real-time weather information',
      icon: CloudSun,
      href: '/(app)/weather' as const,
      color: colors.info,
    },
    {
      title: 'Market Prices',
      desc: 'Track prices of key crops by region',
      icon: LineChart,
      href: '/(app)/market' as const,
      color: colors.purple400,
    },
    {
      title: 'Government Schemes',
      desc: 'Find relevant agricultural schemes',
      icon: ScrollText,
      href: '/(app)/schemes' as const,
      color: colors.rose400,
    },
    {
      title: 'Land Records',
      desc: 'Access official land record details',
      icon: FileText,
      href: '/(app)/land-records' as const,
      color: colors.mutedForeground,
    },
    {
      title: 'Fertilizer Finder',
      desc: 'Locate nearby fertilizer shops',
      icon: MapPin,
      href: '/(app)/fertilizer-finder' as const,
      color: colors.warning,
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Wrench size={28} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
            Farming Tools
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
          Access smart modules & AI advisors to optimize yields.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[4] }}>
        {toolCategories.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(item.href)}
            activeOpacity={0.7}
            style={styles.cardWrapper}
          >
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={24} color={item.color} />
                </View>
                <View style={styles.cardTextContent}>
                  <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {item.desc}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.mutedForeground} style={styles.chevron} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
