import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { ProductCard } from '../components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 20 };
      if (search) params.search = search;
      if (selectedBrand) params.brand = selectedBrand;
      const { data } = await api.get('/products', { params });
      setProducts(data.data || data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, selectedBrand]);
  useEffect(() => { api.get('/products/brands').then(r => setBrands(r.data)).catch(() => {}); }, []);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.title}>Explorar</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar sneakers, marcas..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Brand filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.md }}>
        <TouchableOpacity style={[styles.filterChip, !selectedBrand && styles.filterActive]} onPress={() => setSelectedBrand('')}>
          <Text style={[styles.filterText, !selectedBrand && styles.filterTextActive]}>Todos</Text>
        </TouchableOpacity>
        {brands.map(b => (
          <TouchableOpacity key={b.id} style={[styles.filterChip, selectedBrand === b.slug && styles.filterActive]} onPress={() => setSelectedBrand(selectedBrand === b.slug ? '' : b.slug)}>
            <Text style={[styles.filterText, selectedBrand === b.slug && styles.filterTextActive]}>{b.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={products}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: Spacing.sm, paddingBottom: 100 }}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={{ width: '50%' }}>
            <ProductCard product={item} onPress={() => router.push(`/product/${item.slug}`)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>👟</Text>
            <Text style={styles.emptyText}>No encontramos sneakers</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { paddingHorizontal: Spacing.md, paddingTop: 56 },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '800', marginBottom: Spacing.sm },
  searchInput: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: 14, color: Colors.textPrimary, fontSize: FontSizes.md, borderWidth: 1, borderColor: Colors.border,
  },
  filterBar: { maxHeight: 50, marginTop: Spacing.md },
  filterChip: { backgroundColor: Colors.surface, borderRadius: BorderRadius.full, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: FontSizes.sm, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textMuted, fontSize: FontSizes.lg, marginTop: Spacing.md },
});
