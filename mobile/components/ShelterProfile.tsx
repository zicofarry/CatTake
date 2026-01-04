import React, { useCallback, useState } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, Alert, Linking 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '@/api/apiClient';

// Helper URL Gambar
const resolveImageUrl = (path: string | null) => {
  if (!path || path === 'NULL' || path === 'null') return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL?.replace('/api/v1', '') || '';
  if (path.startsWith('/public/')) return `${baseUrl}${path}`;
  if (path.startsWith('qr-')) return `${baseUrl}/public/img/qr_img/${path}`;
  if (path.startsWith('legal-')) return `${baseUrl}/public/docs/legal/${path}`;
  return `${baseUrl}/public/img/${path}`;
};

export default function ShelterProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        handleLogoutForce();
        return;
      }
      const decoded: any = jwtDecode(token);
      
      const response = await apiClient.get(`/users/profile/${decoded.id}/${decoded.role}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  // --- LOGOUT YANG BENAR (RESET STACK) ---
  const handleLogoutForce = async () => {
    try {
      // 1. Hapus data
      await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'username']);
      
      // 2. Reset Navigasi (PENTING!)
      // dismissAll() menutup semua screen yang numpuk
      if (router.canGoBack()) {
        router.dismissAll();
      }
      // 3. Pindah ke login
      router.replace('/(auth)/login'); 
    } catch (e) {
      console.log(e);
      router.replace('/(auth)/login');
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Keluar', 
        style: 'destructive', 
        onPress: handleLogoutForce 
      }
    ]);
  };
  // ---------------------------------------

  if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#EBCD5E" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="pt-14 px-4"
      >
          {/* Header Profil */}
          <View className="flex-row items-center justify-between mb-6">
              <Text className="text-3xl font-bold text-gray-800">Profil Shelter</Text>
              <TouchableOpacity onPress={handleLogout} className="bg-red-100 p-2 rounded-full">
                  <Ionicons name="log-out-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
          </View>

          {/* Container Putih Rounded */}
          <View className="bg-white rounded-[30px] shadow-sm p-6 mb-6 border border-gray-100">
              
              {/* 1. Identitas Shelter */}
              <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-4">
                      <FontAwesome5 name="home" size={20} color="#3A5F50" />
                      <Text className="text-xl font-bold text-[#3A5F50]">Identitas Shelter</Text>
                  </View>
                  <View className="gap-4">
                      <View>
                          <Text className="text-sm font-bold text-gray-500 mb-1">Nama Shelter</Text>
                          <Text className="text-lg text-gray-800">{profile?.name || '-'}</Text>
                      </View>
                      <View className="flex-row gap-4">
                          <View className="flex-1">
                              <Text className="text-sm font-bold text-gray-500 mb-1">Jenis Organisasi</Text>
                              <Text className="text-base text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">{profile?.organization_type || '-'}</Text>
                          </View>
                          <View className="flex-1">
                              <Text className="text-sm font-bold text-gray-500 mb-1">Tanggal Berdiri</Text>
                              <Text className="text-base text-gray-800 bg-gray-50 p-2 rounded-lg border border-gray-100">{profile?.established_date ? profile.established_date.split('T')[0] : '-'}</Text>
                          </View>
                      </View>
                      <View>
                          <Text className="text-sm font-bold text-gray-500 mb-1">Bio Singkat</Text>
                          <Text className="text-base text-gray-600 italic">{profile?.bio || 'Belum ada bio.'}</Text>
                      </View>
                  </View>
              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* 2. Kontak & Donasi */}
              <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-4">
                      <FontAwesome5 name="address-book" size={20} color="#3A5F50" />
                      <Text className="text-xl font-bold text-[#3A5F50]">Kontak & Donasi</Text>
                  </View>
                  <View className="gap-4">
                      <View>
                          <Text className="text-sm font-bold text-gray-500 mb-1">Nomor Kontak (WA)</Text>
                          <Text className="text-lg text-gray-800">{profile?.contact_phone || '-'}</Text>
                      </View>
                      <View>
                          <Text className="text-sm font-bold text-gray-500 mb-1">Nomor Rekening</Text>
                          <Text className="text-lg text-gray-800 font-mono">{profile?.donation_account_number || '-'}</Text>
                      </View>
                      <View>
                          <Text className="text-sm font-bold text-gray-500 mb-2">QRIS Code</Text>
                          {profile?.qr_img ? (
                              <Image 
                                  source={{ uri: resolveImageUrl(profile.qr_img) }} 
                                  className="w-32 h-32 rounded-xl bg-gray-50 border border-gray-200"
                                  resizeMode="contain"
                              />
                          ) : (
                              <Text className="text-gray-400 italic text-sm">Belum upload QRIS</Text>
                          )}
                      </View>
                  </View>
              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* 3. Legalitas */}
              <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-4">
                      <FontAwesome5 name="user-shield" size={18} color="#3A5F50" />
                      <Text className="text-xl font-bold text-[#3A5F50]">Legalitas & PJ</Text>
                  </View>
                  <View className="gap-4">
                      <View className="flex-row gap-4">
                          <View className="flex-1">
                              <Text className="text-sm font-bold text-gray-500 mb-1">Penanggung Jawab</Text>
                              <Text className="text-base text-gray-800">{profile?.pj_name || '-'}</Text>
                          </View>
                          <View className="flex-1">
                              <Text className="text-sm font-bold text-gray-500 mb-1">NIK PJ</Text>
                              <Text className="text-base text-gray-800">{profile?.pj_nik || '-'}</Text>
                          </View>
                      </View>
                      <View>
                          <Text className="text-sm font-bold text-gray-500 mb-1">Dokumen Legalitas</Text>
                          <TouchableOpacity 
                              onPress={() => profile?.legal_certificate && Linking.openURL(resolveImageUrl(`legal-${profile.legal_certificate}`))}
                              disabled={!profile?.legal_certificate}
                              className="flex-row items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200"
                          >
                              <FontAwesome5 name="file-contract" size={24} color={profile?.legal_certificate ? "#3A5F50" : "#9CA3AF"} />
                              <Text className={`flex-1 ${profile?.legal_certificate ? 'text-blue-600 underline' : 'text-gray-400'}`}>
                                  {profile?.legal_certificate || 'Belum ada dokumen'}
                              </Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* 4. Lokasi */}
              <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-4">
                      <FontAwesome5 name="map-marked-alt" size={20} color="#3A5F50" />
                      <Text className="text-xl font-bold text-[#3A5F50]">Lokasi Shelter</Text>
                  </View>
                  <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <Text className="text-gray-600 text-sm leading-5">
                            {profile?.latitude && profile?.longitude 
                              ? `Koordinat: ${profile.latitude}, ${profile.longitude}` 
                              : 'Lokasi belum diatur'}
                      </Text>
                  </View>
              </View>

              {/* Tombol Edit */}
              <TouchableOpacity 
                  onPress={() => router.push('/shelter/edit-profile')}
                  className="w-full bg-[#EBCD5E] py-4 rounded-full shadow-lg active:scale-95 transition-transform flex-row justify-center items-center gap-2"
              >
                  <FontAwesome5 name="edit" size={18} color="white" />
                  <Text className="text-white font-bold text-xl">Edit Profil</Text>
              </TouchableOpacity>

          </View>
      </ScrollView>
    </View>
  );
}