import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => { logout(); } },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ fontSize: 48, marginBottom: Spacing.md }}>👤</Text>
        <Text style={styles.guestText}>Inicia sesión para ver tu perfil</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    { emoji: '📦', title: 'Mis Pedidos', onPress: () => router.push('/orders') },
    { emoji: '🏆', title: 'Tillas Points', onPress: () => router.push('/loyalty') },
    { emoji: '📍', title: 'Mis Direcciones', onPress: () => {} },
    { emoji: '❤️', title: 'Wishlist', onPress: () => {} },
    { emoji: '⭐', title: 'Mis Reviews', onPress: () => {} },
    { emoji: '🔄', title: 'Devoluciones', onPress: () => {} },
    { emoji: '⚙️', title: 'Configuración', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* User card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Menu */}
      {menuItems.map((item, i) => (
        <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  guestText: { color: Colors.textSecondary, fontSize: FontSizes.lg, marginBottom: Spacing.lg },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingHorizontal: 32, paddingVertical: 14 },
  loginBtnText: { color: Colors.white, fontSize: FontSizes.lg, fontWeight: '700' },
  userCard: { alignItems: 'center', paddingTop: 64, paddingBottom: Spacing.lg, backgroundColor: Colors.surface, borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: FontSizes.xxl, fontWeight: '900' },
  userName: { color: Colors.textPrimary, fontSize: FontSizes.xl, fontWeight: '700', marginTop: Spacing.sm },
  userEmail: { color: Colors.textMuted, fontSize: FontSizes.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  menuTitle: { flex: 1, color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: '500' },
  arrow: { color: Colors.textMuted, fontSize: 20 },
  logoutBtn: { marginTop: Spacing.xl, alignItems: 'center', paddingVertical: Spacing.md },
  logoutText: { color: Colors.error, fontSize: FontSizes.md, fontWeight: '600' },
});
