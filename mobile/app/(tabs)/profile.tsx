// File: mobile/app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useFocusEffect } from 'expo-router';

// PANGGIL 2 FILE YANG SUDAH KITA PISAH TADI
import UserProfile from '@/components/UserProfile';
import ShelterProfile from '@/components/ShelterProfile';

export default function ProfileScreen() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      checkRole();
    }, [])
  );

  const checkRole = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      // Coba ambil role dari storage dulu
      const storedRole = await AsyncStorage.getItem('userRole');

      if (storedRole) {
        setRole(storedRole);
      } else if (token) {
        // Kalau ga ada di storage, decode dari token
        const decoded: any = jwtDecode(token);
        setRole(decoded.role);
        await AsyncStorage.setItem('userRole', decoded.role);
      }
    } catch (error) {
      console.log('Error check role', error);
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

  // INI LOGIKA PEMILIHNYA
  if (role === 'shelter') {
    return <ShelterProfile />;
  } else {
    // Kalau User Biasa (atau belum login/admin), tampilkan UserProfile
    return <UserProfile />;
  }
}