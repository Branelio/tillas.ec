'use client';
import { useEffect, useState } from 'react';
import { adminProductsApi } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { Plus, Search, Pencil, Trash2, X, Package } from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  brand?: { name: string };
  category?: { name: string };
  variants: { id: string; size: string; price: number; stock: number; sku: string }[];
  createdAt: string;
}

const emptyProduct = {
  name: '', slug: '', description: '', brandName: '', categoryName: '',
  images: [] as string[], isFeatured: false,
  variants: [{ size: '', price: 0, stock: 1, sku: '' }],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const { data } = await adminProductsApi.getAll({ limit: 100, search: search || undefined });
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchProducts();
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: '',
      brandName: product.brand?.name || '',
      categoryName: product.category?.name || '',
      images: product.images || [],
      isFeatured: product.isFeatured,
      variants: product.variants.length > 0
        ? product.variants.map(v => ({ size: v.size, price: v.price, stock: v.stock, sku: v.sku }))
        : [{ size: '', price: 0, stock: 1, sku: '' }],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await adminProductsApi.update(editingId, form);
        toast.success('Producto actualizado', 'Los cambios se guardaron correctamente');
      } else {
        await adminProductsApi.create(form);
        toast.success('Producto creado', 'El producto se agregó al catálogo');
      }
      setShowModal(false);
      setForm(emptyProduct);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'No se pudo guardar el producto');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres archivar este producto?')) return;
    try {
      await adminProductsApi.delete(id);
      toast.success('Producto archivado');
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'No se pudo archivar el producto');
    }
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { size: '', price: 0, stock: 1, sku: '' }] });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const variants = [...form.variants];
    (variants[index] as any)[field] = value;
    setForm({ ...form, variants });
  };

  const removeVariant = (index: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors text-sm">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca..."
            className="w-full bg-admin-card border border-admin-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary transition-colors" />
        </div>
      </form>

      {/* Table */}
      <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-12">Cargando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-12">
                  <Package size={32} className="mx-auto mb-2 text-gray-600" />
                  No hay productos
                </td></tr>
              ) : (
                products.map(p => {
                  const minPrice = Math.min(...p.variants.map(v => v.price));
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-white text-sm font-medium truncate max-w-[200px]">{p.name}</p>
                            <p className="text-gray-500 text-xs">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-300 text-sm">{p.brand?.name || '—'}</td>
                      <td className="text-white font-bold text-sm">${minPrice.toFixed(2)}</td>
                      <td>
                        <span className={`text-sm font-medium ${totalStock > 0 ? 'text-admin-success' : 'text-admin-error'}`}>
                          {totalStock}
                        </span>
                      </td>
                      <td>
                        {p.isFeatured && (
                          <span className="text-[10px] bg-admin-primary/20 text-admin-primary px-2 py-0.5 rounded font-bold mr-1">⭐ Destacado</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-admin-elevated transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-2 text-gray-400 hover:text-admin-error rounded-lg hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-admin-surface rounded-2xl border border-admin-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Nike Air Max 90"
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                    placeholder="nike-air-max-90"
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Descripción del producto..."
                  className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Marca</label>
                  <input type="text" value={form.brandName} onChange={e => setForm({ ...form, brandName: e.target.value })}
                    placeholder="Nike"
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
                  <input type="text" value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value })}
                    placeholder="Lifestyle"
                    className="w-full bg-admin-card border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                  className="accent-admin-primary" id="featured" />
                <label htmlFor="featured" className="text-sm text-gray-300">Producto destacado</label>
              </div>

              {/* Imágenes */}
              <ImageUploader
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
                maxImages={8}
              />

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Variantes (Tallas)</label>
                  <button onClick={addVariant} className="text-admin-primary text-xs font-medium hover:underline">+ Agregar talla</button>
                </div>
                <div className="space-y-2">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <input type="text" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}
                        placeholder="US 10" className="bg-admin-card border border-admin-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                      <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', +e.target.value)}
                        placeholder="Precio" className="bg-admin-card border border-admin-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                      <input type="number" value={v.stock} onChange={e => updateVariant(i, 'stock', +e.target.value)}
                        placeholder="Stock" className="bg-admin-card border border-admin-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                      <input type="text" value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                        placeholder="SKU" className="bg-admin-card border border-admin-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary" />
                      <button onClick={() => removeVariant(i)} className="p-2 text-gray-500 hover:text-admin-error">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || !form.name}
              className="w-full mt-6 py-3 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : editingId ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
