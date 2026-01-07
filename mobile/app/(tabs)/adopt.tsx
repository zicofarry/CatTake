import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, 
  ActivityIndicator, RefreshControl, SafeAreaView, 
  StatusBar, FlatList, ScrollView, Platform, Modal 
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
import CustomPopup from '@/components/CustomPopup';

const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000';

// --- HELPERS ---
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

const getStatusBg = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'pending') return { backgroundColor: '#fef3c7' };
  if (s === 'approved' || s === 'completed') return { backgroundColor: '#d1fae5' };
  return { backgroundColor: '#fee2e2' };
};

export default function AdoptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Tab Utama
  const [activeUserTab, setActiveUserTab] = useState<'browse' | 'history'>('browse');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // States Data Utama
  const [cats, setCats] = useState<any[]>([]);
  const [myAdoptions, setMyAdoptions] = useState<any[]>([]);
  const [allShelters, setAllShelters] = useState<any[]>([]);

  // State UI
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  
  // State Filter
  const [viewMode, setViewMode] = useState<'all' | 'favorite'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedShelters, setSelectedShelters] = useState<string[]>([]);

  // State Custom Popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('success');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  // --- 1. FETCH DATA SHELTER (UNTUK OPSI FILTER) ---
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await apiClient.get('/users/shelters');
        if (Array.isArray(res.data)) {
          setAllShelters(res.data);
        }
      } catch (e) {
        console.error("Gagal ambil list shelter:", e);
      }
    };
    fetchShelters();
  }, []);

  // --- 2. LOAD DATA UTAMA ---
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeUserTab === 'browse') {
        const res = await apiClient.get('/adopt/cats');
        setCats(res.data); 
      } else {
        const res = await apiClient.get('/adopt/my-adoptions');
        setMyAdoptions(res.data);
      }
    } catch (e) {
      console.error("Load Error:", e);
      showPopup('error', 'Gagal Memuat', 'Terjadi kesalahan saat mengambil data.');
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

  // --- 3. LOGIKA FILTERING ---
  const filteredCats = useMemo(() => {
    return cats.filter(cat => {
      // Filter Mode Favorite
      if (viewMode === 'favorite' && !cat.isFavorited) return false;

      // Filter Gender
      if (selectedGenders.length > 0 && !selectedGenders.includes(cat.gender)) return false;

      // Filter Shelter
      const catShelterName = cat.shelter || cat.shelter_name || cat.shelterName;
      if (selectedShelters.length > 0 && !selectedShelters.includes(catShelterName)) return false;

      return true;
    });
  }, [cats, viewMode, selectedGenders, selectedShelters]);

  // --- 4. HANDLERS ---
  const toggleSelection = (list: string[], setList: Function, value: string) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const resetFilter = () => {
    setSelectedGenders([]);
    setSelectedShelters([]);
    setViewMode('all');
    setModalVisible(false);
  };

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
      showPopup('success', 'Berhasil', 'Pengajuan adopsi telah dibatalkan.');
    } catch (e) {
      setShowConfirmModal(false);
      showPopup('error', 'Gagal', 'Terjadi kesalahan saat membatalkan pengajuan.');
    }
  };

  const openDocument = async (url: string) => {
    const fullUrl = resolveBackendUrl(url);
    if (fullUrl) {
      await WebBrowser.openBrowserAsync(fullUrl);
    }
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
            {/* MENU FILTER UTAMA */}
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
                    showStatus={false}
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
          /* --- TAB RIWAYAT SAYA (DETAILED DROPDOWN) --- */
          <FlatList
            data={myAdoptions}
            keyExtractor={(item: any) => item.id.toString()}
            contentContainerStyle={{padding: 20, paddingBottom: 100}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            renderItem={({ item }: any) => {
                const isExpanded = expandedId === item.id;
                const displayImg = item.catImage?.startsWith('http') 
                  ? item.catImage 
                  : `${BASE_SERVER_URL}/public/img/cats/${item.catImage || 'NULL.png'}`;

                return (
                  <View style={[styles.historyCardContainer, { borderLeftColor: item.status === 'pending' ? '#EBCD5E' : item.status === 'approved' || item.status === 'completed' ? '#22c55e' : '#ef4444' }]}>
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

                    {isExpanded && (
                      <View style={styles.cardExpanded}>
                        <View style={styles.divider} />
                        {item.status === 'rejected' && item.rejection_reason && (
                          <View style={styles.rejectionBox}>
                            <Text style={styles.rejectionTitle}>ALASAN PENOLAKAN:</Text>
                            <Text style={styles.rejectionText}>{item.rejection_reason}</Text>
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
                          {item.statementFile && (
                              <TouchableOpacity onPress={() => openDocument(item.statementFile)} style={styles.docBtn}>
                                  <FontAwesome name="file-pdf-o" size={14} color="#ef4444" />
                                  <Text style={styles.docBtnText}>Surat Pernyataan</Text>
                              </TouchableOpacity>
                          )}
                          {item.identityFile && (
                              <TouchableOpacity onPress={() => openDocument(item.identityFile)} style={[styles.docBtn, { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }]}>
                                  <FontAwesome name="id-card" size={14} color="#3b82f6" />
                                  <Text style={[styles.docBtnText, { color: '#475569' }]}>Foto KTP</Text>
                              </TouchableOpacity>
                          )}
                        </View>

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

        {/* MODAL POP-UP FILTER */}
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

                <Text style={styles.filterSectionTitle}>Pilih Shelter / Komunitas</Text>
                {allShelters.length > 0 ? (
                    <View style={styles.chipsContainer}>
                        {allShelters.map((shelter: any) => (
                            <TouchableOpacity 
                                key={shelter.id}
                                style={[
                                    styles.chip, 
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

        {/* MODAL KONFIRMASI PEMBATALAN */}
        <ConfirmModal
          visible={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleCancelAdoption}
          title="Batalkan Adopsi"
          message="Apakah Anda yakin ingin membatalkan pengajuan adopsi ini? Data yang sudah dikirim akan dihapus."
          confirmText="Ya, Batalkan"
          type="danger"
        />

        {/* CUSTOM POPUP */}
        <CustomPopup 
          visible={popupVisible}
          onClose={() => setPopupVisible(false)}
          type={popupType}
          title={popupTitle}
          message={popupMessage}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullBackground: { flex: 1, backgroundColor: '#2c473c' },
  hero: { padding: 24, alignItems: 'center', paddingTop: 20 },
  heroImg: { width: 100, height: 70, marginBottom: 5 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, padding: 4, marginTop: 15 },
  tabBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 25, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontWeight: 'bold', color: '#fff', fontSize: 12 },
  filterMenuContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15, gap: 10, paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)' },
  menuItemActive: { backgroundColor: '#EBCD5E', borderColor: '#EBCD5E' },
  menuItemHighlight: { backgroundColor: 'rgba(235, 205, 94, 0.4)', borderColor: '#EBCD5E' },
  menuText: { color: '#e2e8f0', fontSize: 12, fontWeight: '600' },
  menuTextActive: { color: '#3A5F50' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  historyCardContainer: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 15, overflow: 'hidden', borderLeftWidth: 5, elevation: 3 },
  historyCardHeader: { padding: 15, flexDirection: 'row', alignItems: 'center' },
  histImg: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#f3f4f6' },
  catNameText: { fontWeight: 'bold', fontSize: 16, color: '#1e293b' },
  shelterText: { fontSize: 12, color: '#64748b' },
  dateText: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 8, fontWeight: 'bold', color: '#1e293b' },
  cardExpanded: { paddingHorizontal: 15, paddingBottom: 20 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 15 },
  rejectionBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  rejectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#b91c1c', marginBottom: 2 },
  rejectionText: { fontSize: 12, color: '#7f1d1d' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  infoList: { gap: 6 },
  infoItem: { fontSize: 13, color: '#64748b' },
  infoLabel: { fontWeight: '700', color: '#475569' },
  docRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  docBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#dcfce7', padding: 10, borderRadius: 12, gap: 8, flex: 1 },
  docBtnText: { color: '#166534', fontSize: 11, fontWeight: 'bold' },
  cancelBtnFull: { marginTop: 20, backgroundColor: '#ef4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 16, gap: 8 },
  cancelBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: 14 },
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