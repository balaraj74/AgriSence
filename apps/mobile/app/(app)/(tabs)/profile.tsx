import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { signOut } from '../../../src/services/auth';
import {
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Bell,
  ChevronRight,
  BookOpen,
  Settings,
  Phone,
  CircleHelp as HelpCircle,
  Pen as Edit3,
} from 'lucide-react-native';

// ─── Initials Avatar ──────────────────────────────────────────────────────────
function InitialsAvatar({ name, size = 80 }: { name: string; size?: number }) {
  const cleanName = (name || 'Farmer').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = '';
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    const firstChar = parts[0][0] || '';
    const lastChar = parts[parts.length - 1]![0] || '';
    initials = `${firstChar}${lastChar}`.toUpperCase();
  } else if (parts[0]) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else {
    initials = 'FA';
  }
  return (
    <View
      style={[
        initialsStyles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[initialsStyles.text, { fontSize: size * 0.32 }]}>
        {initials}
      </Text>
    </View>
  );
}

const initialsStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ff7a00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, typography, spacing, colorScheme, toggleTheme } = useTheme();
  const [signingOut, setSigningOut] = useState(false);

  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const displayName = user?.displayName ?? 'Farmer Partner';
  const firstName = displayName.split(' ')[0] ?? displayName;
  const hasPhoto = !!user?.photoURL;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(true);
              await signOut();
              // Navigate to auth screen
              router.replace('/(auth)');
            } catch (error) {
              setSigningOut(false);
              console.error('Failed to sign out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
    );
  };

  const profileOptions = [
    {
      title: 'Notifications',
      desc: 'Alerts, sounds & preferences',
      icon: Bell,
      color: '#ff7a00',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon.'),
    },
    {
      title: 'Privacy & Security',
      desc: 'Biometrics & account safety',
      icon: Shield,
      color: '#8b5cf6',
      onPress: () => Alert.alert('Coming Soon', 'Security settings will be available soon.'),
    },
    {
      title: 'Farming Guide',
      desc: 'Cultivation recommendations',
      icon: BookOpen,
      color: '#10b981',
      onPress: () => Alert.alert('Coming Soon', 'Farming guide will be available soon.'),
    },
    {
      title: 'Support & Help',
      desc: 'FAQs and contact us',
      icon: HelpCircle,
      color: '#2563eb',
      onPress: () => Alert.alert('Coming Soon', 'Support centre will be available soon.'),
    },
    {
      title: 'Contact AgriSence',
      desc: '+91 90000 00000',
      icon: Phone,
      color: '#d97706',
      onPress: () => Alert.alert('Contact Us', 'Phone: +91 90000 00000\nEmail: support@agrisence.com'),
    },
  ];

  // Light glassmorphic card background
  const glassCardBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.safe, { backgroundColor: isDark ? '#0f1117' : '#f4f6f9' }]}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: isDark ? '#0f1117' : '#f4f6f9', paddingTop: insets.top + 10 }]}>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
          ]}
        >
          My Profile
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon.')}
          style={[styles.editBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
        >
          <Edit3 size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}
      >
        {/* ── Hero User Card ───────────────────────────────────────────── */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: glassCardBg,
              borderColor: glassBorder,
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16 },
                android: { elevation: 4 },
              }),
            },
          ]}
        >
          <View style={styles.heroTop}>
            {/* Avatar */}
            <View style={[styles.avatarRing, { borderColor: '#ff7a00' }]}>
              {hasPhoto ? (
                <Image source={{ uri: user!.photoURL! }} style={styles.avatarImg} />
              ) : (
                <InitialsAvatar name={displayName} size={76} />
              )}
            </View>
            {/* Info */}
            <View style={styles.heroInfo}>
              <Text
                style={[styles.userName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}
              >
                {displayName}
              </Text>
              <Text
                style={[styles.userEmail, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}
              >
                {user?.email ?? 'farmer@agrisence.org'}
              </Text>
              <View style={[styles.badge, { backgroundColor: '#ff7a0018', borderColor: '#ff7a0030' }]}>
                <View style={styles.greenDot} />
                <Text style={[styles.badgeText, { fontFamily: typography.fontFamily.sansMedium, color: '#ff7a00' }]}>
                  Active Farmer
                </Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={[styles.statsRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            {[
              { label: 'Fields', value: '3' },
              { label: 'Crops', value: '5' },
              { label: 'Season', value: 'Kharif' },
            ].map((s, i, arr) => (
              <View
                key={s.label}
                style={[
                  styles.statItem,
                  i < arr.length - 1 && {
                    borderRightWidth: 1,
                    borderRightColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
              >
                <Text style={[styles.statValue, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Theme Toggle Card ────────────────────────────────────────── */}
        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: glassCardBg,
              borderColor: glassBorder,
              marginTop: 16,
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 },
                android: { elevation: 3 },
              }),
            },
          ]}
        >
          <View style={styles.themeRow}>
            <View style={[styles.themeIconBox, { backgroundColor: isDark ? '#1e2a3a' : '#fff3e6' }]}>
              {isDark ? (
                <Moon size={20} color="#60a5fa" />
              ) : (
                <Sun size={20} color="#ff7a00" />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                Switch visual appearance
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e5e7eb', true: '#374151' }}
              thumbColor={isDark ? '#60a5fa' : '#ff7a00'}
            />
          </View>
        </View>

        {/* ── Settings List ─────────────────────────────────────────────── */}
        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: glassCardBg,
              borderColor: glassBorder,
              marginTop: 16,
              overflow: 'hidden',
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 },
                android: { elevation: 3 },
              }),
            },
          ]}
        >
          {profileOptions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionRow,
                idx > 0 && {
                  borderTopWidth: 1,
                  borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.65}
            >
              <View style={[styles.optionIconBox, { backgroundColor: `${item.color}15` }]}>
                <item.icon size={20} color={item.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionName, { color: colors.foreground, fontFamily: typography.fontFamily.sansSemiBold }]}>
                  {item.title}
                </Text>
                <Text style={[styles.optionDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {item.desc}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── App Info ─────────────────────────────────────────────────── */}
        <Text style={[styles.versionText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
          AgriSence v1.0.0 — Made with 💚 for Indian Farmers
        </Text>

        {/* ── Sign Out Button ──────────────────────────────────────────── */}
        <TouchableOpacity
          style={[
            styles.signOutBtn,
            {
              backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.08)',
              borderColor: isDark ? 'rgba(239,68,68,0.3)' : 'rgba(220,38,38,0.2)',
            },
          ]}
          onPress={handleSignOut}
          activeOpacity={0.7}
          disabled={signingOut}
        >
          <LogOut size={20} color="#dc2626" />
          <Text style={[styles.signOutText, { fontFamily: typography.fontFamily.sansSemiBold }]}>
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  avatarRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  heroInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 19,
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  badgeText: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 2,
  },
  statValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 11,
  },

  // Glass card
  glassCard: {
    borderRadius: 20,
    borderWidth: 1,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  themeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // Options
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontSize: 15,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 12,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  signOutText: {
    fontSize: 16,
    color: '#dc2626',
  },
});
