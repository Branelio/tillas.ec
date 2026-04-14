import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { TillasButton } from '../components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Completa todos los campos');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, phone });
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Error al registrar');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (otp.length < 6) return Alert.alert('Error', 'Ingresa el código completo');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, code: otp });
      Alert.alert('¡Listo!', 'Cuenta verificada. Inicia sesión.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Código incorrecto');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      Alert.alert('Enviado', 'Nuevo código enviado a tu email');
    } catch {}
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{step === 'form' ? 'Crear Cuenta' : 'Verificar Email'}</Text>
        <Text style={styles.subtitle}>{step === 'form' ? 'Únete a TILLAS.EC' : `Código enviado a ${email}`}</Text>

        {step === 'form' ? (
          <>
            <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={Colors.textMuted}
              value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Teléfono (opcional)" placeholderTextColor={Colors.textMuted}
              value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Contraseña (mín. 8 caracteres)" placeholderTextColor={Colors.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry />
            <TillasButton title="Crear Cuenta" onPress={handleRegister} loading={loading} style={{ marginTop: Spacing.md }} />
          </>
        ) : (
          <>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              placeholderTextColor={Colors.textMuted}
              value={otp} onChangeText={setOtp}
              keyboardType="number-pad" maxLength={6}
            />
            <TillasButton title="Verificar Código" onPress={handleVerify} loading={loading} style={{ marginTop: Spacing.md }} />
            <TouchableOpacity onPress={handleResend} style={{ marginTop: Spacing.md }}>
              <Text style={styles.resend}>¿No recibiste el código? Reenviar</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: Spacing.xl }}>
          <Text style={styles.link}>¿Ya tienes cuenta? <Text style={{ color: Colors.primary, fontWeight: '600' }}>Iniciar Sesión</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  backBtn: { position: 'absolute', top: 56, left: 0 },
  backText: { color: Colors.textSecondary, fontSize: FontSizes.md, fontWeight: '600' },
  title: { color: Colors.textPrimary, fontSize: FontSizes.xxl, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSizes.md, textAlign: 'center', marginTop: 4, marginBottom: Spacing.xl },
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: 16, color: Colors.textPrimary, fontSize: FontSizes.md,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm,
  },
  otpInput: { textAlign: 'center', fontSize: FontSizes.xxl, fontWeight: '800', letterSpacing: 12 },
  resend: { color: Colors.textMuted, fontSize: FontSizes.sm, textAlign: 'center' },
  link: { color: Colors.textSecondary, fontSize: FontSizes.md, textAlign: 'center' },
});
