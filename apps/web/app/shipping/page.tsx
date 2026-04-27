import { Truck, Clock, MapPin, CreditCard, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Envíos — TILLAS.EC',
  description: 'Información sobre envíos, tiempos de entrega y cobertura de TILLAS.EC. Envío a todo Ecuador.',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-tillas-primary/10 flex items-center justify-center mx-auto mb-4">
          <Truck size={32} className="text-tillas-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Información de Envíos</h1>
        <p className="text-gray-400 mt-2">Todo lo que necesitas saber sobre nuestras entregas</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          { step: '1', icon: CreditCard, title: 'Realiza tu pedido', desc: 'Elige tus sneakers y realiza el pago por transferencia bancaria.' },
          { step: '2', icon: Package, title: 'Preparamos tu pedido', desc: 'Verificamos el pago y preparamos tu paquete con cuidado.' },
          { step: '3', icon: Truck, title: 'Entrega a domicilio', desc: 'Recibe tu pedido en la puerta de tu casa.' },
        ].map(item => (
          <div key={item.step} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border text-center card-hover">
            <div className="w-10 h-10 rounded-xl bg-tillas-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-tillas-primary font-bold">{item.step}</span>
            </div>
            <h3 className="font-heading font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-tillas-primary" />
            <h2 className="font-heading text-xl font-bold text-white">Tiempos de Entrega</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-tillas-border">
              <span className="text-gray-300">Quito (ciudad)</span>
              <span className="text-white font-semibold">24 — 48 horas</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-tillas-border">
              <span className="text-gray-300">Valles de Quito (Cumbayá, Tumbaco, etc.)</span>
              <span className="text-white font-semibold">48 — 72 horas</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-tillas-border">
              <span className="text-gray-300">Guayaquil, Cuenca</span>
              <span className="text-white font-semibold">3 — 5 días</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-300">Resto del país</span>
              <span className="text-white font-semibold">5 — 7 días</span>
            </div>
          </div>
        </div>

        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-tillas-primary" />
            <h2 className="font-heading text-xl font-bold text-white">Costos de Envío</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-tillas-border">
              <span className="text-gray-300">Compras sobre $100</span>
              <span className="text-tillas-primary font-bold">¡GRATIS! 🎉</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-300">Compras menores a $100</span>
              <span className="text-white font-semibold">$5.99</span>
            </div>
          </div>
        </div>

        <div className="bg-tillas-primary/10 border border-tillas-primary/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-tillas-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-semibold text-white mb-2">Ciclo de Pedidos</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Los pedidos se procesan semanalmente. Las órdenes realizadas antes del <strong className="text-white">martes a las 18:00h</strong> se
                envían el <strong className="text-white">sábado</strong> de esa misma semana. Los pedidos después de esa hora se procesan
                para la semana siguiente.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-tillas-primary" />
            <h2 className="font-heading text-xl font-bold text-white">Cobertura</h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Realizamos envíos a <strong className="text-white">todo Ecuador</strong> a través de servicios de courier confiables.
            El envío incluye seguro de paquete y código de rastreo para que siempre sepas dónde están tus sneakers.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm mb-4">¿Tienes preguntas sobre tu envío?</p>
        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
          Contáctanos
        </Link>
      </div>
    </div>
  );
}
