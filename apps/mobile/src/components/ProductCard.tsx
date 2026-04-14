import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '../constants/theme';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    brand?: { name: string };
    variants?: { price: number; compareAt?: number | null; stock?: number }[];
    isFeatured?: boolean;
  };
  onPress: () => void;
  onWishlist?: () => void;
}

export default function ProductCard({ product, onPress, onWishlist }: ProductCardProps) {
  const price = product.variants?.[0]?.price || 0;
  const compareAt = product.variants?.[0]?.compareAt;
  const stock = product.variants?.[0]?.stock;
  const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images?.[0] }} style={styles.image} resizeMode="cover" />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}
        {stock !== undefined && stock > 0 && stock < 3 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>¡Últimas {stock}!</Text>
          </View>
        )}
        {onWishlist && (
          <TouchableOpacity onPress={onWishlist} style={styles.wishlistBtn}>
            <Text style={{ fontSize: 16 }}>🤍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {product.brand && (
          <Text style={styles.brand}>{product.brand.name}</Text>
        )}
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
          {compareAt && (
            <Text style={styles.compareAt}>${compareAt.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    margin: 4,
  },
  imageContainer: { aspectRatio: 1, backgroundColor: Colors.surfaceElevated },
  image: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '700' },
  stockBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: Colors.error, borderRadius: BorderRadius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  stockText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '600' },
  wishlistBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: BorderRadius.full,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  info: { padding: Spacing.sm },
  brand: { color: Colors.primary, fontSize: FontSizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700' },
  compareAt: { color: Colors.textMuted, fontSize: FontSizes.sm, textDecorationLine: 'line-through' },
});
