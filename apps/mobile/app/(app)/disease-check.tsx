import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { detectDisease, DiseaseOutput } from '../../src/services/ai';
import { getDiagnosisHistory, addDiagnosisRecord } from '../../src/services/firestore';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  LocateFixed,
  Languages,
  Camera,
  Image as ImageIcon,
  History as HistoryIcon,
  Sprout,
  AlertTriangle,
  Trash2,
  Volume2,
  VolumeX,
  Calendar,
  ChevronRight,
  Info,
  Wand2,
  X,
  MapPin,
  Leaf,
  ShieldCheck,
  RotateCcw,
  Box,
  CheckCircle,
} from 'lucide-react-native';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'Hindi', label: 'Hindi (हिन्दी)' },
  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
];

export default function DiseaseCheckScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  // Core States
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [imageFiles, setImageFiles] = useState<Array<{ uri: string; dataUri: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<DiseaseOutput | null>(null);

  // Bottom Sheets / Modals state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [speakingSection, setSpeakingSection] = useState<'chemical' | 'organic' | 'prevention' | null>(null);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any | null>(null);

  // Fetch history
  const fetchHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const records = await getDiagnosisHistory(user.uid);
      setHistory(records);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Location Handlers
  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    setErrorMsg(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to analyze crop health.');
        setIsLoadingLocation(false);
        return;
      }
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to acquire device GPS location. Please check your settings.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Image Picking
  const handleCapturePhoto = async () => {
    setErrorMsg(null);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'AgriSence needs camera access to capture leaf images.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${asset.base64}`;
        setImageFiles((prev) => [...prev, { uri: asset.uri, dataUri }].slice(0, 5));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to open camera.');
    }
  };

  const handleSelectGallery = async () => {
    setErrorMsg(null);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'AgriSence needs gallery access to upload leaf images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${asset.base64}`;
        setImageFiles((prev) => [...prev, { uri: asset.uri, dataUri }].slice(0, 5));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to open image gallery.');
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Diagnostic Flow Call
  const handleDiagnose = async () => {
    if (imageFiles.length === 0) {
      setErrorMsg('Please select or capture at least one image of the crop.');
      return;
    }
    if (!location) {
      setErrorMsg('Please acquire your location before running diagnosis.');
      return;
    }
    if (!user) {
      setErrorMsg('You must be signed in to perform a diagnosis.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setFinalResult(null);

    try {
      const uris = imageFiles.map((f) => f.dataUri);
      const diagnosisResult = await detectDisease({
        imageUris: uris,
        geolocation: location,
        userId: user.uid,
        language: selectedLanguage,
      });

      if (!diagnosisResult.plantIdentification.isPlant) {
        setErrorMsg(diagnosisResult.plantIdentification.plantName || 'AI could not recognize a plant in the image. Please make sure the photo is clear and contains a leaf.');
      } else {
        setFinalResult(diagnosisResult);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Diagnosis failed. Please check your network and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Speech helper
  const handleSpeak = async (text: string, section: 'chemical' | 'organic' | 'prevention') => {
    if (speakingSection === section) {
      Speech.stop();
      setSpeakingSection(null);
      return;
    }

    Speech.stop();
    setSpeakingSection(section);

    let langCode = 'en-US';
    if (selectedLanguage === 'Kannada') langCode = 'kn-IN';
    else if (selectedLanguage === 'Hindi') langCode = 'hi-IN';
    else if (selectedLanguage === 'Tamil') langCode = 'ta-IN';
    else if (selectedLanguage === 'Telugu') langCode = 'te-IN';

    // Strip markdown formatting characters for clean speech
    const cleanText = text.replace(/(\*|_|#|`|~)/g, '');

    await Speech.speak(cleanText, {
      language: langCode,
      rate: 0.95,
      onDone: () => setSpeakingSection(null),
      onError: () => setSpeakingSection(null),
    });
  };

  const handleReset = () => {
    setLocation(null);
    setImageFiles([]);
    setFinalResult(null);
    setErrorMsg(null);
    Speech.stop();
    setSpeakingSection(null);
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'High':
        return colors.destructive;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.success;
      default:
        return colors.mutedForeground;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Disease Check" subtitle="AI Diagnostic Plant Scanner" />

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('new')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'new' ? colors.primary : colors.mutedForeground, fontFamily: typography.fontFamily.sansSemiBold },
            ]}
          >
            New Scan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'history' ? colors.primary : colors.mutedForeground, fontFamily: typography.fontFamily.sansSemiBold },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'new' ? (
          <View style={styles.tabContainer}>
            {/* Setup Options */}
            <View style={styles.row}>
              {/* Location Card */}
              <Card style={[styles.setupCard, { flex: 1, marginRight: spacing[2], backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeaderSmall}>
                  <MapPin size={16} color={colors.primary} />
                  <Text style={[styles.setupCardTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                    Location
                  </Text>
                </View>
                {location ? (
                  <View style={styles.acquiredBox}>
                    <Badge variant="success" label="Acquired" style={{ alignSelf: 'flex-start' }} />
                    <Text numberOfLines={1} style={[styles.coordsText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleGetLocation}
                    disabled={isLoadingLocation}
                    style={[styles.acquireBtn, { backgroundColor: colors.secondary }]}
                    activeOpacity={0.7}
                  >
                    {isLoadingLocation ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <LocateFixed size={14} color={colors.primary} />
                        <Text style={[styles.acquireBtnText, { color: colors.primary, fontFamily: typography.fontFamily.sansMedium }]}>
                          Acquire GPS
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </Card>

              {/* Language Card */}
              <Card style={[styles.setupCard, { flex: 1, marginLeft: spacing[2], backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeaderSmall}>
                  <Languages size={16} color={colors.primary} />
                  <Text style={[styles.setupCardTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                    Language
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(true)}
                  style={[styles.langSelectBtn, { backgroundColor: colors.secondary }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langSelectBtnText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                    {selectedLanguage}
                  </Text>
                  <ChevronRight size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </Card>
            </View>

            {/* Error Message Display */}
            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15`, borderColor: `${colors.destructive}40` }]}>
                <AlertTriangle size={18} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: typography.fontFamily.sans }]}>
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Main Selection Area */}
            {!finalResult ? (
              <View style={styles.setupContainer}>
                {imageFiles.length === 0 ? (
                  <View style={[styles.dropzone, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Sprout size={48} color={colors.primary} style={{ marginBottom: spacing[2] }} />
                    <Text style={[styles.dropzoneTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Capture or Select Images
                    </Text>
                    <Text style={[styles.dropzoneDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      Take photos of affected plant leaves to run AI disease diagnostics. Support up to 5 images.
                    </Text>

                    <View style={styles.actionButtonRow}>
                      <TouchableOpacity
                        onPress={handleCapturePhoto}
                        style={[styles.uploadActionBtn, { backgroundColor: colors.primary }]}
                        activeOpacity={0.7}
                      >
                        <Camera size={18} color={colors.primaryForeground} />
                        <Text style={[styles.uploadActionText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.sansMedium }]}>
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSelectGallery}
                        style={[styles.uploadActionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                        activeOpacity={0.7}
                      >
                        <ImageIcon size={18} color={colors.foreground} />
                        <Text style={[styles.uploadActionText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                          Upload Gallery
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Card style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.selectedHeader, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Selected Leaf Images ({imageFiles.length} of 5)
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageList}>
                      {imageFiles.map((file, idx) => (
                        <View key={idx} style={styles.imageWrapper}>
                          <Image source={{ uri: file.uri }} style={[styles.thumbnail, { borderRadius: borderRadius.md }]} />
                          <TouchableOpacity
                            onPress={() => removeImage(idx)}
                            style={[styles.deleteBtn, { backgroundColor: colors.destructive }]}
                            activeOpacity={0.7}
                          >
                            <X size={10} color={colors.destructiveForeground} />
                          </TouchableOpacity>
                        </View>
                      ))}

                      {imageFiles.length < 5 && (
                        <View style={styles.pickerActionsInline}>
                          <TouchableOpacity
                            onPress={handleCapturePhoto}
                            style={[styles.inlineAddBtn, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}
                            activeOpacity={0.7}
                          >
                            <Camera size={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSelectGallery}
                            style={[styles.inlineAddBtn, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}
                            activeOpacity={0.7}
                          >
                            <ImageIcon size={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </ScrollView>

                    <Button
                      label={isAnalyzing ? 'Analyzing Leaf Content...' : 'Diagnose Plant Health'}
                      onPress={handleDiagnose}
                      disabled={isAnalyzing || !location}
                      variant="primary"
                      style={{ marginTop: spacing[4] }}
                      icon={isAnalyzing ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Wand2 size={16} />}
                    />
                  </Card>
                )}
              </View>
            ) : (
              /* Diagnosis Result Display */
              <View style={styles.resultContainer}>
                {/* Identified Plant Summary Card */}
                <Card style={[styles.resSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.resRow}>
                    <Sprout size={24} color={colors.primary} />
                    <View style={styles.resHeaderCol}>
                      <Text style={[styles.plantName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        {finalResult.plantIdentification.plantName}
                      </Text>
                      <Text style={[styles.diseaseNameText, { color: getSeverityColor(finalResult.diseaseDiagnosis.severity), fontFamily: typography.fontFamily.sansSemiBold }]}>
                        Diagnosis: {finalResult.diseaseDiagnosis.diseaseName}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        Severity
                      </Text>
                      <Badge variant={finalResult.diseaseDiagnosis.severity === 'High' ? 'destructive' : finalResult.diseaseDiagnosis.severity === 'Medium' ? 'warning' : 'success'} label={finalResult.diseaseDiagnosis.severity} />
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        Confidence
                      </Text>
                      <Text style={[styles.metricVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        {Math.round(finalResult.diseaseDiagnosis.confidenceScore * 100)}%
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        Affected Parts
                      </Text>
                      <Text numberOfLines={1} style={[styles.metricVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium, fontSize: 13 }]}>
                        {finalResult.diseaseDiagnosis.affectedParts?.join(', ') || 'Leaves'}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Risk Warning Alert */}
                <Card style={[styles.riskCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]}>
                  <View style={styles.cardHeaderSmall}>
                    <AlertTriangle size={16} color={colors.warning} />
                    <Text style={[styles.riskTitle, { color: colors.warning, fontFamily: typography.fontFamily.sansBold }]}>
                      Next Disease Risk Forecast
                    </Text>
                  </View>
                  <Text style={[styles.riskDesc, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                    {finalResult.nextDiseaseRisk}
                  </Text>
                </Card>

                {/* Remedies Section */}
                <View style={styles.remedyContainer}>
                  {/* Chemical */}
                  <Card style={[styles.remedyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.remedyHeader}>
                      <Text style={[styles.remedyTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        Chemical Remedies
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleSpeak(finalResult.remedies.chemicalRemedy, 'chemical')}
                        style={[styles.ttsBtn, { backgroundColor: colors.secondary }]}
                        activeOpacity={0.7}
                      >
                        {speakingSection === 'chemical' ? (
                          <VolumeX size={14} color={colors.destructive} />
                        ) : (
                          <Volume2 size={14} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.remedyText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {finalResult.remedies.chemicalRemedy}
                    </Text>
                  </Card>

                  {/* Organic */}
                  <Card style={[styles.remedyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.remedyHeader}>
                      <Text style={[styles.remedyTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        Organic Remedies
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleSpeak(finalResult.remedies.organicRemedy, 'organic')}
                        style={[styles.ttsBtn, { backgroundColor: colors.secondary }]}
                        activeOpacity={0.7}
                      >
                        {speakingSection === 'organic' ? (
                          <VolumeX size={14} color={colors.destructive} />
                        ) : (
                          <Volume2 size={14} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.remedyText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {finalResult.remedies.organicRemedy}
                    </Text>
                  </Card>

                  {/* Preventive */}
                  <Card style={[styles.remedyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.remedyHeader}>
                      <Text style={[styles.remedyTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        Preventive Measures
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleSpeak(finalResult.remedies.preventiveMeasures, 'prevention')}
                        style={[styles.ttsBtn, { backgroundColor: colors.secondary }]}
                        activeOpacity={0.7}
                      >
                        {speakingSection === 'prevention' ? (
                          <VolumeX size={14} color={colors.destructive} />
                        ) : (
                          <Volume2 size={14} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.remedyText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {finalResult.remedies.preventiveMeasures}
                    </Text>
                  </Card>
                </View>

                {/* Additional Insights */}
                <Card style={[styles.insightsCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <View style={styles.cardHeaderSmall}>
                    <Info size={16} color={colors.primary} />
                    <Text style={[styles.remedyTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      Additional Insights
                    </Text>
                  </View>

                  <View style={styles.insightBlock}>
                    <View style={styles.insightLabelRow}>
                      <HistoryIcon size={14} color={colors.primary} />
                      <Text style={[styles.insightSubLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                        Historical Insight
                      </Text>
                    </View>
                    <Text style={[styles.insightBody, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {finalResult.historicalInsight}
                    </Text>
                  </View>

                  <View style={styles.insightBlock}>
                    <View style={styles.insightLabelRow}>
                      <RotateCcw size={14} color={colors.primary} />
                      <Text style={[styles.insightSubLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                        Alternative Crops / Rotation
                      </Text>
                    </View>
                    <Text style={[styles.insightBody, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {finalResult.farmingRecommendations.alternativeCrops}
                    </Text>
                  </View>

                  <View style={styles.insightBlock}>
                    <View style={styles.insightLabelRow}>
                      <Box size={14} color={colors.primary} />
                      <Text style={[styles.insightSubLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                        Preservation Tips
                      </Text>
                    </View>
                    <Text style={[styles.insightBody, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {finalResult.farmingRecommendations.preservationTips}
                    </Text>
                  </View>
                </Card>

                {/* Reset Trigger */}
                <Button label="Start New Scan" onPress={handleReset} variant="outline" style={{ marginTop: spacing[4] }} />
              </View>
            )}
          </View>
        ) : (
          /* Diagnosis History Tab */
          <View style={styles.tabContainer}>
            {isLoadingHistory ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <HistoryIcon size={48} color={colors.mutedForeground} style={{ marginBottom: spacing[2] }} />
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                  No Diagnosis History
                </Text>
                <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Perform a diagnostic scan to store records.
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {history.map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() => setSelectedHistoryRecord(record)}
                    style={[styles.historyItemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: record.imageUrl }} style={styles.historyThumbnail} />
                    <View style={styles.historyItemContent}>
                      <Text numberOfLines={1} style={[styles.historyPlant, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                        {record.plantName}
                      </Text>
                      <Text numberOfLines={1} style={[styles.historyDisease, { color: getSeverityColor(record.severity), fontFamily: typography.fontFamily.sansSemiBold }]}>
                        {record.diseaseName}
                      </Text>
                      <View style={styles.historyMeta}>
                        <Calendar size={12} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                        <Text style={[styles.historyDate, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                          {format(new Date(record.timestamp), 'dd MMM yyyy')}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Language Select Sheet Modal */}
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
                  selectedLanguage === item.value && { backgroundColor: `${colors.primary}10` },
                ]}
                onPress={() => {
                  setSelectedLanguage(item.value);
                  setShowLanguageModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    { color: colors.foreground, fontFamily: typography.fontFamily.sans },
                    selectedLanguage === item.value && { color: colors.primary, fontFamily: typography.fontFamily.sansBold },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* History Detail Modal */}
      <Modal visible={!!selectedHistoryRecord} transparent={true} animationType="slide" onRequestClose={() => setSelectedHistoryRecord(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.detailModalHeader}>
              <Text style={[styles.detailModalTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                Diagnosis Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedHistoryRecord(null)} activeOpacity={0.7}>
                <X size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedHistoryRecord && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>
                <Image source={{ uri: selectedHistoryRecord.imageUrl }} style={[styles.detailImage, { borderRadius: borderRadius.lg }]} />

                <View style={styles.detailMetaRow}>
                  <View>
                    <Text style={[styles.detailPlantName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      {selectedHistoryRecord.plantName}
                    </Text>
                    <Text style={[styles.detailDiseaseName, { color: getSeverityColor(selectedHistoryRecord.severity), fontFamily: typography.fontFamily.sansSemiBold }]}>
                      {selectedHistoryRecord.diseaseName}
                    </Text>
                  </View>
                  <Badge variant={selectedHistoryRecord.severity === 'High' ? 'destructive' : selectedHistoryRecord.severity === 'Medium' ? 'warning' : 'success'} label={selectedHistoryRecord.severity} />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.detailMetaItem}>
                  <View style={styles.detailMetaLabelRow}>
                    <Calendar size={14} color={colors.primary} />
                    <Text style={[styles.detailMetaLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Diagnosed At
                    </Text>
                  </View>
                  <Text style={[styles.detailMetaVal, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {format(new Date(selectedHistoryRecord.timestamp), 'dd MMM yyyy, hh:mm a')}
                  </Text>
                </View>

                <View style={styles.detailMetaItem}>
                  <View style={styles.detailMetaLabelRow}>
                    <MapPin size={14} color={colors.primary} />
                    <Text style={[styles.detailMetaLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Acquired Location
                    </Text>
                  </View>
                  <Text style={[styles.detailMetaVal, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {selectedHistoryRecord.geolocation.latitude.toFixed(6)}, {selectedHistoryRecord.geolocation.longitude.toFixed(6)}
                  </Text>
                </View>

                <View style={styles.detailMetaItem}>
                  <View style={styles.detailMetaLabelRow}>
                    <CheckCircle size={14} color={colors.primary} />
                    <Text style={[styles.detailMetaLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      Confidence Score
                    </Text>
                  </View>
                  <Text style={[styles.detailMetaVal, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {Math.round(selectedHistoryRecord.confidenceScore * 100)}%
                  </Text>
                </View>

                <Button
                  label="Re-run Analysis Flow"
                  onPress={() => {
                    const rec = selectedHistoryRecord;
                    setSelectedHistoryRecord(null);
                    setActiveTab('new');
                    setLocation(rec.geolocation);
                    setImageFiles([{ uri: rec.imageUrl, dataUri: rec.imageUrl }]); // Send imageUrl since backend accepts downloadURLs or dataUri base64! Wait, let's make sure it runs correctly.
                    // Wait, rerun can happen by setting these states!
                  }}
                  variant="outline"
                  style={{ marginTop: spacing[4] }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Analysis Overlay Loader */}
      {isAnalyzing && (
        <View style={styles.analyzingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.analyzingText, { color: '#ffffff', fontFamily: typography.fontFamily.sansBold }]}>
            AI Agent Analyzing Leaf Data...
          </Text>
          <Text style={[styles.analyzingSub, { color: 'rgba(255,255,255,0.7)', fontFamily: typography.fontFamily.sans }]}>
            This takes about 5-10 seconds to generate remedies.
          </Text>
        </View>
      )}
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
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
  },
  tabContainer: {
    padding: 16,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  setupCard: {
    padding: 12,
    borderWidth: 1,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  setupCardTitle: {
    fontSize: 13,
  },
  acquiredBox: {
    marginTop: 4,
    gap: 4,
  },
  coordsText: {
    fontSize: 12,
  },
  acquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 2,
    height: 36,
  },
  acquireBtnText: {
    fontSize: 12,
  },
  langSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 2,
    height: 36,
  },
  langSelectBtnText: {
    fontSize: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  setupContainer: {
    width: '100%',
  },
  dropzone: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  dropzoneTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  dropzoneDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  uploadActionText: {
    fontSize: 14,
  },
  selectedCard: {
    padding: 16,
    borderWidth: 1,
  },
  selectedHeader: {
    fontSize: 15,
    marginBottom: 12,
  },
  imageList: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 70,
    height: 70,
  },
  deleteBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerActionsInline: {
    flexDirection: 'row',
    gap: 8,
  },
  inlineAddBtn: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    width: '100%',
  },
  resSummaryCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  resRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resHeaderCol: {
    flex: 1,
    gap: 2,
  },
  plantName: {
    fontSize: 18,
  },
  diseaseNameText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
  },
  metricVal: {
    fontSize: 14,
  },
  riskCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  riskTitle: {
    fontSize: 14,
  },
  riskDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  remedyContainer: {
    gap: 12,
    marginBottom: 16,
  },
  remedyCard: {
    padding: 14,
    borderWidth: 1,
  },
  remedyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remedyTitle: {
    fontSize: 14,
  },
  ttsBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remedyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  insightsCard: {
    padding: 16,
    borderWidth: 1,
    gap: 16,
    marginBottom: 16,
  },
  insightBlock: {
    gap: 4,
  },
  insightLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightSubLabel: {
    fontSize: 13,
  },
  insightBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
  },
  historyList: {
    gap: 12,
  },
  historyItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  historyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  historyItemContent: {
    flex: 1,
    gap: 2,
  },
  historyPlant: {
    fontSize: 14,
  },
  historyDisease: {
    fontSize: 12,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    width: '100%',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  detailModalContent: {
    width: '90%',
    height: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailModalTitle: {
    fontSize: 18,
  },
  detailScroll: {
    gap: 16,
    paddingBottom: 24,
  },
  detailImage: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
  },
  detailMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailPlantName: {
    fontSize: 18,
  },
  detailDiseaseName: {
    fontSize: 14,
  },
  detailMetaItem: {
    gap: 4,
  },
  detailMetaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailMetaLabel: {
    fontSize: 13,
  },
  detailMetaVal: {
    fontSize: 13,
    paddingLeft: 20,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
  },
  analyzingText: {
    fontSize: 16,
  },
  analyzingSub: {
    fontSize: 12,
  },
});
