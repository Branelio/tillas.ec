import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { TillasButton } from '../components';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa todos los campos');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.logo}><Text style={{ color: Colors.primary }}>TILLAS</Text>.EC</Text>
        <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor={Colors.textMuted}
          value={password} onChangeText={setPassword} secureTextEntry />

        <TillasButton title="Iniciar Sesión" onPress={handleLogin} loading={loading} style={{ marginTop: Spacing.md }} />

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: Spacing.xl }}>
          <Text style={styles.linkText}>¿No tienes cuenta? <Text style={{ color: Colors.primary, fontWeight: '600' }}>Regístrate</Text></Text>
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
  logo: { color: Colors.textPrimary, fontSize: FontSizes.hero, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSizes.lg, textAlign: 'center', marginTop: 4, marginBottom: Spacing.xl },
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: 16, color: Colors.textPrimary, fontSize: FontSizes.md,
    borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm,
  },
  linkText: { color: Colors.textSecondary, fontSize: FontSizes.md, textAlign: 'center' },
});
