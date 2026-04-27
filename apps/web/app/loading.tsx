export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo */}
        <div className="inline-flex items-center gap-1 font-heading font-bold text-3xl mb-4 animate-pulse">
          <span className="text-tillas-primary">TILLAS</span>
          <span className="text-white">.EC</span>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-tillas-surface rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-tillas-primary to-tillas-accent rounded-full animate-shimmer"
            style={{ width: '40%', backgroundSize: '200% 100%' }} />
        </div>

        <p className="text-gray-600 text-sm mt-4">Cargando...</p>
      </div>
    </div>
  );
}
