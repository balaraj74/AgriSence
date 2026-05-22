import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { searchSchemes, SchemesOutput } from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Skeleton } from '../../src/components/ui/Skeleton';
import {
  ScrollText,
  Bot,
  BookOpen,
  ArrowRight,
  Search,
  Sparkles,
  HelpCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';

const SUGGESTIONS = [
  'PM-KISAN',
  'Drip Irrigation',
  'Crop Insurance',
  'Organic Farming',
  'Solar Pump',
];

export default function SchemesScreen() {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SchemesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchSchemes('');
  }, []);

  const fetchSchemes = async (searchQuery: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await searchSchemes({ query: searchQuery });
      setResult(res);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to fetch government schemes. Please check your internet connection.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    fetchSchemes(query);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    fetchSchemes(suggestion);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSchemes(query);
  };

  const handleOpenLink = async (url: string) => {
    if (!url || url === '#') return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Cannot open this URL");
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Scheme Finder" subtitle="Government schemes & subsidies" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Search Panel */}
        <Card style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle style={{ fontSize: typography.fontSize.lg }}>Find Specific Schemes</CardTitle>
            <CardDescription>
              Enter a crop, state, or topic to search relevant policies.
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.searchRowContainer}>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="e.g. drip irrigation, PM-KISAN, subsidy"
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              disabled={isLoading}
              style={[
                styles.searchButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                },
              ]}
              activeOpacity={0.7}
            >
              {isLoading && query ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Search size={20} color={colors.primaryForeground} />
              )}
            </TouchableOpacity>
          </CardContent>

          {/* Quick Suggestions Chips */}
          <View style={styles.suggestionsContainer}>
            <Text
              style={[
                styles.suggestionsLabel,
                { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
              ]}
            >
              Popular searches:
            </Text>
            <View style={styles.chipsRow}>
              {SUGGESTIONS.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => handleSuggestionPress(item)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: colors.secondary,
                      borderColor: colors.border,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.secondaryForeground, fontFamily: typography.fontFamily.sansMedium },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Error handling */}
        {errorMsg && (
          <Card style={[styles.errorCard, { borderColor: `${colors.destructive}40`, backgroundColor: `${colors.destructive}05` }]}>
            <CardContent style={styles.errorContent}>
              <AlertCircle size={24} color={colors.destructive} style={{ marginRight: spacing[3] }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.errorTitle, { color: colors.destructive, fontFamily: typography.fontFamily.sansBold }]}>
                  Search Error
                </Text>
                <Text style={[styles.errorText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                  {errorMsg}
                </Text>
              </View>
            </CardContent>
            <CardFooter style={{ borderTopWidth: 0, justifyContent: 'flex-end', paddingTop: 0 }}>
              <Button
                label="Retry"
                size="sm"
                variant="outline"
                onPress={() => fetchSchemes(query)}
                icon={<RefreshCw size={14} color={colors.foreground} />}
              />
            </CardFooter>
          </Card>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <View style={styles.skeletonContainer}>
            <View style={styles.aiGreetingRow}>
              <Bot size={20} color={colors.primary} style={{ marginRight: spacing[2] }} />
              <Skeleton width="60%" height={24} />
            </View>
            <View style={{ height: spacing[4] }} />
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} style={[styles.schemeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CardHeader>
                  <Skeleton width="80%" height={20} />
                </CardHeader>
                <CardContent style={{ gap: spacing[4] }}>
                  <View style={{ gap: spacing[1] }}>
                    <Skeleton width="40%" height={14} />
                    <Skeleton width="100%" height={40} />
                  </View>
                  <View style={{ gap: spacing[1] }}>
                    <Skeleton width="30%" height={14} />
                    <Skeleton width="100%" height={24} />
                  </View>
                </CardContent>
                <CardFooter style={{ borderTopColor: colors.border }}>
                  <Skeleton width="100%" height={40} />
                </CardFooter>
              </Card>
            ))}
          </View>
        )}

        {/* Content results */}
        {result && !isLoading && (
          <View style={styles.resultsContainer}>
            {/* AI Agent Greeting message */}
            <Card style={[styles.aiMessageCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <CardContent style={styles.aiMessageContent}>
                <Bot size={22} color={colors.primary} style={styles.aiIcon} />
                <Text
                  style={[
                    styles.aiMessageText,
                    { color: colors.foreground, fontFamily: typography.fontFamily.sans },
                  ]}
                >
                  {result.message}
                </Text>
              </CardContent>
            </Card>

            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Available Schemes
            </Text>

            {/* List Schemes */}
            {result.schemes.length > 0 ? (
              result.schemes.map((scheme, index) => (
                <Card key={index} style={[styles.schemeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <CardHeader>
                    <View style={styles.schemeHeaderTitleRow}>
                      <View style={[styles.bookIconContainer, { backgroundColor: `${colors.primary}10` }]}>
                        <BookOpen size={20} color={colors.primary} />
                      </View>
                      <CardTitle style={[styles.schemeName, { fontFamily: typography.fontFamily.sansBold }]}>
                        {scheme.name}
                      </CardTitle>
                    </View>
                  </CardHeader>
                  <CardContent style={styles.schemeCardBody}>
                    <View style={styles.fieldSection}>
                      <Text style={[styles.fieldHeader, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        Description
                      </Text>
                      <Text style={[styles.fieldText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        {scheme.description}
                      </Text>
                    </View>

                    <View style={styles.fieldSection}>
                      <Text style={[styles.fieldHeader, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        Eligibility
                      </Text>
                      <Text style={[styles.fieldText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        {scheme.eligibility}
                      </Text>
                    </View>
                  </CardContent>
                  <CardFooter style={{ borderTopColor: colors.border }}>
                    {scheme.link && scheme.link !== '#' ? (
                      <Button
                        label="Learn More"
                        variant="outline"
                        style={{ width: '100%' }}
                        onPress={() => handleOpenLink(scheme.link)}
                        icon={<ArrowRight size={16} color={colors.foreground} />}
                      />
                    ) : (
                      <Text style={[styles.noLinkText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        No official link available
                      </Text>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card style={[styles.noResultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CardContent style={styles.noResultsContent}>
                  <HelpCircle size={40} color={colors.mutedForeground} style={{ marginBottom: spacing[2] }} />
                  <Text style={[styles.noResultsTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    No schemes found
                  </Text>
                  <Text style={[styles.noResultsDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    The AI couldn't find any specific schemes matching "{query}". Try searching with simple keywords like "rice", "loan", or "karnataka".
                  </Text>
                  <Button
                    label="Reset Search"
                    variant="outline"
                    onPress={() => {
                      setQuery('');
                      fetchSchemes('');
                    }}
                    style={{ marginTop: spacing[4] }}
                  />
                </CardContent>
              </Card>
            )}
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
  searchCard: {
    width: '100%',
  },
  cardHeader: {
    paddingBottom: 8,
  },
  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  searchButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  errorCard: {
    borderWidth: 1,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  errorTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  errorText: {
    fontSize: 14,
  },
  skeletonContainer: {
    gap: 16,
  },
  aiGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsContainer: {
    gap: 16,
  },
  aiMessageCard: {
    borderWidth: 1,
  },
  aiMessageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  aiIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  aiMessageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 4,
  },
  schemeCard: {
    width: '100%',
  },
  schemeHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bookIconContainer: {
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  schemeName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  schemeCardBody: {
    gap: 16,
  },
  fieldSection: {
    gap: 4,
  },
  fieldHeader: {
    fontSize: 14,
  },
  fieldText: {
    fontSize: 13,
    lineHeight: 18,
  },
  noLinkText: {
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  noResultsCard: {
    borderWidth: 1,
  },
  noResultsContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  noResultsTitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  noResultsDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
