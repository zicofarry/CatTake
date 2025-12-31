import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Dimensions, Alert, Platform, StatusBar 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import CatCard from '../../components/CatCard';

// IP Address Backend
const API_URL = 'http://10.173.4.177:3000'; 

const { width } = Dimensions.get('window');

export default function AdoptScreen() {
  const router = useRouter();
  
  // Data State
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'gender', 'favorite'
  const [genderFilter, setGenderFilter] = useState('all'); // 'male', 'female'

  // Fetch Data
  const fetchCats = async () => {
    try {
      // Tambahkan query param jika butuh filter dari backend (opsional)
      // Di sini kita filter di client-side saja biar cepat
      const response = await fetch(`${API_URL}/api/v1/cats`);
      const data = await response.json();
      setCats(data.data || data); 
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCats();
  }, []);

  // --- LOGIKA FILTERING ---
  const handleGenderFilter = () => {
    Alert.alert(
      "Pilih Gender",
      "Tampilkan kucing berdasarkan jenis kelamin:",
      [
        { text: "Semua", onPress: () => { setActiveFilter('all'); setGenderFilter('all'); } },
        { text: "Jantan (Male)", onPress: () => { setActiveFilter('gender'); setGenderFilter('male'); } },
        { text: "Betina (Female)", onPress: () => { setActiveFilter('gender'); setGenderFilter('female'); } },
        { text: "Batal", style: "cancel" }
      ]
    );
  };

  const filteredCats = cats.filter(cat => {
    if (activeFilter === 'favorite') {
      return cat.isFavorited; // Pastikan backend kirim status ini, atau handle lokal
    }
    if (activeFilter === 'gender' && genderFilter !== 'all') {
      return cat.gender.toLowerCase() === genderFilter;
    }
    return true; // 'all'
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          // Tarik untuk refresh (handle props manual karena bukan FlatList utama)
          <View style={{display: 'none'}} /> 
        }
      >
        
        {/* --- HERO SECTION (Header) --- */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../../assets/images/cathelo.png')} // Pastikan ada aset dummy atau ganti URL
            style={styles.heroImage}
            resizeMode="contain"
          />
          {/* Kalau gak ada gambar lokal, pakai URL ini sementara: */}
          {/* <Image source={{uri: 'https://cdn-icons-png.flaticon.com/512/616/616408.png'}} style={styles.heroImage} resizeMode="contain"/> */}

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Berikan Rumah, Dapatkan Cinta.</Text>
            <Text style={styles.heroSubtitle}>
              Mari bersama menciptakan cerita baru bagi mereka, dari kesepian menuju rumah yang hangat.
            </Text>
          </View>
        </View>

        {/* --- FILTER FLOATING --- */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            
            {/* Tombol SEMUA */}
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'all' && styles.filterActive]} 
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>Semua</Text>
            </TouchableOpacity>

            {/* Tombol GENDER */}
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'gender' && styles.filterActive]} 
              onPress={handleGenderFilter}
            >
              <Text style={[styles.filterText, activeFilter === 'gender' && styles.filterTextActive]}>
                {activeFilter === 'gender' 
                  ? (genderFilter === 'male' ? 'Jantan' : 'Betina') 
                  : 'Gender'}
              </Text>
              <Ionicons name="caret-down" size={14} color={activeFilter === 'gender' ? '#fff' : '#333'} style={{marginLeft: 4}}/>
            </TouchableOpacity>

            {/* Tombol FAVORIT */}
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'favorite' && styles.filterActive]} 
              onPress={() => setActiveFilter('favorite')}
            >
              <Text style={[styles.filterText, activeFilter === 'favorite' && styles.filterTextActive]}>Favorit</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* --- LIST CONTAINER (HIJAU MELENGKUNG) --- */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderSpace} /> 

          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{marginTop: 50}} />
          ) : (
            <View style={styles.gridContainer}>
              {filteredCats.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="paw" size={60} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.emptyText}>Tidak ada kucing ditemukan.</Text>
                  <TouchableOpacity onPress={() => setActiveFilter('all')} style={styles.resetButton}>
                    <Text style={styles.resetText}>Reset Filter</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredCats.map((item) => (
                  <View key={item.id} style={styles.gridItem}>
                    <CatCard 
                      name={item.name}
                      breed={item.breed}
                      age={item.age}
                      gender={item.gender}
                      status={item.status}
                      imageUrl={`${API_URL}/uploads/${item.image}`}
                      onPress={() => router.push(`/adopt/${item.id}` as any)} 
                    />
                  </View>
                ))
              )}
            </View>
          )}
          
          {/* Spacer Bawah agar tidak ketutup TabBar */}
          <View style={{height: 100}} /> 
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Latar belakang abu muda
  },
  
  // HERO SECTION
  heroSection: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 20 : 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },

  // FILTER SECTION
  filterContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: -25, // Supaya setengah tombol menumpuk di atas bagian hijau
  },
  filterScroll: {
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 10, // Ruang untuk shadow
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    // Shadow
    shadowColor: '#3A5F50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  filterActive: {
    backgroundColor: '#EBCD5E', // Kuning/Gold
    transform: [{translateY: -2}], // Efek naik dikit
  },
  filterText: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },

  // LIST SECTION (HIJAU)
  listSection: {
    backgroundColor: '#3A5F50', // Hijau Tua CatTake
    minHeight: Dimensions.get('window').height, // Biar full screen ke bawah
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
  },
  listHeaderSpace: {
    height: 50, // Ruang kosong di atas list supaya tidak ketabrak filter
  },
  
  // GRID LAYOUT
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%', // Supaya jadi 2 kolom dengan spasi di tengah
    marginBottom: 16,
  },

  // EMPTY STATE
  emptyState: {
    width: '100%',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});