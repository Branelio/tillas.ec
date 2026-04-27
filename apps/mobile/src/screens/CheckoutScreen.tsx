import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { TillasButton } from '../components';
import { usersApi, ordersApi } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { getEstimatedDeliveryText } from '../utils/delivery';

const SHIPPING_QUITO = 3.50;
const SHIPPING_NACIONAL = 7.00;

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  city: string;
  sector: string;
  mainStreet: string;
  secondaryStreet?: string;
  reference: string;
  isDefault?: boolean;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal } = useCartStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [label, setLabel] = useState('Casa');
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [mainStreet, setMainStreet] = useState('');
  const [secondaryStreet, setSecondaryStreet] = useState('');
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingAddresses(false);
      return;
    }

    usersApi
      .getAddresses()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [];
        setAddresses(list);

        const defaultAddress = list.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        } else {
          setUseNewAddress(true);
        }
      })
      .catch(() => {
        setUseNewAddress(true);
      })
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const selectedAddress = useMemo(
    () => addresses.find((addr) => addr.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const shippingCity = useNewAddress ? city : selectedAddress?.city || '';
  const isQuito = shippingCity.toLowerCase().includes('quito');
  const shipping = isQuito ? SHIPPING_QUITO : SHIPPING_NACIONAL;
  const total = subtotal + shipping;

  const validateNewAddress = () => {
    if (!label || !recipientName || !city || !sector || !mainStreet || !reference || !phone) {
      Alert.alert('Error', 'Completa todos los campos obligatorios de la nueva dirección');
      return false;
    }
    return true;
  };

  const getAddressIdForOrder = async () => {
    if (!useNewAddress && selectedAddressId) {
      return selectedAddressId;
    }

    if (!validateNewAddress()) {
      return null;
    }

    const { data } = await usersApi.addAddress({
      label,
      recipientName,
      phone,
      city,
      sector,
      mainStreet,
      secondaryStreet,
      reference,
      isDefault: addresses.length === 0,
    });

    const createdId = data?.id;
    if (createdId) {
      setAddresses((prev) => [data, ...prev]);
      setSelectedAddressId(createdId);
      setUseNewAddress(false);
    }
    return createdId || null;
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    setLoading(true);
    try {
      const addressId = await getAddressIdForOrder();
      if (!addressId) {
        setLoading(false);
        return;
      }

      const { data } = await ordersApi.create(addressId);
      router.push(`/payment/${data.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear la orden');
    } finally {
      setLoading(false);
    }
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

        {!useNewAddress && (
          <>
            {loadingAddresses ? (
              <Text style={styles.loadingText}>Cargando direcciones...</Text>
            ) : addresses.length === 0 ? (
              <Text style={styles.loadingText}>No tienes direcciones guardadas.</Text>
            ) : (
              <View style={styles.addressList}>
                {addresses.map((addr) => {
                  const selected = selectedAddressId === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.addressCard, selected && styles.addressCardSelected]}
                      onPress={() => setSelectedAddressId(addr.id)}
                    >
                      <View style={styles.addressHeadRow}>
                        <Text style={styles.addressLabel}>{addr.label}</Text>
                        {addr.isDefault ? <Text style={styles.defaultBadge}>Principal</Text> : null}
                      </View>
                      <Text style={styles.addressLine}>{addr.recipientName} • {addr.phone}</Text>
                      <Text style={styles.addressSubLine}>{addr.mainStreet}{addr.secondaryStreet ? ` y ${addr.secondaryStreet}` : ''}, {addr.sector}, {addr.city}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}

        <TouchableOpacity onPress={() => setUseNewAddress((prev) => !prev)}>
          <Text style={styles.toggleAddressText}>{useNewAddress ? 'Usar dirección guardada' : 'Agregar nueva dirección'}</Text>
        </TouchableOpacity>

        {useNewAddress && (
          <>
            <TextInput style={styles.input} placeholder="Etiqueta (Casa/Oficina) *" placeholderTextColor={Colors.textMuted}
              value={label} onChangeText={setLabel} />
            <TextInput style={styles.input} placeholder="Nombre de quien recibe *" placeholderTextColor={Colors.textMuted}
              value={recipientName} onChangeText={setRecipientName} />
            <TextInput style={styles.input} placeholder="Ciudad *" placeholderTextColor={Colors.textMuted}
              value={city} onChangeText={setCity} />
            <TextInput style={styles.input} placeholder="Sector / Barrio *" placeholderTextColor={Colors.textMuted}
              value={sector} onChangeText={setSector} />
            <TextInput style={styles.input} placeholder="Calle principal *" placeholderTextColor={Colors.textMuted}
              value={mainStreet} onChangeText={setMainStreet} />
            <TextInput style={styles.input} placeholder="Calle secundaria" placeholderTextColor={Colors.textMuted}
              value={secondaryStreet} onChangeText={setSecondaryStreet} />
            <TextInput style={styles.input} placeholder="Referencia (ej: junto a la panadería) *" placeholderTextColor={Colors.textMuted}
              value={reference} onChangeText={setReference} />
            <TextInput style={styles.input} placeholder="Teléfono de contacto *" placeholderTextColor={Colors.textMuted}
              value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </>
        )}
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
  loadingText: { color: Colors.textMuted, fontSize: FontSizes.sm, marginBottom: Spacing.sm },
  addressList: { gap: Spacing.sm, marginBottom: Spacing.sm },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
  },
  addressCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  addressHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressLabel: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '700' },
  defaultBadge: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  addressLine: { color: Colors.textSecondary, fontSize: FontSizes.xs, marginTop: 2 },
  addressSubLine: { color: Colors.textMuted, fontSize: FontSizes.xs, marginTop: 2 },
  toggleAddressText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '600', marginBottom: Spacing.sm },
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
