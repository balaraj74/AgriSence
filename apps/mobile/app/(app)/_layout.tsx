import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  // Redirect to Auth if not logged in
  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Configure default stack presentation for sub-screens */}
      <Stack.Screen name="chatbot" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="disease-check" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="soil-advisor" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="schemes" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="fertilizer-finder" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="loan-assistant" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="satellite-health" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="medicinal-plants" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="weather" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="market" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="market-matchmaking" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="land-records" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="voice" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="live-advisor" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="crops" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="expenses" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="harvest" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="analytics" options={{ presentation: 'card', headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

