'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { usersApi } from '@/lib/api';
import {
  User, Mail, Phone, MapPin, Plus, Pencil, Trash2, Star,
  Package, LogOut, ChevronRight, Save, X, Shield, Check,
} from 'lucide-react';
import Link from 'next/link';

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  city: string;
  sector: string;
  mainStreet: string;
  secondaryStreet?: string;
  number?: string;
  reference: string;
  isDefault: boolean;
}

const emptyAddress = {
  label: '', recipientName: '', phone: '', city: 'Quito',
  sector: '', mainStreet: '', secondaryStreet: '', number: '', reference: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loadUser, logout } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
      return;
    }
    if (user) {
      setProfileForm({ name: user.name, phone: user.phone || '' });
      usersApi.getAddresses()
        .then(({ data }) => setAddresses(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await usersApi.updateProfile(profileForm);
      await loadUser();
      setEditing(false);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
    }
    setSavingProfile(false);
  };

  const handleAddAddress = async () => {
    setSavingAddress(true);
    try {
      await usersApi.addAddress(addressForm);
      const { data } = await usersApi.getAddresses();
      setAddresses(data);
      setShowAddressForm(false);
      setAddressForm(emptyAddress);
    } catch (err) {
      console.error('Error agregando dirección:', err);
    }
    setSavingAddress(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <User size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="font-heading text-2xl text-white">Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-3xl font-bold text-white mb-8">Mi Cuenta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Avatar & quick info */}
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border text-center">
            <div className="w-20 h-20 rounded-full bg-tillas-primary/20 flex items-center justify-center mx-auto mb-4">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-tillas-primary">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2 className="font-heading font-semibold text-white">{user.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </div>

          {/* Quick links */}
          <Link href="/orders"
            className="flex items-center justify-between bg-tillas-surface rounded-xl p-4 border border-tillas-border hover:border-tillas-primary/30 transition-colors group">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-tillas-primary" />
              <span className="text-white text-sm font-medium">Mis Pedidos</span>
            </div>
            <ChevronRight size={16} className="text-gray-500 group-hover:text-tillas-primary transition-colors" />
          </Link>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-tillas-surface rounded-xl p-4 border border-tillas-border hover:border-red-500/30 transition-colors text-left">
            <LogOut size={18} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile info */}
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                <User size={18} className="text-tillas-primary" /> Datos Personales
              </h3>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="text-tillas-primary text-sm font-medium flex items-center gap-1 hover:underline">
                  <Pencil size={14} /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="p-1.5 text-gray-500 hover:text-white">
                    <X size={16} />
                  </button>
                  <button onClick={handleSaveProfile} disabled={savingProfile}
                    className="flex items-center gap-1 text-sm font-medium text-tillas-primary hover:underline disabled:opacity-50">
                    <Save size={14} /> {savingProfile ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Nombre</label>
                {editing ? (
                  <input type="text" value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full mt-1 bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-tillas-primary transition-colors" />
                ) : (
                  <p className="text-white mt-1">{user.name}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white">{user.email}</p>
                  <span className="text-[10px] bg-tillas-primary/20 text-tillas-primary px-2 py-0.5 rounded flex items-center gap-1">
                    <Shield size={10} /> Verificado
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Teléfono</label>
                {editing ? (
                  <input type="tel" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+593991234567"
                    className="w-full mt-1 bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
                ) : (
                  <p className="text-white mt-1">{user.phone || 'No registrado'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                <MapPin size={18} className="text-tillas-primary" /> Direcciones
              </h3>
              <button onClick={() => setShowAddressForm(true)}
                className="text-tillas-primary text-sm font-medium flex items-center gap-1 hover:underline">
                <Plus size={14} /> Agregar
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">No tienes direcciones guardadas</p>
                <button onClick={() => setShowAddressForm(true)}
                  className="mt-3 text-tillas-primary text-sm font-medium hover:underline">
                  + Agregar dirección
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl border border-tillas-border bg-tillas-surfaceElevated">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-tillas-primary/20 text-tillas-primary px-2 py-0.5 rounded flex items-center gap-1">
                          <Check size={10} /> Principal
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{addr.recipientName} • {addr.phone}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {addr.mainStreet}{addr.secondaryStreet && ` y ${addr.secondaryStreet}`}, {addr.sector}, {addr.city}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5">Ref: {addr.reference}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-tillas-surface rounded-2xl border border-tillas-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-white">Nueva Dirección</h3>
              <button onClick={() => { setShowAddressForm(false); setAddressForm(emptyAddress); }}
                className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Etiqueta</label>
                  <input type="text" value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="Casa, Oficina..."
                    className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Ciudad</label>
                  <select value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-tillas-primary">
                    <option>Quito</option>
                    <option>Guayaquil</option>
                    <option>Cuenca</option>
                    <option>Ambato</option>
                    <option>Loja</option>
                    <option>Manta</option>
                    <option>Riobamba</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre del destinatario</label>
                <input type="text" value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                  placeholder="Nombre completo"
                  className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                <input type="tel" value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+593991234567"
                  className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sector / Barrio</label>
                <input type="text" value={addressForm.sector}
                  onChange={(e) => setAddressForm({ ...addressForm, sector: e.target.value })}
                  placeholder="La Mariscal, Cumbayá, etc."
                  className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Calle principal</label>
                  <input type="text" value={addressForm.mainStreet}
                    onChange={(e) => setAddressForm({ ...addressForm, mainStreet: e.target.value })}
                    placeholder="Av. Amazonas"
                    className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Calle secundaria</label>
                  <input type="text" value={addressForm.secondaryStreet}
                    onChange={(e) => setAddressForm({ ...addressForm, secondaryStreet: e.target.value })}
                    placeholder="N24-08"
                    className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Referencia</label>
                <input type="text" value={addressForm.reference}
                  onChange={(e) => setAddressForm({ ...addressForm, reference: e.target.value })}
                  placeholder="Frente al parque, edificio azul..."
                  className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary" />
              </div>
            </div>

            <button onClick={handleAddAddress} disabled={savingAddress || !addressForm.label || !addressForm.mainStreet || !addressForm.recipientName}
              className="w-full mt-6 py-3.5 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors disabled:opacity-50">
              {savingAddress ? 'Guardando...' : 'Guardar Dirección'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
