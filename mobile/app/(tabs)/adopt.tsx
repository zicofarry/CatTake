import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, 
  ActivityIndicator, RefreshControl, SafeAreaView, 
  StatusBar, FlatList, ScrollView, Platform 
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient, { API_BASE_URL } from '@/api/apiClient';
import CatCard from '@/components/CatCard'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StickyBackButton from '../../components/StickyBackButton';
import * as WebBrowser from 'expo-web-browser';

// Import Komponen Pendukung
import ConfirmModal from '@/components/ConfirmModal';

// Membersihkan URL dari /api/v1 untuk akses file statis
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

// --- HELPERS (Sama dengan shelter/adopt.tsx) ---
const resolveBackendUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const getStatusLabel = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'pending') return 'MENUNGGU';
  if (s === 'approved') return 'DISETUJUI';
  if (s === 'completed') return 'SELESAI';
  if (s === 'rejected') return 'DITOLAK';
  return status?.toUpperCase();
};

export default function AdoptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeUserTab, setActiveUserTab] = useState<'browse' | 'history'>('browse');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // States Data
  const [cats, setCats] = useState<any[]>([]);
  const [myAdoptions, setMyAdoptions] = useState<any[]>([]);
  
  // State Dropdown & Modal
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);

  // State Filter
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = activeUserTab === 'browse' ? '/adopt/cats' : '/adopt/my-adoptions';
      const res = await apiClient.get(endpoint);
      
      if (activeUserTab === 'browse') {
        setCats(res.data); 
      } else {
        setMyAdoptions(res.data);
        console.log("My Adoptions:", res.data);
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

  const handleToggleFavorite = async (id: number) => {
    try {
      await apiClient.post(`/cats/${id}/favorite`);
      setCats(prev => prev.map(c => 
        c.id === id ? { ...c, isFavorited: !c.isFavorited } : c
      ));
    } catch (e: any) {
      console.error("Gagal toggle favorite:", e);
    }
  };

  const handleCancelAdoption = async () => {
    if (!pendingCancelId) return;
    try {
      await apiClient.delete(`/adopt/cancel/${pendingCancelId}`);
      setShowConfirmModal(false);
      loadData();
    } catch (e) {
      console.error("Gagal membatalkan pengajuan");
    }
  };

  const openDocument = async (url: string) => {
    const fullUrl = resolveBackendUrl(url);
    if (fullUrl) {
      await WebBrowser.openBrowserAsync(fullUrl);
    }
  };

  // Logika Filter
  const filteredCats = cats.filter(cat => {
    if (activeFilter === 'favorite') return cat.isFavorited;
    if (activeFilter === 'male') return cat.gender === 'male';
    if (activeFilter === 'female') return cat.gender === 'female';
    return true;
  });

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={styles.fullBackground}
      resizeMode="repeat"
    >
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle="light-content" />
        <StickyBackButton /> 
        
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
                    showStatus={false}
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
          /* --- TAB RIWAYAT SAYA (DROPDOWN MODE) --- */
          <FlatList
            data={myAdoptions}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={{padding: 20, paddingBottom: 100}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            renderItem={({ item }: any) => {
                const isExpanded = expandedId === item.id;
                const displayImg = item.catImage?.startsWith('http') 
                  ? item.catImage 
                  : `${item.catImage || 'null.png'}`;

                return (
                  <View style={[styles.historyCardContainer, { borderLeftColor: item.status === 'pending' ? '#EBCD5E' : item.status === 'approved' ? '#22c55e' : '#ef4444' }]}>
                    {/* Header Card (Bisa diklik untuk expand) */}
                    <TouchableOpacity 
                      style={styles.historyCardHeader}
                      onPress={() => setExpandedId(isExpanded ? null : item.id)}
                      activeOpacity={0.7}
                    >
                      <Image source={{ uri: displayImg }} style={styles.histImg} />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems: 'center'}}>
                          <Text style={styles.catNameText}>{item.catName}</Text>
                          <View style={[styles.badge, getStatusBg(item.status)]}>
                            <Text style={styles.badgeText}>{getStatusLabel(item.status)}</Text>
                          </View>
                        </View>
                        <Text style={styles.shelterText}>{item.shelterName}</Text>
                        <Text style={styles.dateText}>{item.appliedDate}</Text>
                      </View>
                      <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#9ca3af" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>

                    {/* Expanded Content (Dropdown Detail) */}
                    {isExpanded && (
                      <View style={styles.cardExpanded}>
                        <View style={styles.divider} />
                        {/* TAMPILKAN ALASAN JIKA DITOLAK */}
                        {item.status === 'rejected' && item.rejection_reason && (
                          <View style={{ backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#b91c1c', marginBottom: 2 }}>ALASAN PENOLAKAN:</Text>
                            <Text style={{ fontSize: 12, color: '#7f1d1d' }}>{item.rejection_reason}</Text>
                          </View>
                        )}
                        <Text style={styles.sectionTitle}>Data Pengajuan Anda</Text>
                        <View style={styles.infoList}>
                          <Text style={styles.infoItem}><Text style={styles.infoLabel}>NIK:</Text> {item.applicantNik || '-'}</Text>
                          <Text style={styles.infoItem}><Text style={styles.infoLabel}>HP:</Text> {item.applicantPhone || '-'}</Text>
                          <Text style={styles.infoItem}><Text style={styles.infoLabel}>Pekerjaan:</Text> {item.applicantJob || '-'}</Text>
                          <Text style={styles.infoItem}><Text style={styles.infoLabel}>Alamat:</Text> {item.applicantAddress || '-'}</Text>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Dokumen Terlampir</Text>
                        <View style={styles.docRow}>
                          {/* Menggunakan statementFile sesuai SQL */}
                          {item.statementFile && (
                              <TouchableOpacity onPress={() => openDocument(item.statementFile)} style={styles.docBtn}>
                                  <FontAwesome name="file-pdf-o" size={14} color="#ef4444" />
                                  <Text style={styles.docBtnText}>Surat Pernyataan</Text>
                              </TouchableOpacity>
                          )}
                          {/* Menggunakan identityFile sesuai SQL */}
                          {item.identityFile && (
                              <TouchableOpacity onPress={() => openDocument(item.identityFile)} style={[styles.docBtn, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
                                  <FontAwesome name="id-card" size={14} color="#3b82f6" />
                                  <Text style={[styles.docBtnText, { color: '#475569' }]}>Foto KTP</Text>
                              </TouchableOpacity>
                          )}
                        </View>

                        {/* Tombol Aksi Batalkan di dalam Dropdown */}
                        {item.status === 'pending' && (
                          <TouchableOpacity 
                            onPress={() => {
                              setPendingCancelId(item.id);
                              setShowConfirmModal(true);
                            }} 
                            style={styles.cancelBtnFull}
                          >
                            <Ionicons name="trash-outline" size={18} color="#fff" />
                            <Text style={styles.cancelBtnText}>BATALKAN PENGAJUAN</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
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
      </SafeAreaView>

      {/* MODAL KONFIRMASI PEMBATALAN */}
      <ConfirmModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCancelAdoption}
        title="Batalkan Adopsi"
        message="Apakah Anda yakin ingin membatalkan pengajuan adopsi ini? Data yang sudah dikirim akan dihapus."
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
        type="danger"
        icon="alert-circle"
      />
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
  fullBackground: { flex: 1, backgroundColor: '#2c473c' },
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
  
  // Gaya Card Riwayat Baru
  historyCardContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    marginBottom: 15, 
    overflow: 'hidden',
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyCardHeader: { 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  histImg: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#f3f4f6' },
  catNameText: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  shelterText: { fontSize: 12, color: '#64748b' },
  dateText: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 8, fontWeight: 'bold', color: '#1e293b' },
  
  // Gaya Expanded Content
  cardExpanded: { paddingHorizontal: 15, paddingBottom: 20 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 15 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  infoList: { gap: 6 },
  infoItem: { fontSize: 13, color: '#64748b' },
  infoLabel: { fontWeight: '700', color: '#475569' },
  
  docRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  docBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0fdf4', 
    borderWidth: 1, 
    borderColor: '#dcfce7', 
    padding: 10, 
    borderRadius: 12,
    gap: 8,
    flex: 1
  },
  docBtnText: { color: '#166534', fontSize: 11, fontWeight: 'bold' },

  cancelBtnFull: { 
    marginTop: 20, 
    backgroundColor: '#ef4444', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 14, 
    borderRadius: 16,
    gap: 8
  },
  cancelBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },

  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: 14 }
});