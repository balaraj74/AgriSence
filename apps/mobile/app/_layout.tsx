import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '../src/theme';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Safety timeout — always hide splash after 3 seconds no matter what
const SPLASH_TIMEOUT_MS = 3000;

function RootLayoutContent() {
  const { colorScheme, colors } = useTheme();
  const splashHidden = useRef(false);

  // Utility to hide splash once (idempotent)
  const hideSplash = async () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    try {
      await SplashScreen.hideAsync();
    } catch (_) {
      // Already hidden — ignore
    }
  };

  useEffect(() => {
    // Safety net: always hide splash after timeout even if fonts / firebase fail
    const timer = setTimeout(hideSplash, SPLASH_TIMEOUT_MS);
    // Hide immediately since fonts will load dynamically or use system fonts
    hideSplash();
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Dashboard header is always dark overlay, so we use light icons */}
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)/index" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
