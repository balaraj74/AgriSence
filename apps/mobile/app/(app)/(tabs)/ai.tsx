import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  Sparkles,
  MessageCircle,
  Mic,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  Users,
} from 'lucide-react-native';

export default function AiHubScreen() {
  const router = useRouter();
  const { colors, typography, spacing } = useTheme();

  const aiItems = [
    {
      href: '/(app)/chatbot' as const,
      title: 'AI Farming Chatbot',
      description: 'Get instant, text-based farming advice.',
      icon: MessageCircle,
      color: colors.primary,
    },
    {
      href: '/(app)/voice' as const,
      title: 'Voice Assistant',
      description: 'Interact with AgriSence using your voice.',
      icon: Mic,
      color: colors.accent,
    },
  ];

  const handleContactDev = () => {
    Linking.openURL('mailto:balarajr483@gmail.com');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={28} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
            AI Advisory Hub
          </Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
          Real-time intelligent recommendations based on agricultural LLMs.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[6] }}>
        {/* AI Links */}
        <View style={{ gap: spacing[3] }}>
          {aiItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(item.href)}
              activeOpacity={0.7}
              style={styles.cardWrapper}
            >
              <Card style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                    <item.icon size={24} color={item.color} />
                  </View>
                  <View style={styles.cardTextContent}>
                    <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                      {item.description}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={colors.mutedForeground} style={styles.chevron} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Developer Contact Card */}
        <Card style={styles.devCard}>
          <CardHeader>
            <View style={styles.devHeader}>
              <View style={[styles.devAvatar, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.devAvatarText, { color: colors.primary, fontFamily: typography.fontFamily.sansBold }]}>
                  BR
                </Text>
              </View>
              <View>
                <Text style={[styles.devLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Developed & Maintained by
                </Text>
                <Text style={[styles.devName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  Balaraj R
                </Text>
              </View>
            </View>
          </CardHeader>
          <CardContent style={[styles.devContent, { gap: spacing[3] }]}>
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('mailto:balarajr483@gmail.com')}
              activeOpacity={0.7}
            >
              <Mail size={18} color={colors.mutedForeground} />
              <Text style={[styles.contactText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                balarajr483@gmail.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('tel:+918431206594')}
              activeOpacity={0.7}
            >
              <Phone size={18} color={colors.mutedForeground} />
              <Text style={[styles.contactText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                +91 8431206594
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL('https://balarajr.b12sites.com/index')}
              activeOpacity={0.7}
            >
              <Globe size={18} color={colors.mutedForeground} />
              <Text style={[styles.contactText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                balarajr.b12sites.com
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.supportedByContainer}>
              <View style={styles.supportedTitleRow}>
                <Users size={18} color={colors.mutedForeground} />
                <Text style={[styles.supportedTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                  Supported By
                </Text>
              </View>
              <Text style={[styles.supportedNames, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                Bharath C D {'\n'}
                Mahesh Kumar B {'\n'}
                Basavaraj M
              </Text>
            </View>
          </CardContent>
          <CardFooter>
            <Button
              variant="default"
              size="md"
              onPress={handleContactDev}
              style={styles.contactButton}
            >
              Contact Developer
            </Button>
          </CardFooter>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  devCard: {
    width: '100%',
  },
  devHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devAvatarText: {
    fontSize: 18,
  },
  devLabel: {
    fontSize: 12,
  },
  devName: {
    fontSize: 16,
    marginTop: 2,
  },
  devContent: {
    paddingTop: 0,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  supportedByContainer: {
    marginTop: 4,
  },
  supportedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  supportedTitle: {
    fontSize: 14,
  },
  supportedNames: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 28,
  },
  contactButton: {
    width: '100%',
    alignSelf: 'stretch',
  },
});
