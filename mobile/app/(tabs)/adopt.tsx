import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, 
  Alert, ActivityIndicator, RefreshControl, SafeAreaView, 
  StatusBar, FlatList, ScrollView // PERBAIKAN: Import ScrollView
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
  const [activeUserTab, setActiveUserTab] = useState<'browse' | 'history'>('browse');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // States Data
  const [cats, setCats] = useState<any[]>([]);
  const [myAdoptions, setMyAdoptions] = useState([]);
  
  // State Filter (Sinkron dengan Vue)
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = activeUserTab === 'browse' ? '/adopt/cats' : '/adopt/my-adoptions';
      const res = await apiClient.get(endpoint);
      
      if (activeUserTab === 'browse') {
        // PERBAIKAN: Jangan tulis ulang isFavorited: false
        // Gunakan data langsung dari backend karena backend sudah menghitung isFavorited
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

  // Logika Filter (Sinkron dengan Vue)
  const filteredCats = cats.filter(cat => {
    if (activeFilter === 'favorite') return cat.isFavorited;
    if (activeFilter === 'male') return cat.gender === 'male';
    if (activeFilter === 'female') return cat.gender === 'female';
    return true;
  });

  const handleToggleFavorite = async (id: number) => {
    try {
      // 1. Panggil API backend
      await apiClient.post(`/cats/${id}/favorite`);

      // 2. Update state lokal agar UI langsung berubah (Optimistic Update)
      setCats(prev => prev.map(c => 
        c.id === id ? { ...c, isFavorited: !c.isFavorited } : c
      ));
      
      // Opsional: Jika sedang di tab favorit, kita mungkin ingin refresh data
      if (activeFilter === 'favorite') {
        // loadData(); // Aktifkan jika ingin item langsung hilang saat un-favorite
      }
    } catch (e: any) {
      console.error("Gagal toggle favorite:", e);
      Alert.alert("Gagal", e.response?.data?.error || "Terjadi kesalahan saat menyukai kucing.");
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
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ width: 150, height: 150, opacity: 0.15 }}
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
            {/* FILTER HORIZONTAL */}
            <View style={styles.filterBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 20}}>
                <FilterBtn label="Semua" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
                <FilterBtn label="Jantan" active={activeFilter === 'male'} onPress={() => setActiveFilter('male')} />
                <FilterBtn label="Betina" active={activeFilter === 'female'} onPress={() => setActiveFilter('female')} />
                <FilterBtn 
                  label={`Favorit (${cats.filter(c => c.isFavorited).length})`} 
                  active={activeFilter === 'favorite'} 
                  onPress={() => setActiveFilter('favorite')} 
                />
              </ScrollView>
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
                    onPress={() => router.push(`/adopt/${item.id}`)}
                    onFavoritePress={() => handleToggleFavorite(item.id)}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyBox}>
                    <Ionicons name="search-outline" size={50} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.emptyText}>Tidak ada kucing ditemukan</Text>
                  </View>
                }
              />
            )}
          </View>
        ) : (
          /* RIWAYAT VIEW */
          <FlatList
            data={myAdoptions}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={{padding: 20, paddingBottom: 100}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            renderItem={({ item }: any) => (
              <TouchableOpacity 
                style={styles.historyCard}
                onPress={() => router.push(`/adopt/history/${item.id}`)}
              >
                <Image 
                  source={{ uri: `${BASE_SERVER_URL}/public/img/cats/${item.catImage}` }} 
                  style={styles.histImg} 
                />
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
            )}
            ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Ionicons name="document-text-outline" size={50} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.emptyText}>Belum ada riwayat pengajuan</Text>
                </View>
            }
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const FilterBtn = ({ label, active, onPress }: any) => (
  <TouchableOpacity style={[styles.fBtn, active && styles.fBtnActive]} onPress={onPress}>
    <Text style={[styles.fText, active && styles.fTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const getStatusBg = (status: string) => {
  if (status === 'pending') return { backgroundColor: '#fef3c7' };
  if (status === 'approved' || status === 'completed') return { backgroundColor: '#d1fae5' };
  return { backgroundColor: '#fee2e2' };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c473c' },
  hero: { padding: 24, alignItems: 'center', paddingTop: 20 },
  heroImg: { width: 100, height: 70, marginBottom: 5 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, padding: 4, marginTop: 15 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 25 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontWeight: 'bold', color: '#fff', fontSize: 12 },
  filterBar: { marginVertical: 10 },
  fBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  fBtnActive: { backgroundColor: '#EBCD5E', borderColor: '#EBCD5E' },
  fText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  fTextActive: { color: '#fff' },
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
  emptyText: { color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: 14 }
});