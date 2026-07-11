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
  ClipboardList,
  Sprout,
  DollarSign,
  TrendingUp,
  MapPin,
  FileText,
  ChevronRight,
  BarChart3,
} from 'lucide-react-native';

export default function RecordsHubScreen() {
  const router = useRouter();
  const { colors, typography, spacing, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const recordCategories = [
    {
      title: 'Crops Management',
      desc: 'Track planted dates, growth logs & notes',
      icon: Sprout,
      href: '/(app)/crops' as const,
      color: '#10b981',
    },
    {
      title: 'Expenses Tracker',
      desc: 'Log seed, labor, equipment & fertilizer costs',
      icon: DollarSign,
      href: '/(app)/expenses' as const,
      color: '#ef4444',
    },
    {
      title: 'Harvest Records',
      desc: 'Record total crop yields, units & sell notes',
      icon: TrendingUp,
      href: '/(app)/harvest' as const,
      color: '#f59e0b',
    },
    {
      title: 'Field Mapping',
      desc: 'Draw boundary pins & size estimations via map',
      icon: MapPin,
      href: '/(app)/field-mapping' as const,
      color: '#2563eb',
    },
    {
      title: 'Land Records',
      desc: 'Access legal titles, survey numbers & details',
      icon: FileText,
      href: '/(app)/land-records' as const,
      color: '#8b5cf6',
    },
    {
      title: 'Analytics',
      desc: 'Visualise your farm performance metrics',
      icon: BarChart3,
      href: '/(app)/analytics' as const,
      color: '#0ea5e9',
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
          <View style={[styles.headerIconBox, { backgroundColor: '#10b98115' }]}>
            <ClipboardList size={24} color="#10b981" />
          </View>
          <View>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
              ]}
            >
              Farm Records
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
              ]}
            >
              Log, measure, and analyze activities
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8, gap: 12 }}
      >
        {recordCategories.map((item, idx) => (
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
