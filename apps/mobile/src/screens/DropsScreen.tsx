import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import api from '../services/api';
import { CountdownTimer } from '../components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function DropsScreen() {
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/drops').then(r => setDrops(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getStatus = (drop: any) => {
    const now = new Date();
    const start = new Date(drop.startsAt);
    if (now < start) return 'upcoming';
    if (drop.endsAt && now > new Date(drop.endsAt)) return 'ended';
    return 'live';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 24 }}>⚡</Text>
        <Text style={styles.title}>Drops</Text>
      </View>
      <FlatList
        data={drops}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}
        renderItem={({ item }) => {
          const status = getStatus(item);
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              {item.image && <Image source={{ uri: item.image }} style={styles.cardImage} />}
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, status === 'live' && styles.liveBadge, status === 'ended' && styles.endedBadge]}>
                    <Text style={styles.statusText}>{status === 'live' ? '🔴 EN VIVO' : status === 'upcoming' ? '⏰ Próximo' : '✅ Finalizado'}</Text>
                  </View>
                  {item.isRaffle && <View style={styles.raffleBadge}><Text style={styles.raffleText}>🎲 Raffle</Text></View>}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                {status === 'upcoming' && <CountdownTimer expiresAt={item.startsAt} />}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🔥</Text>
            <Text style={styles.emptyText}>No hay drops programados</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingTop: 56 },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800' },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: Spacing.md },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statusBadge: { backgroundColor: Colors.warning + '20', borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  liveBadge: { backgroundColor: Colors.error + '20' },
  endedBadge: { backgroundColor: Colors.textMuted + '20' },
  statusText: { color: Colors.textPrimary, fontSize: FontSizes.xs, fontWeight: '600' },
  raffleBadge: { backgroundColor: Colors.primary + '20', borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  raffleText: { color: Colors.primary, fontSize: FontSizes.xs, fontWeight: '600' },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '700' },
  cardDesc: { color: Colors.textSecondary, fontSize: FontSizes.sm, marginTop: 4, marginBottom: Spacing.sm },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textMuted, fontSize: FontSizes.lg, marginTop: Spacing.md },
});
