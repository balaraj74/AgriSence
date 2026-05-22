import React from 'react';
import { View, Text, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '../../theme';

interface BadgeProps extends ViewProps {
  children?: React.ReactNode;
  label?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'destructive';
}

export function Badge({ children, label, variant = 'default', style, ...props }: BadgeProps) {
  const { colors, borderRadius, typography, spacing } = useTheme();

  const getVariantStyles = () => {
    const finalVariant = variant === 'destructive' ? 'error' : variant;
    switch (finalVariant) {
      case 'secondary':
        return {
          bg: colors.secondary,
          border: 'transparent',
          text: colors.secondaryForeground,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.border,
          text: colors.foreground,
        };
      case 'success':
        return {
          bg: `${colors.success}15`,
          border: 'transparent',
          text: colors.success,
        };
      case 'warning':
        return {
          bg: `${colors.warning}15`,
          border: 'transparent',
          text: colors.warning,
        };
      case 'error':
        return {
          bg: `${colors.error}15`,
          border: 'transparent',
          text: colors.error,
        };
      case 'default':
      default:
        return {
          bg: colors.primary,
          border: 'transparent',
          text: colors.primaryForeground,
        };
    }
  };

  const vStyle = getVariantStyles();
  const badgeContent = children !== undefined ? children : label;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: vStyle.bg,
          borderColor: vStyle.border,
          borderWidth: vStyle.border !== 'transparent' ? 1 : 0,
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[1],
        },
        style,
      ]}
      {...props}
    >
      {typeof badgeContent === 'string' ? (
        <Text
          style={[
            styles.text,
            {
              color: vStyle.text,
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontFamily.sansMedium,
            },
          ]}
        >
          {badgeContent}
        </Text>
      ) : (
        badgeContent
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    lineHeight: 14,
  },
});
