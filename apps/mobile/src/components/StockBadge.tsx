import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSizes } from '../constants/theme';

interface StockBadgeProps {
  stock: number;
}

export default function StockBadge({ stock }: StockBadgeProps) {
  if (stock >= 3) return null;
  if (stock === 0) {
    return (
      <View style={[styles.badge, styles.outOfStock]}>
        <Text style={styles.text}>Agotado</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.lowStock]}>
      <Text style={styles.text}>¡Últimas {stock} unidades!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  lowStock: { backgroundColor: Colors.error + '20', borderWidth: 1, borderColor: Colors.error + '40' },
  outOfStock: { backgroundColor: Colors.textMuted + '20', borderWidth: 1, borderColor: Colors.textMuted + '40' },
  text: { color: Colors.error, fontSize: FontSizes.xs, fontWeight: '600' },
});
