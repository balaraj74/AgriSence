import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { getLoanAdvice, LoanOutput, EligibleScheme } from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Skeleton } from '../../src/components/ui/Skeleton';
import {
  Landmark,
  Bot,
  ShieldCheck,
  Banknote,
  ListChecks,
  FileText,
  UserCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react-native';

const ResultCard = ({ scheme }: { scheme: EligibleScheme }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  // Split benefits by '*' if it contains them
  const benefitsList = scheme.benefits
    .split('*')
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return (
    <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <CardHeader style={styles.cardHeader}>
        <View style={styles.schemeTitleRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}10` }]}>
            {scheme.schemeType === 'Loan' ? (
              <Banknote size={22} color={colors.primary} />
            ) : (
              <ShieldCheck size={22} color={colors.primary} />
            )}
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={[styles.schemeName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              {scheme.schemeName}
            </Text>
            <Text style={[styles.schemeTypeBadge, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium }]}>
              {scheme.schemeType} Scheme
            </Text>
          </View>
        </View>
        <Text style={[styles.eligibilitySummary, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
          {scheme.eligibilitySummary}
        </Text>
      </CardHeader>

      <CardContent style={styles.cardContent}>
        {/* Key Benefits */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <UserCheck size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              Key Benefits
            </Text>
          </View>
          <View style={styles.listContainer}>
            {benefitsList.map((benefit, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.bulletPoint, { color: colors.primary }]}>•</Text>
                <Text style={[styles.listText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ListChecks size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              Next Steps to Apply
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
            {scheme.nextSteps}
          </Text>
        </View>

        {/* Required Documents */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <FileText size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              Required Documents
            </Text>
          </View>
          <Text style={[styles.bodyText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
            {scheme.requiredDocuments}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};

export default function LoanAssistantScreen() {
  const { colors, typography, spacing, borderRadius } = useTheme();

  // Form input states
  const [landSize, setLandSize] = useState('5');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [location, setLocation] = useState('');
  const [hasKCC, setHasKCC] = useState(false);

  // Status & Result States
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LoanOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    const landAcres = parseFloat(landSize);
    if (isNaN(landAcres) || landAcres < 0) {
      setErrorMsg('Land size must be a positive number.');
      return;
    }
    if (!primaryCrop.trim()) {
      setErrorMsg('Primary crop is required.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Location is required.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const response = await getLoanAdvice({
        landSizeAcres: landAcres,
        primaryCrop: primaryCrop.trim(),
        location: location.trim(),
        hasKisanCreditCard: hasKCC,
      });
      setResult(response);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'The AI could not analyze eligibility. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="AI Loan Assistant" subtitle="Check eligibility for credit & insurance" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Input Details Card */}
        <Card style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>
              Provide basic land and crop information to identify relevant credit and insurance programs.
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.formContent}>
            {/* Land Size */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                Total Land Size (in acres)
              </Text>
              <Input
                keyboardType="numeric"
                placeholder="e.g. 5"
                value={landSize}
                onChangeText={setLandSize}
              />
            </View>

            {/* Primary Crop */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                Primary Crop
              </Text>
              <Input
                placeholder="e.g. Paddy, Cotton, Sugarcane"
                value={primaryCrop}
                onChangeText={setPrimaryCrop}
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                Location (District, State)
              </Text>
              <Input
                placeholder="e.g. Mandya, Karnataka"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* KCC Switch */}
            <View style={[styles.switchContainer, { borderColor: colors.border }]}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                  Kisan Credit Card (KCC)
                </Text>
                <Text style={[styles.switchDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Do you already have a Kisan Credit Card?
                </Text>
              </View>
              <Switch
                value={hasKCC}
                onValueChange={setHasKCC}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'android' ? colors.card : undefined}
              />
            </View>
          </CardContent>

          {/* Submit Action */}
          <View style={styles.formActions}>
            <Button
              label="Check Eligibility"
              onPress={handleSubmit}
              disabled={isLoading}
              isLoading={isLoading}
              icon={<Bot size={18} color={colors.primaryForeground} />}
              style={styles.submitButton}
            />
          </View>
        </Card>

        {/* Input/Validation Errors */}
        {errorMsg && (
          <Card style={[styles.errorCard, { borderColor: `${colors.destructive}40`, backgroundColor: `${colors.destructive}05` }]}>
            <CardContent style={styles.errorContent}>
              <AlertCircle size={24} color={colors.destructive} style={{ marginRight: spacing[3] }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.errorTitle, { color: colors.destructive, fontFamily: typography.fontFamily.sansBold }]}>
                  Analysis Failed
                </Text>
                <Text style={[styles.errorText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                  {errorMsg}
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Skeletons on loading */}
        {isLoading && (
          <View style={styles.skeletonContainer}>
            <Card style={[styles.aiSummaryCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <CardContent style={styles.aiSummaryContent}>
                <Bot size={22} color={colors.primary} style={{ marginRight: spacing[3] }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="100%" height={14} />
                </View>
              </CardContent>
            </Card>

            <View style={styles.resultsGrid}>
              <Skeleton width="100%" height={240} style={styles.skeletonCard} />
              <Skeleton width="100%" height={240} style={styles.skeletonCard} />
            </View>
          </View>
        )}

        {/* Results output */}
        {result && !isLoading && (
          <View style={styles.resultsContainer}>
            {/* AI Summary Block */}
            <Card style={[styles.aiSummaryCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <CardContent style={styles.aiSummaryContent}>
                <Bot size={24} color={colors.primary} style={styles.aiIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.aiTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    AI Analysis Complete
                  </Text>
                  <Text style={[styles.aiText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                    {result.overallSummary}
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Text style={[styles.sectionTitleLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Eligible Programs
            </Text>

            {/* Schemes List */}
            {result.eligibleSchemes && result.eligibleSchemes.length > 0 ? (
              <View style={styles.schemesGrid}>
                {result.eligibleSchemes.map((scheme, index) => (
                  <ResultCard key={index} scheme={scheme} />
                ))}
              </View>
            ) : (
              <Card style={[styles.noResultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <CardContent style={styles.noResultsContent}>
                  <HelpCircle size={48} color={colors.mutedForeground} style={{ marginBottom: spacing[2] }} />
                  <Text style={[styles.noResultsTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    No Eligible Schemes Found
                  </Text>
                  <Text style={[styles.noResultsDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    The system couldn't identify specific programs matching your parameters. Check that your land size, location, and crop inputs are correct.
                  </Text>
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
  formCard: {
    width: '100%',
  },
  formContent: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 14,
  },
  switchDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  formActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  submitButton: {
    width: '100%',
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
  skeletonCard: {
    borderRadius: 8,
  },
  resultsGrid: {
    gap: 16,
  },
  resultsContainer: {
    gap: 16,
  },
  aiSummaryCard: {
    borderWidth: 1,
  },
  aiSummaryContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  aiIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  aiTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  aiText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitleLabel: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 4,
  },
  schemesGrid: {
    gap: 16,
  },
  resultCard: {
    width: '100%',
  },
  cardHeader: {
    paddingBottom: 12,
  },
  schemeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  titleTextContainer: {
    flex: 1,
  },
  schemeName: {
    fontSize: 16,
    lineHeight: 22,
  },
  schemeTypeBadge: {
    fontSize: 11,
    marginTop: 1,
  },
  eligibilitySummary: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  cardContent: {
    gap: 16,
    paddingTop: 12,
  },
  section: {
    gap: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13.5,
  },
  listContainer: {
    gap: 4,
    paddingLeft: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 18,
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 4,
  },
  noResultsCard: {
    borderWidth: 1,
  },
  noResultsContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
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
