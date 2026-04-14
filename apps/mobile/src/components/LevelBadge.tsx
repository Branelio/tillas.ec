import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSizes } from '../constants/theme';

type Tier = 'BRONCE' | 'PLATA' | 'ORO' | 'ELITE';

const tierConfig: Record<Tier, { color: string; emoji: string; label: string }> = {
  BRONCE: { color: Colors.bronze, emoji: '🥉', label: 'Bronce' },
  PLATA: { color: Colors.silver, emoji: '🥈', label: 'Plata' },
  ORO: { color: Colors.gold, emoji: '🥇', label: 'Oro' },
  ELITE: { color: Colors.elite, emoji: '💎', label: 'Élite' },
};

interface LevelBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md';
}

export default function LevelBadge({ tier, size = 'md' }: LevelBadgeProps) {
  const config = tierConfig[tier] || tierConfig.BRONCE;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { borderColor: config.color }, isSmall && styles.small]}>
      <Text style={isSmall ? styles.emojiSm : styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.color }, isSmall && styles.labelSm]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  small: { paddingHorizontal: 8, paddingVertical: 3 },
  emoji: { fontSize: 16 },
  emojiSm: { fontSize: 12 },
  label: { fontSize: FontSizes.sm, fontWeight: '700' },
  labelSm: { fontSize: FontSizes.xs },
});
