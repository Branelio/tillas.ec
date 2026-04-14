'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { paymentsApi, ordersApi } from '@/lib/api';
import {
  CheckCircle2, Upload, Copy, Check, Loader2,
  Clock, Building2, ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

type PageStatus = 'LOADING' | 'BANK_INFO' | 'UPLOADING' | 'RECEIPT_SENT' | 'VERIFIED' | 'FAILED';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountHolder: string;
  qrImage: string;
  instructions: string[];
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<PageStatus>('LOADING');
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderId) return;
    Promise.all([
      paymentsApi.getBankInfo(),
      ordersApi.getById(orderId),
    ]).then(([bankRes, orderRes]) => {
      setBankInfo(bankRes.data);
      setOrderNumber(orderRes.data.orderNumber);
      setAmount(Number(orderRes.data.total));

      // Si ya tiene comprobante subido, mostrar estado
      if (orderRes.data.payment?.status === 'COMPLETED') {
        setStatus('VERIFIED');
      } else if (orderRes.data.payment?.status === 'PROCESSING') {
        setStatus('RECEIPT_SENT');
      } else if (orderRes.data.payment?.status === 'FAILED') {
        setStatus('FAILED');
      } else {
        setStatus('BANK_INFO');
      }
    }).catch((err) => {
      console.error(err);
      setError('Error al cargar la información del pago');
      setStatus('FAILED');
    });
  }, [orderId]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadReceipt = async () => {
    if (!file || !orderId) return;
    setUploading(true);
    try {
      await paymentsApi.uploadReceipt(orderId, file, notes);
      setStatus('RECEIPT_SENT');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al subir el comprobante');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'LOADING') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-tillas-primary animate-spin" />
      </div>
    );
  }

  if (status === 'BANK_INFO' && bankInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-2xl font-bold text-white">Realiza tu transferencia</h1>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg">Pendiente</span>
          </div>
          
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">Total a pagar:</p>
            <p className="font-heading text-4xl font-bold text-white mb-6">${amount.toFixed(2)}</p>
            
            <div className="bg-white p-4 rounded-xl inline-block mb-6">
              <img src={bankInfo.qrImage} alt="QR Pago" className="w-48 h-48 object-contain" />
            </div>
            
            <div className="space-y-2 text-left bg-tillas-primary/5 p-6 rounded-xl">
              <div className="flex justify-between">
                <span className="text-gray-400">Banco:</span>
                <span className="text-white font-medium">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cuenta:</span>
                <span className="text-white font-medium">{bankInfo.accountNumber}</span>
                <button onClick={() => handleCopyToClipboard(bankInfo.accountNumber)} className="ml-2 text-tillas-primary hover:text-tillas-primaryDark">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white">{bankInfo.accountType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Titular:</span>
                <span className="text-white">{bankInfo.accountHolder}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {bankInfo.instructions.map((instruction, i) => (
              <p key={i} className="text-gray-400 text-sm flex items-start gap-2">
                <span className="text-tillas-primary mt-1">•</span>
                {instruction}
              </p>
            ))}
          </div>
          
          <button
            onClick={() => setStatus('UPLOADING')}
            className="mt-8 w-full py-4 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors"
          >
            Ya realicé la transferencia
          </button>
        </div>
      </div>
    );
  }

  if (status === 'UPLOADING') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border">
          <h1 className="font-heading text-2xl font-bold text-white mb-6">Sube tu comprobante</h1>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Orden #{orderNumber}</label>
            <p className="font-heading text-3xl font-bold text-white">${amount.toFixed(2)}</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Comprobante de pago</label>
            <input
              type="file"
              ref={fileRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-tillas-border rounded-xl p-8 text-center cursor-pointer hover:border-tillas-primary transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
              ) : (
                <>
                  <ImageIcon size={48} className="mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">Haz clic o arrastra una imagen</p>
                  <p className="text-gray-500 text-xs mt-1">JPG, PNG (máx. 5MB)</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Transferencia desde Banco Guayaquil"
              className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-tillas-primary/50 focus:outline-none"
              rows={3}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleUploadReceipt}
            disabled={uploading || !file}
            className="w-full py-4 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : 'Enviar comprobante'}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'RECEIPT_SENT') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border text-center">
          <CheckCircle2 size={64} className="mx-auto text-tillas-primary mb-4" />
          <h1 className="font-heading text-2xl font-bold text-white mb-2">¡Comprobante recibido!</h1>
          <p className="text-gray-400 mb-6">
            Hemos recibido tu comprobante de pago. Nuestro equipo lo verificará en las próximas horas.
          </p>
          <div className="bg-tillas-primary/10 border border-tillas-primary/20 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm">
              Una vez verificado, recibirás un email de confirmación y comenzaremos a preparar tu pedido.
            </p>
          </div>
          <Link href="/orders" className="inline-block px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'VERIFIED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border text-center">
          <CheckCircle2 size={64} className="mx-auto text-tillas-primary mb-4" />
          <h1 className="font-heading text-2xl font-bold text-white mb-2">¡Pago verificado!</h1>
          <p className="text-gray-400 mb-6">
            Tu pago ha sido verificado y estamos preparando tu pedido #${orderNumber}.
          </p>
          <Link href="/orders" className="inline-block px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
            Ver mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-tillas-surface rounded-2xl p-8 border border-tillas-border text-center">
          <Clock size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Error en el pago</h1>
          <p className="text-gray-400 mb-6">
            Hubo un problema con tu pago. Por favor intenta de nuevo o contacta a soporte.
          </p>
          <Link href="/orders" className="inline-block px-6 py-3 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
            Volver a pedidos
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
