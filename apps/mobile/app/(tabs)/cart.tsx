import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { TillasButton } from '../../src/components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';

export default function CartTab() {
  const router = useRouter();
  const { items, subtotal, itemCount, isLoading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Tu Carrito</Text>
        <Text style={styles.emptyText}>Inicia sesión para ver tu carrito</Text>
        <TillasButton title="Iniciar Sesión" onPress={() => router.push('/(auth)/login')} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 48 }}>👟</Text>
        <Text style={styles.emptyTitle}>Carrito vacío</Text>
        <Text style={styles.emptyText}>Agrega sneakers para comenzar</Text>
        <TillasButton title="Explorar sneakers" onPress={() => router.push('/(tabs)/search')} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.header}>Tu Carrito ({itemCount})</Text>

        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.variant.product.images?.[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemBrand}>{item.variant.product.brand?.name}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.variant.product.name}</Text>
              <Text style={styles.itemSize}>Talla {item.variant.size}</Text>
              <Text style={styles.itemPrice}>${item.variant.price.toFixed(2)}</Text>

              {/* Quantity controls */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                >
                  <Text style={styles.qtyBtnText}>{item.quantity === 1 ? '🗑️' : '−'}</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <TillasButton
          title="Ir al Checkout"
          onPress={() => router.push('/checkout')}
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: Spacing.lg },
  emptyTitle: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800', marginTop: Spacing.md },
  emptyText: { color: Colors.textSecondary, fontSize: FontSizes.md, marginTop: Spacing.xs },
  header: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800', paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md },
  itemCard: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  itemImage: { width: 90, height: 90, borderRadius: BorderRadius.lg, backgroundColor: Colors.surfaceElevated },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemBrand: { color: Colors.primary, fontSize: FontSizes.xs, fontWeight: '600', textTransform: 'uppercase' },
  itemName: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600', marginTop: 2 },
  itemSize: { color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: 2 },
  itemPrice: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  qtyBtn: { width: 32, height: 32, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700' },
  qtyText: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, paddingBottom: 30,
  },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalLabel: { color: Colors.textSecondary, fontSize: FontSizes.md },
  subtotalValue: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '900' },
});
