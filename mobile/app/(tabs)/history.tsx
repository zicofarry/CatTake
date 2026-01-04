import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  FlatList, ActivityIndicator, RefreshControl, 
  StatusBar, ImageBackground, Dimensions, Modal, ScrollView
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import apiClient, { API_BASE_URL } from '@/api/apiClient';
import StickyBackButton from '../../components/StickyBackButton';

const { width } = Dimensions.get('window');

type HistoryType = 'semua' | 'donasi' | 'adopsi' | 'rescue';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<HistoryType>('semua');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Mapping Konfigurasi Ikon & Warna (Sesuai Menu Cepat index.tsx)
  const categoryConfig = {
    semua: { icon: 'time', color: '#3b82f6', label: 'Semua Riwayat' },
    donasi: { icon: 'heart', color: '#ef4444', label: 'Donasi' },
    adopsi: { icon: 'paw', color: '#f97316', label: 'Adopsi' },
    rescue: { icon: 'medkit', color: '#10b981', label: 'Lapor' }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [donations, adoptions, rescues] = await Promise.all([
        apiClient.get('/donations/history').catch(() => ({ data: [] })),
        apiClient.get('/adoptions/history').catch(() => ({ data: [] })),
        apiClient.get('/rescue/history').catch(() => ({ data: [] }))
      ]);

      const combined = [
        ...(donations.data || []).map((d: any) => ({ ...d, type: 'donasi', dateObj: new Date(d.createdAt || d.date) })),
        ...(adoptions.data || []).map((a: any) => ({ ...a, type: 'adopsi', dateObj: new Date(a.createdAt || a.date) })),
        ...(rescues.data || []).map((r: any) => ({ ...r, type: 'rescue', dateObj: new Date(r.createdAt || r.date) }))
      ];

      combined.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
      setData(combined);
    } catch (error) {
      console.error("Gagal ambil riwayat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filteredData = activeTab === 'semua' ? data : data.filter(item => item.type === activeTab);

  const renderItem = ({ item }: { item: any }) => {
    const config = categoryConfig[item.type as keyof typeof categoryConfig] || categoryConfig.semua;

    return (
      <View style={styles.donationCard}>
        <View style={styles.cardTopRow}>
          <Text style={styles.dateText}>
            {item.date || new Date(item.dateObj).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <View style={[styles.statusBadge, item.status === 'Completed' || item.status === 'verified' ? styles.bgSuccess : styles.bgPending]}>
            <Text style={[styles.statusText, item.status === 'Completed' || item.status === 'verified' ? styles.textSuccess : styles.textPending]}>
              {(item.status || 'PENDING').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={[styles.iconWrapper, { backgroundColor: config.color + '15' }]}>
            <Ionicons name={config.icon as any} size={18} color={config.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.donorName}>{item.title || item.catName || 'Aktivitas Tercatat'}</Text>
            <Text style={styles.categoryLabel}>{config.label}</Text>
          </View>
          {item.amount && (
            <Text style={[styles.amountText, { color: config.color }]}>
              Rp {parseInt(item.amount).toLocaleString('id-ID')}
            </Text>
          )}
        </View>
        
        <Text style={styles.historyDesc}>{item.description || item.message || 'Data telah tercatat di sistem CatTake.'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
      <StickyBackButton /> 
      
      <ImageBackground 
        source={require('../../assets/images/bg-texture.png')} 
        style={StyleSheet.absoluteFillObject} 
        resizeMode="cover"
      />

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} tintColor="#fff" />}
        ListHeaderComponent={
          <View>
            <View style={styles.heroSection}>
              <Image source={require('../../assets/images/time1.png')} style={styles.heroImage} resizeMode="contain" />
              <Text style={styles.heroTitle}>Jejak Kebaikan Kamu.</Text>
              <Text style={styles.heroSubtitle}>Lihat kembali semua kontribusi dan kasih sayang yang telah kamu bagikan untuk anabul.</Text>
            </View>

            {/* DROPDOWN FILTER DENGAN IKON */}
            <View style={styles.filterSection}>
               <Text style={styles.label}>FILTER KATEGORI</Text>
               <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                     <Ionicons 
                        name={categoryConfig[activeTab].icon as any} 
                        size={20} 
                        color={categoryConfig[activeTab].color} 
                     />
                     <Text style={styles.dropdownText}>
                        {categoryConfig[activeTab].label}
                     </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
               </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={!loading && (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={60} color="rgba(255,255,255,0.3)" />
            <Text style={{color: 'rgba(255,255,255,0.5)', marginTop: 10, fontStyle: 'italic'}}>Belum ada riwayat ditemukan.</Text>
          </View>
        )}
      />

      {/* MODAL FILTER DENGAN IKON REPRESENTATIF */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Pilih Kategori</Text>
                 <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                 </TouchableOpacity>
              </View>
              <ScrollView>
                 {(['semua', 'donasi', 'adopsi', 'rescue'] as HistoryType[]).map((type) => (
                    <TouchableOpacity 
                       key={type} 
                       style={styles.modalItem}
                       onPress={() => { setActiveTab(type); setModalVisible(false); }}
                    >
                       <View style={[styles.modalIconBox, { backgroundColor: categoryConfig[type].color + '15' }]}>
                          <Ionicons name={categoryConfig[type].icon as any} size={20} color={categoryConfig[type].color} />
                       </View>
                       <Text style={[styles.modalText, activeTab === type && { fontWeight: 'bold', color: '#3A5F50' }]}>
                         {categoryConfig[type].label}
                       </Text>
                       {activeTab === type && <Ionicons name="checkmark-circle" size={20} color="#3A5F50" />}
                    </TouchableOpacity>
                 ))}
              </ScrollView>
           </View>
        </View>
      </Modal>

      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#EBCD5E" style={styles.loader} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C473C' },
  heroSection: { alignItems: 'center', padding: 24, paddingTop: 40 },
  heroImage: { width: 120, height: 120, marginBottom: 15 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  heroSubtitle: { fontSize: 12, color: '#e5e7eb', textAlign: 'center', marginTop: 5, maxWidth: 280, lineHeight: 18 },
  
  // Dropdown Style
  filterSection: { paddingHorizontal: 20, marginBottom: 25 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#EBCD5E', marginBottom: 6, letterSpacing: 0.5 },
  dropdown: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
    alignItems: 'center'
  },
  dropdownText: { fontSize: 15, color: '#1F2937', fontWeight: 'bold' },

  // Card Style
  donationCard: {
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 8 },
  dateText: { fontSize: 11, color: '#6b7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bgSuccess: { backgroundColor: '#ECFDF5' }, bgPending: { backgroundColor: '#FFFBEB' },
  textSuccess: { color: '#059669', fontSize: 10, fontWeight: 'bold' }, textPending: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
  
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconWrapper: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  donorName: { fontWeight: 'bold', color: '#1F2937', fontSize: 15 },
  categoryLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' },
  amountText: { fontWeight: 'bold', fontSize: 16 },
  historyDesc: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  
  // Modal Style
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 15 },
  modalIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalText: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 50 },
  loader: { position: 'absolute', top: '55%', alignSelf: 'center' }
});