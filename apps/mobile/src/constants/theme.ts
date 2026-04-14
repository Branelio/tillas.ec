// ==============================================
// TILLAS.EC — Design System Constants 2026
// Paleta: Dark mode con naranja como acento
// ==============================================

export const Colors = {
  // Core — Slate dark (Dark Mode First)
  background: '#0A0A0A',
  surface: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  border: '#3A3A3C',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1A6',
  textMuted: '#71717A',

  // Brand — Tillas Red (Primary)
  primary: '#FF3B30',
  primaryDark: '#E02720',
  primaryLight: '#FF5247',
  secondary: '#CCFF00',

  // Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // DeUna
  deuna: '#22C55E',

  // Loyalty tiers
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#E5E4E2',

  // Glassmorphism
  glass: 'rgba(28, 28, 30, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: '#3A3A3C',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  hero: 36,
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
