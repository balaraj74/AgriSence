import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useFarmerContext, contextToPromptString } from '../../src/hooks/useFarmerContext';
import { farmingChatbot, ChatbotOutput } from '../../src/services/ai';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import {
  Send,
  Mic,
  Bot,
  User,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  suggestedFollowups?: string[];
  relatedFeatures?: Array<{ name: string; href: string; reason: string }>;
  confidence?: number;
}

const LANGUAGE_OPTIONS = [
  { value: 'en-IN', label: 'English' },
  { value: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'hi-IN', label: 'Hindi (ಕನ್ನಡ/हिन्दी)' },
];

export default function ChatbotScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const [ttsLanguage, setTtsLanguage] = useState('en-IN');
  const [showLangModal, setShowLangModal] = useState(false);
  const [showMicInfoModal, setShowMicInfoModal] = useState(false);

  // Load Farmer Context
  const { data: farmerContext, isLoading: isLoadingContext } = useFarmerContext(user?.uid);
  const farmerContextString = farmerContext ? contextToPromptString(farmerContext) : '';

  const scrollViewRef = useRef<ScrollView>(null);

  // Speech End handler hook simulator
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const handleSpeak = async (message: Message) => {
    if (speakingMessageId === message.id) {
      Speech.stop();
      setSpeakingMessageId(null);
      return;
    }

    Speech.stop();
    setSpeakingMessageId(message.id);

    const langCode = ttsLanguage.split('-')[0] || 'en';

    await Speech.speak(message.text, {
      language: langCode,
      rate: 0.9,
      onDone: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const getLanguageName = (code: string) => {
    const option = LANGUAGE_OPTIONS.find((opt) => opt.value === code);
    return option ? option.label.split(' ')[0] : 'English';
  };

  const getConversationHistory = () => {
    return messages.slice(-6).map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }));
  };

  const handleSubmit = async (overrideInput?: string) => {
    const currentInput = overrideInput !== undefined ? overrideInput : input;
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (overrideInput === undefined) {
      setInput('');
    }
    setIsLoading(true);

    try {
      const response = await farmingChatbot({
        question: currentInput,
        language: getLanguageName(ttsLanguage),
        farmerContext: farmerContextString || undefined,
        conversationHistory: getConversationHistory(),
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.answer,
        suggestedFollowups: response.suggestedFollowups,
        relatedFeatures: response.relatedFeatures,
        confidence: response.confidence,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I couldn't get a response from the AgriSence AI service. Please verify your connection and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupClick = (question: string) => {
    handleSubmit(question);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="AI Farming Chatbot"
        subtitle="AgriSence Intelligence Assistant"
        rightElement={
          <TouchableOpacity
            style={[styles.langBadge, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.7}
          >
            <Languages size={16} color={colors.primary} />
            <Text style={[styles.langText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
              {getLanguageName(ttsLanguage)}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={[styles.chatContent, { padding: spacing[4] }]}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={[styles.welcomeIconBox, { backgroundColor: `${colors.primary}15` }]}>
                <Bot size={48} color={colors.primary} />
              </View>
              <Text style={[styles.welcomeTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                Welcome to AgriSence AI!
              </Text>
              <Text style={[styles.welcomeDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                I'm your intelligent farming assistant. Ask me about crop diseases, fertilizers, market prices, weather impacts, or crop recommendations.
              </Text>

              {farmerContextString ? (
                <View style={[styles.personalizedBox, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }]}>
                  <Sparkles size={16} color={colors.success} />
                  <Text style={[styles.personalizedText, { color: colors.success, fontFamily: typography.fontFamily.sansMedium }]}>
                    Personalized context loaded from your farms
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.suggestionHeading, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansBold }]}>
                Suggested Questions
              </Text>
              <View style={styles.suggestionsGrid}>
                {[
                  'What crops are best for this season?',
                  'How to treat leaf curl in tomatoes?',
                  'When should I harvest wheat?',
                ].map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleFollowupClick(suggestion)}
                    style={[styles.suggestionChip, { borderColor: colors.border, backgroundColor: colors.card }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.suggestionChipText, { color: colors.primary, fontFamily: typography.fontFamily.sansMedium }]}>
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((message) => (
            <View key={message.id} style={styles.messageRowContainer}>
              <View style={[
                styles.messageBubbleContainer,
                message.sender === 'user' ? styles.userRow : styles.botRow
              ]}>
                {message.sender === 'bot' && (
                  <View style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}>
                    <Bot size={18} color={colors.primary} />
                  </View>
                )}

                <View style={[
                  styles.bubble,
                  message.sender === 'user'
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }]
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.sender === 'user'
                      ? { color: colors.primaryForeground }
                      : { color: colors.foreground },
                    { fontFamily: typography.fontFamily.sans }
                  ]}>
                    {message.text}
                  </Text>

                  {message.confidence !== undefined && message.sender === 'bot' && (
                    <Text style={[styles.confidence, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      Confidence: {Math.round(message.confidence * 100)}%
                    </Text>
                  )}
                </View>

                {message.sender === 'bot' && (
                  <TouchableOpacity
                    onPress={() => handleSpeak(message)}
                    style={[styles.speakButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                    activeOpacity={0.7}
                  >
                    {speakingMessageId === message.id ? (
                      <VolumeX size={16} color={colors.destructive} />
                    ) : (
                      <Volume2 size={16} color={colors.foreground} />
                    )}
                  </TouchableOpacity>
                )}

                {message.sender === 'user' && (
                  <View style={[styles.avatar, { backgroundColor: `${colors.primary}30` }]}>
                    <User size={18} color={colors.primary} />
                  </View>
                )}
              </View>

              {/* Suggested followups */}
              {message.sender === 'bot' && message.suggestedFollowups && message.suggestedFollowups.length > 0 && (
                <View style={styles.followupsContainer}>
                  {message.suggestedFollowups.map((followup, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleFollowupClick(followup)}
                      style={[styles.followupChip, { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.followupText, { color: colors.primary, fontFamily: typography.fontFamily.sansMedium }]}>
                        {followup}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Related features */}
              {message.sender === 'bot' && message.relatedFeatures && message.relatedFeatures.length > 0 && (
                <View style={styles.featuresContainer}>
                  {message.relatedFeatures.map((feat, idx) => {
                    // map feature.href to appropriate app paths
                    let routeHref = feat.href;
                    if (feat.href.startsWith('/')) {
                      // Adjust nextjs client pathing
                      routeHref = feat.href.replace(/^\/?(all-farms|analytics|chatbot|crop-calendar|crops|dashboard|disease-check|expenses|fertilizer-finder|field-mapping|harvest|land-records|live-advisor|loan-assistant|market|market-matchmaking|medicinal-plants|profile|records|satellite-health|schemes|soil-advisor|statistic|tools|voice|weather)$/, '/(app)/$1');
                    }
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => router.push(routeHref as any)}
                        style={[styles.featureBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                        activeOpacity={0.7}
                      >
                        <ExternalLink size={12} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={[styles.featureText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                          {feat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubbleContainer, styles.botRow]}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}>
                <Bot size={18} color={colors.primary} />
              </View>
              <View style={[styles.bubble, styles.botBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask a farming question..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, fontFamily: typography.fontFamily.sans }]}
            multiline={false}
            editable={!isLoading}
            onSubmitEditing={() => handleSubmit()}
          />
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowMicInfoModal(true)}
            activeOpacity={0.7}
          >
            <Mic size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
            onPress={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.7}
          >
            <Send size={18} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Language Select Modal */}
      <Modal
        visible={showLangModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLangModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowLangModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Select Language
            </Text>
            {LANGUAGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.modalItem,
                  { borderBottomColor: colors.border },
                  ttsLanguage === item.value && { backgroundColor: `${colors.primary}10` }
                ]}
                onPress={() => {
                  setTtsLanguage(item.value);
                  setShowLangModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    { color: colors.foreground, fontFamily: typography.fontFamily.sans },
                    ttsLanguage === item.value && { color: colors.primary, fontFamily: typography.fontFamily.sansBold }
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Microphone Info Modal */}
      <Modal
        visible={showMicInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMicInfoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowMicInfoModal(false)}
        >
          <View style={[styles.infoModalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoIconBox, { backgroundColor: `${colors.info}15` }]}>
              <Info size={28} color={colors.info} />
            </View>
            <Text style={[styles.infoTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Voice Input
            </Text>
            <Text style={[styles.infoDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              To use your voice to type questions, please tap the microphone button on your keyboard. This utilizes high-accuracy native speech-to-text.
            </Text>
            <Button
              label="Understood"
              onPress={() => setShowMicInfoModal(false)}
              variant="primary"
              style={{ width: '100%', marginTop: spacing[2] }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  langText: {
    fontSize: 13,
  },
  keyboardView: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 32,
  },
  welcomeIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 16,
  },
  personalizedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginBottom: 24,
  },
  personalizedText: {
    fontSize: 12,
  },
  suggestionHeading: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  suggestionsGrid: {
    width: '100%',
    gap: 8,
  },
  suggestionChip: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontSize: 14,
    textAlign: 'center',
  },
  messageRowContainer: {
    width: '100%',
    marginBottom: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '75%',
  },
  userBubble: {
    borderBottomRightRadius: 2,
  },
  botBubble: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  confidence: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
  },
  speakButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 40,
    marginTop: 8,
  },
  followupChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  followupText: {
    fontSize: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingLeft: 40,
    marginTop: 8,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureText: {
    fontSize: 12,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    borderWidth: 0,
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
  infoModalContent: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  infoIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
});
