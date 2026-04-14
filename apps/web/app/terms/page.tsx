export const metadata = {
  title: 'Términos y Condiciones — TILLAS.EC',
  description: 'Términos y condiciones de uso de TILLAS.EC.',
};

export default function TermsPage() {
  const sections = [
    {
      title: '1. Aceptación de los Términos',
      content: 'Al acceder y utilizar el sitio web tillas.ec y/o la aplicación móvil TILLAS.EC (en adelante, "la Plataforma"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna de estas condiciones, te rogamos no utilizar la Plataforma.',
    },
    {
      title: '2. Descripción del Servicio',
      content: 'TILLAS.EC es una plataforma de comercio electrónico dedicada a la venta de zapatillas (sneakers) originales en Ecuador. Operamos exclusivamente en línea y realizamos envíos a todo el territorio ecuatoriano continental.',
    },
    {
      title: '3. Registro de Usuario',
      content: 'Para realizar compras debes registrarte con una dirección de email válida. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Debes ser mayor de 18 años para registrarte. La información proporcionada debe ser veraz y actualizada.',
    },
    {
      title: '4. Productos y Precios',
      content: 'Todos nuestros productos son 100% originales y están sujetos a disponibilidad. Los precios están expresados en dólares americanos (USD), la moneda oficial de Ecuador. Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso. Los precios incluyen IVA cuando aplique.',
    },
    {
      title: '5. Proceso de Compra',
      content: 'Al confirmar tu pedido, aceptas adquirir los productos seleccionados al precio indicado. El contrato de compra se perfecciona cuando recibes la confirmación del pedido por email. Los pagos se realizan mediante transferencia bancaria (Banco Pichincha). Tu pedido será procesado una vez que el comprobante de transferencia sea verificado por nuestro equipo.',
    },
    {
      title: '6. Envíos',
      content: 'Los tiempos de entrega son estimados y pueden variar. Quito: 24-48 horas hábiles; Guayaquil y Cuenca: 2-3 días hábiles; Resto del país: 3-5 días hábiles. El envío es gratuito en compras superiores a $100.00. No realizamos envíos a Galápagos.',
    },
    {
      title: '7. Devoluciones',
      content: 'Dispones de 15 días calendario desde la fecha de entrega para solicitar una devolución. El producto debe estar sin usar, con etiquetas originales y en su caja. Los productos adquiridos en Drops o promociones especiales no son elegibles para devolución. El costo de envío de devolución corre por cuenta del comprador.',
    },
    {
      title: '8. Drops y Sorteos',
      content: 'Los Drops son eventos de venta limitada sujetos a reglas específicas que se comunicarán en cada evento. Los sorteos (Raffles) se realizan de manera aleatoria e imparcial. La participación en Drops puede estar sujeta a requisitos de membresía del programa de lealtad.',
    },
    {
      title: '9. Programa de Lealtad',
      content: 'El programa de lealtad TILLAS.EC otorga puntos por compras y otras acciones. Los puntos tienen una tasa de canje definida y pueden cambiar. TILLAS.EC se reserva el derecho de modificar, suspender o cancelar el programa de lealtad en cualquier momento.',
    },
    {
      title: '10. Propiedad Intelectual',
      content: 'Todos los contenidos de la Plataforma (textos, imágenes, logos, diseño) son propiedad de TILLAS.EC o de sus respectivos propietarios. Las marcas de los productos pertenecen a sus fabricantes respectivos. Queda prohibida la reproducción sin autorización.',
    },
    {
      title: '11. Limitación de Responsabilidad',
      content: 'TILLAS.EC no será responsable por daños indirectos derivados del uso de la Plataforma, interrupciones del servicio por causas de fuerza mayor, ni retrasos en la entrega por parte de empresas de courier.',
    },
    {
      title: '12. Ley Aplicable',
      content: 'Estos Términos se rigen por las leyes de la República del Ecuador. Cualquier controversia será sometida a los tribunales competentes de la ciudad de Quito.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">Términos y Condiciones</h1>
      <p className="text-gray-500 text-sm mb-10">Última actualización: Marzo 2026</p>

      <div className="space-y-8">
        {sections.map(s => (
          <div key={s.title} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <h2 className="font-heading text-lg font-bold text-white mb-3">{s.title}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-xs text-center mt-10">
        © 2026 TILLAS.EC — Quito, Ecuador. Todos los derechos reservados.
      </p>
    </div>
  );
}
