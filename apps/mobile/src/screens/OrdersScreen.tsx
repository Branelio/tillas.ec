import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusMap: Record<string, { emoji: string; color: string; label: string }> = {
    PENDING: { emoji: '⏳', color: Colors.warning, label: 'Pendiente' },
    PAYMENT_PROCESSING: { emoji: '💳', color: Colors.primary, label: 'Pagando' },
    PAID: { emoji: '✅', color: Colors.success, label: 'Pagado' },
    PREPARING: { emoji: '📦', color: Colors.info, label: 'Preparando' },
    SHIPPED: { emoji: '🚚', color: Colors.info, label: 'Enviado' },
    DELIVERED: { emoji: '🎉', color: Colors.success, label: 'Entregado' },
    CANCELLED: { emoji: '❌', color: Colors.error, label: 'Cancelado' },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Pedidos 📦</Text>
      <FlatList
        data={orders}
        keyExtractor={i => i.id}
        refreshing={refreshing}
        onRefresh={() => fetchOrders(true)}
        contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}
        renderItem={({ item }) => {
          const s = statusMap[item.status] || { emoji: '📋', color: Colors.textMuted, label: item.status };
          const canPayNow = item.status === 'PENDING' || item.status === 'FAILED';

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderNum}>#{item.orderNumber}</Text>
                <View style={[styles.statusBadge, { borderColor: s.color + '60', backgroundColor: s.color + '15' }]}>
                  <Text style={{ fontSize: 12 }}>{s.emoji}</Text>
                  <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.amount}>${Number(item.total).toFixed(2)}</Text>
              </View>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>

              {canPayNow ? (
                <TouchableOpacity
                  style={styles.payNowButton}
                  onPress={() => router.push(`/payment/${item.id}`)}
                >
                  <Text style={styles.payNowText}>Pagar ahora</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={styles.emptyText}>No tienes pedidos aún</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { color: Colors.textSecondary, marginTop: Spacing.sm, fontSize: FontSizes.sm },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800', paddingHorizontal: Spacing.md, paddingTop: 56 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderNum: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '700', fontFamily: 'monospace' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: FontSizes.xs, fontWeight: '600' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: Colors.textMuted, fontSize: FontSizes.sm },
  amount: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '800' },
  date: { color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: 4 },
  payNowButton: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    paddingVertical: 10,
  },
  payNowText: { color: Colors.black, fontSize: FontSizes.sm, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textMuted, fontSize: FontSizes.lg, marginTop: Spacing.md },
});
