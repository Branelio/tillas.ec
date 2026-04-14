'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { usersApi, ordersApi } from '@/lib/api';
import { MapPin, Truck, Calendar } from 'lucide-react';
import Link from 'next/link';

// Utilidad local para mostrar la fecha
function getEstimatedDeliveryText(): string {
  const CUTOFF_DAY = 2; // Martes
  const CUTOFF_HOUR = 18; // 18:00 (6 PM)
  const DELIVERY_DAY = 6; // Sábado

  const date = new Date();
  const currentDay = date.getDay();
  const currentHour = date.getHours();

  let isBeforeCutoff = false;
  if (currentDay < CUTOFF_DAY) {
    isBeforeCutoff = true;
  } else if (currentDay === CUTOFF_DAY && currentHour < CUTOFF_HOUR) {
    isBeforeCutoff = true;
  }

  const factoryOrderDate = new Date(date.getTime());
  let daysToCutoff = CUTOFF_DAY - currentDay;
  if (!isBeforeCutoff) {
     daysToCutoff += 7;
  }
  
  factoryOrderDate.setDate(date.getDate() + daysToCutoff);
  factoryOrderDate.setHours(CUTOFF_HOUR, 0, 0, 0);

  const estimatedDeliveryAt = new Date(factoryOrderDate.getTime());
  const daysFromFactoryToDelivery = DELIVERY_DAY - CUTOFF_DAY;
  
  estimatedDeliveryAt.setDate(factoryOrderDate.getDate() + daysFromFactoryToDelivery);
  
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return estimatedDeliveryAt.toLocaleDateString('es-EC', options);
}

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  city: string;
  sector: string;
  mainStreet: string;
  secondaryStreet?: string;
  number?: string;
  reference: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, fetchCart } = useCartStore();
  const { isAuthenticated, loadUser } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);


  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCart();
    usersApi.getAddresses()
      .then(({ data }) => {
        setAddresses(data);
        const defaultAddr = data.find((a: Address) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
        else if (data.length > 0) setSelectedAddress(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const shipping = subtotal >= 100 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setPlacing(true);
    try {
      const { data } = await ordersApi.create(selectedAddress);
      // Redirigir a la pantalla de pago (datos bancarios + subir comprobante)
      router.push(`/payment/${data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear el pedido');
      setPlacing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl text-white">Debes iniciar sesión</h2>
        <Link href="/login" className="inline-block mt-4 px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-heading text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address */}
        <div className="lg:col-span-2">
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                <MapPin size={18} className="text-tillas-primary" /> Dirección de Envío
              </h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2].map((i) => <div key={i} className="h-20 bg-tillas-surfaceElevated rounded-xl animate-pulse" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-500">No tienes direcciones guardadas</p>
                <p className="text-gray-600 text-sm mt-1">Agrega una dirección desde tu perfil</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAddress === addr.id
                        ? 'border-tillas-primary bg-tillas-primary/5'
                        : 'border-tillas-border hover:border-tillas-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{addr.label}</span>
                      {addr.isDefault && <span className="text-[10px] bg-tillas-primary/20 text-tillas-primary px-2 py-0.5 rounded">Principal</span>}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{addr.recipientName} • {addr.phone}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{addr.mainStreet} {addr.secondaryStreet && `y ${addr.secondaryStreet}`}, {addr.sector}, {addr.city}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Shipping info */}
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border mt-4">
            <h3 className="font-heading font-semibold text-white flex items-center gap-2 mb-3">
              <Truck size={18} className="text-tillas-primary" /> Envío
            </h3>
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-gray-400">Entrega Estimada (Ecuador):</span>
              <span className={shipping === 0 ? 'text-tillas-primary font-bold' : 'text-white'}>
                {shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="bg-tillas-primary/10 border border-tillas-primary/20 rounded-xl p-4 flex gap-3 items-start">
              <Calendar className="text-tillas-primary shrink-0" size={20} />
              <div>
                <p className="text-white font-medium text-sm">Recíbelo el <span className="text-tillas-primary font-bold capitalize">{getEstimatedDeliveryText()}</span></p>
                <p className="text-gray-400 text-xs mt-1">
                  Los pedidos realizados antes del <strong>Martes a las 18:00h</strong> se entregan el Sábado de esa misma semana. De lo contrario, se procesan para la semana siguiente.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border sticky top-24">
            <h3 className="font-heading font-semibold text-white mb-4">Resumen del Pedido</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.variant.product.images?.[0] || '/placeholder.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.variant.product.name}</p>
                    <p className="text-gray-500 text-[10px]">Talla: {item.variant.size} × {item.quantity}</p>
                  </div>
                  <span className="text-white text-sm font-medium shrink-0">${(item.variant.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-tillas-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className={shipping === 0 ? 'text-tillas-primary' : 'text-white'}>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-tillas-border pt-2 flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-xl text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddress || items.length === 0}
              className="mt-6 w-full py-4 bg-tillas-primary text-black font-bold rounded-xl text-lg hover:bg-tillas-primaryDark transition-colors disabled:opacity-50"
            >
              {placing ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">El pago se realiza por transferencia bancaria</p>
          </div>
        </div>
      </div>
    </div>
  );
}
