import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useTheme } from '../../src/theme';
import { farmingChatbot } from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  User,
  Bot,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

export default function VoiceAdvisorScreen() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  // States
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'kn-IN' | 'hi-IN'>('en-IN');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleSpeak = async (text: string) => {
    if (!text) return;
    try {
      setIsSpeaking(true);
      await Speech.stop();

      let langCode = 'en-IN';
      if (selectedLanguage === 'kn-IN') langCode = 'kn-IN';
      else if (selectedLanguage === 'hi-IN') langCode = 'hi-IN';

      await Speech.speak(text, {
        language: langCode,
        pitch: 1.0,
        rate: 0.95,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (e) {
      console.error('Speech synthesis failed', e);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleStartListening = () => {
    setErrorMsg(null);
    setIsListening(true);
  };

  const handleStopListening = () => {
    setIsListening(false);
    if (transcript.trim()) {
      processVoiceQuery(transcript);
    }
  };

  const processVoiceQuery = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResponse('');

    try {
      const languageText = selectedLanguage === 'kn-IN' ? 'Kannada' : selectedLanguage === 'hi-IN' ? 'Hindi' : 'English';
      const result = await farmingChatbot({
        question: text,
        language: languageText,
      });

      setResponse(result.answer);
      handleSpeak(result.answer);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to process voice advice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setResponse('');
    setIsListening(false);
    setErrorMsg(null);
    handleStopSpeaking();
  };

  const getLanguageLabel = (code: string) => {
    if (code === 'kn-IN') return 'Kannada';
    if (code === 'hi-IN') return 'Hindi';
    return 'English (India)';
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Header title="Voice Assistant" showBackButton />

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[5] }}>
        <View style={styles.introRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Mic size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Voice Advisory
            </Text>
            <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              Speak directly in your preferred language to get real-time voice-synthesized farming advice.
            </Text>
          </View>
        </View>

        {/* Language Selector */}
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[4], gap: spacing[3] }}>
            <View style={styles.sectionHeaderRow}>
              <Languages size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                Select Language
              </Text>
            </View>
            <View style={styles.languageOptions}>
              {(['en-IN', 'kn-IN', 'hi-IN'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setSelectedLanguage(lang)}
                  activeOpacity={0.7}
                  style={[
                    styles.langButton,
                    {
                      borderColor: selectedLanguage === lang ? colors.primary : colors.border,
                      backgroundColor: selectedLanguage === lang ? `${colors.primary}10` : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.langButtonText,
                      {
                        color: selectedLanguage === lang ? colors.primary : colors.foreground,
                        fontFamily: selectedLanguage === lang ? typography.fontFamily.sansBold : typography.fontFamily.sansMedium,
                      },
                    ]}
                  >
                    {getLanguageLabel(lang)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Mic Control Box */}
        <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[4], gap: spacing[4], alignItems: 'center' }}>
            <Text style={[styles.statusText, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              {isListening
                ? 'Recording... Tap Mic to Stop'
                : isLoading
                ? 'Thinking...'
                : 'Tap Microphone & Dictate'}
            </Text>

            {/* Mic Pulse Button */}
            <TouchableOpacity
              onPress={isListening ? handleStopListening : handleStartListening}
              activeOpacity={0.8}
              disabled={isLoading}
              style={[
                styles.micBtnLarge,
                {
                  ...shadows.lg,
                  backgroundColor: isListening ? colors.error : colors.primary,
                  shadowColor: isListening ? colors.error : colors.primary,
                },
              ]}
            >
              {isListening ? (
                <MicOff size={32} color="#ffffff" />
              ) : (
                <Mic size={32} color={colors.primaryForeground} />
              )}
            </TouchableOpacity>

            <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              Tip: Use the microphone button on your keyboard for native, high-accuracy speech-to-text input.
            </Text>

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
              multiline
              placeholder="Your transcribed question will appear here. You can also edit it..."
              placeholderTextColor={colors.mutedForeground}
              value={transcript}
              onChangeText={setTranscript}
              editable={!isLoading && !isListening}
            />

            {!isListening && transcript.trim() !== '' && (
              <View style={styles.actionButtons}>
                <Button
                  onPress={() => processVoiceQuery(transcript)}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <Text style={{ color: colors.primaryForeground, fontFamily: typography.fontFamily.sansBold }}>
                      Ask Question
                    </Text>
                  )}
                </Button>
                <Button variant="outline" onPress={handleReset} style={styles.resetBtn}>
                  <RotateCcw size={16} color={colors.mutedForeground} />
                </Button>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {errorMsg && (
          <View style={[styles.errorAlert, { backgroundColor: `${colors.error}10`, borderColor: colors.error }]}>
            <AlertTriangle size={18} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error, fontFamily: typography.fontFamily.sansMedium }]}>
              {errorMsg}
            </Text>
          </View>
        )}

        {/* Response Box */}
        {(response !== '' || isLoading) && (
          <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <CardContent style={{ padding: spacing[4], gap: spacing[4] }}>
              <View style={styles.responseHeader}>
                <View style={styles.headerTitleRow}>
                  <Bot size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                    AgriSence Voice Advisor
                  </Text>
                </View>
                {response !== '' && (
                  <TouchableOpacity
                    onPress={isSpeaking ? handleStopSpeaking : () => handleSpeak(response)}
                    style={[styles.listenBtn, { backgroundColor: `${colors.primary}15` }]}
                  >
                    {isSpeaking ? (
                      <VolumeX size={16} color={colors.primary} />
                    ) : (
                      <Volume2 size={16} color={colors.primary} />
                    )}
                    <Text style={[styles.listenBtnText, { color: colors.primary, fontFamily: typography.fontFamily.sansMedium }]}>
                      {isSpeaking ? 'Stop' : 'Listen'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Synthesizing recommendations...
                  </Text>
                </View>
              ) : (
                <View style={styles.responseTextContainer}>
                  <Text style={[styles.responseText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                    {response}
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
  introRow: {
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
  title: {
    fontSize: 18,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  langButton: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langButtonText: {
    fontSize: 13,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
  micBtnLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  hintText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  resetBtn: {
    width: 46,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  listenBtnText: {
    fontSize: 12,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  responseTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 8,
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
