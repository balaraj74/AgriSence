import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDashboardStats } from '../../../src/hooks/useFarmerContext';
import { Card, CardContent } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import {
  Sprout,
  HeartPulse,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  CloudSun,
  User,
  Bell,
  ChevronRight,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const { stats, isLoading, refetch } = useDashboardStats(user?.uid);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const quickTools = [
    {
      name: 'Disease Check',
      desc: 'Scan crops with camera',
      icon: HeartPulse,
      href: '/(app)/disease-check' as const,
      color: colors.success,
    },
    {
      name: 'AI Chatbot',
      desc: 'Ask AgriSence AI',
      icon: Sparkles,
      href: '/(app)/chatbot' as const,
      color: colors.info,
    },
    {
      name: 'Market Prices',
      desc: 'View price forecasts',
      icon: TrendingUp,
      href: '/(app)/market' as const,
      color: colors.accent,
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.navbar, { borderBottomColor: colors.border }]}>
        <View style={styles.navLeft}>
          <Sprout size={28} color={colors.primary} />
          <Text style={[styles.brandText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
            AgriSence
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity
            style={[styles.navButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Bell size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing[4], paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: spacing[6] }}>
          <Text style={[styles.welcomeText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
            Welcome Back,
          </Text>
          <Text style={[styles.usernameText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
            {user?.displayName || 'Farmer Partner'}
          </Text>
        </View>

        {/* Weather Preview Banner */}
        <Card style={{ marginBottom: spacing[6] }}>
          <CardContent style={[styles.weatherBanner, { padding: spacing[4] }]}>
            <View>
              <Text style={[styles.weatherTemp, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                28°C
              </Text>
              <Text style={[styles.weatherStatus, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                Scattered Clouds • Hassan
              </Text>
              <Text style={[styles.weatherAdvice, { color: colors.success, fontFamily: typography.fontFamily.sansMedium, marginTop: spacing[2] }]}>
                Ideal day for weed control.
              </Text>
            </View>
            <CloudSun size={64} color={colors.accent} style={styles.weatherIcon} />
          </CardContent>
        </Card>

        {/* Dashboard Metrics Grid */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold, marginBottom: spacing[3] }]}>
          Farm Overview
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing[6] }} />
        ) : (
          <View style={styles.grid}>
            <Card style={styles.gridCard}>
              <CardContent style={[styles.cardContent, { padding: spacing[3] }]}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15` }]}>
                  <Sprout size={20} color={colors.primary} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Active Crops
                </Text>
                <Text style={[styles.cardValue, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  {stats?.activeCrops ?? 0}
                </Text>
              </CardContent>
            </Card>

            <Card style={styles.gridCard}>
              <CardContent style={[styles.cardContent, { padding: spacing[3] }]}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.success}15` }]}>
                  <HeartPulse size={20} color={colors.success} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Health Score
                </Text>
                <Text style={[styles.cardValue, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  {stats?.healthScore ?? 100}%
                </Text>
              </CardContent>
            </Card>

            <Card style={styles.gridCard}>
              <CardContent style={[styles.cardContent, { padding: spacing[3] }]}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.accent}15` }]}>
                  <TrendingUp size={20} color={colors.accent} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Yield Forecast
                </Text>
                <Text style={[styles.cardValue, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  {stats?.yieldForecast ?? 'N/A'}
                </Text>
              </CardContent>
            </Card>

            <Card style={styles.gridCard}>
              <CardContent style={[styles.cardContent, { padding: spacing[3] }]}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.error}15` }]}>
                  <DollarSign size={20} color={colors.error} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  This Month
                </Text>
                <Text style={[styles.cardValue, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  ₹{(stats?.monthlyExpenses ?? 0).toLocaleString('en-IN')}
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Quick Actions List */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold, marginTop: spacing[6], marginBottom: spacing[3] }]}>
          Quick Actions
        </Text>
        <View style={{ gap: spacing[3] }}>
          {quickTools.map((tool, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(tool.href)}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconBox, { backgroundColor: `${tool.color}15` }]}>
                  <tool.icon size={22} color={tool.color} />
                </View>
                <View>
                  <Text style={[styles.actionName, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                    {tool.name}
                  </Text>
                  <Text style={[styles.actionDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {tool.desc}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  navbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
  },
  usernameText: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  weatherBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 32,
    lineHeight: 38,
  },
  weatherStatus: {
    fontSize: 14,
  },
  weatherAdvice: {
    fontSize: 13,
  },
  weatherIcon: {
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    minWidth: '45%',
  },
  cardContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
  },
  cardValue: {
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionName: {
    fontSize: 15,
  },
  actionDesc: {
    fontSize: 12,
  },
});
