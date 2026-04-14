import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { ProductCard, CountdownTimer } from '../components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [featured, setFeatured] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [nextDrop, setNextDrop] = useState<any>(null);

  useEffect(() => {
    api.get('/products/featured').then(r => setFeatured(r.data)).catch(() => {});
    api.get('/products/new-arrivals').then(r => setNewArrivals(r.data)).catch(() => {});
    api.get('/products/brands').then(r => setBrands(r.data)).catch(() => {});
    api.get('/drops').then(r => {
      const upcoming = r.data.find((d: any) => new Date(d.startsAt) > new Date());
      if (upcoming) setNextDrop(upcoming);
    }).catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}><Text style={{ color: Colors.primary }}>TILLAS</Text>.EC</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/orders')}>
          <Text style={{ fontSize: 22 }}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Drop Banner */}
      {nextDrop && (
        <TouchableOpacity style={styles.dropBanner} onPress={() => router.push('/(tabs)/drops')}>
          <Text style={styles.dropLabel}>🔥 PRÓXIMO DROP</Text>
          <Text style={styles.dropTitle}>{nextDrop.title}</Text>
          <CountdownTimer expiresAt={nextDrop.startsAt} />
        </TouchableOpacity>
      )}

      {/* Para Ti */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Para Ti 🎯</Text>
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.md }}
            renderItem={({ item }) => (
              <View style={{ width: width * 0.42, marginRight: Spacing.sm }}>
                <ProductCard product={item} onPress={() => router.push(`/product/${item.slug}`)} />
              </View>
            )}
            keyExtractor={i => i.id}
          />
        </View>
      )}

      {/* Marcas */}
      {brands.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marcas</Text>
          <FlatList
            data={brands}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.brandChip} onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.brandName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={i => i.id}
          />
        </View>
      )}

      {/* Trending */}
      {newArrivals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending 🔥</Text>
          <View style={styles.grid}>
            {newArrivals.slice(0, 6).map(item => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard product={item} onPress={() => router.push(`/product/${item.slug}`)} />
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md },
  logo: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.textPrimary },
  dropBanner: {
    marginHorizontal: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '40', alignItems: 'center',
  },
  dropLabel: { color: Colors.primary, fontSize: FontSizes.xs, fontWeight: '700', letterSpacing: 1 },
  dropTitle: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '800', marginTop: 4, marginBottom: Spacing.sm },
  section: { marginTop: Spacing.xl },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '700', marginBottom: Spacing.md, paddingHorizontal: Spacing.md },
  brandChip: { backgroundColor: Colors.surface, borderRadius: BorderRadius.full, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  brandName: { color: Colors.textPrimary, fontSize: FontSizes.sm, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm },
  gridItem: { width: '50%' },
});
