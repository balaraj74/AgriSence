import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import {
  getSoilAdvice,
  parseSoilReport,
  GetSoilAdviceOutput,
  ParseSoilReportOutput,
} from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import * as ImagePicker from 'expo-image-picker';
import {
  TestTube,
  Bot,
  Leaf,
  Sprout,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trees,
  Shield,
  Languages,
  ChevronRight,
  Camera,
  Image as ImageIcon,
  MapPin,
  Clipboard,
  Beaker,
  AlertCircle,
  Check,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'Hindi', label: 'Hindi (हिन्दी)' },
];

export default function SoilAdvisorScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');

  // Input states for Manual Entry
  const [location, setLocation] = useState('');
  const [soilPh, setSoilPh] = useState('7.0');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [language, setLanguage] = useState('English');

  // States for Upload Report
  const [uploadLocation, setUploadLocation] = useState('');
  const [reportImage, setReportImage] = useState<{ uri: string; dataUri: string } | null>(null);

  // Status & Result States
  const [isLoading, setIsLoading] = useState(false);
  const [progressStatus, setProgressStatus] = useState('');
  const [result, setResult] = useState<GetSoilAdviceOutput | null>(null);
  const [parsedReport, setParsedReport] = useState<ParseSoilReportOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleGetLocation = () => {
    // Basic placeholder or prompt
    Alert.prompt(
      'Enter Location',
      'Please enter your farm location (District, State):',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (val) => {
            if (activeTab === 'manual') {
              setLocation(val || '');
            } else {
              setUploadLocation(val || '');
            }
          },
        },
      ],
      'plain-text',
      activeTab === 'manual' ? location : uploadLocation
    );
  };

  // Image selection for soil report
  const handleSelectReportImage = async (useCamera: boolean) => {
    setErrorMsg(null);
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera access is required to photograph your soil report.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Gallery access is required to select your soil report.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${asset.base64}`;
        setReportImage({ uri: asset.uri, dataUri });
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to select report image.');
    }
  };

  // Manual Form Submission
  const handleGetManualAdvice = async () => {
    if (!location) {
      setErrorMsg('Please enter your farm location.');
      return;
    }
    const ph = parseFloat(soilPh);
    if (isNaN(ph) || ph < 0 || ph > 14) {
      setErrorMsg('Please enter a valid soil pH between 0 and 14.');
      return;
    }

    setIsLoading(true);
    setProgressStatus('Analyzing soil data...');
    setErrorMsg(null);
    setResult(null);
    setParsedReport(null);

    try {
      const advice = await getSoilAdvice({
        soilPh: ph,
        nitrogen: Number(nitrogen) || 0,
        phosphorus: Number(phosphorus) || 0,
        potassium: Number(potassium) || 0,
        location: location,
        language: language,
      });
      setResult(advice);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to analyze soil data. Please try again.');
    } finally {
      setIsLoading(false);
      setProgressStatus('');
    }
  };

  // Analyze uploaded report image
  const handleAnalyzeReportImage = async () => {
    if (!reportImage) {
      setErrorMsg('Please capture or upload a soil report image.');
      return;
    }
    if (!uploadLocation) {
      setErrorMsg('Please enter your farm location.');
      return;
    }

    setIsLoading(true);
    setProgressStatus('Extracting report data...');
    setErrorMsg(null);
    setResult(null);
    setParsedReport(null);

    try {
      // 1. Parse report
      const parsedData = await parseSoilReport({
        reportDataUri: reportImage.dataUri,
      });
      setParsedReport(parsedData);

      // 2. Automatically generate advice using parsed data
      setProgressStatus('Generating AI recommendations...');
      const advice = await getSoilAdvice({
        soilPh: parsedData.soilPh,
        nitrogen: parsedData.nitrogen,
        phosphorus: parsedData.phosphorus,
        potassium: parsedData.potassium,
        location: uploadLocation,
        language: language,
      });

      setResult(advice);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Report analysis failed. Please verify the image is clear and contains readable text.');
    } finally {
      setIsLoading(false);
      setProgressStatus('');
    }
  };

  const handleReset = () => {
    setResult(null);
    setParsedReport(null);
    setErrorMsg(null);
    setReportImage(null);
  };

  // Semantic styles for status badges/cards
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('optimal') || s.includes('sufficient')) {
      return { bg: `${colors.success}15`, text: colors.success, border: `${colors.success}30` };
    }
    if (s.includes('low') || s.includes('acidic') || s.includes('alkaline')) {
      return { bg: `${colors.warning}15`, text: colors.warning, border: `${colors.warning}30` };
    }
    if (s.includes('high')) {
      return { bg: `${colors.destructive}15`, text: colors.destructive, border: `${colors.destructive}30` };
    }
    return { bg: colors.secondary, text: colors.mutedForeground, border: colors.border };
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('optimal') || s.includes('sufficient')) {
      return <CheckCircle size={16} color={colors.success} />;
    }
    if (s.includes('low') || s.includes('acidic') || s.includes('alkaline')) {
      return <AlertTriangle size={16} color={colors.warning} />;
    }
    return <XCircle size={16} color={colors.destructive} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Soil Advisor" subtitle="Crop Recommendations & Soil Analysis" />

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'manual' && { borderBottomColor: colors.primary }]}
          onPress={() => {
            setActiveTab('manual');
            handleReset();
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'manual' ? colors.primary : colors.mutedForeground,
                fontFamily: typography.fontFamily.sansSemiBold,
              },
            ]}
          >
            Manual Entry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && { borderBottomColor: colors.primary }]}
          onPress={() => {
            setActiveTab('upload');
            handleReset();
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === 'upload' ? colors.primary : colors.mutedForeground,
                fontFamily: typography.fontFamily.sansSemiBold,
              },
            ]}
          >
            Upload Report
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Loading Overlay */}
        {isLoading && (
          <Card style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing[4] }} />
            <Text style={[styles.loadingText, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              {progressStatus}
            </Text>
            <Text style={[styles.loadingSubtext, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              Our AI is processing your request. Please hold on...
            </Text>
          </Card>
        )}

        {/* Form Screens (when no result) */}
        {!result && !isLoading && (
          <View style={styles.formContainer}>
            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15`, borderColor: `${colors.destructive}40` }]}>
                <AlertCircle size={18} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: typography.fontFamily.sans }]}>
                  {errorMsg}
                </Text>
              </View>
            )}

            {activeTab === 'manual' ? (
              // MANUAL ENTRY FORM
              <Card style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeaderSmall}>
                  <Beaker size={20} color={colors.primary} />
                  <Text style={[styles.cardTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Farming & Soil Parameters
                  </Text>
                </View>

                <View style={styles.inputSpacing}>
                  <TouchableOpacity
                    onPress={handleGetLocation}
                    activeOpacity={0.7}
                    style={styles.locationInputTrigger}
                  >
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Farm Location (District, State)"
                        placeholder="e.g. Kolar, Karnataka"
                        value={location}
                        editable={false}
                        pointerEvents="none"
                      />
                    </View>
                    <View style={[styles.locationIconBtn, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
                      <MapPin size={18} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputSpacing}>
                  <Input
                    label="Soil pH"
                    placeholder="e.g. 6.5"
                    keyboardType="numeric"
                    value={soilPh}
                    onChangeText={setSoilPh}
                  />
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: spacing[2] }}>
                    <Input
                      label="Nitrogen (N) kg/ha"
                      placeholder="e.g. 45"
                      keyboardType="numeric"
                      value={nitrogen}
                      onChangeText={setNitrogen}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing[2] }}>
                    <Input
                      label="Phosphorus (P) kg/ha"
                      placeholder="e.g. 20"
                      keyboardType="numeric"
                      value={phosphorus}
                      onChangeText={setPhosphorus}
                    />
                  </View>
                </View>

                <View style={styles.inputSpacing}>
                  <Input
                    label="Potassium (K) kg/ha"
                    placeholder="e.g. 30"
                    keyboardType="numeric"
                    value={potassium}
                    onChangeText={setPotassium}
                  />
                </View>

                {/* Language Picker */}
                <View style={styles.inputSpacing}>
                  <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium, fontSize: typography.fontSize.sm, marginBottom: spacing[1] }]}>
                    Response Language
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowLanguageModal(true)}
                    style={[styles.langBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    activeOpacity={0.7}
                  >
                    <Languages size={18} color={colors.primary} style={{ marginRight: spacing[2] }} />
                    <Text style={[styles.langBtnText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                      {language}
                    </Text>
                    <View style={{ flex: 1 }} />
                    <ChevronRight size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>

                <Button
                  style={{ width: '100%', marginTop: spacing[6] }}
                  onPress={handleGetManualAdvice}
                >
                  <Bot size={18} color={colors.primaryForeground} style={{ marginRight: spacing[2] }} />
                  <Text style={{ color: colors.primaryForeground, fontFamily: typography.fontFamily.sansBold }}>
                    Get AI Soil Advice
                  </Text>
                </Button>
              </Card>
            ) : (
              // UPLOAD REPORT FORM
              <View style={{ width: '100%' }}>
                <Card style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: spacing[4] }]}>
                  <View style={styles.cardHeaderSmall}>
                    <Clipboard size={20} color={colors.primary} />
                    <Text style={[styles.cardTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      Auto-Extract Report
                    </Text>
                  </View>

                  <View style={styles.inputSpacing}>
                    <TouchableOpacity
                      onPress={handleGetLocation}
                      activeOpacity={0.7}
                      style={styles.locationInputTrigger}
                    >
                      <View style={{ flex: 1 }}>
                        <Input
                          label="Farm Location (District, State)"
                          placeholder="e.g. Belgaum, Karnataka"
                          value={uploadLocation}
                          editable={false}
                          pointerEvents="none"
                        />
                      </View>
                      <View style={[styles.locationIconBtn, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
                        <MapPin size={18} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Language Picker */}
                  <View style={styles.inputSpacing}>
                    <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium, fontSize: typography.fontSize.sm, marginBottom: spacing[1] }]}>
                      Response Language
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowLanguageModal(true)}
                      style={[styles.langBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                      activeOpacity={0.7}
                    >
                      <Languages size={18} color={colors.primary} style={{ marginRight: spacing[2] }} />
                      <Text style={[styles.langBtnText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                        {language}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <ChevronRight size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                </Card>

                {/* Upload Action Card */}
                {!reportImage ? (
                  <View style={[styles.dropzone, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <TestTube size={48} color={colors.primary} style={{ marginBottom: spacing[2] }} />
                    <Text style={[styles.dropzoneTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Select Soil Report Photo
                    </Text>
                    <Text style={[styles.dropzoneDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      Take a clear photo or upload a screenshot of your lab report. The AI will parse details and provide recommendations.
                    </Text>

                    <View style={styles.actionButtonRow}>
                      <TouchableOpacity
                        onPress={() => handleSelectReportImage(true)}
                        style={[styles.uploadActionBtn, { backgroundColor: colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Camera size={18} color={colors.primaryForeground} />
                        <Text style={[styles.uploadActionText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.sansMedium }]}>
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleSelectReportImage(false)}
                        style={[styles.uploadActionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                        activeOpacity={0.7}
                      >
                        <ImageIcon size={18} color={colors.foreground} />
                        <Text style={[styles.uploadActionText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                          Gallery
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Card style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.selectedHeader, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Selected Report Document
                    </Text>
                    <Image source={{ uri: reportImage.uri }} style={[styles.reportPreview as any, { borderRadius: borderRadius.md }]} />

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        onPress={() => setReportImage(null)}
                        style={[styles.changeReportBtn, { backgroundColor: colors.secondary }]}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                      <View style={{ width: spacing[4] }} />
                      <Button
                        style={{ flex: 1 }}
                        onPress={handleAnalyzeReportImage}
                      >
                        <Bot size={16} color={colors.primaryForeground} style={{ marginRight: spacing[2] }} />
                        <Text style={{ color: colors.primaryForeground, fontFamily: typography.fontFamily.sansBold }}>
                          Analyze Report
                        </Text>
                      </Button>
                    </View>
                  </Card>
                )}
              </View>
            )}
          </View>
        )}

        {/* Results Screen */}
        {result && !isLoading && (
          <View style={styles.resultsContainer}>
            {/* Auto Extracted Data Alert */}
            {parsedReport && (
              <Card style={[styles.parsedReportCard, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }]}>
                <View style={styles.cardHeaderSmall}>
                  <Check size={16} color={colors.success} />
                  <Text style={[styles.parsedTitle, { color: colors.success, fontFamily: typography.fontFamily.sansBold }]}>
                    Report Analysis Successful
                  </Text>
                </View>
                <Text style={[styles.parsedBody, { color: colors.foreground, fontFamily: typography.fontFamily.sans, fontSize: 13 }]}>
                  Extracted values: pH: {parsedReport.soilPh.toFixed(1)} | N: {parsedReport.nitrogen} | P: {parsedReport.phosphorus} | K: {parsedReport.potassium}
                  {parsedReport.organicCarbon ? ` | OC: ${parsedReport.organicCarbon}%` : ''}
                </Text>
              </Card>
            )}

            {/* Recommended Crops */}
            <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderSmall}>
                <Trees size={22} color={colors.primary} />
                <View>
                  <Text style={[styles.resultTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Recommended Crops
                  </Text>
                  <Text style={[styles.resultSubtitleText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Optimized for location: {activeTab === 'manual' ? location : uploadLocation}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.cropsText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                {result.recommendedCrops}
              </Text>
            </Card>

            {/* Nutrient Status Analysis */}
            <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderSmall}>
                <TestTube size={22} color={colors.primary} />
                <View>
                  <Text style={[styles.resultTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Nutrient Analysis
                  </Text>
                  <Text style={[styles.resultSubtitleText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Status of key soil nutrients
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.grid}>
                {result.nutrientAnalysis.map((item, index) => {
                  const stylesMap = getStatusColor(item.status);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.gridItem,
                        {
                          backgroundColor: stylesMap.bg,
                          borderColor: stylesMap.border,
                          borderRadius: borderRadius.md,
                        },
                      ]}
                    >
                      <View style={styles.nutrientRow}>
                        {getStatusIcon(item.status)}
                        <Text style={[styles.nutrientName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                          {item.nutrient}
                        </Text>
                      </View>
                      <Text style={[styles.nutrientStatusText, { color: stylesMap.text, fontFamily: typography.fontFamily.sansSemiBold }]}>
                        {item.status}
                      </Text>
                      <Text style={[styles.nutrientComment, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]} numberOfLines={3}>
                        {item.comment}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Chemical Recommendations */}
            <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderSmall}>
                <Beaker size={22} color={colors.primary} />
                <View>
                  <Text style={[styles.resultTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Chemical Fertilizers
                  </Text>
                  <Text style={[styles.resultSubtitleText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Targeted application schedules
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {result.chemicalRecommendations.length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontFamily: typography.fontFamily.sans, paddingVertical: spacing[2] }}>
                  No chemical recommendations necessary for this soil.
                </Text>
              ) : (
                result.chemicalRecommendations.map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.recommendationItem,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth: idx === result.chemicalRecommendations.length - 1 ? 0 : 1,
                        paddingBottom: spacing[3],
                        marginBottom: idx === result.chemicalRecommendations.length - 1 ? 0 : spacing[3],
                      },
                    ]}
                  >
                    <View style={styles.recomHeaderRow}>
                      <Text style={[styles.recomName, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                        {item.fertilizerName}
                      </Text>
                      <Badge variant="warning" label={item.dosage} />
                    </View>
                    <Text style={[styles.recomDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      Schedule: {item.applicationTime}
                    </Text>
                  </View>
                ))
              )}
            </Card>

            {/* Organic Alternatives */}
            <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderSmall}>
                <Leaf size={22} color={colors.primary} />
                <View>
                  <Text style={[styles.resultTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Organic Alternatives
                  </Text>
                  <Text style={[styles.resultSubtitleText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Sustainable options to build long-term fertility
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {result.organicAlternatives.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.organicItem,
                    {
                      borderBottomColor: colors.border,
                      borderBottomWidth: idx === result.organicAlternatives.length - 1 ? 0 : 1,
                      paddingBottom: spacing[3],
                      marginBottom: idx === result.organicAlternatives.length - 1 ? 0 : spacing[3],
                    },
                  ]}
                >
                  <View style={styles.recomHeaderRow}>
                    <Text style={[styles.recomName, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      {item.name}
                    </Text>
                    <Badge variant="success" label={item.applicationRate} />
                  </View>
                  <Text style={[styles.organicBenefits, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {item.benefits}
                  </Text>
                </View>
              ))}
            </Card>

            {/* General Tips */}
            <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeaderSmall}>
                <Shield size={22} color={colors.primary} />
                <View>
                  <Text style={[styles.resultTitleText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    Soil Management Tips
                  </Text>
                  <Text style={[styles.resultSubtitleText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Practical soil conservation strategies
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.tipsList}>
                {result.soilManagementTips
                  .split('*')
                  .filter((t) => t.trim().length > 0)
                  .map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <View style={[styles.tipBullet, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.tipText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                        {tip.trim()}
                      </Text>
                    </View>
                  ))}
              </View>
            </Card>

            <Button
              label="Run Another Diagnosis"
              onPress={handleReset}
              variant="outline"
              style={{ width: '100%', marginVertical: spacing[6] }}
            />
          </View>
        )}
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent={true} animationType="fade" onRequestClose={() => setShowLanguageModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Response Language
            </Text>
            {LANGUAGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.modalItem,
                  { borderBottomColor: colors.border },
                  language === item.value && { backgroundColor: `${colors.primary}10` },
                ]}
                onPress={() => {
                  setLanguage(item.value);
                  setShowLanguageModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    { color: colors.foreground, fontFamily: typography.fontFamily.sans },
                    language === item.value && { color: colors.primary, fontFamily: typography.fontFamily.sansBold },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderWidth: 1,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    padding: 16,
    borderWidth: 1,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitleText: {
    fontSize: 16,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  locationInputTrigger: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  locationIconBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  label: {},
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  dropzoneTitle: {
    fontSize: 15,
    marginBottom: 6,
    textAlign: 'center',
  },
  dropzoneDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadActionText: {
    fontSize: 13,
  },
  selectedCard: {
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedHeader: {
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  reportPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  changeReportBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  resultsContainer: {
    width: '100%',
  },
  parsedReportCard: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  parsedTitle: {
    fontSize: 13,
  },
  parsedBody: {
    marginTop: 4,
  },
  resultCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  resultTitleText: {
    fontSize: 16,
  },
  resultSubtitleText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cropsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 64) / 2,
    padding: 12,
    borderWidth: 1,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  nutrientName: {
    fontSize: 14,
  },
  nutrientStatusText: {
    fontSize: 12,
    marginBottom: 4,
  },
  nutrientComment: {
    fontSize: 10,
    lineHeight: 14,
  },
  recommendationItem: {
    width: '100%',
  },
  recomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recomName: {
    fontSize: 14,
    flex: 1,
  },
  recomDesc: {
    fontSize: 12,
  },
  organicItem: {
    width: '100%',
  },
  organicBenefits: {
    fontSize: 12,
    lineHeight: 18,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
