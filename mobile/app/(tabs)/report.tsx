import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, ImageBackground, Alert, Modal, ActivityIndicator,
  RefreshControl, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 
import apiClient, { API_BASE_URL } from '@/api/apiClient';

// Import komponen wrapper yang baru dibuat
import MapBox from '@/components/MapBox';
// IMPORT CUSTOM POPUP
import CustomPopup from '@/components/CustomPopup';

const { width } = Dimensions.get('window');
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

const INITIAL_REGION = {
  latitude: -6.9175,
  longitude: 107.6191,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); 
  const mapRef = useRef<any>(null);

  // --- STATES ---
  const [activeUserTab, setActiveUserTab] = useState<'create' | 'history'>('create');
  const [activeReportType, setActiveReportType] = useState<'stray' | 'missing' | 'my_lost'>('stray');
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    description: '',
    location: '',
    lat: -6.9175,
    long: 107.6191,
    lost_cat_id: null as number | null,
    name: '', age: '', breed: '', color: '', reward: ''
  });
  
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempCoords, setTempCoords] = useState({ lat: -6.9175, lng: 107.6191 });
  const [isLocating, setIsLocating] = useState(false);
  const [myHistory, setMyHistory] = useState([]);

  // Search logic
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- STATE UNTUK CUSTOM POPUP ---
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

  const loadData = async () => {
    if (activeUserTab === 'history') fetchUserHistory();
  };

  const fetchUserHistory = async () => {
    try {
      // Jalankan dua request secara paralel
      const [resReports, resLostCats] = await Promise.allSettled([
        apiClient.get('/reports/my-history'),
        apiClient.get('/lost-cats/my-history')
      ]);

      let combinedData: any[] = [];

      // Ambil data dari reports jika sukses
      if (resReports.status === 'fulfilled') {
        combinedData.push(...resReports.value.data.map((item: any) => ({ ...item, source: 'report' })));
      } else {
        console.warn("Gagal ambil history reports:", resReports.reason);
      }

      // Ambil data dari lost_cats jika sukses
      if (resLostCats.status === 'fulfilled') {
        combinedData.push(...resLostCats.value.data.map((item: any) => ({ ...item, source: 'lost_cat' })));
      } else {
        console.warn("Gagal ambil history lost_cats:", resLostCats.reason);
      }

      // Urutkan berdasarkan created_at
      combinedData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMyHistory(combinedData);
    } catch (e) {
      console.error("Fetch History General Error:", e);
    }
  };
  
  const handleUpdateLostCatStatus = async (catId: number, newStatus: string) => {
    try {
      await apiClient.put(`/lost-cats/status/${catId}`, { status: newStatus });
      showModal("success", "Sukses", "Status berhasil diperbarui. Senang anabul Anda sudah kembali!");
      fetchUserHistory(); // Refresh data
    } catch (e) {
      showModal("error", "Error", "Gagal memperbarui status.");
    }
  };

  useEffect(() => { loadData(); }, [activeUserTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, [activeUserTab]);

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'CatTake-Mobile' } }
      );
      const data = await response.json();
      if (data.display_name) {
        setForm(prev => ({ ...prev, location: data.display_name, lat, long: lng }));
      }
    } catch (error) {
      console.error("Nominatim Error:", error);
    }
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showModal('error', 'Izin Ditolak', 'Aplikasi butuh izin lokasi.');
      setIsLocating(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setTempCoords(newCoords);
    
    mapRef.current?.animateToRegion({
      latitude: newCoords.lat,
      longitude: newCoords.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);

    await getAddressFromCoords(newCoords.lat, newCoords.lng);
    setIsLocating(false);
  };

  const handleSearchInput = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setShowDropdown(true);
    try {
      const res = await apiClient.get(`/lost-cats/search?q=${text}`);
      setSearchResults(res.data);
    } catch (e) { console.error(e); }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg'
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.location || !form.description || !selectedImage) {
      return showModal("error", "Peringatan", "Mohon lengkapi lokasi, deskripsi, dan foto.");
    }
    setIsSubmitting(true);
    const formData = new FormData();

    if (activeReportType === 'my_lost') {
      formData.append('name', form.name);
      formData.append('age', form.age);
      formData.append('description', form.description);
      formData.append('last_seen_address', form.location);
    } else {
      formData.append('report_type', activeReportType);
      formData.append('location', form.location);
      formData.append('description', form.description);
      formData.append('lat', form.lat.toString());
      formData.append('long', form.long.toString());
      if (form.lost_cat_id) formData.append('lost_cat_id', form.lost_cat_id.toString());
    }
    formData.append('photo', selectedImage as any);

    try {
      const endpoint = activeReportType === 'my_lost' ? '/lost-cats' : '/reports';
      await apiClient.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showModal("success", "Sukses", "Laporan berhasil dikirim!");
    } catch (e: any) {
      showModal("error", "Gagal", e.response?.data?.error || "Terjadi kesalahan.");
    } finally { setIsSubmitting(false); }
  };

  const resolveImg = (path: string) => {
    if (!path || path.includes('NULL')) return 'https://i.pravatar.cc/150';
    return path.startsWith('http') ? path : `${BASE_SERVER_URL}${path}`;
  };

  return (
    <ImageBackground
      source={require('../../assets/images/background.png')}
      className="flex-1 bg-[#2c473c]"
      resizeMode="repeat"
      imageStyle={{ width: 150, height: 150, opacity: 0.15 }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header Hero Section */}
          <View className="p-6 items-center pt-8">
            <Image source={require('../../assets/images/tigakucing.png')} className="w-40 h-24 mb-2" resizeMode="contain" />
            <Text className="text-3xl font-bold text-white">Lapor & Temukan</Text>

            <View className="flex-row bg-white/20 rounded-full p-1 mt-6 w-full shadow-sm">
              <TouchableOpacity
                className={`flex-1 py-2.5 rounded-full ${activeUserTab === 'create' ? 'bg-white' : ''}`}
                onPress={() => setActiveUserTab('create')}
              >
                <Text className={`text-center font-bold text-xs ${activeUserTab === 'create' ? 'text-[#3A5F50]' : 'text-white'}`}>
                  Buat Laporan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2.5 rounded-full ${activeUserTab === 'history' ? 'bg-white' : ''}`}
                onPress={() => setActiveUserTab('history')}
              >
                <Text className={`text-center font-bold text-xs ${activeUserTab === 'history' ? 'text-[#3A5F50]' : 'text-white'}`}>
                  Riwayat Saya
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeUserTab === 'create' ? (
            <View className="p-5">
              {/* Tipe Laporan Row */}
              <View className="flex-row justify-center gap-2 mb-5">
                {[
                  { id: 'stray', label: 'Nemu Liar', color: 'bg-[#EBCD5E]' },
                  { id: 'missing', label: 'Nemu Hilang', color: 'bg-[#EBCD5E]' },
                  { id: 'my_lost', label: 'Kucing Saya Hilang!', color: 'bg-red-500' }
                ].map(t => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setActiveReportType(t.id as any)}
                    className={`px-3 py-2.5 rounded-2xl ${activeReportType === t.id ? t.color : 'bg-white/80'}`}
                  >
                    <Text className={`text-[10px] font-bold ${activeReportType === t.id ? 'text-white' : 'text-slate-500'}`}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Form */}
              <View className="bg-white rounded-[35px] p-6 shadow-xl">
                {activeReportType === 'missing' && (
                  <View className="z-50 mb-4">
                    <Text className="text-sm font-bold text-slate-800 mb-2">Cari Data Kucing Hilang</Text>
                    <View className="flex-row items-center bg-slate-100 rounded-xl px-3 h-12">
                      <Ionicons name="search" size={18} color="#94a3b8" />
                      <TextInput
                        className="flex-1 ml-2 text-sm"
                        placeholder="Nama kucing atau pemilik..."
                        value={searchQuery}
                        onChangeText={handleSearchInput}
                      />
                    </View>
                    {showDropdown && searchResults.length > 0 && (
                      <View className="absolute top-[75px] left-0 right-0 bg-white rounded-2xl shadow-2xl z-[999] border border-slate-100">
                        {searchResults.map((item: any) => (
                          <TouchableOpacity
                            key={item.id}
                            className="flex-row items-center p-3 border-b border-slate-50"
                            onPress={() => {
                              setSearchQuery(`${item.cat_name} - ${item.owner_name}`);
                              setForm({ ...form, lost_cat_id: item.id });
                              setShowDropdown(false);
                            }}
                          >
                            <Image source={{ uri: resolveImg(item.photo) }} className="w-10 h-10 rounded-full" />
                            <View className="ml-3">
                              <Text className="font-bold text-slate-800">{item.cat_name}</Text>
                              <Text className="text-[10px] text-slate-500">Pemilik: {item.owner_name}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {activeReportType === 'my_lost' && (
                  <View className="gap-3 mb-4">
                    <TextInput
                      className="bg-slate-100 rounded-xl p-3.5 text-sm"
                      placeholder="Nama Kucing"
                      value={form.name}
                      onChangeText={t => setForm({ ...form, name: t })}
                    />
                    <TextInput
                      className="bg-slate-100 rounded-xl p-3.5 text-sm"
                      placeholder="Umur (Bulan)"
                      keyboardType="numeric"
                      value={form.age}
                      onChangeText={t => setForm({ ...form, age: t })}
                    />
                  </View>
                )}

                <Text className="text-sm font-bold text-slate-800 mb-2">Lokasi Kejadian</Text>
                <View className="flex-row gap-3 mb-4">
                  <TouchableOpacity
                    className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden items-center justify-center border border-slate-200"
                    onPress={() => {
                       setMapModalVisible(true);
                       setTimeout(() => getCurrentLocation(), 500); // Auto focus saat buka
                    }}
                  >
                    <Image source={require('../../assets/images/maps.png')} className="w-full h-full opacity-40" />
                    <Ionicons name="location" size={24} color="#ef4444" className="absolute" />
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 bg-slate-100 rounded-2xl p-3 text-[11px] text-slate-600"
                    placeholder="Klik ikon peta untuk pilih lokasi..."
                    value={form.location}
                    onChangeText={t => setForm({ ...form, location: t })}
                    multiline
                  />
                </View>

                <Text className="text-sm font-bold text-slate-800 mb-2">Deskripsi Kondisi</Text>
                <TextInput
                  className="bg-slate-100 rounded-2xl p-4 text-sm h-24 mb-4"
                  style={{ textAlignVertical: 'top' }}
                  placeholder="Jelaskan ciri-ciri, warna, atau luka..."
                  value={form.description}
                  onChangeText={t => setForm({ ...form, description: t })}
                  multiline
                />

                <Text className="text-sm font-bold text-slate-800 mb-2">Foto Bukti</Text>
                <TouchableOpacity
                  className="h-36 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 items-center justify-center mb-6 overflow-hidden"
                  onPress={pickImage}
                >
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage.uri }} className="w-full h-full" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={40} color="#cbd5e1" />
                      <Text className="text-slate-400 text-xs mt-1">Ambil atau pilih foto</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className={`py-4 rounded-2xl items-center shadow-md ${activeReportType === 'my_lost' ? 'bg-red-500' : 'bg-[#EBCD5E]'}`}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Kirim Laporan</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
             <View className="p-5">
              {myHistory.map((item: any, index: number) => {
              const isLostCat = item.source === 'lost_cat';
              
              return (
                <View key={index} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-50">
                  <View className="flex-row gap-4">
                    <Image source={{ uri: resolveImg(item.photo) }} className="w-20 h-20 rounded-2xl bg-slate-100" />
                    
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-bold text-slate-800 flex-1 mr-2" numberOfLines={1}>
                          {isLostCat ? `Anabul Hilang: ${item.name}` : `Laporan Penemuan #${item.id}`}
                        </Text>
                        
                        {/* Status Badge */}
                        <View className={`px-2 py-0.5 rounded-md ${
                          (item.status === 'returned' || item.assignment_status === 'completed') 
                          ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                          <Text className={`text-[8px] font-bold ${
                            (item.status === 'returned' || item.assignment_status === 'completed') 
                            ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            {(item.status || item.assignment_status || 'PENDING').replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center mb-1">
                        <Ionicons name="location" size={10} color="#94a3b8" />
                        <Text className="text-[11px] text-slate-500 ml-1" numberOfLines={1}>
                          {isLostCat ? item.last_seen_address : item.location}
                        </Text>
                      </View>

                      <Text className={`text-[9px] font-bold ${isLostCat ? 'text-red-500' : 'text-teal-600'}`}>
                        {isLostCat ? 'LAPORAN KUCING SAYA' : 'LAPORAN TEMUAN'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* --- TOMBOL AKSI KHUSUS LOST CAT --- */}
                  {isLostCat && item.status === 'at_shelter' && (
                    <View className="mt-4 gap-2">
                      {/* Tombol Chat ke Shelter */}
                      <TouchableOpacity 
                        onPress={() => {
                          if (item.shelter_assigned_id) {
                            router.push({
                              pathname: "/chat/[id]",
                              params: { 
                                id: `${item.shelter_assigned_id}`, 
                                name: item.shelter_name || 'Admin Shelter' 
                              }
                            });
                          } else {
                            showModal("error", "Info", "Data shelter belum tersedia.");
                          }
                        }}
                        className="bg-[#3A5F50] py-3 rounded-xl flex-row items-center justify-center gap-2"
                      >
                        <Ionicons name="chatbubbles" size={16} color="white" />
                        <Text className="text-white font-bold text-xs uppercase">Chat Shelter</Text>
                      </TouchableOpacity>

                      {/* Tombol Konfirmasi Selesai */}
                      <TouchableOpacity 
                        onPress={() => Alert.alert("Konfirmasi", "Apakah kucing sudah kembali ke tangan Anda?", [
                          { text: "Belum", style: "cancel" },
                          { text: "Sudah", onPress: () => handleUpdateLostCatStatus(item.id, 'returned') }
                        ])}
                        className="bg-emerald-600 py-3 rounded-xl flex-row items-center justify-center gap-2"
                      >
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                        <Text className="text-white font-bold text-xs uppercase">Sudah Saya Terima</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Tombol Lacak (Hanya untuk temuan penjemputan) */}
                  {!isLostCat && (item.assignment_status === 'assigned' || item.assignment_status === 'in_transit') && (
                    <TouchableOpacity 
                      onPress={() => router.push(`/track/${item.id}`)}
                      className="mt-4 bg-teal-600 py-2.5 rounded-xl flex-row items-center justify-center gap-2"
                    >
                      <Ionicons name="map" size={14} color="white" />
                      <Text className="text-white font-bold text-xs uppercase">Lacak Penjemputan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            </View>
          )}
        </ScrollView>

        {/* --- FULLSCREEN MAP MODAL --- */}
        <Modal visible={mapModalVisible} animationType="slide">
          <View className="flex-1" style={{ paddingTop: insets.top }}>
            {/* Header Modal */}
            <View className="flex-row justify-between items-center p-4 border-b border-slate-100 bg-white z-10">
              <Text className="text-lg font-bold text-slate-800">Pilih Titik Lokasi</Text>
              <TouchableOpacity onPress={() => setMapModalVisible(false)} className="p-1">
                <Ionicons name="close-circle" size={32} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {/* Area Peta */}
            <View className="flex-1 relative bg-slate-100">
               <MapBox 
                  mapRef={mapRef}
                  region={INITIAL_REGION}
                  selectedCoords={tempCoords}
                  onSelectLocation={(coords: any) => {
                      setTempCoords({ lat: coords.latitude, lng: coords.longitude });
                  }}
               />

               {/* Tombol My Location (Floating) */}
               <TouchableOpacity
                 className="absolute bottom-40 right-6 bg-white p-4 rounded-full shadow-2xl border border-slate-100"
                 onPress={getCurrentLocation}
                 style={{ elevation: 10 }}
               >
                 {isLocating ? (
                   <ActivityIndicator size="small" color="#2c473c" />
                 ) : (
                   <Ionicons name="locate" size={26} color="#2c473c" />
                 )}
               </TouchableOpacity>

               {/* Bottom Info & Confirmation Box */}
               <View className="absolute bottom-0 left-0 right-0 bg-white p-6 rounded-t-[30px] shadow-2xl">
                 <View className="w-12 h-1 bg-slate-200 rounded-full self-center mb-4" />
                 <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Koordinat Terpilih</Text>
                 <Text className="text-sm font-semibold text-slate-700 mb-6">
                    {tempCoords.lat.toFixed(6)}, {tempCoords.lng.toFixed(6)}
                 </Text>
                 
                 <TouchableOpacity
                   className="bg-[#2c473c] py-4.5 rounded-2xl items-center active:bg-[#1a2c25]"
                   onPress={async () => {
                     await getAddressFromCoords(tempCoords.lat, tempCoords.lng);
                     setMapModalVisible(false);
                   }}
                 >
                   <Text className="text-white font-bold text-base">Konfirmasi Lokasi Ini</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </View>
        </Modal>

        {/* CUSTOM POPUP COMPONENT */}
        <CustomPopup
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            if (modalType === 'success') {
               // Logic setelah sukses
               setActiveUserTab('history');
               setSelectedImage(null);
               setForm({
                 description: '',
                 location: '',
                 lat: -6.9175,
                 long: 107.6191,
                 lost_cat_id: null,
                 name: '', age: '', breed: '', color: '', reward: ''
               });
               setSearchQuery('');
            }
          }}
          title={modalTitle}
          message={modalMessage}
          type={modalType}
        />
      </View>
    </ImageBackground>
  );
}