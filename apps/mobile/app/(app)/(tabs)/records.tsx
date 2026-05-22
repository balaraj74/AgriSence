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
  ClipboardList,
  Sprout,
  DollarSign,
  TrendingUp,
  MapPin,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

export default function RecordsHubScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const recordCategories = [
    {
      title: 'Crops Management',
      desc: 'Track planted dates, growth logs & notes',
      icon: Sprout,
      href: '/(app)/crops' as const,
      color: colors.success,
    },
    {
      title: 'Expenses Tracker',
      desc: 'Log seed, labor, equipment & fertilizer costs',
      icon: DollarSign,
      href: '/(app)/expenses' as const,
      color: colors.destructive,
    },
    {
      title: 'Harvest Records',
      desc: 'Record total crop yields, units & sell notes',
      icon: TrendingUp,
      href: '/(app)/harvest' as const,
      color: colors.accent,
    },
    {
      title: 'Field Mapping',
      desc: 'Draw boundary pins & size estimations via map',
      icon: MapPin,
      href: '/(app)/field-mapping' as const,
      color: colors.info,
    },
    {
      title: 'Land Records',
      desc: 'Access legal titles, survey numbers & details',
      icon: FileText,
      href: '/(app)/land-records' as const,
      color: colors.mutedForeground,
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <ClipboardList size={28} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
            Farm Records
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
          Log, measure, and analyze your field activities.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[4] }}>
        {recordCategories.map((item, idx) => (
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
