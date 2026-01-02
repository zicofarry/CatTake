import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Dimensions, Alert, Platform, StatusBar 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CatCard from '../../components/CatCard';

// Gunakan API_URL  dari Config pusat
import apiClient, { API_BASE_URL } from '../../api/apiClient';
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

const { width } = Dimensions.get('window');

export default function AdoptScreen() {
  const router = useRouter();
  
  // Data State - Pastikan defaultnya array []
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [genderFilter, setGenderFilter] = useState('all'); 

  // Fetch Data
  const fetchCats = async () => {
    try {
      const response = await apiClient.get(`/cats`);
      const data = response.data;
      
      // FIX: Cek apakah data.data ada, jika tidak cek apakah data itu sendiri adalah array
      // Jika keduanya bukan array, set ke array kosong [] agar .filter tidak crash
      const responseArray = data.data || data;
      setCats(Array.isArray(responseArray) ? responseArray : []);
      
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setCats([]); // Jika error, pastikan tetap array kosong
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

  // FIX: Pastikan cats adalah array sebelum memanggil .filter
  const safeCats = Array.isArray(cats) ? cats : [];

  const filteredCats = safeCats.filter(cat => {
    if (!cat) return false;

    if (activeFilter === 'favorite') {
      return cat.isFavorited; 
    }
    if (activeFilter === 'gender' && genderFilter !== 'all') {
      // Gunakan optional chaining ?. agar tidak error jika gender null
      return cat.gender?.toLowerCase() === genderFilter.toLowerCase();
    }
    return true; 
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- HERO SECTION --- */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../../assets/images/cathelo.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />

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
            
            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'all' && styles.filterActive]} 
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>Semua</Text>
            </TouchableOpacity>

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

            <TouchableOpacity 
              style={[styles.filterButton, activeFilter === 'favorite' && styles.filterActive]} 
              onPress={() => setActiveFilter('favorite')}
            >
              <Text style={[styles.filterText, activeFilter === 'favorite' && styles.filterTextActive]}>Favorit</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

        {/* --- LIST CONTAINER (HIJAU) --- */}
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
                  <TouchableOpacity onPress={() => {setActiveFilter('all'); setGenderFilter('all');}} style={styles.resetButton}>
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
                      // Path gambar di server kamu adalah /public/img/cats/
                      imageUrl={item.image ? `${serverUrl}/public/img/cats/${item.image}` : null}
                      onPress={() => router.push(`/adopt/${item.id}` as any)} 
                    />
                  </View>
                ))
              )}
            </View>
          )}
          
          <View style={{height: 100}} /> 
        </View>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  heroSection: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroImage: { width: 120, height: 120, marginBottom: 20 },
  heroTextContainer: { alignItems: 'center' },
  heroTitle: {
    fontSize: 28, fontWeight: '800', color: '#1f2937',
    textAlign: 'center', marginBottom: 10, lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 14, color: '#6b7280', textAlign: 'center',
    lineHeight: 22, maxWidth: '90%',
  },
  filterContainer: { position: 'relative', zIndex: 10, marginBottom: -25 },
  filterScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 10 },
  filterButton: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 30, flexDirection: 'row', alignItems: 'center',
    elevation: 6, shadowColor: '#3A5F50', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 10,
  },
  filterActive: { backgroundColor: '#EBCD5E', transform: [{translateY: -2}] },
  filterText: { fontWeight: 'bold', color: '#374151', fontSize: 14 },
  filterTextActive: { color: '#fff' },
  listSection: {
    backgroundColor: '#3A5F50', minHeight: Dimensions.get('window').height,
    borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingHorizontal: 20,
  },
  listHeaderSpace: { height: 50 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '47%', marginBottom: 16 },
  emptyState: { width: '100%', alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  resetButton: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  resetText: { color: '#fff', fontWeight: 'bold' },
});