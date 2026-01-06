import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, ImageBackground, Alert, Modal, ActivityIndicator,
  RefreshControl, Dimensions, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 
import apiClient, { API_BASE_URL } from '@/api/apiClient';

// Import komponen pendukung
import LocationPicker from '@/components/LocationPicker';
import CustomPopup from '@/components/CustomPopup';

const { width } = Dimensions.get('window');
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

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
    name: '', 
    age: '', 
    breed: '', 
    color: '', 
    reward: '',
    shareToCommunity: false // Field sinkron dengan Vue
  });
  
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempCoords, setTempCoords] = useState({ lat: -6.9175, lng: 107.6191 });
  const [tempAddress, setTempAddress] = useState('Mencari alamat...');
  const [myHistory, setMyHistory] = useState([]);

  // Search logic
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- STATE POPUP ---
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

  // --- LOGIC FUNCTIONS ---

  const fetchTempAddress = async (lat: number, lng: number) => {
    setTempAddress('Mencari alamat...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'CatTake-Mobile' } }
      );
      const data = await response.json();
      setTempAddress(data.display_name || `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (error) {
      setTempAddress(`Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const switchReportType = (type: 'stray' | 'missing' | 'my_lost') => {
    setActiveReportType(type);
    setSelectedImage(null);
    setSearchQuery('');
    setForm(prev => ({
      ...prev,
      description: '',
      lost_cat_id: null,
      name: '', age: '', breed: '', color: '', reward: '',
      shareToCommunity: false
    }));
  };

  const loadData = async () => {
    if (activeUserTab === 'history') fetchUserHistory();
  };

  const fetchUserHistory = async () => {
    try {
      const [resReports, resLostCats] = await Promise.allSettled([
        apiClient.get('/reports/my-history'),
        apiClient.get('/lost-cats/my-history')
      ]);

      let combinedData: any[] = [];
      if (resReports.status === 'fulfilled') {
        combinedData.push(...resReports.value.data.map((item: any) => ({ ...item, source: 'report' })));
      }
      if (resLostCats.status === 'fulfilled') {
        combinedData.push(...resLostCats.value.data.map((item: any) => ({ ...item, source: 'lost_cat' })));
      }

      combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMyHistory(combinedData);
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
      formData.append('breed', form.breed);
      formData.append('color', form.color);
      formData.append('reward_amount', form.reward);
      formData.append('description', form.description);
      formData.append('last_seen_address', form.location);
      formData.append('last_seen_lat', form.lat.toString());
      formData.append('last_seen_long', form.long.toString());
      formData.append('share_to_community', form.shareToCommunity ? 'true' : 'false');
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, [activeUserTab]);

  useEffect(() => { loadData(); }, [activeUserTab]);

  const handleSearchInput = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setShowDropdown(true);
    try {
      const res = await apiClient.get(`/lost-cats/search?q=${text}`);
      setSearchResults(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={{ flex: 1, backgroundColor: '#2c473c' }}
      resizeMode="repeat"
      imageStyle={{ opacity: 1 }} // Opacity gambar diset ke 1 (Maksimal Jelas)
    >
      {/* Background overlay diturunkan ke 0.4 agar gambar dibelakang kelihatan muncul */}
      <View style={{ flex: 1, backgroundColor: 'rgba(44, 71, 60, 0.1)', paddingTop: insets.top }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header Hero */}
          <View className="p-6 items-center pt-8">
            <Image source={require('../../assets/images/tigakucing.png')} className="w-40 h-24 mb-2" resizeMode="contain" />
            <Text className="text-3xl font-bold text-white text-center">Lapor & Temukan</Text>

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
              <View className="flex-row justify-center gap-2 mb-5">
                {[
                  { id: 'stray', label: 'Nemu Kucing Liar', color: 'bg-[#EBCD5E]' },
                  { id: 'missing', label: 'Nemu Kucing Hilang', color: 'bg-[#EBCD5E]' },
                  { id: 'my_lost', label: 'Kucing Saya Hilang!', color: 'bg-red-500' }
                ].map(t => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => switchReportType(t.id as any)}
                    className={`px-3 py-2.5 rounded-2xl ${activeReportType === t.id ? t.color : 'bg-white/80'}`}
                  >
                    <Text className={`text-[10px] font-bold ${activeReportType === t.id ? 'text-white' : 'text-slate-500'}`}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="bg-white rounded-[35px] p-6 shadow-xl">
                
                {/* Checkbox Community (Khusus My Lost - Seperti Vue) */}
                {activeReportType === 'my_lost' && (
                  <TouchableOpacity 
                    onPress={() => setForm({...form, shareToCommunity: !form.shareToCommunity})}
                    className="flex-row items-center gap-3 bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-6"
                  >
                    <View className={`w-5 h-5 rounded border items-center justify-center ${form.shareToCommunity ? 'bg-[#EBCD5E] border-[#EBCD5E]' : 'border-gray-400'}`}>
                      {form.shareToCommunity && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <Text className="flex-1 text-[11px] font-bold text-gray-700">
                      Bagikan otomatis ke postingan Komunitas agar lebih banyak yang melihat?
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Search Logic */}
                {activeReportType === 'missing' && (
                  <View className="z-50 mb-4">
                    <Text className="text-sm font-bold text-slate-800 mb-2">Cari Data Kucing Hilang</Text>
                    <View className="flex-row items-center bg-slate-100 rounded-xl px-3 h-12">
                      <Ionicons name="search" size={18} color="#94a3b8" />
                      <TextInput
                        className="flex-1 ml-2 text-sm text-slate-800"
                        placeholder="Nama kucing atau pemilik..."
                        placeholderTextColor="#94a3b8"
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
                            <Image source={{ uri: item.photo }} className="w-10 h-10 rounded-full" />
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

                {/* Grid Input Nama & Umur (Seimbang) */}
                {activeReportType === 'my_lost' && (
                  <View className="gap-3 mb-4">
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-600 mb-1">Nama Kucing</Text>
                        <TextInput 
                          className="bg-slate-100 rounded-xl p-3.5 text-sm text-slate-800" 
                          placeholder="Misal: Mochi" 
                          placeholderTextColor="#94a3b8"
                          value={form.name}
                          onChangeText={t => setForm({ ...form, name: t })}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-600 mb-1">Umur (Bulan)</Text>
                        <TextInput 
                          className="bg-slate-100 rounded-xl p-3.5 text-sm text-slate-800" 
                          placeholder="Misal: 12" 
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          value={form.age}
                          onChangeText={t => setForm({ ...form, age: t })}
                        />
                      </View>
                    </View>
                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-600 mb-1">Ras</Text>
                        <TextInput 
                          className="bg-slate-100 rounded-xl p-3.5 text-sm text-slate-800" 
                          placeholder="Domestik/Persia" 
                          placeholderTextColor="#94a3b8" 
                          value={form.breed}
                          onChangeText={t => setForm({ ...form, breed: t })}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-600 mb-1">Warna</Text>
                        <TextInput 
                          className="bg-slate-100 rounded-xl p-3.5 text-sm text-slate-800" 
                          placeholder="Oren/Putih" 
                          placeholderTextColor="#94a3b8"
                          value={form.color}
                          onChangeText={t => setForm({ ...form, color: t })}
                        />
                      </View>
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-slate-600 mb-1">Imbalan (Opsional)</Text>
                      <TextInput 
                        className="bg-slate-100 rounded-xl p-3.5 text-sm text-slate-800" 
                        placeholder="Rp 0" 
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={form.reward}
                        onChangeText={t => setForm({ ...form, reward: t })}
                      />
                    </View>
                  </View>
                )}

                <Text className="text-sm font-bold text-slate-800 mb-2">Lokasi Kejadian</Text>
                <View className="flex-row gap-3 mb-4">
                  <TouchableOpacity
                    className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden items-center justify-center border border-slate-200"
                    onPress={() => setMapModalVisible(true)}
                  >
                    <Image source={require('../../assets/images/maps.png')} className="w-full h-full opacity-40" />
                    <Ionicons name="location" size={24} color="#ef4444" className="absolute" />
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 bg-slate-100 rounded-2xl p-3 text-[11px] text-slate-600"
                    placeholder="Klik peta untuk pilih lokasi..."
                    placeholderTextColor="#94a3b8"
                    value={form.location}
                    onChangeText={t => setForm({ ...form, location: t })}
                    multiline
                  />
                </View>

                {/* Ganti Label Conditional */}
                <Text className="text-sm font-bold text-slate-800 mb-2">
                  {activeReportType === 'my_lost' ? 'Ciri-ciri Khusus' : 'Deskripsi Kondisi'}
                </Text>
                <TextInput
                  className="bg-slate-100 rounded-2xl p-4 text-sm h-24 mb-4 text-slate-800"
                  style={{ textAlignVertical: 'top' }}
                  placeholder={activeReportType === 'my_lost' ? "Ekor bengkok, pakai kalung merah..." : "Jelaskan ciri-ciri atau luka..."}
                  placeholderTextColor="#94a3b8"
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
            /* --- HISTORY TAB --- */
            <View className="p-5">
              {myHistory.map((item: any, index: number) => {
                const isLostCat = item.source === 'lost_cat';
                return (
                  <View key={index} className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-slate-50">
                    <View className="flex-row gap-4">
                      <Image source={{ uri: item.photo }} className="w-20 h-20 rounded-2xl bg-slate-100" />
                      <View className="flex-1">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className="font-bold text-slate-800 flex-1 mr-2 text-xs" numberOfLines={1}>
                            {isLostCat ? `Anabul Hilang: ${item.name}` : `Laporan Penemuan #${item.id}`}
                          </Text>
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
                          <Text className="text-[10px] text-slate-500 ml-1" numberOfLines={1}>
                            {isLostCat ? item.last_seen_address : item.location}
                          </Text>
                        </View>
                        <Text className={`text-[9px] font-bold ${isLostCat ? 'text-red-500' : 'text-teal-600'}`}>
                          {isLostCat ? 'LAPORAN KUCING SAYA' : 'LAPORAN TEMUAN'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Modal Peta */}
        <Modal visible={mapModalVisible} animationType="slide">
          <View style={{ flex: 1, paddingTop: insets.top }}>
            <View className="flex-row justify-between items-center p-4 border-b border-slate-100 bg-white">
              <Text className="text-lg font-bold">Pilih Titik Lokasi</Text>
              <TouchableOpacity onPress={() => setMapModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <LocationPicker 
                latitude={tempCoords.lat}
                longitude={tempCoords.lng}
                onPress={(e: any) => {
                  const coords = e.nativeEvent.coordinate;
                  if (coords) {
                    setTempCoords({ lat: coords.latitude, lng: coords.longitude });
                    fetchTempAddress(coords.latitude, coords.longitude);
                  }
                }}
              />
              
              <View className="absolute bottom-10 left-5 right-5 bg-white p-5 rounded-[30px] shadow-2xl">
                <Text className="text-[10px] text-gray-400 uppercase font-bold text-center mb-1">Alamat Terpilih</Text>
                <Text className="text-sm font-semibold text-slate-700 mb-5 text-center" numberOfLines={3}>
                  {tempAddress}
                </Text>
                <TouchableOpacity
                  className="bg-[#3A5F50] py-4 rounded-2xl items-center"
                  onPress={() => {
                    setForm(prev => ({ ...prev, location: tempAddress, lat: tempCoords.lat, long: tempCoords.lng }));
                    setMapModalVisible(false);
                  }}
                >
                  <Text className="text-white font-bold text-base">Konfirmasi Lokasi Ini</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <CustomPopup
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            if (modalType === 'success') {
              setActiveUserTab('history');
              switchReportType(activeReportType);
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