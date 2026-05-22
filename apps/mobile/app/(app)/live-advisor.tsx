import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import { useTheme } from '../../src/theme';
import { liveFarmAdvisor, LiveAdvisorOutput } from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import {
  Camera,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  Bot,
  User,
  AlertTriangle,
  Info,
  Square,
  RefreshCw,
  Eye,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LiveAdvisorScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // States
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'kn-IN'>('en-IN');
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<LiveAdvisorOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleStartSession = async () => {
    if (!permission || !permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Permission Denied', 'AgriSence needs camera access to start the live advisor.');
        return;
      }
    }
    setErrorMsg(null);
    setLastResponse(null);
    setTranscript('');
    setIsSessionActive(true);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setIsListening(false);
    setIsLoading(false);
    setLastResponse(null);
    setTranscript('');
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleSpeak = async (text: string) => {
    if (!text) return;
    try {
      setIsSpeaking(true);
      await Speech.stop();
      await Speech.speak(text, {
        language: selectedLanguage,
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleMicPress = async () => {
    if (isLoading) return;

    if (isListening) {
      // User finished speaking, now capture frame and submit
      setIsListening(false);
      if (!transcript.trim()) {
        setErrorMsg('Please dictate or type a query.');
        return;
      }
      await processLiveQuery();
    } else {
      setErrorMsg(null);
      setTranscript('');
      setIsListening(true);
    }
  };

  const processLiveQuery = async () => {
    if (!cameraRef.current) {
      setErrorMsg('Camera is not ready yet.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Capture frame from camera
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      const mimeType = 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${picture.base64}`;

      const languageText = selectedLanguage === 'kn-IN' ? 'Kannada' : 'English';

      const response = await liveFarmAdvisor({
        videoFrameUri: dataUri,
        farmerQuery: transcript,
        language: languageText,
      });

      setLastResponse(response);
      handleSpeak(response.responseToQuery);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to analyze frame. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Header title="Live Advisor" showBackButton />

      {!isSessionActive ? (
        <View style={styles.startContainer}>
          <Card style={{ width: width - 32, backgroundColor: colors.card, borderColor: colors.border }}>
            <CardContent style={{ padding: spacing[5], gap: spacing[4], alignItems: 'center' }}>
              <View style={[styles.iconBoxLarge, { backgroundColor: `${colors.primary}15` }]}>
                <Camera size={40} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                Real-Time Video Advisor
              </Text>
              <Text style={[styles.desc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans, textAlign: 'center' }]}>
                Start a live session to analyze what you see in front of you. Ask visual questions about plant health, insects, and soil conditions.
              </Text>

              <Button onPress={handleStartSession} style={{ width: '100%', marginTop: spacing[3] }}>
                <Camera size={18} color={colors.primaryForeground} style={{ marginRight: spacing[2] }} />
                <Text style={{ color: colors.primaryForeground, fontFamily: typography.fontFamily.sansBold }}>
                  Start Live Session
                </Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            ref={cameraRef}
          />

          {/* Overlay Layout */}
          <View style={styles.overlayContainer}>
            {/* Top Bar - Response Card */}
            {lastResponse && (
              <Card style={[styles.topCard, { backgroundColor: `${colors.card}E0`, borderColor: colors.border }]}>
                <CardContent style={{ padding: spacing[3], gap: spacing[2] }}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Eye size={16} color={colors.primary} />
                        <Text style={[styles.cardSectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                          Visual Analysis
                        </Text>
                      </View>
                      <Text style={[styles.cardSectionBody, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        {lastResponse.visualAnalysis}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={isSpeaking ? handleStopSpeaking : () => handleSpeak(lastResponse.responseToQuery)}
                      style={[styles.audioIconBtn, { backgroundColor: `${colors.primary}20` }]}
                    >
                      {isSpeaking ? (
                        <VolumeX size={16} color={colors.primary} />
                      ) : (
                        <Volume2 size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                    <Bot size={16} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={[styles.advisorText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                      {lastResponse.responseToQuery}
                    </Text>
                  </View>

                  {lastResponse.proactiveAlert !== 'None' && (
                    <View style={[styles.alertBox, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
                      <AlertTriangle size={14} color={colors.error} />
                      <Text style={[styles.alertText, { color: colors.error, fontFamily: typography.fontFamily.sans }]}>
                        {lastResponse.proactiveAlert}
                      </Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Middle - User query preview / loading indicator */}
            {isLoading && (
              <View style={[styles.loadingBox, { backgroundColor: `${colors.card}C0` }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                  AI is analyzing video frame...
                </Text>
              </View>
            )}

            {/* Error Message */}
            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: `${colors.error}E0` }]}>
                <AlertTriangle size={16} color="#ffffff" />
                <Text style={[styles.errorTextText, { fontFamily: typography.fontFamily.sansMedium }]}>
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Bottom Controls */}
            <View style={[styles.bottomControls, { backgroundColor: `${colors.card}E0`, borderTopColor: colors.border }]}>
              <View style={styles.controlsRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.foreground,
                        fontFamily: typography.fontFamily.sans,
                      },
                    ]}
                    placeholder={isListening ? 'Speak now...' : 'Ask about what you see...'}
                    placeholderTextColor={colors.mutedForeground}
                    value={transcript}
                    onChangeText={setTranscript}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={handleMicPress}
                    disabled={isLoading}
                    style={[
                      styles.micBtn,
                      {
                        backgroundColor: isListening ? colors.error : colors.primary,
                      },
                    ]}
                  >
                    {isListening ? (
                      <MicOff size={18} color="#ffffff" />
                    ) : (
                      <Mic size={18} color={colors.primaryForeground} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Language Select Toggle */}
                <TouchableOpacity
                  onPress={() => setSelectedLanguage((prev) => (prev === 'en-IN' ? 'kn-IN' : 'en-IN'))}
                  style={[styles.langSelectBtn, { borderColor: colors.border }]}
                >
                  <Languages size={16} color={colors.foreground} />
                  <Text style={[styles.langText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    {selectedLanguage === 'en-IN' ? 'EN' : 'KN'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleEndSession}
                  style={[styles.endBtn, { backgroundColor: colors.destructive }]}
                >
                  <Square size={16} color="#ffffff" />
                  <Text style={[styles.endText, { fontFamily: typography.fontFamily.sansBold }]}>
                    End
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  topCard: {
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardSectionTitle: {
    fontSize: 13,
  },
  cardSectionBody: {
    fontSize: 11,
    marginTop: 2,
  },
  audioIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  advisorText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  alertText: {
    fontSize: 11,
    flex: 1,
  },
  loadingBox: {
    alignSelf: 'center',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorBox: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  errorTextText: {
    color: '#ffffff',
    fontSize: 12,
  },
  bottomControls: {
    width: width - 32,
    alignSelf: 'center',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    marginBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 14,
    paddingRight: 44,
    fontSize: 13,
  },
  micBtn: {
    position: 'absolute',
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
  },
  langText: {
    fontSize: 12,
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  endText: {
    color: '#ffffff',
    fontSize: 13,
  },
});
