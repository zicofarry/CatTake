import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // Tambah FontAwesome5

// IP ADDRESS
import apiClient, { API_BASE_URL } from '../../api/apiClient';
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

export default function CatDetail() {
  const { id } = useLocalSearchParams(); 
  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const response = await apiClient.get(`/cats/${id}`);
      setCat(response.data.data || response.data); 
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
      <Stack.Screen 
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView style={styles.container} bounces={false}>
        {/* Gambar Header */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: `${cat.image || cat.photo}` }} 
            style={styles.image} 
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </View>

        <View style={styles.contentContainer}>
          
          {/* Header Nama Kucing */}
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.name}>{cat.name}</Text>
              <Text style={styles.breed}>{cat.breed || 'Unknown Breed'}</Text>
            </View>
            <View style={[
              styles.statusBadge, 
              cat.adoption_status === 'available' ? styles.bgSuccess : styles.bgDanger
            ]}>
              <Text style={styles.statusText}>{cat.adoption_status || 'Unknown'}</Text>
            </View>
          </View>

          {/* --- [BARU] TOMBOL MENUJU PROFIL SHELTER --- */}
          {/* Ini adalah "Pintu Masuk" ke halaman toko/shelter */}
          <TouchableOpacity 
            style={styles.shelterCard} 
            onPress={() => router.push(`/shelter/${cat.shelter_id}`)} // Navigasi ke ID Shelter
            activeOpacity={0.7}
          >
            <View style={styles.shelterIconBox}>
                <FontAwesome5 name="store" size={20} color="#3A5F50" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.shelterLabel}>Diposting oleh:</Text>
                <Text style={styles.shelterName}>{cat.shelter_name || cat.shelter || 'Shelter Name'}</Text>
            </View>
            <View style={styles.visitButton}>
                <Text style={styles.visitText}>Kunjungi</Text>
                <Ionicons name="chevron-forward" size={16} color="#3A5F50" />
            </View>
          </TouchableOpacity>
          {/* ------------------------------------------- */}

          {/* Info Statistik */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{cat.age} Bln</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{cat.gender === 'male' ? 'Jantan' : 'Betina'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Health</Text>
              <Text style={styles.infoValue}>{cat.health_status || '-'}</Text>
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {cat.name}</Text>
            <Text style={styles.description}>
              {cat.description || "Tidak ada deskripsi tambahan."}
            </Text>
          </View>

          {/* Tombol Aksi */}
          <TouchableOpacity 
            style={styles.adoptButton}
            onPress={() => router.push({ pathname: '/adopt/apply', params: { id: id } })}
          >
            <Text style={styles.adoptButtonText}>Isi Formulir</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  imageContainer: { height: 350, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.3)', 
    padding: 8, 
    borderRadius: 20, 
    marginLeft: 10
  },

  contentContainer: {
    flex: 1,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary },
  breed: { fontSize: 16, color: Colors.textSecondary, marginTop: 4 },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  bgSuccess: { backgroundColor: '#dcfce7' },
  bgDanger: { backgroundColor: '#fee2e2' }, 
  statusText: { fontWeight: 'bold', color: Colors.textPrimary, textTransform: 'capitalize' },

  // --- STYLE BARU UNTUK CARD SHELTER ---
  shelterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', // Abu-abu sangat muda
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  shelterIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#e8f5e9', // Hijau muda sekali
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shelterLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  shelterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  visitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A5F50',
    marginRight: 2,
  },
  // -------------------------------------

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

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 24 },

  adoptButton: {
    backgroundColor: '#EBCD5E', // Warna Kuning App
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#EBCD5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  adoptButtonText: { color: '#1F2937', fontSize: 18, fontWeight: 'bold' },
});