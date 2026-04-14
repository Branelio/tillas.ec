import { Truck, Clock, MapPin, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Envíos — TILLAS.EC',
  description: 'Información de envíos, tarifas y tiempos de entrega en Ecuador.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Truck size={28} className="text-tillas-primary" />
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Envíos</h1>
      </div>

      {/* Rates */}
      <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border mb-6">
        <h2 className="font-heading text-xl font-bold text-white mb-4">Tarifas de Envío</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-tillas-border">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-tillas-primary" />
              <span className="text-white text-sm font-medium">Quito (zona urbana)</span>
            </div>
            <span className="text-white font-bold">$3.50</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-tillas-border">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-tillas-primary" />
              <span className="text-white text-sm font-medium">Guayaquil y Cuenca</span>
            </div>
            <span className="text-white font-bold">$5.00</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-tillas-border">
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-tillas-primary" />
              <span className="text-white text-sm font-medium">Resto del país</span>
            </div>
            <span className="text-white font-bold">$7.00</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-tillas-primary" />
              <span className="text-tillas-primary text-sm font-bold">Compras mayores a $100</span>
            </div>
            <span className="text-tillas-primary font-bold">¡GRATIS!</span>
          </div>
        </div>
      </div>

      {/* Delivery times */}
      <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border mb-6">
        <h2 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={18} className="text-tillas-primary" /> Tiempos de Entrega
        </h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-tillas-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-white font-medium">Quito</p>
              <p className="text-gray-400">24 a 48 horas hábiles después de confirmar el pago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-tillas-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-white font-medium">Guayaquil y Cuenca</p>
              <p className="text-gray-400">2 a 3 días hábiles después de confirmar el pago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-tillas-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-white font-medium">Resto de Ecuador</p>
              <p className="text-gray-400">3 a 5 días hábiles después de confirmar el pago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
        <h2 className="font-heading text-xl font-bold text-white mb-4">Información Importante</h2>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
            Todos los pedidos incluyen empaque protector para sneakers
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
            Recibirás un código de tracking para rastrear tu paquete
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
            Los tiempos de entrega son estimados y pueden variar según la ubicación
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
            No realizamos envíos a Galápagos por el momento
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
            Horario de despacho: Lunes a Viernes, 9:00 AM a 5:00 PM (ECT)
          </li>
        </ul>
      </div>
    </div>
  );
}
