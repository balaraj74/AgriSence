import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import {
  marketPriceSearch,
  predictMarketPrice,
  MarketPriceSearchOutput,
  PredictMarketPriceOutput,
  CropPrice,
} from '../../src/services/ai';
import { useAuth } from '../../src/hooks/useAuth';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { LineChart } from 'react-native-gifted-charts';
import firestore from '@react-native-firebase/firestore';
import { format, parseISO } from 'date-fns';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AreaChart as AreaChartIcon,
  RefreshCw,
  Bot,
  Info,
  HelpCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Trend Indicator Component
const PriceTrend = ({ value }: { value: number }) => {
  const { colors, typography } = useTheme();
  let Icon = Minus;
  let color = colors.mutedForeground;
  if (value > 0) {
    Icon = TrendingUp;
    color = '#4ade80';
  } else if (value < 0) {
    Icon = TrendingDown;
    color = '#f87171';
  }

  return (
    <View style={styles.trendContainer}>
      <Icon size={16} color={color} style={{ marginRight: 2 }} />
      <Text style={[styles.trendText, { color, fontFamily: typography.fontFamily.sansBold }]}>
        {Math.abs(value)}%
      </Text>
    </View>
  );
};

export default function MarketScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, borderRadius } = useTheme();

  // Search state
  const [question, setQuestion] = useState('');
  const [searchResult, setSearchResult] = useState<MarketPriceSearchOutput | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Prediction state
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictMarketPriceOutput | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchPrices = async (userQuery = '') => {
    if (userQuery) {
      setIsSearching(true);
      setSearchError(null);
    } else {
      setIsInitialLoading(true);
    }

    try {
      const result = await marketPriceSearch({ question: userQuery });
      setSearchResult(result);
      if (!userQuery) {
        setLastUpdated(new Date());
      }

      // Save to Firestore for cross-feature integration
      if (user?.uid && result.prices && result.prices.length > 0) {
        const batch = firestore().batch();
        result.prices.forEach((price) => {
          const docRef = firestore()
            .collection('users')
            .doc(user.uid)
            .collection('marketPrices')
            .doc(`${price.cropName.replace(/\s+/g, '_')}_${price.market.replace(/\s+/g, '_')}`);
          batch.set(
            docRef,
            {
              cropName: price.cropName,
              market: price.market,
              price: price.price,
              unit: price.unit,
              trend: price.trend,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        });
        await batch.commit();
      }
    } catch (error: any) {
      console.error('Price fetch error:', error);
      setSearchError('Could not load market prices. Please try again.');
    } finally {
      setIsSearching(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    if (!question.trim() || isSearching) return;
    fetchPrices(question);
  };

  const handlePredict = async () => {
    Keyboard.dismiss();
    if (!selectedCrop.trim() || !selectedMarket.trim()) {
      setPredictionError('Please enter both crop and market names.');
      return;
    }
    setIsPredicting(true);
    setPrediction(null);
    setPredictionError(null);
    try {
      const result = await predictMarketPrice({
        cropName: selectedCrop.trim(),
        marketName: selectedMarket.trim(),
      });
      setPrediction(result);
    } catch (error: any) {
      console.error(error);
      setPredictionError('Could not generate a forecast at this time.');
    } finally {
      setIsPredicting(false);
    }
  };

  const getTrendBadgeStyle = (trend?: string) => {
    if (trend === 'bullish') {
      return { text: '📈 Bullish', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' };
    }
    if (trend === 'bearish') {
      return { text: '📉 Bearish', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
    }
    return { text: '➡️ Stable', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
  };

  const getImpactColor = (impact: string) => {
    if (impact === 'positive') return '#4ade80';
    if (impact === 'negative') return '#f87171';
    return colors.mutedForeground;
  };

  // Configure react-native-gifted-charts configuration dynamically
  const getForecastChartConfig = () => {
    if (!prediction?.forecast || prediction.forecast.length === 0) return { data: [], yAxisOffset: 0, maxValue: 100 };
    const chartData = prediction.forecast.map((f) => {
      let label = '';
      try {
        label = format(parseISO(f.date), 'd MMM');
      } catch {
        label = f.date;
      }
      return {
        value: f.predictedPrice,
        label,
        dataPointText: `₹${f.predictedPrice}`,
      };
    });

    const prices = chartData.map((d) => d.value);
    const maxVal = Math.max(...prices);
    const minVal = Math.min(...prices);
    const diff = maxVal - minVal;
    
    // Setup sensible offset and max to showcase the gradient curve nicely
    const padding = diff > 0 ? diff * 0.2 : minVal * 0.1;
    const yAxisOffset = Math.floor(Math.max(0, minVal - padding));
    const maxValue = Math.ceil(maxVal + padding);

    return {
      data: chartData,
      yAxisOffset,
      maxValue,
    };
  };

  const chartConfig = getForecastChartConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Header
          title="Market Prices"
          subtitle={
            lastUpdated
              ? `Live crop prices • Updated ${format(lastUpdated, 'h:mm a')}`
              : 'Live crop prices'
          }
        />
        <TouchableOpacity
          style={[styles.refreshBtn, { borderColor: colors.border }]}
          onPress={() => fetchPrices()}
          disabled={isInitialLoading || isSearching}
        >
          <RefreshCw size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 7-Day Price Forecast Section */}
        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <CardTitle>
              <View style={styles.titleRow}>
                <AreaChartIcon size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.titleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  7-Day Price Forecast
                </Text>
              </View>
            </CardTitle>
            <CardDescription>
              AI-powered price predictions based on seasonal patterns and market indices.
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.predictForm}>
              <View style={styles.predictInput}>
                <Input
                  placeholder="Crop (e.g. Wheat)"
                  value={selectedCrop}
                  onChangeText={setSelectedCrop}
                />
              </View>
              <View style={styles.predictInput}>
                <Input
                  placeholder="Market (e.g. Delhi)"
                  value={selectedMarket}
                  onChangeText={setSelectedMarket}
                />
              </View>
              <Button
                label="Forecast"
                onPress={handlePredict}
                disabled={isPredicting}
                isLoading={isPredicting}
                style={styles.predictBtn}
              />
            </View>

            {predictionError && (
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: typography.fontFamily.sans }]}>
                {predictionError}
              </Text>
            )}

            {prediction && !isPredicting && (
              <View style={styles.predictionDetails}>
                {/* Price Metrics Badges */}
                <View style={[styles.predictionStats, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <View>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      Current Price
                    </Text>
                    <Text style={[styles.statValue, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      ₹{prediction.currentPrice.toLocaleString('en-IN')}
                      <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>/q</Text>
                    </Text>
                  </View>

                  {(() => {
                    const badge = getTrendBadgeStyle(prediction.trendDirection);
                    return (
                      <View style={[styles.badgeContainer, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.badgeText, { color: badge.color, fontFamily: typography.fontFamily.sansBold }]}>
                          {badge.text}
                        </Text>
                      </View>
                    );
                  })()}

                  <View style={[styles.badgeContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fontFamily.sansBold }]}>
                      {prediction.expectedChange && prediction.expectedChange >= 0 ? '+' : ''}
                      {prediction.expectedChange?.toFixed(1)}% in 7d
                    </Text>
                  </View>
                </View>

                {/* Forecast Chart */}
                {chartConfig.data.length > 0 && (
                  <View style={styles.chartWrapper}>
                    <LineChart
                      data={chartConfig.data}
                      width={width - 64}
                      height={160}
                      curved
                      color={colors.primary}
                      thickness={3}
                      startFillColor={colors.primary}
                      endFillColor="transparent"
                      startOpacity={0.2}
                      endOpacity={0.01}
                      areaChart
                      noOfSections={4}
                      yAxisColor={colors.border}
                      xAxisColor={colors.border}
                      yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 9 }}
                      xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 9 }}
                      yAxisLabelWidth={40}
                      yAxisOffset={chartConfig.yAxisOffset}
                      maxValue={chartConfig.maxValue}
                      rulesType="dashed"
                      rulesColor={`${colors.border}20`}
                      pointerConfig={{
                        pointerColor: colors.primary,
                        pointerLabelComponent: (items: any) => {
                          if (!items || items.length === 0) return null;
                          return (
                            <View style={[styles.tooltip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                              <Text style={[styles.tooltipText, { color: colors.foreground }]}>
                                ₹{items[0].value.toFixed(0)}
                              </Text>
                            </View>
                          );
                        },
                      }}
                    />
                  </View>
                )}

                {/* Recommendation Alert */}
                {prediction.recommendation && (
                  <View style={[styles.recommendationAlert, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
                    <Text style={[styles.recommendationTitle, { color: colors.primary, fontFamily: typography.fontFamily.sansBold }]}>
                      💡 Farmer Advice
                    </Text>
                    <Text style={[styles.recommendationBody, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                      {prediction.recommendation}
                    </Text>
                  </View>
                )}

                {/* Forecast List Table */}
                <View style={styles.forecastList}>
                  <Text style={[styles.sectionHeading, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Daily Price Forecast Table
                  </Text>
                  {prediction.forecast.map((item, idx) => (
                    <View key={idx} style={[styles.forecastRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.rowDate, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                        {format(parseISO(item.date), 'EEE, MMM d')}
                      </Text>
                      <Text style={[styles.rowPrice, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        ₹{item.predictedPrice.toLocaleString('en-IN')}
                        <Text style={styles.rowUnit}>/quintal</Text>
                      </Text>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor:
                            item.confidence === 'high'
                              ? 'rgba(74, 222, 128, 0.3)'
                              : item.confidence === 'medium'
                              ? 'rgba(251, 191, 36, 0.3)'
                              : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color:
                              item.confidence === 'high'
                                ? '#4ade80'
                                : item.confidence === 'medium'
                                ? '#fbbf24'
                                : colors.mutedForeground,
                          }}
                        >
                          {item.confidence || 'medium'}
                        </Text>
                      </Badge>
                    </View>
                  ))}
                </View>

                {/* Factors Analysis */}
                {prediction.factors && prediction.factors.length > 0 && (
                  <View style={styles.factorsList}>
                    <Text style={[styles.sectionHeading, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      Influential Market Factors
                    </Text>
                    <View style={styles.factorsGrid}>
                      {prediction.factors.map((factor, idx) => (
                        <View key={idx} style={[styles.factorCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <View style={styles.factorHeader}>
                            <Text style={[styles.factorTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                              {factor.factor}
                            </Text>
                            <Text style={{ fontSize: 12, color: getImpactColor(factor.impact) }}>
                              {factor.impact === 'positive' ? 'Positive ↑' : factor.impact === 'negative' ? 'Negative ↓' : 'Neutral →'}
                            </Text>
                          </View>
                          <Text style={[styles.factorDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                            {factor.description}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <Text style={[styles.summaryText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {prediction.summary}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Ask AI Price Assistant */}
        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <CardTitle>
              <View style={styles.titleRow}>
                <Bot size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.titleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  Ask AI Price Assistant
                </Text>
              </View>
            </CardTitle>
            <CardDescription>
              Ask specific price queries (e.g., "What is the price of Basmati rice in Haryana?")
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.searchRow}>
              <View style={{ flex: 1 }}>
                <Input
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="e.g. Price of Cotton in Gujarat"
                />
              </View>
              <TouchableOpacity
                onPress={handleSearchSubmit}
                style={[styles.searchBtn, { backgroundColor: colors.primary }]}
                disabled={isSearching || !question.trim()}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                ) : (
                  <Search size={18} color={colors.primaryForeground} />
                )}
              </TouchableOpacity>
            </View>

            {searchError && (
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: typography.fontFamily.sans }]}>
                {searchError}
              </Text>
            )}

            {isSearching && (
              <View style={styles.aiLoading}>
                <Bot size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.aiLoadingText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  AI is searching for latest prices...
                </Text>
              </View>
            )}

            {searchResult?.answer && !isSearching && (
              <View style={[styles.aiAnswerCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.aiAnswerHeader}>
                  <Bot size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.aiAnswerTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    AI Insights Response
                  </Text>
                </View>
                <Text style={[styles.aiAnswerText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                  {searchResult.answer}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Live Overview Table */}
        <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <View style={styles.headerFlex}>
              <CardTitle>Today's Market Overview</CardTitle>
              <Badge variant="outline" style={{ borderColor: 'rgba(74, 222, 128, 0.3)', backgroundColor: 'rgba(74, 222, 128, 0.05)' }}>
                <Text style={{ color: '#4ade80', fontSize: 10 }}>● Live</Text>
              </Badge>
            </View>
            {searchResult?.summary ? (
              <CardDescription>{searchResult.summary}</CardDescription>
            ) : (
              <CardDescription>Major crop rates across wholesale centers in India.</CardDescription>
            )}
            {searchResult?.dataSource && (
              <Text style={[styles.dataSourceText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                Source: {searchResult.dataSource} • {searchResult.lastUpdated || 'Just now'}
              </Text>
            )}
          </CardHeader>
          <CardContent style={[styles.cardContent, { paddingTop: 0 }]}>
            {isInitialLoading ? (
              <View style={{ gap: 12 }}>
                <Skeleton width="100%" height={40} />
                <Skeleton width="100%" height={40} />
                <Skeleton width="100%" height={40} />
                <Skeleton width="100%" height={40} />
              </View>
            ) : searchResult?.prices && searchResult.prices.length > 0 ? (
              <View style={styles.tableWrapper}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.tableCol, styles.tableColHeader, { flex: 2, color: colors.mutedForeground }]}>Crop</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, { flex: 2.5, color: colors.mutedForeground }]}>Market</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, { flex: 2, textAlign: 'right', color: colors.mutedForeground }]}>Price</Text>
                  <Text style={[styles.tableCol, styles.tableColHeader, { flex: 1.5, textAlign: 'right', color: colors.mutedForeground }]}>Trend</Text>
                </View>

                {/* Table Data */}
                {searchResult.prices.map((price, index) => (
                  <View key={index} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.tableCol, { flex: 2, color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      {price.cropName}
                    </Text>
                    <Text style={[styles.tableCol, { flex: 2.5, color: colors.mutedForeground }]}>
                      {price.market}
                    </Text>
                    <Text style={[styles.tableCol, { flex: 2, textAlign: 'right', color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      ₹{price.price.toLocaleString()}{' '}
                      <Text style={{ fontSize: 9, color: colors.mutedForeground }}>{price.unit}</Text>
                    </Text>
                    <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                      <PriceTrend value={price.trend} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noDataView}>
                <HelpCircle size={32} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
                <Text style={[styles.noDataText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  No market price data available at this time.
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  refreshBtn: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 50,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
  },
  cardContent: {
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
  },
  predictForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  predictInput: {
    flex: 2,
  },
  predictBtn: {
    flex: 1.5,
    height: 44,
  },
  predictionDetails: {
    marginTop: 8,
    gap: 16,
  },
  predictionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: 'normal',
  },
  badgeContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
  },
  chartWrapper: {
    marginVertical: 12,
    paddingLeft: 4,
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  recommendationAlert: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recommendationTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  recommendationBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  forecastList: {
    gap: 8,
    marginTop: 8,
  },
  sectionHeading: {
    fontSize: 14,
    marginBottom: 4,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowDate: {
    fontSize: 13,
    flex: 2,
  },
  rowPrice: {
    fontSize: 14,
    flex: 2,
  },
  rowUnit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#8899aa',
  },
  factorsList: {
    gap: 8,
  },
  factorsGrid: {
    gap: 10,
  },
  factorCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorTitle: {
    fontSize: 13,
  },
  factorDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 16.5,
    fontStyle: 'italic',
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    marginTop: 4,
  },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  aiLoadingText: {
    fontSize: 13,
  },
  aiAnswerCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  aiAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAnswerTitle: {
    fontSize: 14,
  },
  aiAnswerText: {
    fontSize: 13,
    lineHeight: 19,
  },
  headerFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataSourceText: {
    fontSize: 10,
    marginTop: 4,
  },
  tableWrapper: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tableHeader: {
    paddingBottom: 6,
  },
  tableCol: {
    fontSize: 12,
  },
  tableColHeader: {
    fontWeight: 'bold',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
  },
  noDataView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  noDataText: {
    fontSize: 13,
  },
});
