import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  label,
  icon,
  variant = 'default',
  size = 'md',
  isLoading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors, borderRadius, typography, spacing } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
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
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: colors.foreground,
        };
      case 'destructive':
        return {
          bg: colors.destructive,
          border: 'transparent',
          text: colors.destructiveForeground,
        };
      case 'primary':
      case 'default':
      default:
        return {
          bg: colors.primary,
          border: 'transparent',
          text: colors.primaryForeground,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing[2],
          paddingHorizontal: spacing[3],
          fontSize: typography.fontSize.sm,
        };
      case 'lg':
        return {
          paddingVertical: spacing[4],
          paddingHorizontal: spacing[6],
          fontSize: typography.fontSize.lg,
        };
      case 'md':
      default:
        return {
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[4],
          fontSize: typography.fontSize.base,
        };
    }
  };

  const vStyle = getVariantStyles();
  const sStyle = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: vStyle.bg,
          borderColor: vStyle.border,
          borderWidth: vStyle.border !== 'transparent' ? 1 : 0,
          borderRadius: borderRadius.md,
          paddingVertical: sStyle.paddingVertical,
          paddingHorizontal: sStyle.paddingHorizontal,
          opacity: disabled || isLoading ? 0.6 : 1,
        },
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'destructive' || variant === 'primary' ? '#ffffff' : colors.foreground}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={{ marginRight: spacing[2] }}>{icon}</View>}
          {label ? (
            <Text
              style={[
                styles.text,
                {
                  color: vStyle.text,
                  fontSize: sStyle.fontSize,
                  fontFamily: typography.fontFamily.sansSemiBold,
                },
              ]}
            >
              {label}
            </Text>
          ) : typeof children === 'string' ? (
            <Text
              style={[
                styles.text,
                {
                  color: vStyle.text,
                  fontSize: sStyle.fontSize,
                  fontFamily: typography.fontFamily.sansSemiBold,
                },
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
