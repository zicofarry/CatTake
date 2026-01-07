import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, 
  Alert, ActivityIndicator, RefreshControl, SafeAreaView, 
  StatusBar, FlatList, ScrollView, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient, { API_BASE_URL } from '@/api/apiClient';
import CatCard from '@/components/CatCard'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StickyBackButton from '../../components/StickyBackButton';

// Membersihkan URL dari /api/v1 untuk akses file statis
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

export default function AdoptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Tab Utama: Cari Kucing vs Riwayat Saya
  const [activeUserTab, setActiveUserTab] = useState<'browse' | 'history'>('browse');
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // States Data Utama
  const [cats, setCats] = useState<any[]>([]);
  const [myAdoptions, setMyAdoptions] = useState([]);

  // --- STATE FILTER ---
  const [viewMode, setViewMode] = useState<'all' | 'favorite'>('all'); 
  const [modalVisible, setModalVisible] = useState(false); 

  // Pilihan Filter (Array)
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedShelters, setSelectedShelters] = useState<string[]>([]);

  // State Data Shelter (Dari Endpoint /users/shelters)
  const [allShelters, setAllShelters] = useState<any[]>([]);

  // --- 1. FETCH DATA SEMUA SHELTER (UNTUK OPSI FILTER) ---
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await apiClient.get('/users/shelters');
        // Pastikan response berupa array
        if (Array.isArray(res.data)) {
          setAllShelters(res.data);
        }
      } catch (e) {
        console.error("Gagal ambil list shelter:", e);
      }
    };
    fetchShelters();
  }, []);

  // --- 2. LOAD DATA KUCING ---
  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = activeUserTab === 'browse' ? '/adopt/cats' : '/adopt/my-adoptions';
      const res = await apiClient.get(endpoint);
      
      if (activeUserTab === 'browse') {
        setCats(res.data); 
      } else {
        setMyAdoptions(res.data);
      }
    } catch (e) {
      console.error("Load Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [activeUserTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [activeUserTab]);

  // --- 3. LOGIKA FILTERING (COCOKKAN DATA) ---
  const filteredCats = useMemo(() => {
    return cats.filter(cat => {
      // A. Filter Mode Favorite
      if (viewMode === 'favorite' && !cat.isFavorited) return false;

      // B. Filter Gender (jika ada yang dipilih)
      if (selectedGenders.length > 0 && !selectedGenders.includes(cat.gender)) return false;

      // C. Filter Shelter (jika ada yang dipilih)
      // Data kucing dari CatService memiliki properti 'shelter' (bukan shelter_name)
      // Data filter kita berisi nama shelter string
      const catShelterName = cat.shelter || cat.shelter_name || cat.shelterName;
      if (selectedShelters.length > 0 && !selectedShelters.includes(catShelterName)) return false;

      return true;
    });
  }, [cats, viewMode, selectedGenders, selectedShelters]);

  // Helper Toggle Pilihan
  const toggleSelection = (list: string[], setList: Function, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value)); // Hapus
    } else {
      setList([...list, value]); // Tambah
    }
  };

  const resetFilter = () => {
    setSelectedGenders([]);
    setSelectedShelters([]);
    setModalVisible(false);
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      await apiClient.post(`/cats/${id}/favorite`);
      setCats(prev => prev.map(c => 
        c.id === id ? { ...c, isFavorited: !c.isFavorited } : c
      ));
    } catch (e: any) {
      Alert.alert("Gagal", "Terjadi kesalahan saat menyukai kucing.");
    }
  };

  const handleCancel = (id: number) => {
    Alert.alert("Batalkan", "Yakin ingin membatalkan pengajuan adopsi ini?", [
      { text: "Tidak", style: "cancel" },
      { text: "Ya, Batalkan", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/adopt/cancel/${id}`);
            loadData();
          } catch (e) { Alert.alert("Error", "Gagal membatalkan pengajuan"); }
        }
      }
    ]);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={styles.fullBackground}
      resizeMode="repeat"
    >
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle="light-content" />
        <StickyBackButton /> 
        
        {/* HERO SECTION */}
        <View style={[styles.hero, { paddingTop: insets.top + 60 }]}>
          <Image source={require('../../assets/images/cathelo.png')} style={styles.heroImg} resizeMode="contain" />
          <Text style={styles.heroTitle}>Adopsi & Cinta</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeUserTab === 'browse' && styles.tabActive]} 
              onPress={() => setActiveUserTab('browse')}
            >
              <Text style={[styles.tabText, activeUserTab === 'browse' && {color: '#3A5F50'}]}>Cari Kucing</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeUserTab === 'history' && styles.tabActive]} 
              onPress={() => setActiveUserTab('history')}
            >
              <Text style={[styles.tabText, activeUserTab === 'history' && {color: '#3A5F50'}]}>Riwayat Saya</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeUserTab === 'browse' ? (
          <View style={{flex: 1}}>
            
            {/* --- 3 MENU UTAMA (Semua | Filter | Favorite) --- */}
            <View style={styles.filterMenuContainer}>
              <TouchableOpacity 
                style={[styles.menuItem, viewMode === 'all' && styles.menuItemActive]} 
                onPress={() => setViewMode('all')}
              >
                <Text style={[styles.menuText, viewMode === 'all' && styles.menuTextActive]}>Semua</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.menuItem, 
                  (selectedGenders.length > 0 || selectedShelters.length > 0) && styles.menuItemHighlight
                ]} 
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="options" size={16} color={(selectedGenders.length > 0 || selectedShelters.length > 0) ? '#fff' : '#e2e8f0'} style={{marginRight: 6}} />
                <Text style={[styles.menuText, (selectedGenders.length > 0 || selectedShelters.length > 0) && styles.menuTextActive]}>Filter</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, viewMode === 'favorite' && styles.menuItemActive]} 
                onPress={() => setViewMode('favorite')}
              >
                <Ionicons name="heart" size={16} color={viewMode === 'favorite' ? '#fff' : '#e2e8f0'} style={{marginRight: 6}} />
                <Text style={[styles.menuText, viewMode === 'favorite' && styles.menuTextActive]}>Favorite</Text>
              </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
              <ActivityIndicator color="#fff" style={{marginTop: 50}} />
            ) : (
              <FlatList
                data={filteredCats}
                numColumns={2}
                keyExtractor={(item) => item.id.toString()}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                renderItem={({ item }) => (
                  <CatCard 
                    cat={item} 
                    serverUrl={BASE_SERVER_URL} 
                    showStatus={true} 
                    onPress={() => router.push(`/adopt/${item.id}`)}
                    onFavoritePress={() => handleToggleFavorite(item.id)}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyBox}>
                    <Ionicons name="search-outline" size={50} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.emptyText}>Tidak ada kucing ditemukan</Text>
                    {(selectedGenders.length > 0 || selectedShelters.length > 0) && (
                        <TouchableOpacity onPress={resetFilter} style={{marginTop: 10}}>
                            <Text style={{color: '#EBCD5E', textDecorationLine: 'underline'}}>Reset Filter</Text>
                        </TouchableOpacity>
                    )}
                  </View>
                }
              />
            )}
          </View>
        ) : (
          /* TAMPILAN RIWAYAT (SESUAI KODE ASLI) */
          <FlatList
            data={myAdoptions}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={{padding: 20, paddingBottom: 100}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            renderItem={({ item }: any) => {
                const displayImg = item.catImage?.startsWith('http') 
                  ? item.catImage 
                  : `${BASE_SERVER_URL}/public/img/cats/${item.catImage || 'NULL.png'}`;

                return (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.historyCard}
                    onPress={() => router.push(`/adopt/history/${item.id}`)}
                  >
                    <Image source={{ uri: displayImg }} style={styles.histImg} />
                    <View style={{flex: 1}}>
                      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems: 'center'}}>
                        <Text style={styles.catNameText}>{item.catName}</Text>
                        <View style={[styles.badge, getStatusBg(item.status)]}>
                          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={styles.shelterText}>{item.shelterName}</Text>
                      <Text style={styles.dateText}>{item.appliedDate}</Text>
                    </View>
                    {item.status === 'pending' && (
                      <TouchableOpacity onPress={() => handleCancel(item.id)} style={styles.cancelBtn}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
            }}
            ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons name="document-text-outline" size={50} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.emptyText}>Belum ada riwayat pengajuan</Text>
                </View>
            }
          />
        )}

        {/* --- MODAL POP-UP FILTER --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Pencarian</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{maxHeight: 400}} showsVerticalScrollIndicator={false}>
                
                {/* 1. Filter Jenis Kelamin */}
                <Text style={styles.filterSectionTitle}>Jenis Kelamin</Text>
                <View style={styles.chipsContainer}>
                   {['male', 'female'].map(gender => (
                     <TouchableOpacity 
                        key={gender}
                        style={[styles.chip, selectedGenders.includes(gender) && styles.chipActive]}
                        onPress={() => toggleSelection(selectedGenders, setSelectedGenders, gender)}
                     >
                        <Text style={[styles.chipText, selectedGenders.includes(gender) && styles.chipTextActive]}>
                            {gender === 'male' ? 'Jantan' : 'Betina'}
                        </Text>
                     </TouchableOpacity>
                   ))}
                </View>

                {/* 2. Filter Shelter (Data dari Endpoint) */}
                <Text style={styles.filterSectionTitle}>Pilih Shelter / Komunitas</Text>
                {allShelters.length > 0 ? (
                    <View style={styles.chipsContainer}>
                        {allShelters.map((shelter: any) => (
                            <TouchableOpacity 
                                key={shelter.id}
                                style={[
                                    styles.chip, 
                                    // Cocokkan nama shelter yang dipilih dengan daftar
                                    selectedShelters.includes(shelter.shelter_name) && styles.chipActive
                                ]}
                                onPress={() => toggleSelection(selectedShelters, setSelectedShelters, shelter.shelter_name)}
                            >
                                <Text style={[
                                    styles.chipText, 
                                    selectedShelters.includes(shelter.shelter_name) && styles.chipTextActive
                                ]}>
                                    {shelter.shelter_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text style={{color: '#999', fontStyle: 'italic'}}>Memuat daftar shelter...</Text>
                )}

              </ScrollView>
              
              <View style={styles.modalFooter}>
                 <TouchableOpacity onPress={resetFilter} style={styles.resetBtn}>
                    <Text style={{color: '#666'}}>Reset</Text>
                 </TouchableOpacity>
                 <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.applyBtn}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Terapkan</Text>
                 </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </ImageBackground>
  );
}

const getStatusBg = (status: string) => {
  if (status === 'pending') return { backgroundColor: '#fef3c7' };
  if (status === 'approved' || status === 'completed') return { backgroundColor: '#d1fae5' };
  return { backgroundColor: '#fee2e2' };
};

const styles = StyleSheet.create({
  fullBackground: { flex: 1, backgroundColor: '#2c473c' },
  hero: { padding: 24, alignItems: 'center', paddingTop: 20 },
  heroImg: { width: 100, height: 70, marginBottom: 5 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, padding: 4, marginTop: 15 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 25 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontWeight: 'bold', color: '#fff', fontSize: 12 },
  
  // Style Menu Filter (3 Kolom)
  filterMenuContainer: { 
    flexDirection: 'row', justifyContent: 'center', marginVertical: 15, gap: 10, paddingHorizontal: 20
  },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, 
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)'
  },
  menuItemActive: { backgroundColor: '#EBCD5E', borderColor: '#EBCD5E' },
  menuItemHighlight: { backgroundColor: 'rgba(235, 205, 94, 0.3)', borderColor: '#EBCD5E' },
  menuText: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  menuTextActive: { color: '#fff' },

  // List & Cards
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  historyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 15, flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  histImg: { width: 65, height: 65, borderRadius: 12 },
  catNameText: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  shelterText: { fontSize: 12, color: '#64748b' },
  dateText: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontSize: 8, fontWeight: 'bold', color: '#1e293b' },
  cancelBtn: { padding: 10, backgroundColor: '#fee2e2', borderRadius: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: 14 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  filterSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginTop: 15, marginBottom: 10 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' },
  chipActive: { backgroundColor: '#dcfce7', borderColor: '#22c55e' },
  chipText: { color: '#64748b', fontSize: 12 },
  chipTextActive: { color: '#15803d', fontWeight: 'bold' },
  modalFooter: { flexDirection: 'row', marginTop: 25, justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  resetBtn: { padding: 12 },
  applyBtn: { flex: 1, backgroundColor: '#3A5F50', padding: 15, borderRadius: 15, alignItems: 'center' }
});