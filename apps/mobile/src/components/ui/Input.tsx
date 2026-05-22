import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View, Text, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { colors, borderRadius, typography, spacing } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.foreground,
              fontFamily: typography.fontFamily.sansMedium,
              fontSize: typography.fontSize.sm,
              marginBottom: spacing[1],
            },
          ]}
        >
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.input,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[3],
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.sans,
          },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
      {error && (
        <Text
          style={[
            styles.error,
            {
              color: colors.destructive,
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.fontSize.xs,
              marginTop: spacing[1],
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {},
  input: {
    borderWidth: 1,
  },
  error: {},
});
