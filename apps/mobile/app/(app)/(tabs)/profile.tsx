import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { signOut } from '../../../src/services/auth';
import { Card, CardContent } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Bell,
  ChevronRight,
  BookOpen,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, typography, spacing, colorScheme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const profileOptions = [
    {
      title: 'Notifications',
      desc: 'Preferences, alerts & sound controls',
      icon: Bell,
      onPress: () => {},
    },
    {
      title: 'Privacy & Security',
      desc: 'Biometrics & account settings',
      icon: Shield,
      onPress: () => {},
    },
    {
      title: 'Farming Guide',
      desc: 'General cultivation recommendations',
      icon: BookOpen,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
          My Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[6] }}>
        {/* User Card */}
        <Card>
          <CardContent style={[styles.userCardContent, { padding: spacing[4] }]}>
            <View style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}>
              <User size={32} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                {user?.displayName || 'Farmer Partner'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                {user?.email || 'farmer@agrisence.org'}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* Theme Settings Card */}
        <Card>
          <CardContent style={[styles.settingsCardContent, { padding: spacing[4] }]}>
            <View style={styles.settingsLabelRow}>
              {colorScheme === 'dark' ? (
                <Moon size={22} color={colors.primary} />
              ) : (
                <Sun size={22} color={colors.primary} />
              )}
              <View>
                <Text style={[styles.settingTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                  Dark Theme
                </Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  Enable light or dark visual aesthetic
                </Text>
              </View>
            </View>
            <Button
              variant="secondary"
              size="sm"
              onPress={toggleTheme}
              style={styles.toggleButton}
            >
              {colorScheme === 'dark' ? 'Disable' : 'Enable'}
            </Button>
          </CardContent>
        </Card>

        {/* Options List */}
        <View style={{ gap: spacing[3] }}>
          {profileOptions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBox, { backgroundColor: `${colors.primary}15` }]}>
                  <item.icon size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.optionName, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    {item.desc}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          variant="destructive"
          size="lg"
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <LogOut size={20} color="#ffffff" style={{ marginRight: spacing[2] }} />
          Sign Out
        </Button>
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
  headerTitle: {
    fontSize: 22,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  settingsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleButton: {
    marginLeft: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 15,
  },
  optionDesc: {
    fontSize: 12,
  },
  signOutButton: {
    width: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
