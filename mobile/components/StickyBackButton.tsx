import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StickyBackButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.stickyHeader, { top: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
      <TouchableOpacity 
        onPress={() => router.replace('/(tabs)')} 
        style={styles.backBtnGreen}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.backTextWhite}>Kembali</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    left: 20,
    zIndex: 100,
    paddingTop: 10 // Pastikan di atas layer lain
  },
  backBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A5F50', // Background Hijau
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#fff', // Border putih agar kontras
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  backTextWhite: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#fff', // Teks Putih
    fontSize: 14
  },
});