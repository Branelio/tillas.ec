// ==============================================
// Payment Screen — Bank Transfer Only
// ==============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { paymentsApi, ordersApi } from '../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { CheckCircle, Upload, Copy, Clock, Building2, ArrowLeft } from 'lucide-react-native';

type PageStatus = 'LOADING' | 'BANK_INFO' | 'UPLOADING' | 'RECEIPT_SENT' | 'VERIFIED' | 'FAILED';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountType: string;
  accountHolder: string;
  qrImage: string;
  instructions: string[];
}

interface RouteParams {
  orderId: string;
}

export default function PaymentScreen() {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { orderId } = route.params as RouteParams;
  const { user } = useAuthStore();

  const [status, setStatus] = useState<PageStatus>('LOADING');
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [amount, setAmount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<any>(null);
  const [preview, setPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<any>(null);

  useEffect(() => {
    if (!orderId) return;
    Promise.all([
      paymentsApi.getBankInfo(),
      ordersApi.getById(orderId),
    ]).then(([bankRes, orderRes]) => {
      setBankInfo(bankRes.data);
      setOrderNumber(orderRes.data.orderNumber);
      setAmount(Number(orderRes.data.total));

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
    // Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (selectedFile: any) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(selectedFile.uri || '');
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (status === 'BANK_INFO' && bankInfo) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Realiza tu transferencia</Text>
            <Text style={[styles.statusBadge, styles.statusPending]}>Pendiente</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total a pagar</Text>
            <Text style={styles.amount}>${amount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.qrContainer}>
            <Image source={{ uri: bankInfo.qrImage }} style={styles.qrImage} resizeMode="contain" />
          </View>
          
          <View style={styles.bankInfoContainer}>
            <Text style={styles.bankInfoLabel}>Banco:</Text>
            <Text style={styles.bankInfoValue}>{bankInfo.bankName}</Text>
            
            <View style={styles.accountRow}>
              <Text style={styles.bankInfoLabel}>Cuenta:</Text>
              <Text style={styles.bankInfoValue}>{bankInfo.accountNumber}</Text>
              <TouchableOpacity onPress={() => handleCopyToClipboard(bankInfo.accountNumber)}>
                {copied ? <CheckCircle size={16} color="#00FF87" /> : <Copy size={16} color="#00FF87" />}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.bankInfoLabel}>Tipo:</Text>
            <Text style={styles.bankInfoValue}>{bankInfo.accountType}</Text>
            
            <Text style={styles.bankInfoLabel}>Titular:</Text>
            <Text style={styles.bankInfoValue}>{bankInfo.accountHolder}</Text>
          </View>
          
          <View style={styles.instructionsContainer}>
            {bankInfo.instructions.map((instruction, i) => (
              <Text key={i} style={styles.instructionText}>• {instruction}</Text>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setStatus('UPLOADING')}
          >
            <Text style={styles.nextButtonText}>Ya realicé la transferencia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (status === 'UPLOADING') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Sube tu comprobante</Text>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Orden #{orderNumber}</Text>
            <Text style={styles.orderAmount}>${amount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.fileInput}>
            <TouchableOpacity onPress={() => fileRef.current?.click()}>
              {preview ? (
                <Image source={{ uri: preview }} style={styles.previewImage} />
              ) : (
                <View style={styles.filePlaceholder}>
                  <Upload size={48} color="#666" />
                  <Text style={styles.filePlaceholderText}>Haz clic o arrastra una imagen</Text>
                  <Text style={styles.filePlaceholderSubtext}>JPG, PNG (máx. 5MB)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notas (opcional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ej: Transferencia desde Banco Guayaquil"
              multiline
              numberOfLines={3}
            />
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
            onPress={handleUploadReceipt}
            disabled={uploading || !file}
          >
            {uploading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>Enviar comprobante</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (status === 'RECEIPT_SENT') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <CheckCircle size={64} color="#00FF87" />
          <Text style={styles.title}>¡Comprobante recibido!</Text>
          <Text style={styles.description}>
            Hemos recibido tu comprobante de pago. Nuestro equipo lo verificará en las próximas horas.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Una vez verificado, recibirás un email de confirmación y comenzaremos a preparar tu pedido.</Text>
          </View>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.ordersButtonText}>Ver mis pedidos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (status === 'VERIFIED') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <CheckCircle size={64} color="#00FF87" />
          <Text style={styles.title}>¡Pago verificado!</Text>
          <Text style={styles.description}>
            Tu pago ha sido verificado y estamos preparando tu pedido #{orderNumber}.
          </Text>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.ordersButtonText}>Ver mis pedidos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (status === 'FAILED') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Clock size={64} color="#FF4444" />
          <Text style={styles.title}>Error en el pago</Text>
          <Text style={styles.description}>
            Hubo un problema con tu pago. Por favor intenta de nuevo o contacta a soporte.
          </Text>
          <TouchableOpacity
            style={styles.ordersButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.ordersButtonText}>Volver a pedidos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'system',
  },
  methodCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  methodCardSelected: {
    backgroundColor: '#00FF871A',
    borderColor: '#00FF87',
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    backgroundColor: '#00FF8720',
    color: '#00FF87',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#FFA50020',
    color: '#FFA500',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  qrBox: {
    width: 120,
    height: 120,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    color: '#666',
    marginTop: 8,
    fontSize: 12,
  },
  qrInstruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: '#00FF87',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#00FF871A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00FF8720',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bankInfoContainer: {
    backgroundColor: '#00FF870A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bankInfoValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#00FF87',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  fileInput: {
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  filePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#222',
  },
  filePlaceholderText: {
    color: '#666',
    marginTop: 12,
    fontSize: 14,
  },
  filePlaceholderSubtext: {
    color: '#444',
    fontSize: 12,
    marginTop: 4,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#222',
  },
  errorContainer: {
    backgroundColor: '#FF44441A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF444420',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#00FF87',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ordersButton: {
    backgroundColor: '#00FF87',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ordersButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
