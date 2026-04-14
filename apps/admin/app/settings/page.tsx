'use client';

import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { Settings, DollarSign, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Banco Pichincha',
    accountNumber: '2209004611',
    accountType: 'Ahorros',
    accountHolder: 'BRANDON JOEL',
    idNumber: '',
  });

  const [siteConfig, setSiteConfig] = useState({
    siteName: 'TILLAS.EC',
    siteUrl: 'https://tillas.ec',
    shippingCost: '5.00',
    freeShippingThreshold: '100.00',
    currency: 'USD',
    timezone: 'America/Guayaquil',
  });

  const handleSaveBankInfo = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save bank info
      // await api.patch('/admin/settings/bank', bankInfo);
      toast.success('Información bancaria actualizada', 'Los cambios se guardaron correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error', 'No se pudo guardar la configuración');
    }
    setSaving(false);
  };

  const handleSaveSiteConfig = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save site config
      // await api.patch('/admin/settings/site', siteConfig);
      toast.success('Configuración del sitio actualizada', 'Los cambios se guardaron correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error', 'No se pudo guardar la configuración');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Configuración</h1>
          <p className="text-gray-500 text-sm mt-1">Ajustes del sistema y datos bancarios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Info */}
        <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
          <h2 className="font-heading font-semibold text-white mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-admin-primary" /> Información Bancaria
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Banco</label>
              <input
                type="text"
                value={bankInfo.bankName}
                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Número de Cuenta</label>
              <input
                type="text"
                value={bankInfo.accountNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipo de Cuenta</label>
              <select
                value={bankInfo.accountType}
                onChange={(e) => setBankInfo({ ...bankInfo, accountType: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary"
              >
                <option value="Ahorros">Ahorros</option>
                <option value="Corriente">Corriente</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Titular</label>
              <input
                type="text"
                value={bankInfo.accountHolder}
                onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cédula/RUC</label>
              <input
                type="text"
                value={bankInfo.idNumber}
                onChange={(e) => setBankInfo({ ...bankInfo, idNumber: e.target.value })}
                placeholder="1712345678"
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
              />
            </div>

            <button
              onClick={handleSaveBankInfo}
              disabled={saving}
              className="w-full py-3 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar Información Bancaria'}
            </button>
          </div>
        </div>

        {/* Site Configuration */}
        <div className="bg-admin-card rounded-2xl border border-admin-border p-6">
          <h2 className="font-heading font-semibold text-white mb-6 flex items-center gap-2">
            <Globe size={20} className="text-blue-400" /> Configuración del Sitio
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nombre del Sitio</label>
              <input
                type="text"
                value={siteConfig.siteName}
                onChange={(e) => setSiteConfig({ ...siteConfig, siteName: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">URL del Sitio</label>
              <input
                type="url"
                value={siteConfig.siteUrl}
                onChange={(e) => setSiteConfig({ ...siteConfig, siteUrl: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Costo de Envío</label>
                <input
                  type="number"
                  step="0.01"
                  value={siteConfig.shippingCost}
                  onChange={(e) => setSiteConfig({ ...siteConfig, shippingCost: e.target.value })}
                  className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Envío Gratis desde</label>
                <input
                  type="number"
                  step="0.01"
                  value={siteConfig.freeShippingThreshold}
                  onChange={(e) => setSiteConfig({ ...siteConfig, freeShippingThreshold: e.target.value })}
                  className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-admin-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Moneda</label>
              <select
                value={siteConfig.currency}
                onChange={(e) => setSiteConfig({ ...siteConfig, currency: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Zona Horaria</label>
              <select
                value={siteConfig.timezone}
                onChange={(e) => setSiteConfig({ ...siteConfig, timezone: e.target.value })}
                className="w-full bg-admin-surface border border-admin-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-admin-primary"
              >
                <option value="America/Guayaquil">América/Guayaquil (ECT)</option>
                <option value="America/New_York">América/Nueva York (EST)</option>
                <option value="America/Mexico_City">América/Ciudad de México (CST)</option>
              </select>
            </div>

            <button
              onClick={handleSaveSiteConfig}
              disabled={saving}
              className="w-full py-3 bg-admin-primary text-black font-bold rounded-xl hover:bg-admin-primaryDark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {saving ? 'Guardando...' : 'Guardar Configuración del Sitio'}
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-6 bg-admin-card rounded-2xl border border-admin-border p-6">
        <h2 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
          <Settings size={20} className="text-gray-400" /> Información del Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-admin-surface rounded-lg border border-admin-border">
            <p className="text-gray-500 text-xs mb-1">Versión del Sistema</p>
            <p className="text-white font-bold">v2.0.0</p>
          </div>
          <div className="p-4 bg-admin-surface rounded-lg border border-admin-border">
            <p className="text-gray-500 text-xs mb-1">Última Actualización</p>
            <p className="text-white font-bold">Abril 2026</p>
          </div>
          <div className="p-4 bg-admin-surface rounded-lg border border-admin-border">
            <p className="text-gray-500 text-xs mb-1">Entorno</p>
            <p className="text-admin-primary font-bold">Producción</p>
          </div>
        </div>
      </div>
    </div>
  );
}
