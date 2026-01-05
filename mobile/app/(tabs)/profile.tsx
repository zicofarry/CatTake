// File: mobile/app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// PANGGIL 2 FILE YANG SUDAH KITA PISAH TADI
import UserProfile from '@/components/UserProfile';
import ShelterProfile from '@/components/ShelterProfile';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      checkRole();
    }, [])
  );

  const checkRole = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const storedRole = await AsyncStorage.getItem('userRole');

      if (storedRole) {
        setRole(storedRole);
      } else if (token) {
        // Kalau ga ada di storage, decode dari token
        const decoded: any = jwtDecode(token);
        setRole(decoded.role);
        await AsyncStorage.setItem('userRole', decoded.role);
      } else {
        // Jika tidak ada token dan storedRole, pastikan role null
        setRole(null);
      }
    } catch (error) {
      console.log('Error check role', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EBCD5E" />
      </View>
    );
  }

  // 1. TAMPILAN JIKA BELUM LOGIN (ROLE NULL)
  if (!role) {
    return (
      <View style={styles.containerCenter}>
        <Ionicons name="person-circle-outline" size={100} color="#ccc" />
        <Text style={styles.title}>Anda Belum Login</Text>
        <Text style={styles.subtitle}>Silakan login terlebih dahulu untuk melihat dan mengelola profil Anda.</Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Masuk Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. LOGIKA PEMILIH ROLE JIKA SUDAH LOGIN
  if (role === 'shelter') {
    return <ShelterProfile />;
  } else {
    return <UserProfile />;
  }
}

const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#EBCD5E',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});