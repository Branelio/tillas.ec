import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '../constants/theme';

interface TillasButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function TillasButton({
  title, onPress, loading, disabled, variant = 'primary', size = 'md', icon, style, textStyle,
}: TillasButtonProps) {
  const isDisabled = disabled || loading;

  const btnStyles = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    isDisabled && styles.disabled,
    style,
  ];

  const txtStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`textVariant_${variant}`],
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={btnStyles}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={txtStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  size_sm: { paddingVertical: 10, paddingHorizontal: 16 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 32 },
  variant_primary: { backgroundColor: Colors.primary },
  variant_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  variant_ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '700' },
  text_sm: { fontSize: FontSizes.sm },
  text_md: { fontSize: FontSizes.lg },
  text_lg: { fontSize: FontSizes.xl },
  textVariant_primary: { color: Colors.white },
  textVariant_outline: { color: Colors.primary },
  textVariant_ghost: { color: Colors.primary },
});
