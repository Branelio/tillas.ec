import { Shield, Heart, Award, Zap } from 'lucide-react';

export const metadata = {
  title: 'Sobre Nosotros — TILLAS.EC',
  description: 'Conoce la historia de TILLAS.EC, la tienda de sneakers #1 de Ecuador.',
};

export default function AboutPage() {
  const values = [
    { icon: Shield, title: '100% Originales', desc: 'Cada par es verificado y autenticado. Trabajamos directamente con distribuidores autorizados.' },
    { icon: Heart, title: 'Pasión Sneaker', desc: 'Somos sneakerheads como tú. Seleccionamos lo mejor para la comunidad ecuatoriana.' },
    { icon: Award, title: 'Servicio Premium', desc: 'Atención personalizada, envío rápido y la mejor experiencia de compra.' },
    { icon: Zap, title: 'Innovación', desc: 'Drops exclusivos, sistema de lealtad y la tecnología más avanzada para tus compras.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold">
          <span className="text-tillas-primary">TILLAS</span><span className="text-white">.EC</span>
        </h1>
        <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
          La tienda de sneakers más innovadora de Ecuador. Nacimos para conectar a los sneakerheads ecuatorianos con los mejores lanzamientos del mundo.
        </p>
      </div>

      {/* Story */}
      <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border mb-12">
        <h2 className="font-heading text-2xl font-bold text-white mb-4">Nuestra Historia</h2>
        <div className="text-gray-400 space-y-4 leading-relaxed">
          <p>
            TILLAS.EC nació en Quito, Ecuador, con una misión clara: traer la cultura sneaker al nivel que se merece en nuestro país. Cansados de las limitaciones del mercado local, decidimos crear una plataforma que combine lo mejor del e-commerce internacional con la calidez del servicio ecuatoriano.
          </p>
          <p>
            Cada zapatilla que vendemos es 100% original, verificada y autenticada. Trabajamos con distribuidores autorizados para garantizar que recibas únicamente productos genuinos. No vendemos réplicas, no vendemos imitaciones — solo lo real.
          </p>
          <p>
            Nuestro sistema de Drops te da acceso a los lanzamientos más exclusivos, y nuestro programa de lealtad premia tu pasión por los sneakers. Porque en TILLAS.EC, comprar zapatillas es más que una transacción — es una experiencia.
          </p>
        </div>
      </div>

      {/* Values */}
      <h2 className="font-heading text-2xl font-bold text-white mb-6 text-center">Nuestros Valores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {values.map(v => (
          <div key={v.title} className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <v.icon size={24} className="text-tillas-primary mb-3" />
            <h3 className="font-heading font-semibold text-white mb-2">{v.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center bg-tillas-surface rounded-2xl p-8 border border-tillas-primary/20">
        <p className="text-2xl mb-2">👟</p>
        <h3 className="font-heading text-xl font-bold text-white">¿Listo para tu próximo par?</h3>
        <p className="text-gray-500 text-sm mt-2 mb-6">Explora nuestro catálogo y encuentra tu talla perfecta.</p>
        <a href="/shop" className="inline-block px-8 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
          Ver Catálogo
        </a>
      </div>
    </div>
  );
}
