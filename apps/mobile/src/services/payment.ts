// ==============================================
// Payment Service — Manejo de pagos por transferencia
// ==============================================

import api from './api';
import * as FileSystem from 'expo-file-system';

export interface BankInfoData {
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountHolder: string;
  qrImage: string;
  instructions: string[];
}

export const paymentService = {
  /**
   * Obtener datos bancarios para transferencia
   */
  async getBankInfo(): Promise<BankInfoData> {
    const { data } = await api.get('/payments/bank-info');
    return data;
  },

  /**
   * Subir foto del comprobante
   */
  async uploadReceipt(orderId: string, fileUri: string, notes?: string) {
    // Usamos formData manual porque fetch/axios en React Native a veces fallan con form-data multipart directo
    // Pero como estamos usando FileSystem de Expo, podemos pasarlo usando formData directo si configuramos bien
    try {
      const formData = new FormData();
      
      // Inferir mimetype basado en la extensión o dejar jpeg por defecto
      const rawExt = fileUri.split('.').pop()?.toLowerCase();
      const ext = rawExt === 'png' ? 'png' : 'jpeg';

      formData.append('receipt', {
        uri: fileUri,
        name: `receipt_${orderId}.${ext}`,
        type: `image/${ext}`,
      } as any);

      formData.append('orderId', orderId);
      if (notes) formData.append('notes', notes);

      const { data } = await api.post('/payments/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verificar estado del pago local (verificado/pendiente)
   */
  async checkStatus(orderId: string) {
    const { data } = await api.get(`/payments/status/${orderId}`);
    return data;
  },
};
