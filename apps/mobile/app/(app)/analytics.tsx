import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subMonths } from 'date-fns';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { BarChart as BarChartIcon, Layers, Info } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { Header } from '../../src/components/ui/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../src/components/ui/Card';
import { getHarvests, getExpenses } from '../../src/services/firestore';
import type { Harvest, Expense } from '../../src/types';

type TimeRange = 'all' | '3m' | '6m' | '12m';

const BAR_COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];
const CATEGORY_COLORS: Record<string, string> = {
  Seeds: '#4ade80',
  Fertilizer: '#fbbf24',
  Labor: '#60a5fa',
  Equipment: '#f97316',
  Other: '#94a3b8',
};

// ── DATA HOOK ──────────────────────────────────────────────────
function useAnalyticsData(userId: string | undefined) {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      const [hData, eData] = await Promise.all([getHarvests(userId), getExpenses(userId)]);
      setHarvests(hData);
      setExpenses(eData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { harvests, expenses, isLoading, isRefreshing, refetch: fetchData };
}

// ── FILTERING HELPER ───────────────────────────────────────────
function filterData(harvests: Harvest[], expenses: Expense[], range: TimeRange) {
  if (range === 'all') return { harvests, expenses };
  const now = new Date();
  const limitDate = subMonths(now, range === '3m' ? 3 : range === '6m' ? 6 : 12);
  return {
    harvests: harvests.filter((h) => new Date(h.harvestDate) >= limitDate),
    expenses: expenses.filter((e) => new Date(e.date) >= limitDate),
  };
}

// ── CROP PERFORMANCE CHART COMPONENT ───────────────────────────
function CropPerformanceChart({ harvests }: { harvests: Harvest[] }) {
  const { colors, spacing, typography } = useTheme();
  const barData = useMemo(() => {
    const dataByCrop: Record<string, number> = {};
    harvests.forEach((h) => {
      let qty = h.quantity;
      if (h.unit === 'quintal') qty *= 100;
      if (h.unit === 'tonne') qty *= 1000;
      dataByCrop[h.cropName] = (dataByCrop[h.cropName] ?? 0) + qty;
    });
    return Object.entries(dataByCrop).map(([name, val], idx) => ({
      value: val,
      label: name.length > 8 ? `${name.substring(0, 6)}..` : name,
      frontColor: BAR_COLORS[idx % BAR_COLORS.length],
      topLabelComponent: () => (
        <Text style={{ color: colors.foreground, fontSize: 9, marginBottom: 2 }}>{val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${val}k`}</Text>
      ),
    }));
  }, [harvests, colors]);

  if (barData.length === 0) {
    return <Text style={[styles.emptyChartText, { color: colors.mutedForeground }]}>No harvest data for this period.</Text>;
  }

  return (
    <View style={{ paddingVertical: spacing[2], alignItems: 'center' }}>
      <BarChart
        data={barData}
        barWidth={28}
        spacing={24}
        noOfSections={4}
        yAxisThickness={1}
        xAxisThickness={1}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 9 }}
        hideRules
      />
    </View>
  );
}

// ── EXPENSE BREAKDOWN CHART COMPONENT ──────────────────────────
function ExpenseBreakdownChart({ expenses }: { expenses: Expense[] }) {
  const { colors, spacing } = useTheme();
  const pieData = useMemo(() => {
    const sums: Record<string, number> = {};
    expenses.forEach((e) => {
      sums[e.category] = (sums[e.category] ?? 0) + e.amount;
    });
    const total = Object.values(sums).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(sums).map(([cat, val]) => ({
      value: val,
      color: CATEGORY_COLORS[cat] || '#ccc',
      text: `${Math.round((val / total) * 100)}%`,
    }));
  }, [expenses]);

  if (pieData.length === 0) {
    return <Text style={[styles.emptyChartText, { color: colors.mutedForeground }]}>No expense data for this period.</Text>;
  }

  return (
    <View style={{ paddingVertical: spacing[4], alignItems: 'center', gap: spacing[4] }}>
      <PieChart data={pieData} radius={70} textBackgroundRadius={15} showText textColor={colors.foreground} textSize={10} />
      <View style={styles.legendContainer}>
        {Object.keys(CATEGORY_COLORS).map((cat) => (
          <View key={cat} style={styles.legendItem}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: CATEGORY_COLORS[cat] }} />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{cat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── TIMEFRAME SELECTOR COMPONENT ───────────────────────────────
interface TimeframeSelectorProps {
  value: TimeRange;
  onChange: (val: TimeRange) => void;
}
function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  const { colors, borderRadius } = useTheme();
  const ranges: { label: string; value: TimeRange }[] = [
    { label: 'All Time', value: 'all' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '12M', value: '12m' },
  ];
  return (
    <View style={[styles.selectorContainer, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
      {ranges.map((r) => {
        const active = value === r.value;
        return (
          <TouchableOpacity
            key={r.value}
            onPress={() => onChange(r.value)}
            style={[styles.selectorTab, active && { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
          >
            <Text style={[styles.selectorText, { color: active ? colors.primaryForeground : colors.mutedForeground, fontWeight: active ? '700' : '500' }]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── MAIN ANALYTICS SCREEN ──────────────────────────────────────
export default function AnalyticsScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const { harvests, expenses, isLoading, isRefreshing, refetch } = useAnalyticsData(user?.uid);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const { harvests: filteredHarvests, expenses: filteredExpenses } = useMemo(
    () => filterData(harvests, expenses, timeRange),
    [harvests, expenses, timeRange]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Analytics" subtitle="Visualize farm performance & expenses" />
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const hasData = harvests.length > 0 || expenses.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Analytics" subtitle="Visualize farm performance & expenses" />
      <ScrollView
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <TimeframeSelector value={timeRange} onChange={setTimeRange} />

        {!hasData ? (
          <Card style={{ backgroundColor: colors.card, borderColor: colors.border, padding: spacing[8], alignItems: 'center' }}>
            <Layers size={40} color={colors.mutedForeground} style={{ marginBottom: spacing[3] }} />
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>No Analytics Data</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
              Start by adding crops, expenses, or harvest records to visualize statistics.
            </Text>
          </Card>
        ) : (
          <>
            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle>Crop Performance</CardTitle>
                <CardDescription>Total yield (in kg) per crop type.</CardDescription>
              </CardHeader>
              <CardContent><CropPerformanceChart harvests={filteredHarvests} /></CardContent>
            </Card>

            <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Total spending by category.</CardDescription>
              </CardHeader>
              <CardContent><ExpenseBreakdownChart expenses={filteredExpenses} /></CardContent>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorContainer: {
    flexDirection: 'row',
    padding: 4,
    width: '100%',
  },
  selectorTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 12,
  },
  emptyChartText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 13,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
