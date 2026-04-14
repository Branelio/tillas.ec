'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  brand?: { name: string };
  variants?: { price: number; compareAt?: number | null }[];
  isFeatured?: boolean;
}

interface Brand { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; }

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 12 };
      if (search) params.search = search;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedCategory) params.category = selectedCategory;
      if (sortBy === 'price-asc') params.sortBy = 'price_asc';
      if (sortBy === 'price-desc') params.sortBy = 'price_desc';
      if (sortBy === 'newest') params.sortBy = 'newest';

      const { data } = await productsApi.getAll(params);
      setProducts(data.data || data);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      console.error('Error cargando productos:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedBrand, selectedCategory, sortBy, page]);

  useEffect(() => {
    productsApi.getBrands().then(({ data }) => setBrands(data)).catch(() => {});
    productsApi.getCategories().then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const clearFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSortBy('newest');
    setPage(1);
  };

  const hasFilters = search || selectedBrand || selectedCategory || sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight">Catálogo</h1>
          <p className="text-tillas-text-secondary text-sm mt-1.5">Sneakers originales para todos los estilos</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchProducts(); }}
            className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tillas-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-tillas-surface-elevated border border-tillas-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-tillas-text-muted focus:outline-none focus:border-tillas-primary/50 focus:ring-1 focus:ring-tillas-primary/20 transition-all w-48 md:w-64"
            />
          </form>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-tillas-primary text-black border-tillas-primary' : 'bg-tillas-surface-elevated text-tillas-text-secondary border-tillas-border hover:border-tillas-primary/50 hover:text-white'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="bg-tillas-surface rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3 border border-tillas-border">
          <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
            className="bg-tillas-surface-elevated border border-tillas-border rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-tillas-primary/50 hover:border-tillas-primary/30 transition-colors min-w-[140px]">
            <option value="" className="bg-tillas-surface-elevated text-white">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug} className="bg-tillas-surface-elevated text-white">{b.name}</option>
            ))}
          </select>

          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="bg-tillas-surface-elevated border border-tillas-border rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-tillas-primary/50 hover:border-tillas-primary/30 transition-colors min-w-[150px]">
            <option value="" className="bg-tillas-surface-elevated text-white">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug} className="bg-tillas-surface-elevated text-white">{c.name}</option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-tillas-surface-elevated border border-tillas-border rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-tillas-primary/50 hover:border-tillas-primary/30 transition-colors min-w-[160px]">
            <option value="newest" className="bg-tillas-surface-elevated text-white">Más recientes</option>
            <option value="price-asc" className="bg-tillas-surface-elevated text-white">Precio: menor a mayor</option>
            <option value="price-desc" className="bg-tillas-surface-elevated text-white">Precio: mayor a menor</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="text-tillas-primary text-sm font-medium flex items-center gap-1 hover:underline px-2">
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border animate-pulse">
              <div className="aspect-square bg-tillas-surfaceElevated" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-tillas-surfaceElevated rounded w-16" />
                <div className="h-4 bg-tillas-surfaceElevated rounded w-full" />
                <div className="h-4 bg-tillas-surfaceElevated rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">👟</p>
          <h3 className="font-heading text-xl text-white">No encontramos sneakers</h3>
          <p className="text-gray-500 mt-2">Intenta con otros filtros o busca algo diferente</p>
          <button onClick={clearFilters} className="mt-4 text-tillas-primary font-medium hover:underline">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-tillas-primary text-black' : 'bg-tillas-surface text-gray-400 hover:text-white border border-tillas-border'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-10 bg-tillas-surface rounded w-48 animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-tillas-surface rounded-2xl overflow-hidden border border-tillas-border animate-pulse">
              <div className="aspect-square bg-tillas-surfaceElevated" />
              <div className="p-4 space-y-2"><div className="h-4 bg-tillas-surfaceElevated rounded w-full" /></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
