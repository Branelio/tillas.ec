export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tight">
          <span className="text-tillas-primary">TILLAS</span>
          <span className="text-white">.EC</span>
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-xl mx-auto">
          La tienda de sneakers #1 de Ecuador 🇪🇨
        </p>
        <p className="mt-2 text-gray-500">
          Nike • Jordan • Adidas • New Balance • Puma • Converse
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/shop"
            className="px-8 py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors"
          >
            Ver Catálogo
          </a>
          <a
            href="/drops"
            className="px-8 py-4 border border-tillas-primary text-tillas-primary font-bold rounded-xl text-lg hover:bg-tillas-primary/10 transition-colors"
          >
            Próximos Drops 🔥
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
        <div className="bg-tillas-surface rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">👟</div>
          <h3 className="font-heading text-lg font-semibold text-white">100% Originales</h3>
          <p className="text-gray-400 mt-2 text-sm">Cada par verificado y autenticado</p>
        </div>
        <div className="bg-tillas-surface rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="font-heading text-lg font-semibold text-white">Pago Fácil</h3>
          <p className="text-gray-400 mt-2 text-sm">Transferencia bancaria o QR, sin complicaciones</p>
        </div>
        <div className="bg-tillas-surface rounded-2xl p-6 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="font-heading text-lg font-semibold text-white">Envío Rápido</h3>
          <p className="text-gray-400 mt-2 text-sm">Entrega en Quito en 24-48 horas</p>
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-24 text-gray-600 text-sm">
        © 2026 TILLAS.EC — Hecho con 💚 en Quito, Ecuador
      </p>
    </div>
  );
}
