import { RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Devoluciones — TILLAS.EC',
  description: 'Política de devoluciones y cambios de TILLAS.EC. Tu satisfacción es nuestra prioridad.',
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-tillas-primary/10 flex items-center justify-center mx-auto mb-4">
          <RotateCcw size={32} className="text-tillas-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Devoluciones y Cambios</h1>
        <p className="text-gray-400 mt-2">Tu satisfacción es nuestra prioridad</p>
      </div>

      <div className="space-y-6">
        {/* Policy summary */}
        <div className="bg-tillas-primary/10 border border-tillas-primary/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-tillas-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-heading font-semibold text-white mb-1">Garantía de Satisfacción</h3>
              <p className="text-gray-400 text-sm">
                Tienes <strong className="text-white">7 días</strong> desde la recepción para solicitar una devolución o cambio.
                El producto debe estar en su estado original, sin uso y con todas las etiquetas.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <h2 className="font-heading text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Clock size={20} className="text-tillas-primary" /> ¿Cómo solicitar una devolución?
          </h2>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Contacta con nosotros', desc: 'Escríbenos por WhatsApp o email dentro de los 7 días posteriores a la recepción del producto.' },
              { step: 2, title: 'Envía evidencia', desc: 'Comparte fotos del producto y el motivo de la devolución. Nuestro equipo revisará tu solicitud en 24-48 horas.' },
              { step: 3, title: 'Envía el producto', desc: 'Si tu solicitud es aprobada, te daremos las instrucciones para devolver el producto. El costo de envío de devolución corre por cuenta del comprador.' },
              { step: 4, title: 'Recibe tu reembolso', desc: 'Una vez recibido y verificado el producto, procesamos el reembolso por transferencia bancaria en 3-5 días hábiles.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-tillas-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-tillas-primary text-sm font-bold">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">{item.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted / Not accepted */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-tillas-success" /> Se aceptan devoluciones si:
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span className="text-tillas-success mt-1">✓</span> El producto tiene defecto de fábrica</li>
              <li className="flex items-start gap-2"><span className="text-tillas-success mt-1">✓</span> Recibiste un producto diferente al pedido</li>
              <li className="flex items-start gap-2"><span className="text-tillas-success mt-1">✓</span> La talla no corresponde a la etiqueta</li>
              <li className="flex items-start gap-2"><span className="text-tillas-success mt-1">✓</span> El producto está sin usar y con etiquetas</li>
            </ul>
          </div>

          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <h3 className="font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle size={16} className="text-tillas-error" /> No se aceptan devoluciones si:
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2"><span className="text-tillas-error mt-1">✗</span> Han pasado más de 7 días de la recepción</li>
              <li className="flex items-start gap-2"><span className="text-tillas-error mt-1">✗</span> El producto fue usado o lavado</li>
              <li className="flex items-start gap-2"><span className="text-tillas-error mt-1">✗</span> Faltan etiquetas, caja o accesorios originales</li>
              <li className="flex items-start gap-2"><span className="text-tillas-error mt-1">✗</span> El producto tiene daños por mal uso</li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <h2 className="font-heading text-xl font-bold text-white mb-5">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: '¿Puedo cambiar la talla?', a: 'Sí, ofrecemos cambio de talla sujeto a disponibilidad. El producto debe estar en condición original.' },
              { q: '¿Cuánto tarda el reembolso?', a: 'Una vez recibido y verificado el producto, el reembolso se procesa en 3-5 días hábiles por transferencia bancaria.' },
              { q: '¿Quién paga el envío de devolución?', a: 'El costo de envío de devolución corre por cuenta del comprador, excepto en casos de error nuestro o producto defectuoso.' },
            ].map((faq, i) => (
              <div key={i} className="py-3 border-b border-tillas-border last:border-0">
                <h4 className="text-white font-medium text-sm mb-1">{faq.q}</h4>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500 text-sm mb-4">¿Necesitas iniciar una devolución?</p>
        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
          Contáctanos
        </Link>
      </div>
    </div>
  );
}
