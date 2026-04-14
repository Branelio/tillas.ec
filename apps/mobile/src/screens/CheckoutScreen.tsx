import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { TillasButton } from '../components';
import api from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { getEstimatedDeliveryText } from '../utils/delivery';

const SHIPPING_QUITO = 3.50;
const SHIPPING_NACIONAL = 7.00;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [mainStreet, setMainStreet] = useState('');
  const [secondaryStreet, setSecondaryStreet] = useState('');
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const isQuito = city.toLowerCase().includes('quito');
  const shipping = isQuito ? SHIPPING_QUITO : SHIPPING_NACIONAL;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!city || !mainStreet || !phone) {
      return Alert.alert('Error', 'Completa ciudad, calle principal y teléfono');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: {
          city,
          sector,
          mainStreet,
          secondaryStreet,
          reference,
          phone,
        },
      });
      router.push(`/payment/${data.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear la orden');
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <TillasButton title="Explorar sneakers" onPress={() => router.push('/(tabs)/search')} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      {/* Items summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen ({items.length} artículos)</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.variant.product.images?.[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemBrand}>{item.variant.product.brand?.name}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.variant.product.name}</Text>
              <Text style={styles.itemSize}>Talla {item.variant.size} × {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${(item.variant.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Shipping address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Dirección de Envío</Text>

        <TextInput style={styles.input} placeholder="Ciudad *" placeholderTextColor={Colors.textMuted}
          value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="Sector / Barrio" placeholderTextColor={Colors.textMuted}
          value={sector} onChangeText={setSector} />
        <TextInput style={styles.input} placeholder="Calle principal *" placeholderTextColor={Colors.textMuted}
          value={mainStreet} onChangeText={setMainStreet} />
        <TextInput style={styles.input} placeholder="Calle secundaria" placeholderTextColor={Colors.textMuted}
          value={secondaryStreet} onChangeText={setSecondaryStreet} />
        <TextInput style={styles.input} placeholder="Referencia (ej: junto a la panadería)" placeholderTextColor={Colors.textMuted}
          value={reference} onChangeText={setReference} />
        <TextInput style={styles.input} placeholder="Teléfono de contacto *" placeholderTextColor={Colors.textMuted}
          value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </View>

      {/* Delivery ETA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Entrega Estimada</Text>
        <View style={styles.deliveryBanner}>
          <Text style={styles.deliveryTitle}>Recíbelo el <Text style={{color: Colors.primary, textTransform: 'capitalize'}}>{getEstimatedDeliveryText()}</Text></Text>
          <Text style={styles.deliveryDesc}>
            Pedidos antes del Martes a las 18:00h llegan el Sábado. Pedidos posteriores se programan para la siguiente semana.
          </Text>
        </View>
      </View>

      {/* Cost breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Resumen de Costos</Text>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Subtotal</Text>
          <Text style={styles.costValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Envío ({isQuito ? 'Quito' : 'Nacional'})</Text>
          <Text style={styles.costValue}>${shipping.toFixed(2)}</Text>
        </View>
        <View style={[styles.costRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Pay button */}
      <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.md }}>
        <TillasButton
          title="Pagar — Transferencia"
          onPress={handleCheckout}
          loading={loading}
          size="lg"
        />
        <Text style={styles.disclaimer}>
          Al confirmar, aceptas nuestros términos y te mostraremos los datos para transferir
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  emptyText: { color: Colors.textSecondary, fontSize: FontSizes.lg, marginTop: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md },
  backText: { color: Colors.textSecondary, fontSize: FontSizes.md, fontWeight: '600' },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800' },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '700', marginBottom: Spacing.md },
  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  itemImage: { width: 56, height: 56, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated },
  itemInfo: { flex: 1 },
  itemBrand: { color: Colors.primary, fontSize: FontSizes.xs, fontWeight: '600', textTransform: 'uppercase' },
  itemName: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600' },
  itemSize: { color: Colors.textMuted, fontSize: FontSizes.xs },
  itemPrice: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700' },
  // Address
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: 14, color: Colors.textPrimary, fontSize: FontSizes.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  // Costs
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  costLabel: { color: Colors.textSecondary, fontSize: FontSizes.md },
  costValue: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm },
  totalLabel: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '800' },
  totalValue: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight: '900' },
  disclaimer: { color: Colors.textMuted, fontSize: FontSizes.xs, textAlign: 'center', marginTop: Spacing.md },
  
  // Delivery Banner
  deliveryBanner: { backgroundColor: Colors.surfaceElevated, borderColor: Colors.primary, borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.md },
  deliveryTitle: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700', marginBottom: 4 },
  deliveryDesc: { color: Colors.textSecondary, fontSize: FontSizes.sm, lineHeight: 20 },
});
