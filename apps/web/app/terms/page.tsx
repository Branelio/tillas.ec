import { FileText } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones — TILLAS.EC',
  description: 'Términos y condiciones de uso de la plataforma TILLAS.EC.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-tillas-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-tillas-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Términos y Condiciones</h1>
        <p className="text-gray-400 mt-2">Última actualización: Abril 2026</p>
      </div>

      <div className="bg-tillas-surface rounded-2xl p-6 md:p-8 border border-tillas-border space-y-8">
        {[
          {
            title: '1. Aceptación de Términos',
            content: 'Al acceder y utilizar la plataforma TILLAS.EC (tillas.ec), aceptas estar sujeto a estos Términos y Condiciones, todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, no debes utilizar este servicio.',
          },
          {
            title: '2. Descripción del Servicio',
            content: 'TILLAS.EC es una plataforma de comercio electrónico especializada en la venta de zapatillas (sneakers) originales. Operamos como intermediarios entre distribuidores autorizados y consumidores finales en Ecuador.',
          },
          {
            title: '3. Cuenta de Usuario',
            content: 'Para realizar compras debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos inmediatamente de cualquier uso no autorizado.',
          },
          {
            title: '4. Productos y Precios',
            content: 'Todos nuestros productos son 100% originales y autenticados. Los precios se muestran en dólares americanos (USD) e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso. Los precios aplicables son los vigentes al momento de la compra.',
          },
          {
            title: '5. Proceso de Compra',
            content: 'Al realizar un pedido, estás haciendo una oferta de compra sujeta a disponibilidad. La confirmación del pedido no garantiza su procesamiento hasta que el pago sea verificado. Nos reservamos el derecho de cancelar pedidos en caso de errores de precio o falta de stock.',
          },
          {
            title: '6. Pagos',
            content: 'Actualmente aceptamos pagos por transferencia bancaria. El comprobante de pago debe ser subido a la plataforma dentro de las 24 horas posteriores a la creación del pedido. Pedidos sin pago verificado serán cancelados automáticamente.',
          },
          {
            title: '7. Envíos y Entregas',
            content: 'Realizamos envíos a todo Ecuador. Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad. TILLAS.EC no se responsabiliza por retrasos causados por el servicio de courier o fuerza mayor.',
          },
          {
            title: '8. Devoluciones y Reembolsos',
            content: 'Aceptamos devoluciones dentro de los 7 días posteriores a la recepción del producto, siempre que esté en su condición original, sin uso y con todas las etiquetas. Para más detalles, consulta nuestra Política de Devoluciones.',
          },
          {
            title: '9. Propiedad Intelectual',
            content: 'Todo el contenido de TILLAS.EC, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de TILLAS.EC o sus licenciantes y está protegido por leyes de propiedad intelectual. No se permite la reproducción sin autorización.',
          },
          {
            title: '10. Limitación de Responsabilidad',
            content: 'TILLAS.EC no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma. Nuestra responsabilidad máxima se limita al valor del producto adquirido.',
          },
          {
            title: '11. Ley Aplicable',
            content: 'Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa será resuelta ante los tribunales competentes de la ciudad de Quito.',
          },
          {
            title: '12. Contacto',
            content: 'Para consultas sobre estos términos, contáctanos a hola@tillas.ec o a través de nuestro WhatsApp.',
          },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="font-heading text-lg font-bold text-white mb-2">{section.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
