export const metadata = {
  title: 'Política de Privacidad — TILLAS.EC',
  description: 'Política de privacidad y protección de datos de TILLAS.EC.',
};

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Responsable del Tratamiento',
      content: 'TILLAS.EC, con domicilio en Quito, Ecuador, es responsable del tratamiento de los datos personales recopilados a través de la Plataforma.',
    },
    {
      title: '2. Datos que Recopilamos',
      items: [
        'Datos de registro: nombre, email, teléfono, contraseña cifrada',
        'Datos de perfil: avatar, tallas favoritas, fecha de nacimiento',
        'Datos de compra: direcciones de envío, historial de pedidos, métodos de pago',
        'Datos de navegación: dirección IP, tipo de dispositivo, páginas visitadas',
        'Datos de comunicación: mensajes de contacto, reviews de productos',
      ],
    },
    {
      title: '3. Finalidad del Tratamiento',
      items: [
        'Gestionar tu cuenta y procesar tus pedidos',
        'Realizar envíos y gestionar devoluciones',
        'Administrar el programa de lealtad y puntos',
        'Enviar notificaciones sobre pedidos, Drops y promociones',
        'Mejorar nuestros servicios y personalizar tu experiencia',
        'Prevenir fraudes y garantizar la seguridad',
      ],
    },
    {
      title: '4. Base Legal',
      content: 'El tratamiento de tus datos se basa en: tu consentimiento al registrarte, la ejecución del contrato de compra, obligaciones legales aplicables, y el interés legítimo en mejorar nuestros servicios.',
    },
    {
      title: '5. Compartir Datos',
      items: [
        'Banco Pichincha: pagos por transferencia bancaria (no almacenamos datos bancarios)',
        'Empresas de courier: para realizar envíos',
        'Firebase (Google): para notificaciones push',
        'No vendemos ni compartimos tus datos con terceros para fines de marketing',
      ],
    },
    {
      title: '6. Seguridad',
      content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos: cifrado de contraseñas (bcrypt), tokens JWT para autenticación, comunicaciones HTTPS, y almacenamiento seguro en servidores protegidos.',
    },
    {
      title: '7. Retención de Datos',
      content: 'Conservamos tus datos mientras mantengas tu cuenta activa. Los datos de pedidos se conservan por el tiempo requerido por la legislación fiscal ecuatoriana (7 años). Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento.',
    },
    {
      title: '8. Tus Derechos',
      items: [
        'Acceso: solicitar una copia de tus datos personales',
        'Rectificación: corregir datos inexactos o incompletos',
        'Eliminación: solicitar la eliminación de tu cuenta y datos',
        'Oposición: oponerte al tratamiento para marketing directo',
        'Portabilidad: recibir tus datos en formato estructurado',
      ],
    },
    {
      title: '9. Cookies',
      content: 'Utilizamos cookies estrictamente necesarias para el funcionamiento de la Plataforma (sesión, carrito, preferencias). No utilizamos cookies de terceros para publicidad.',
    },
    {
      title: '10. Contacto',
      content: 'Para ejercer tus derechos o consultas sobre privacidad, escríbenos a privacidad@tillas.ec o a través de nuestro formulario de contacto.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">Política de Privacidad</h1>
      <p className="text-gray-500 text-sm mb-10">Última actualización: Marzo 2026</p>

      <div className="space-y-6">
        {sections.map(s => (
          <div key={s.title} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <h2 className="font-heading text-lg font-bold text-white mb-3">{s.title}</h2>
            {s.content && <p className="text-gray-400 text-sm leading-relaxed">{s.content}</p>}
            {s.items && (
              <ul className="space-y-2 text-sm text-gray-400">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-tillas-primary mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-xs text-center mt-10">
        © 2026 TILLAS.EC — Quito, Ecuador. Todos los derechos reservados.
      </p>
    </div>
  );
}
