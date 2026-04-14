import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { LevelBadge, TillasButton } from '../components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

const TIER_THRESHOLDS = { BRONCE: 0, PLATA: 500, ORO: 2000, ELITE: 5000 };

export default function LoyaltyScreen() {
  const router = useRouter();
  const [loyalty, setLoyalty] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    api.get('/loyalty/points').then(r => setLoyalty(r.data)).catch(() => {});
    api.get('/loyalty/transactions').then(r => setTransactions(r.data)).catch(() => {});
  }, []);

  const tier = (loyalty?.tier || 'BRONCE') as 'BRONCE' | 'PLATA' | 'ORO' | 'ELITE';
  const points = loyalty?.totalPoints || 0;
  const nextTier = tier === 'BRONCE' ? 'PLATA' : tier === 'PLATA' ? 'ORO' : tier === 'ORO' ? 'ELITE' : null;
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : TIER_THRESHOLDS.ELITE;
  const progress = Math.min(1, points / nextThreshold);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TillasButton title="← Volver" variant="ghost" size="sm" onPress={() => router.back()} style={{ alignSelf: 'flex-start', marginTop: 56, marginLeft: Spacing.md }} />

      {/* Level Card */}
      <View style={styles.levelCard}>
        <LevelBadge tier={tier} />
        <Text style={styles.pointsLarge}>{points.toLocaleString()}</Text>
        <Text style={styles.pointsLabel}>TILLAS POINTS</Text>
        <Text style={styles.equivalent}>= ${(points / 100).toFixed(2)} USD de descuento</Text>

        {/* Progress to next */}
        {nextTier && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{points} / {nextThreshold} para {nextTier}</Text>
          </View>
        )}
      </View>

      {/* How to earn */}
      <Text style={styles.sectionTitle}>Cómo ganar puntos</Text>
      <View style={styles.earnGrid}>
        {[
          { emoji: '🛍️', title: 'Compras', desc: '$1 = 10 puntos' },
          { emoji: '⭐', title: 'Reviews', desc: '50 puntos c/u' },
          { emoji: '👥', title: 'Referidos', desc: '200 puntos' },
          { emoji: '🎂', title: 'Cumpleaños', desc: 'Puntos dobles' },
        ].map((item, i) => (
          <View key={i} style={styles.earnCard}>
            <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
            <Text style={styles.earnTitle}>{item.title}</Text>
            <Text style={styles.earnDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* Transactions */}
      <Text style={styles.sectionTitle}>Historial</Text>
      {transactions.map((tx: any, i: number) => (
        <View key={i} style={styles.txRow}>
          <View>
            <Text style={styles.txType}>{tx.type === 'PURCHASE' ? '🛍️ Compra' : '🎁 Canjeo'}</Text>
            <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('es-EC')}</Text>
          </View>
          <Text style={[styles.txPoints, { color: tx.type === 'PURCHASE' ? Colors.success : Colors.error }]}>
            {tx.type === 'PURCHASE' ? '+' : '-'}{tx.points}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  levelCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, margin: Spacing.md,
    padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  pointsLarge: { color: Colors.textPrimary, fontSize: 48, fontWeight: '900', marginTop: Spacing.md },
  pointsLabel: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '700', letterSpacing: 2 },
  equivalent: { color: Colors.textMuted, fontSize: FontSizes.sm, marginTop: 4 },
  progressSection: { width: '100%', marginTop: Spacing.lg },
  progressBar: { width: '100%', height: 8, backgroundColor: Colors.surfaceElevated, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  progressText: { color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: 4, textAlign: 'center' },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '700', padding: Spacing.md },
  earnGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm },
  earnCard: {
    width: '50%', padding: Spacing.xs,
  },
  earnTitle: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600', marginTop: 4 },
  earnDesc: { color: Colors.textMuted, fontSize: FontSizes.xs },
  txRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderColor: Colors.border,
  },
  txType: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
  txDate: { color: Colors.textMuted, fontSize: FontSizes.xs },
  txPoints: { fontSize: FontSizes.lg, fontWeight: '700' },
});
