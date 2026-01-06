import React, { useCallback, useState, useEffect } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert, Linking, StyleSheet, Modal 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient, { API_BASE_URL } from '@/api/apiClient';
// IMPORT CUSTOM POPUP
import CustomPopup from '@/components/CustomPopup';


export default function ShelterProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addressName, setAddressName] = useState<string>('Memuat alamat...');
  
  // --- STATE MODAL ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // State untuk modal logout
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const formatDateIndonesia = (dateString) => {
    if (!dateString) return '-';
    
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return router.replace('/(auth)/login');
      const decoded: any = jwtDecode(token);
      const response = await apiClient.get(`/users/profile/${decoded.id}/${decoded.role}`);
      
      setProfile(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      // GANTI ALERT JADI MODAL
      showModal('error', 'Gagal', 'Tidak dapat mengambil data profil shelter.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  useEffect(() => {
    if (profile?.latitude && profile?.longitude) {
      getAddress(profile.latitude, profile.longitude);
    }
  }, [profile?.latitude, profile?.longitude]);

  const getAddress = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { 
        headers: { 'User-Agent': 'CatTakeApp/1.0' } 
      });
      const data = await res.json();
      
      // Ambil display_name atau fallback ke koordinat jika gagal
      setAddressName(data.display_name || `${lat}, ${lng}`);
    } catch (error) {
      console.error("Geocoding Error:", error);
      setAddressName(`${lat}, ${lng}`); // Fallback jika internet bermasalah
    }
  };
  const handleLogout = () => {
    // Membuka modal konfirmasi logout
    setLogoutModalVisible(true);
  };

  // Fungsi eksekusi logout
  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'username']);
    router.replace('/(auth)/login');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#EBCD5E" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#E8EAE3', '#A9C2B7']} style={{ flex: 1 }}>
        
        {/* HEADER: KEMBAR SAMA USER PROFILE */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Shelter</Text>
          <TouchableOpacity onPress={() => router.push('/shelter/edit-profile')} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
            
            {/* FOTO PROFIL SHELTER (FIX: Prefix profile-) */}
            <View style={{ marginBottom: 20 }}>
              <Image 
                source={profile.photo ? { uri: profile.photo } : require('@/assets/images/null-shelter.png')} 
                style={{ width: '100%', height: 180, borderRadius: 20, borderWidth: 2, borderColor: 'white' }}
                resizeMode="cover"
              />
              <View className="items-center mt-4">
                <Text className="text-2xl font-bold text-gray-800">{profile?.name || 'Nama Shelter'}</Text>
                <Text className="text-gray-500 text-sm">{profile?.organization_type || 'Organisasi'}</Text>
              </View>
            </View>

            {/* SATU KOTAK PUTIH BESAR (MODE BACA - RAPAT KE BAWAH) */}
            <View style={styles.formCard}>
              
              {/* Identitas Section */}
              <View className="flex-row items-center gap-2 mb-4">
                <FontAwesome5 name="home" size={16} color="#3A5F50" />
                <Text className="text-base font-bold text-[#3A5F50]">Identitas Shelter</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Nama Lengkap Shelter</Text>
                <Text style={styles.readData}>{profile?.name || '-'}</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Jenis Organisasi</Text>
                <Text style={styles.readData}>{profile?.organization_type || '-'}</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.labelTgl}>Tanggal Berdiri</Text>
                <Text style={styles.readData}>
                  {profile?.established_date ? formatDateIndonesia(profile.established_date) : '-'}
                </Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Bio </Text>
                <Text style={styles.readData}>{profile?.bio || 'Belum ada bio.'}</Text>
              </View>

              <View style={styles.separator} />

              {/* Kontak Section */}
              <View className="flex-row items-center gap-2 mb-4">
                <FontAwesome5 name="address-book" size={16} color="#3A5F50" />
                <Text className="text-base font-bold text-[#3A5F50]">Kontak & Donasi</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Nomor Kontak (WhatsApp)</Text>
                <Text style={styles.readData}>{profile?.contact_phone || '-'}</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Nomor Rekening Donasi</Text>
                <Text style={styles.readData}>{profile?.donation_account_number || '-'}</Text>
              </View>

              {profile?.qr_img && (
                <View style={styles.readGroup}>
                  <Text style={styles.readLabel}>QRIS Code</Text>
                  {/* FIX QR DISINI: Tambah prefix qr- biar gambar muncul */}
                  <Image 
                    source={{ uri: profile.qr_img }}
                    style={styles.qrImage} 
                    resizeMode="contain" 
                  />
                </View>
              )}

              <View style={styles.separator} />

              {/* Legalitas Section */}
              <View className="flex-row items-center gap-2 mb-4">
                <FontAwesome5 name="user-shield" size={14} color="#3A5F50" />
                <Text className="text-base font-bold text-[#3A5F50]">Legalitas & PJ</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Nama Penanggung Jawab</Text>
                <Text style={styles.readData}>{profile?.pj_name || '-'}</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>NIK Penanggung Jawab</Text>
                <Text style={styles.readData}>{profile?.pj_nik || '-'}</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readLabel}>Dokumen Legalitas</Text>
                <TouchableOpacity 
                  onPress={() => profile?.legal_certificate && Linking.openURL(profile.legal_certificate)}
                  disabled={!profile?.legal_certificate}
                  style={styles.legalBtn}
                >
                  <Text style={[styles.legalText, { color: profile?.legal_certificate ? '#2563eb' : '#9ca3af' }]}>
                    {profile?.legal_certificate ? 'Lihat Dokumen' : 'Belum ada dokumen'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.separator} />

              {/* Lokasi Section */}
              <View className="flex-row items-center gap-2 mb-4">
                <FontAwesome5 name="map-marked-alt" size={16} color="#3A5F50" />
                <Text className="text-base font-bold text-[#3A5F50]">Lokasi Shelter</Text>
              </View>

              <View style={styles.readGroup}>
                <Text style={styles.readData}>
                  {profile?.latitude && profile?.longitude 
                    ? addressName 
                    : 'Lokasi belum diatur'}
                </Text>
              </View>

            </View>

            {/* SIGN OUT: KEMBAR SAMA USER PROFILE */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </LinearGradient>

      {/* --- MODAL KONFIRMASI LOGOUT (STYLE DRIVER PAGE) --- */}
      <Modal animationType="fade" transparent={true} visible={logoutModalVisible} onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out" size={30} color="white" />
            </View>
            <View style={{ itemsCenter: 'center', marginBottom: 30 }}>
              <Text style={styles.modalTitle}>Keluar Akun</Text>
              <Text style={styles.modalSub}>Yakin ingin keluar dari akun anda?</Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setLogoutModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DI SINI --- */}
      <CustomPopup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingBottom: 15, backgroundColor: 'rgba(255,255,255,0.8)' 
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { marginLeft: 5, fontWeight: '600', color: '#374151' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  editBtn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  editBtnText: { fontWeight: 'bold', color: '#374151' },
  formCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 4 },
  readGroup: { marginBottom: 12, paddingHorizontal: 5 },
  readLabel: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  labelTgl: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  readData: { color: '#374151', fontSize: 15, fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 15 },
  qrImage: { width: 110, height: 110, marginTop: 5, borderRadius: 12 },
  legalBtn: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginTop: 5 },
  legalText: { fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  logoutBtn: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },

  // STYLES UNTUK MODAL (SESUAI DRIVER PAGE)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', width: '85%', paddingHorizontal: 25, paddingBottom: 25, paddingTop: 50, borderRadius: 30, alignItems: 'center', position: 'relative', elevation: 10 },
  modalIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -40, borderWidth: 4, borderColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 10, textAlign: 'center' },
  modalSub: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 10, lineHeight: 22 },
  modalFooter: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 15, backgroundColor: '#f3f4f6', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: 'bold', color: '#6b7280' },
  confirmBtn: { flex: 1, paddingVertical: 16, borderRadius: 15, backgroundColor: '#ef4444', alignItems: 'center' },
  confirmText: { fontSize: 16, fontWeight: 'bold', color: '#fff' }
});