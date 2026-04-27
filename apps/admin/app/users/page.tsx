'use client';
import { useEffect, useState, useCallback } from 'react';
import { adminUsersApi } from '@/lib/api';
import { Users as UsersIcon, Search, Shield, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  loyaltyTier?: string;
  _count?: { orders: number };
  createdAt: string;
}

const tierColors: Record<string, string> = {
  BRONZE: 'bg-orange-500/20 text-orange-400',
  SILVER: 'bg-gray-500/20 text-gray-300',
  GOLD: 'bg-yellow-500/20 text-yellow-400',
  ELITE: 'bg-purple-500/20 text-purple-400',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminUsersApi.getAll({ limit: 100, search: search || undefined });
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await adminUsersApi.updateRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setUpdatingId(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      await adminUsersApi.updateStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
    setUpdatingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full bg-admin-card border border-admin-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary transition-colors" />
        </div>
      </form>

      {/* Table */}
      <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Nivel</th>
                <th>Verificado</th>
                <th>Estado</th>
                <th>Pedidos</th>
                <th>Registrado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center text-gray-500 py-12">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-500 py-12">
                  <UsersIcon size={32} className="mx-auto mb-2 text-gray-600" />
                  No hay usuarios
                </td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-admin-primary text-xs font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-300 text-sm">{user.phone || '—'}</td>
                    <td>
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-admin-accent/20 text-admin-accent px-2 py-0.5 rounded">
                          <Shield size={10} /> Admin
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Cliente</span>
                      )}
                    </td>
                    <td>
                      {user.loyaltyTier ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${tierColors[user.loyaltyTier] || 'bg-gray-500/20 text-gray-400'}`}>
                          {user.loyaltyTier}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      {user.isVerified ? (
                        <UserCheck size={16} className="text-admin-success" />
                      ) : (
                        <span className="text-gray-500 text-xs">No</span>
                      )}
                    </td>
                    <td>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        user.isActive ? 'bg-admin-success/20 text-admin-success' : 'bg-admin-error/20 text-admin-error'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-white text-sm font-medium">{user._count?.orders || 0}</td>
                    <td className="text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.role === 'USER' && (
                          <button
                            onClick={() => handleUpdateRole(user.id, 'ADMIN')}
                            disabled={updatingId === user.id}
                            className="text-xs font-medium bg-admin-accent/10 text-admin-accent px-2 py-1 rounded hover:bg-admin-accent/20 transition-colors disabled:opacity-50"
                            title="Promover a Admin"
                          >
                            {updatingId === user.id ? '...' : <Shield size={14} />}
                          </button>
                        )}
                        {user.role === 'ADMIN' && (
                          <button
                            onClick={() => handleUpdateRole(user.id, 'USER')}
                            disabled={updatingId === user.id}
                            className="text-xs font-medium bg-gray-500/10 text-gray-400 px-2 py-1 rounded hover:bg-gray-500/20 transition-colors disabled:opacity-50"
                            title="Degradar a Cliente"
                          >
                            {updatingId === user.id ? '...' : <UserX size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          disabled={updatingId === user.id}
                          className={`text-xs font-medium px-2 py-1 rounded transition-colors disabled:opacity-50 ${
                            user.isActive
                              ? 'bg-admin-error/10 text-admin-error hover:bg-admin-error/20'
                              : 'bg-admin-success/10 text-admin-success hover:bg-admin-success/20'
                          }`}
                          title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {updatingId === user.id ? '...' : user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
