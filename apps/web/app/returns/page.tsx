import { RotateCcw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Devoluciones — TILLAS.EC',
  description: 'Política de devoluciones y cambios de TILLAS.EC.',
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <RotateCcw size={28} className="text-tillas-primary" />
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Devoluciones y Cambios</h1>
      </div>

      {/* Policy summary */}
      <div className="bg-tillas-primary/10 border border-tillas-primary/30 rounded-2xl p-6 mb-8">
        <h2 className="font-heading text-xl font-bold text-white mb-2">Garantía de Satisfacción</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Tienes <span className="text-tillas-primary font-bold">15 días calendario</span> después de recibir tu pedido para solicitar una devolución o cambio. Queremos que estés 100% satisfecho con tu compra.
        </p>
      </div>

      {/* Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-tillas-primary" /> Aceptamos devoluciones si
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
              El producto está sin usar y en su estado original
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
              Incluye la caja original y todas las etiquetas
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
              Está dentro de los 15 días después de la entrega
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={14} className="text-tillas-primary mt-0.5 shrink-0" />
              Tienes el comprobante de compra
            </li>
          </ul>
        </div>

        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-red-400" /> No aceptamos si
          </h3>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              El producto fue usado o presenta señales de uso
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              No tiene la caja original o está dañada
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              Han pasado más de 15 días desde la entrega
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              Productos comprados en Drops o promociones especiales
            </li>
          </ul>
        </div>
      </div>

      {/* Process */}
      <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border mb-8">
        <h2 className="font-heading text-xl font-bold text-white mb-5">¿Cómo solicitar una devolución?</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Solicita la devolución', desc: 'Ve a "Mis Pedidos" y selecciona el pedido. Haz clic en "Solicitar Devolución" y describe el motivo.' },
            { step: '2', title: 'Aprobación', desc: 'Nuestro equipo revisará tu solicitud en 24-48 horas y te notificará por email.' },
            { step: '3', title: 'Envía el producto', desc: 'Una vez aprobada, te enviaremos las instrucciones para devolver el producto. El costo de envío de devolución corre por cuenta del comprador.' },
            { step: '4', title: 'Reembolso', desc: 'Tras recibir y verificar el producto, procesaremos el reembolso a tu cuenta bancaria en 3-5 días hábiles.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-tillas-primary text-black flex items-center justify-center font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <AlertCircle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-gray-300 text-sm">
          <span className="font-semibold text-yellow-400">Cambios de talla:</span> Si necesitas otra talla, solicita la devolución y realiza una nueva compra. Te daremos prioridad en el procesamiento.
        </p>
      </div>
    </div>
  );
}
