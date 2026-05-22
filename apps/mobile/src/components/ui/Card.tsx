import React from 'react';
import { View, Text, StyleSheet, type ViewProps, type TextProps } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors, borderRadius, shadows } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: borderRadius.lg,
          ...shadows.sm,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardProps) {
  const { spacing } = useTheme();
  return (
    <View style={[styles.header, { padding: spacing[4] }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style, ...props }: TextProps) {
  const { colors, typography } = useTheme();
  return (
    <Text
      style={[
        styles.title,
        {
          color: colors.foreground,
          fontFamily: typography.fontFamily.sansBold,
          fontSize: typography.fontSize.lg,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardDescription({ children, style, ...props }: TextProps) {
  const { colors, typography } = useTheme();
  return (
    <Text
      style={[
        styles.description,
        {
          color: colors.mutedForeground,
          fontFamily: typography.fontFamily.sans,
          fontSize: typography.fontSize.sm,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function CardContent({ children, style, ...props }: CardProps) {
  const { spacing } = useTheme();
  return (
    <View style={[styles.content, { paddingHorizontal: spacing[4], paddingBottom: spacing[4] }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: CardProps) {
  const { spacing, colors } = useTheme();
  return (
    <View
      style={[
        styles.footer,
        {
          padding: spacing[4],
          borderTopColor: colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    letterSpacing: -0.2,
  },
  description: {
    marginTop: 2,
  },
  content: {},
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
