import React, { useCallback, useState } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert, Linking, StyleSheet 
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

const resolveImageUrl = (path: string | null) => {
  if (!path || path === 'NULL' || path === 'null') return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL?.replace('/api/v1', '') || '';
  if (path.startsWith('/public/')) return `${baseUrl}${path}`;
  if (path.startsWith('qr-')) return `${baseUrl}/public/img/qr_img/${path}`;
  if (path.startsWith('legal-')) return `${baseUrl}/public/docs/legal/${path}`;
  if (path.startsWith('profile-')) return `${baseUrl}/public/img/profile/${path}`;
  return `${baseUrl}/public/img/${path}`;
};

export default function ShelterProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- STATE MODAL ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
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

  const handleLogout = () => {
    // Alert konfirmasi bawaan HP tetep dipake buat keamanan logout
    Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Keluar', 
        style: 'destructive', 
        onPress: async () => {
          await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'username']);
          router.replace('/(auth)/login');
        } 
      }
    ]);
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
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
            
            {/* FOTO PROFIL SHELTER (FIX: Prefix profile-) */}
            <View style={{ marginBottom: 20 }}>
              <Image 
                source={profile?.profile_img ? { uri: resolveImageUrl(profile.profile_img.startsWith('profile-') ? profile.profile_img : `profile-${profile.profile_img}`) } : require('@/assets/images/NULL.png')} 
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
                <Text style={styles.readLabel}>Tanggal Berdiri</Text>
                <Text style={styles.readData}>{profile?.established_date ? profile.established_date.split('T')[0] : '-'}</Text>
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
                    source={{ uri: resolveImageUrl(profile.qr_img.startsWith('qr-') ? profile.qr_img : `qr-${profile.qr_img}`) }} 
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
                  onPress={() => profile?.legal_certificate && Linking.openURL(resolveImageUrl(profile.legal_certificate.startsWith('legal-') ? profile.legal_certificate : `legal-${profile.legal_certificate}`))}
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
                    ? `Koordinat: ${profile.latitude}, ${profile.longitude}` 
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
  readLabel: { color: '#9ca3af', fontSize: 11, fontWeight: 'bold', uppercase: 'true', marginBottom: 2 },
  readData: { color: '#374151', fontSize: 15, fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 15 },
  qrImage: { width: 110, height: 110, marginTop: 5, borderRadius: 12 },
  legalBtn: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', marginTop: 5 },
  legalText: { fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  logoutBtn: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});