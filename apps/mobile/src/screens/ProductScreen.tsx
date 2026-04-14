import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../services/api';
import { TillasButton, StockBadge } from '../components';
import { useCartStore } from '../store/cartStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ProductScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!slug) return;
    api.get(`/products/${slug}`).then(r => {
      setProduct(r.data);
      if (r.data.variants?.length) setSelectedVariant(r.data.variants[0]);
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      api.get(`/reviews/product/${product.id}`).then(r => setReviews(r.data)).catch(() => {});
    }
  }, [product?.id]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await addItem(selectedVariant.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {}
    setAdding(false);
  };

  if (!product) {
    return <View style={styles.loading}><Text style={{ color: Colors.textMuted }}>Cargando...</Text></View>;
  }

  const price = selectedVariant?.price || 0;
  const compareAt = selectedVariant?.compareAt;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        {/* Image Gallery */}
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={e => setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={{ width, height: width, backgroundColor: Colors.surface }} resizeMode="cover" />
          )}
          keyExtractor={(_, i) => String(i)}
        />
        {/* Dots */}
        <View style={styles.dots}>
          {product.images.map((_: any, i: number) => (
            <View key={i} style={[styles.dot, i === currentImage && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.content}>
          {/* Brand + Name */}
          <Text style={styles.brand}>{product.brand?.name}</Text>
          <Text style={styles.name}>{product.name}</Text>
          {product.colorway && <Text style={styles.colorway}>{product.colorway} {product.styleCode && `• ${product.styleCode}`}</Text>}

          {/* Reviews */}
          {reviews?.totalReviews > 0 && (
            <View style={styles.reviewRow}>
              <Text style={{ color: Colors.warning }}>{'★'.repeat(Math.round(reviews.averageRating))}</Text>
              <Text style={styles.reviewText}>{reviews.averageRating} ({reviews.totalReviews})</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${price.toFixed(2)}</Text>
            {compareAt && (
              <>
                <Text style={styles.compareAt}>${compareAt.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{Math.round((1 - price / compareAt) * 100)}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Sizes */}
          <Text style={styles.sectionLabel}>Talla</Text>
          <View style={styles.sizesRow}>
            {product.variants.map((v: any) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => setSelectedVariant(v)}
                disabled={v.stock === 0}
                style={[
                  styles.sizeChip,
                  selectedVariant?.id === v.id && styles.sizeActive,
                  v.stock === 0 && styles.sizeDisabled,
                ]}
              >
                <Text style={[
                  styles.sizeText,
                  selectedVariant?.id === v.id && styles.sizeTextActive,
                  v.stock === 0 && styles.sizeTextDisabled,
                ]}>{v.size}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedVariant && <StockBadge stock={selectedVariant.stock} />}

          {/* Description */}
          <Text style={styles.sectionLabel}>Descripción</Text>
          <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>{product.description}</Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.expandText}>{expanded ? 'Ver menos' : 'Ver más...'}</Text>
          </TouchableOpacity>

          {/* Story */}
          {product.story && (
            <View style={styles.storyCard}>
              <Text style={styles.storyLabel}>📖 La Historia</Text>
              <Text style={styles.storyText}>{product.story}</Text>
            </View>
          )}

          {/* Guarantees */}
          <View style={styles.guarantees}>
            {['✅ 100% Original', '🚚 Envío rápido', '🔄 Devoluciones'].map((g, i) => (
              <View key={i} style={styles.guaranteeChip}>
                <Text style={styles.guaranteeText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom */}
      <View style={styles.bottomBar}>
        <TillasButton
          title={added ? '✅ ¡Agregado!' : 'Agregar al Carrito'}
          onPress={handleAddToCart}
          loading={adding}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10, backgroundColor: Colors.overlay, borderRadius: BorderRadius.full, paddingHorizontal: 12, paddingVertical: 6 },
  backText: { color: Colors.white, fontSize: FontSizes.sm, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: -20, marginBottom: Spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceElevated },
  dotActive: { backgroundColor: Colors.primary, width: 20 },
  content: { paddingHorizontal: Spacing.md },
  brand: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  name: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800', marginTop: 2 },
  colorway: { color: Colors.textMuted, fontSize: FontSizes.sm, marginTop: 2 },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  reviewText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md },
  price: { color: Colors.textPrimary, fontSize: FontSizes.hero, fontWeight: '900' },
  compareAt: { color: Colors.textMuted, fontSize: FontSizes.lg, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { color: Colors.white, fontSize: FontSizes.xs, fontWeight: '700' },
  sectionLabel: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeChip: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.surface },
  sizeActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  sizeDisabled: { opacity: 0.3 },
  sizeText: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600' },
  sizeTextActive: { color: Colors.white },
  sizeTextDisabled: { textDecorationLine: 'line-through' },
  description: { color: Colors.textSecondary, fontSize: FontSizes.md, lineHeight: 22 },
  expandText: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '600', marginTop: 4 },
  storyCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  storyLabel: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '700', marginBottom: 4 },
  storyText: { color: Colors.textSecondary, fontSize: FontSizes.sm, lineHeight: 20 },
  guarantees: { flexDirection: 'row', gap: 8, marginTop: Spacing.lg, marginBottom: 100 },
  guaranteeChip: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  guaranteeText: { color: Colors.textSecondary, fontSize: FontSizes.xs },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, paddingBottom: 30,
  },
});
