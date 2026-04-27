import { Lock } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad — TILLAS.EC',
  description: 'Conoce cómo TILLAS.EC protege y maneja tu información personal.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-tillas-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-tillas-primary" />
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
        <p className="text-gray-400 mt-2">Última actualización: Abril 2026</p>
      </div>

      <div className="bg-tillas-surface rounded-2xl p-6 md:p-8 border border-tillas-border space-y-8">
        {[
          {
            title: '1. Información que Recopilamos',
            content: 'Recopilamos información personal que proporcionas voluntariamente: nombre, email, teléfono, dirección de envío. También recopilamos datos de uso como páginas visitadas, productos vistos y dispositivo utilizado.',
          },
          {
            title: '2. Uso de la Información',
            content: 'Usamos tu información para: procesar pedidos y pagos, enviarte notificaciones sobre tus compras, mejorar nuestro servicio, personalizar tu experiencia, y comunicarte ofertas (con tu consentimiento).',
          },
          {
            title: '3. Protección de Datos',
            content: 'Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo encriptación SSL/TLS, almacenamiento seguro de contraseñas con hash, y acceso restringido a datos personales.',
          },
          {
            title: '4. Compartir Información',
            content: 'No vendemos ni compartimos tu información personal con terceros, excepto: servicios de envío (nombre y dirección para la entrega), proveedores de pago (para procesar transacciones), y cuando sea requerido por ley.',
          },
          {
            title: '5. Cookies',
            content: 'Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación, recordar tus preferencias, y analizar el uso de nuestra plataforma. Puedes controlar las cookies a través de la configuración de tu navegador.',
          },
          {
            title: '6. Tus Derechos',
            content: 'Tienes derecho a: acceder a tu información personal, rectificar datos incorrectos, eliminar tu cuenta y datos, oponerte al procesamiento de datos, y solicitar la portabilidad de tus datos. Para ejercer estos derechos, contáctanos a hola@tillas.ec.',
          },
          {
            title: '7. Retención de Datos',
            content: 'Conservamos tu información personal mientras mantengas una cuenta activa o según sea necesario para cumplir con obligaciones legales. Los datos de transacciones se conservan por el período requerido por la ley ecuatoriana.',
          },
          {
            title: '8. Menores de Edad',
            content: 'TILLAS.EC no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. Si eres padre o tutor y crees que un menor nos ha proporcionado información, contáctanos.',
          },
          {
            title: '9. Cambios en la Política',
            content: 'Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos por email o mediante un aviso en la plataforma. El uso continuado del servicio constituye aceptación de los cambios.',
          },
          {
            title: '10. Contacto',
            content: 'Para consultas sobre privacidad: hola@tillas.ec • WhatsApp: +593 098 319 9406 • Quito, Ecuador.',
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
