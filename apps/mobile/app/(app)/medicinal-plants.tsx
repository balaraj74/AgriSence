import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { identifyMedicinalPlant, IdentifyMedicinalPlantOutput } from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Skeleton } from '../../src/components/ui/Skeleton';
import * as ImagePicker from 'expo-image-picker';
import {
  HeartPulse,
  Microscope,
  AlertTriangle,
  Pill,
  BookText,
  Languages,
  Camera,
  Image as ImageIcon,
  Sprout,
  X,
  Wand2,
  RefreshCw,
  Info,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MedicinalPlantsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  // Core States
  const [imageFiles, setImageFiles] = useState<Array<{ uri: string; dataUri: string }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<IdentifyMedicinalPlantOutput | null>(null);

  // Image Picking
  const handleCapturePhoto = async () => {
    setErrorMsg(null);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'AgriSence needs camera access to capture plant images.');
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
        Alert.alert('Permission Required', 'AgriSence needs gallery access to upload plant images.');
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
      setErrorMsg('Failed to open gallery.');
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleReset = () => {
    setImageFiles([]);
    setFinalResult(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (imageFiles.length === 0) {
      setErrorMsg('Please select or capture at least one image.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setFinalResult(null);

    try {
      const imageUris = imageFiles.map((f) => f.dataUri);
      const result = await identifyMedicinalPlant({ imageUris });
      
      setFinalResult(result);
      if (!result.isMedicinal) {
        setErrorMsg(`The AI identified this as "${result.commonName}", which is not a known medicinal plant in India.`);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : 'An error occurred during plant identification.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const ResultSection = ({ title, content, icon: Icon }: { title: string; content: string; icon: any }) => (
    <View style={styles.resultSection}>
      <View style={styles.sectionHeaderRow}>
        <Icon size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.sectionText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
        {content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Medicinal Plants" showBackButton />
      
      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[5] }}>
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[4], gap: spacing[3] }}>
            <View style={styles.infoRow}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <HeartPulse size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  Plant Identifier
                </Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Identify Indian medicinal plants, their properties, usage preparation, and precautions.
                </Text>
              </View>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <View style={[styles.errorAlert, { backgroundColor: `${colors.error}10`, borderColor: colors.error }]}>
                <AlertTriangle size={18} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error, fontFamily: typography.fontFamily.sansMedium }]}>
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Reset Button */}
            {(imageFiles.length > 0 || finalResult) && (
              <Button
                variant="outline"
                size="sm"
                onPress={handleReset}
                disabled={isAnalyzing}
                style={{ alignSelf: 'flex-end' }}
              >
                <RefreshCw size={14} color={colors.mutedForeground} style={{ marginRight: spacing[1] }} />
                <Text style={{ color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium }}>
                  Reset Scanner
                </Text>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Media Controls */}
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[4], gap: spacing[4] }}>
            <Text style={[styles.uploadTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              Capture or Upload Leaf Images
            </Text>

            <View style={styles.mediaButtons}>
              <TouchableOpacity
                onPress={handleCapturePhoto}
                style={[styles.mediaBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                disabled={isAnalyzing}
              >
                <Camera size={20} color={colors.primaryForeground} />
                <Text style={[styles.mediaBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.sansMedium }]}>
                  Use Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSelectGallery}
                style={[styles.mediaBtn, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border }]}
                activeOpacity={0.8}
                disabled={isAnalyzing}
              >
                <ImageIcon size={20} color={colors.foreground} />
                <Text style={[styles.mediaBtnText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                  Choose Gallery
                </Text>
              </TouchableOpacity>
            </View>

            {/* Selected Images Preview */}
            {imageFiles.length > 0 && (
              <View style={{ gap: spacing[2] }}>
                <Text style={[styles.previewLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium }]}>
                  Selected Images ({imageFiles.length}/5):
                </Text>
                <View style={styles.imageGrid}>
                  {imageFiles.map((file, idx) => (
                    <View key={idx} style={[styles.imageWrapper, { borderColor: colors.border }]}>
                      <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                      <TouchableOpacity
                        onPress={() => removeImage(idx)}
                        style={[styles.removeBtn, { backgroundColor: colors.error }]}
                        activeOpacity={0.7}
                      >
                        <X size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Analyze Button */}
            <Button
              onPress={handleAnalyze}
              disabled={isAnalyzing || imageFiles.length === 0}
              size="lg"
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <>
                  <Wand2 size={18} color={colors.primaryForeground} style={{ marginRight: spacing[2] }} />
                  <Text style={{ color: colors.primaryForeground, fontFamily: typography.fontFamily.sansBold }}>
                    Identify Plant
                  </Text>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Skeleton Loader during analysis */}
        {isAnalyzing && (
          <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <CardContent style={{ padding: spacing[4], gap: spacing[4] }}>
              <Skeleton width="60%" height={24} />
              <Skeleton width="40%" height={16} />
              <View style={{ gap: spacing[2], marginTop: spacing[2] }}>
                <Skeleton width="100%" height={80} />
                <Skeleton width="100%" height={60} />
                <Skeleton width="100%" height={60} />
              </View>
            </CardContent>
          </Card>
        )}

        {/* Final Results */}
        {finalResult && !isAnalyzing && (
          <Card style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <CardContent style={{ padding: spacing[4], gap: spacing[5] }}>
              
              {/* Header Info */}
              <View style={styles.resultHeader}>
                <View style={[styles.sproutBadge, { backgroundColor: `${colors.success}15` }]}>
                  <Sprout size={28} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.plantCommonName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                      {finalResult.commonName}
                    </Text>
                    <Badge variant={finalResult.isMedicinal ? 'success' : 'outline'}>
                      {finalResult.isMedicinal ? 'Medicinal' : 'Non-Medicinal'}
                    </Badge>
                  </View>
                  <Text style={[styles.botanicalName, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans, fontStyle: 'italic' }]}>
                    {finalResult.botanicalName}
                  </Text>
                </View>
              </View>

              {finalResult.isMedicinal ? (
                <View style={{ gap: spacing[4] }}>
                  <ResultSection title="Medicinal Uses" content={finalResult.medicinalUses} icon={Microscope} />
                  <ResultSection title="Parts Used" content={finalResult.partsUsed} icon={Pill} />
                  <ResultSection title="Preparation Methods" content={finalResult.preparationMethods} icon={BookText} />
                  <ResultSection title="Regional Names" content={finalResult.regionalNames} icon={Languages} />

                  {/* Precautions Box */}
                  {finalResult.precautions && finalResult.precautions.toLowerCase().trim() !== 'none' && (
                    <View style={[styles.precautionsBox, { backgroundColor: `${colors.error}08`, borderColor: `${colors.error}30` }]}>
                      <View style={styles.precautionsTitleRow}>
                        <AlertTriangle size={16} color={colors.error} />
                        <Text style={[styles.precautionsTitle, { color: colors.error, fontFamily: typography.fontFamily.sansSemiBold }]}>
                          Precautions & Warnings
                        </Text>
                      </View>
                      <Text style={[styles.precautionsText, { color: colors.error, fontFamily: typography.fontFamily.sans }]}>
                        {finalResult.precautions}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.warningBox, { backgroundColor: `${colors.warning}10`, borderColor: colors.warning }]}>
                  <Info size={20} color={colors.warning} />
                  <Text style={[styles.warningText, { color: colors.warning, fontFamily: typography.fontFamily.sansMedium }]}>
                    No known medicinal classification is registered for this plant. Please ensure you take clear photos showing the leaf patterns and plant structure.
                  </Text>
                </View>
              )}

            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  uploadTitle: {
    fontSize: 15,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
  },
  mediaBtnText: {
    fontSize: 14,
  },
  previewLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: (width - 64) / 5,
    height: (width - 64) / 5,
    borderRadius: 8,
    borderWidth: 1,
    position: 'relative',
    overflow: 'visible',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  sproutBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  plantCommonName: {
    fontSize: 20,
  },
  botanicalName: {
    fontSize: 14,
    marginTop: 2,
  },
  resultSection: {
    gap: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  precautionsBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  precautionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  precautionsTitle: {
    fontSize: 14,
  },
  precautionsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
