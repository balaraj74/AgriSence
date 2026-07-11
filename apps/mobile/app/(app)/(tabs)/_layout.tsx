import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme';
import { Home, ClipboardList, Wrench, Sparkles, User } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors, typography, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  // Bottom padding: respect home-indicator on iPhone but cap it
  const bottomPad = Math.max(insets.bottom, 8);

  const tabBarBg = isDark ? '#141820' : '#ffffff';
  const activeTint = '#ff7a00';
  const inactiveTint = isDark ? '#4a5568' : '#9ca3af';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomPad + 10,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 36,
          backgroundColor: tabBarBg,
          borderTopWidth: 0,
          // Floating dock shadow
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.5 : 0.12,
              shadowRadius: 20,
            },
            android: {
              elevation: 16,
            },
          }),
          paddingHorizontal: 8,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.sansMedium,
          fontSize: 10,
          marginTop: -2,
          marginBottom: 6,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => <Wrench size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI Hub',
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
