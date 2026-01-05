import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, Alert, Modal
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '@/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

// Import Komponen Peta
import LocationPicker from '@/components/LocationPicker'; 
// IMPORT CUSTOM POPUP
import CustomPopup from '@/components/CustomPopup';

const resolveImageUrl = (path: string | null) => {
  if (!path || path === 'NULL' || path === 'NULL.JPG' || path === 'null') return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE_URL?.replace('/api/v1', '') || '';
  if (path.startsWith('/public/')) return `${baseUrl}${path}`;
  if (path.startsWith('qr-')) return `${baseUrl}/public/img/qr_img/${path}`;
  if (path.startsWith('profile-')) return `${baseUrl}/public/img/profile/${path}`;
  return `${baseUrl}/public/img/${path}`;
};

export default function EditShelterProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

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

  const [form, setForm] = useState({
    shelter_name: '',
    organization_type: 'Komunitas',
    established_date: '',
    bio: '',
    contact_phone: '',
    donation_account_number: '',
    pj_name: '',
    pj_nik: '',
    latitude: -6.9175,
    longitude: 107.6191,
    address: '', 
  });

  // STATE UNTUK FOTO SHELTER & QR
  const [profileImage, setProfileImage] = useState<any>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<any>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  
  const [legalFile, setLegalFile] = useState<any>(null);
  const [existingLegalName, setExistingLegalName] = useState('');
  const [tempLocation, setTempLocation] = useState({ latitude: -6.9175, longitude: 107.6191, address: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return router.replace('/(auth)/login');
      const decoded: any = jwtDecode(token);
      
      const response = await apiClient.get(`/users/profile/${decoded.id}/${decoded.role}`);
      const data = response.data;

      setForm({
        shelter_name: data.name || '',
        organization_type: data.organization_type || 'Komunitas',
        established_date: data.established_date ? data.established_date.split('T')[0] : '',
        bio: data.bio || '',
        contact_phone: data.contact_phone || '',
        donation_account_number: data.donation_account_number || '',
        pj_name: data.pj_name || '',
        pj_nik: data.pj_nik || '',
        latitude: data.latitude ? parseFloat(data.latitude) : -6.9175,
        longitude: data.longitude ? parseFloat(data.longitude) : 107.6191,
        address: '', 
      });

      if (data.latitude && data.longitude) {
         fetchAddress(data.latitude, data.longitude).then(addr => setForm(prev => ({ ...prev, address: addr })));
      }
      
      // Ambil Preview Foto & QR
      if (data.profile_img) setProfilePreview(resolveImageUrl(data.profile_img.startsWith('profile-') ? data.profile_img : `profile-${data.profile_img}`));
      if (data.qr_img) setQrPreview(resolveImageUrl(data.qr_img.startsWith('qr-') ? data.qr_img : `qr-${data.qr_img}`)); 
      
      if (data.legal_certificate) setExistingLegalName(data.legal_certificate);
    } catch (error) { 
      console.error('Error fetch profile:', error);
      showModal('error', 'Gagal', 'Gagal mengambil data profil.');
    } finally { setLoading(false); }
  };

  // Fungsi Pick Foto Shelter
  const handlePickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspectRatio: [1, 1], quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setProfileImage({ uri: asset.uri, name: asset.fileName || 'profile.jpg', type: asset.mimeType || 'image/jpeg' });
      setProfilePreview(asset.uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setQrImage({ uri: asset.uri, name: asset.fileName || 'qr.jpg', type: asset.mimeType || 'image/jpeg' });
      setQrPreview(asset.uri);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
      if (!result.canceled) {
        const asset = result.assets[0];
        setLegalFile({ uri: asset.uri, name: asset.name, type: asset.mimeType || 'application/pdf' });
      }
    } catch (err) { console.log('Doc picker error', err); }
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'CatTakeApp/1.0' } });
      const data = await res.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (e) { return `${lat}, ${lng}`; }
  };

  const handleMapPress = async (e: any) => {
    if (e.nativeEvent && e.nativeEvent.coordinate) {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setTempLocation(prev => ({ ...prev, latitude, longitude, address: 'Mencari alamat...' }));
        const addr = await fetchAddress(latitude, longitude);
        setTempLocation(prev => ({ ...prev, address: addr }));
    }
  };

  const confirmLocation = () => {
    setForm(prev => ({ ...prev, latitude: tempLocation.latitude, longitude: tempLocation.longitude, address: tempLocation.address }));
    setMapModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!form.shelter_name) return showModal('error', 'Validasi', 'Nama Shelter wajib diisi!');
    setSubmitting(true);
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const decoded: any = jwtDecode(token || '');
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'address') {
            formData.append(key, String(value));
        }
      });

      if (profileImage) {
          // @ts-ignore
          formData.append('profile_img', { uri: profileImage.uri, name: profileImage.name, type: profileImage.type });
      }
      if (qrImage) {
          // @ts-ignore
          formData.append('qr_img', { uri: qrImage.uri, name: qrImage.name, type: qrImage.type });
      }
      if (legalFile) {
          // @ts-ignore
          formData.append('legal_certificate', { uri: legalFile.uri, name: legalFile.name, type: legalFile.type });
      }

      await apiClient.put(`/users/shelter/${decoded.id}`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data
      });

      showModal('success', 'Sukses', 'Profil Shelter berhasil diperbarui!');
      setTimeout(() => router.back(), 2000);

    } catch (error: any) {
      console.error("Submit Error:", error);
      showModal('error', 'Gagal', error.response?.data?.error || 'Gagal menyimpan data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#EBCD5E" /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="pt-14 pb-4 px-4 bg-transparent flex-row items-center gap-4">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm">
          <Ionicons name="arrow-back" size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Edit Profil Shelter</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-[30px] shadow-xl p-6 mb-20 border border-gray-100">
          
          <View className="mb-6">
            <Text className="text-xl font-bold text-[#3A5F50] mb-4">Identitas Shelter</Text>
            <View className="gap-4">
              <View>
                <Text className="text-sm text-gray-500 mb-2">Foto Shelter</Text>
                <TouchableOpacity onPress={handlePickProfileImage} className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 justify-center items-center overflow-hidden">
                   {profilePreview ? (
                     <Image source={{ uri: profilePreview }} className="w-full h-full" resizeMode="cover" />
                   ) : (
                     <View className="items-center"><Ionicons name="camera" size={40} color="#D1D5DB" /><Text className="text-gray-400 text-xs mt-2">Upload Foto</Text></View>
                   )}
                </TouchableOpacity>
              </View>

              <View><Text className="text-sm text-gray-500 mb-2">Nama Shelter</Text><TextInput value={form.shelter_name} onChangeText={(t) => setForm({...form, shelter_name: t})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" /></View>
              <View><Text className="text-sm text-gray-500 mb-2">Jenis Organisasi</Text><View className="flex-row gap-2">{['Komunitas', 'Yayasan', 'Pribadi'].map((type) => (<TouchableOpacity key={type} onPress={() => setForm({...form, organization_type: type})} className={`flex-1 py-3 rounded-xl border ${form.organization_type === type ? 'bg-[#EBCD5E] border-[#EBCD5E]' : 'bg-gray-50 border-gray-200'}`}><Text className={`text-center font-bold text-xs ${form.organization_type === type ? 'text-white' : 'text-gray-600'}`}>{type}</Text></TouchableOpacity>))}</View></View>
              <View><Text className="text-sm text-gray-500 mb-2">Tanggal Berdiri</Text><TextInput value={form.established_date} onChangeText={(t) => setForm({...form, established_date: t})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" placeholder="YYYY-MM-DD" /></View>
              <View><Text className="text-sm text-gray-500 mb-2">Bio Singkat</Text><TextInput value={form.bio} onChangeText={(t) => setForm({...form, bio: t})} multiline className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 h-20" /></View>
            </View>
          </View>
          
          <View className="h-[1px] bg-gray-100 my-4" />
          
          <View className="mb-6">
            <Text className="text-xl font-bold text-[#3A5F50] mb-4">Kontak & Donasi</Text>
            <View className="gap-4">
              <View><Text className="text-sm text-gray-500 mb-2">WA</Text><TextInput value={form.contact_phone} onChangeText={(t) => setForm({...form, contact_phone: t})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" keyboardType="phone-pad" /></View>
              <View><Text className="text-sm text-gray-500 mb-2">Rekening</Text><TextInput value={form.donation_account_number} onChangeText={(t) => setForm({...form, donation_account_number: t})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" /></View>
              <View>
                <Text className="text-sm text-gray-500 mb-2">QRIS Code</Text>
                <TouchableOpacity onPress={handlePickImage} className="flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    {qrPreview ? <Image source={{ uri: qrPreview }} className="w-20 h-20 rounded-lg" resizeMode="contain" /> : <View className="w-20 h-20 bg-gray-200 rounded-lg justify-center items-center"><Ionicons name="qr-code" size={24} /></View>}
                    <Text className="flex-1 text-xs text-gray-500">Upload QRIS (JPG/PNG)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View className="h-[1px] bg-gray-100 my-4" />
          
          <View className="mb-6">
            <Text className="text-xl font-bold text-[#3A5F50] mb-4">Legalitas & PJ</Text>
            <View className="gap-4">
               <View><Text className="text-sm text-gray-500 mb-2">Nama PJ</Text><TextInput value={form.pj_name} onChangeText={(t) => setForm({...form, pj_name: t})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" /></View>
               <View><Text className="text-sm text-gray-500 mb-2">NIK PJ</Text><TextInput value={form.pj_nik} onChangeText={(t) => setForm({...form, pj_nik: t})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200" keyboardType="numeric" /></View>
               <TouchableOpacity onPress={handlePickDocument} className="flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <FontAwesome5 name="file-contract" size={24} color="#D1D5DB" />
                    <Text className="flex-1 text-sm text-gray-600">{legalFile ? legalFile.name : (existingLegalName || 'Upload Legalitas (PDF/Img)')}</Text>
               </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-xl font-bold text-[#3A5F50] mb-4">Lokasi</Text>
            <TouchableOpacity onPress={() => setMapModalVisible(true)} className="w-full h-40 bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                <View pointerEvents="none" style={{flex:1}}><LocationPicker latitude={form.latitude} longitude={form.longitude} onPress={()=>{}} /></View>
                <View className="absolute inset-0 bg-black/20 justify-center items-center"><Text className="bg-white px-3 py-1 rounded-full text-xs font-bold">Ganti Lokasi</Text></View>
            </TouchableOpacity>
            <Text className="text-xs text-gray-400 mb-1">Alamat: {form.address || 'Belum diset'}</Text>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={submitting} className={`w-full py-4 rounded-full shadow-lg flex-row justify-center items-center gap-2 ${submitting ? 'bg-[#dcb945]' : 'bg-[#EBCD5E]'}`}>
            {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-xl">Simpan Perubahan</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={mapModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
            <View className="bg-white w-full h-[80%] rounded-3xl overflow-hidden flex-col">
                <View className="bg-[#3A5F50] p-4 flex-row justify-between items-center z-10">
                    <Text className="text-white font-bold text-lg">Pilih Lokasi</Text>
                    <TouchableOpacity onPress={() => setMapModalVisible(false)}><Ionicons name="close" size={24} color="white" /></TouchableOpacity>
                </View>
                <View className="flex-1 relative">
                    <LocationPicker latitude={tempLocation.latitude} longitude={tempLocation.longitude} onPress={handleMapPress} />
                    <View className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100 items-center">
                         <Text className="text-sm text-gray-700 mb-4 text-center">{tempLocation.address || 'Klik peta...'}</Text>
                         <TouchableOpacity onPress={confirmLocation} className="bg-[#EBCD5E] w-full py-3 rounded-full shadow-sm"><Text className="text-white font-bold text-center">Pilih Lokasi Ini</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
      </Modal>

      {/* MODAL POPUP */}
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