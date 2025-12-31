import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// IP ADDRESS (Sesuaikan lagi kalau berubah)
const API_URL = 'http://192.168.1.5:3000'; 

export default function CatDetail() {
  const { id } = useLocalSearchParams(); // Mengambil ID dari URL
  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cats/${id}`);
      const data = await response.json();
      setCat(data.data || data); // Handle kalau response dibungkus data atau tidak
    } catch (error) {
      console.error("Error fetch detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!cat) {
    return (
      <View style={styles.center}>
        <Text>Data tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <>
      {/* Header Custom: Transparan supaya gambar kelihatan full di atas */}
      <Stack.Screen 
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#fff', // Tombol back jadi putih
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.container} bounces={false}>
        {/* Gambar Full Besar */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: `${API_URL}/uploads/${cat.image}` }} 
            style={styles.image} 
            resizeMode="cover"
          />
          {/* Overlay gradasi hitam di bawah gambar supaya teks terbaca (opsional) */}
          <View style={styles.imageOverlay} />
        </View>

        {/* Konten Putih Melengkung */}
        <View style={styles.contentContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.name}>{cat.name}</Text>
              <Text style={styles.breed}>{cat.breed || 'Unknown Breed'}</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              cat.status === 'available' ? styles.bgSuccess : styles.bgDanger
            ]}>
              <Text style={styles.statusText}>{cat.status}</Text>
            </View>
          </View>

          {/* Info Bar (Umur, Gender, Berat) */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{cat.age} Thn</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{cat.gender}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{cat.weight ? `${cat.weight} kg` : '-'}</Text>
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {cat.name}</Text>
            <Text style={styles.description}>
              {cat.description || "Pemilik tidak memberikan deskripsi tambahan untuk kucing ini. Silakan hubungi pemilik untuk informasi lebih lanjut."}
            </Text>
          </View>

          {/* Tombol Aksi */}
          <TouchableOpacity style={styles.adoptButton}>
            <Text style={styles.adoptButtonText}>Ajukan Adopsi</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Gambar Header
  imageContainer: { height: 350, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    backgroundColor: 'rgba(0,0,0,0.1)' // Sedikit gelap di bawah
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)', 
    padding: 8, 
    borderRadius: 20, 
    marginLeft: 10
  },

  // Konten Utama
  contentContainer: {
    flex: 1,
    marginTop: -40, // Supaya naik menutupi sedikit gambar
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  name: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary },
  breed: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  bgSuccess: { backgroundColor: '#dcfce7' }, // Hijau muda
  bgDanger: { backgroundColor: '#fee2e2' }, // Merah muda
  statusText: { fontWeight: 'bold', color: Colors.textPrimary, textTransform: 'capitalize' },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoItem: { alignItems: 'center', flex: 1 },
  infoLabel: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  divider: { width: 1, height: '100%', backgroundColor: '#e5e7eb' },

  // Deskripsi
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 24 },

  // Tombol
  adoptButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  adoptButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
