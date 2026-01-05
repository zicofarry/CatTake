import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, 
  TextInput, RefreshControl, Keyboard, StatusBar, Modal
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import CustomPopup from '../../components/CustomPopup'; 

const SERVER_URL = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

export default function DriverPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // === 1. STATE MANAGEMENT ===
  const [activeTab, setActiveTab] = useState<'proses' | 'selesai' | 'profile'>('proses');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile State
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', phone_number: '', bio: '', gender: '', birthDate: '',
  });

  // State untuk Modal Popup (Sukses/Error)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // State Khusus Modal Konfirmasi Logout
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // === 2. FETCH DATA LOGIC ===
  const fetchDriverTasks = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/rescue/driver-tasks');
      const mappedData = response.data.data.map((item: any) => ({
        id: item.trackingId, 
        status: item.status,
        catName: item.report?.cat_name || 'Kucing Tanpa Nama',
        location: item.report?.location || 'Lokasi tidak diketahui',
        date: formatDate(item.createdAt),
        img: item.report?.photo 
      }));
      setTasks(mappedData);
    } catch (error) {
      console.error("Gagal mengambil tugas driver:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      const response = await apiClient.get(`/users/profile/${userId}/${role}`);
      const data = response.data;
      setUser(data);

      setFormData({
        name: data.full_name || data.name || '',
        username: data.username || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        bio: data.bio || '',
        gender: data.gender || 'male',
        birthDate: data.birth_date ? data.birth_date.split('T')[0] : '',
      });
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfile();
    } else {
      fetchDriverTasks();
    }
  }, [activeTab]);

  // === 3. CRUD & PHOTO LOGIC ===
  const handleSaveChanges = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      await apiClient.patch(`/users/profile/${userId}`, {
        ...formData,
        full_name: formData.name,
        role: role
      });
      showModal('success', 'Berhasil!', 'Profil driver Anda telah diperbarui.');
      setIsEditing(false);
      fetchProfile(); 
    } catch (error: any) {
      showModal('error', 'Gagal', error.response?.data?.error || 'Gagal memperbarui profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      const data = new FormData();
      // @ts-ignore
      data.append('photo', { uri: asset.uri, name: `driver-${Date.now()}.jpg`, type: 'image/jpeg' });
      if(role) data.append('role', role);

      await apiClient.post(`/users/profile/${userId}/photo`, data, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showModal('success', 'Foto Berhasil!', 'Foto profil driver Anda telah diperbarui.');
      fetchProfile(); 
    } catch (error) {
      showModal('error', 'Gagal', 'Gagal mengunggah foto profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'username']);
    router.replace('/(auth)/login');
  };

  // === 4. HELPERS ===
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const resolveImageUrl = (path: string | null) => {
    if (!path || path === 'NULL' || path === 'NULL.JPG' || path === 'NULL.png' || path === 'null') {
      return require('../../assets/images/NULL.png'); 
    }
    if (path.startsWith('http')) return { uri: path };
    return { uri: `${SERVER_URL}/public/img/profile/${path}` };
  };

  const filteredTasks = useMemo(() => {
    if (activeTab === 'proses') {
      return tasks.filter(t => ['assigned', 'in_transit', 'prosess', 'pending'].includes(t.status));
    }
    if (activeTab === 'selesai') {
      return tasks.filter(t => ['completed', 'sheltered', 'selesai'].includes(t.status));
    }
    return [];
  }, [activeTab, tasks]);

  return (
    <View className="flex-1 bg-[#FFFBF5]">
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 150 }} 
        className="px-5 pt-16"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); activeTab === 'profile' ? fetchProfile() : fetchDriverTasks()}} />}
      >
        {activeTab !== 'profile' ? (
          <>
            <View className="mb-8">
              <Text className="text-4xl font-black text-[#3E3E3E] tracking-tighter">
                {activeTab === 'proses' ? 'Tugas Aktif 🚚' : 'Riwayat Tugas ✅'}
              </Text>
              <Text className="text-lg text-gray-500 font-medium">Pantau penyelamatanmu di sini.</Text>
            </View>

            {isLoading && !refreshing ? (
              <View className="items-center py-20">
                <ActivityIndicator size="large" color="#FF862F" />
              </View>
            ) : (
              <View className="gap-y-6">
                {filteredTasks.map((task) => (
                  <TouchableOpacity key={task.id} onPress={() => router.push(`/track/${task.id}`)} activeOpacity={0.9} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50" style={{ elevation: 4 }}>
                    <View className="flex-row gap-x-5">
                      <View className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                        <Image source={resolveImageUrl(task.img)} className="w-full h-full" resizeMode="cover" />
                      </View>
                      <View className="flex-1 justify-between">
                        <View>
                          <View className="flex-row justify-between items-start mb-2">
                            <View className={`px-3 py-1 rounded-full flex-row items-center gap-x-1 ${task.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                              <FontAwesome5 name={task.status === 'completed' ? 'check' : 'sync-alt'} size={8} color={task.status === 'completed' ? '#15803D' : '#A16207'} />
                              <Text className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'text-green-700' : 'text-yellow-700'}`}>{task.status === 'completed' ? 'Selesai' : 'Proses'}</Text>
                            </View>
                            <Text className="text-[11px] text-gray-400 font-bold">{task.date}</Text>
                          </View>
                          <Text className="font-black text-[#3E3E3E] text-xl" numberOfLines={1}>{task.catName}</Text>
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="location" size={12} color="#F87171" />
                            <Text className="text-sm text-gray-500 font-medium ml-1" numberOfLines={1}>{task.location}</Text>
                          </View>
                        </View>
                        <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-100">
                          <Text className="text-[10px] text-gray-400 italic">ID: {task.id}</Text>
                          <View className="bg-[#FF862F] px-4 py-2 rounded-full flex-row items-center gap-x-2">
                            <Text className="text-white font-black text-xs">Detail</Text>
                            <Ionicons name="arrow-forward" size={10} color="white" />
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <View>
             <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-4xl font-black text-[#3E3E3E] tracking-tighter">Profil Driver</Text>
                <Text className="text-lg text-gray-500 font-medium">Kelola akun penyelamat Anda.</Text>
              </View>
              <TouchableOpacity 
                onPress={isEditing ? handleSaveChanges : () => setIsEditing(true)}
                className={`px-6 py-3 rounded-2xl ${isEditing ? 'bg-[#FF862F]' : 'bg-white border border-gray-200'}`}
              >
                {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : 
                  <Text className={`font-black ${isEditing ? 'text-white' : 'text-[#3E3E3E]'}`}>{isEditing ? 'Simpan' : 'Edit'}</Text>
                }
              </TouchableOpacity>
            </View>

            {isLoading && !refreshing ? (
              <ActivityIndicator size="large" color="#FF862F" className="py-20" />
            ) : user && (
              <View>
                <View className="items-center mb-8">
                  <View className="relative shadow-xl">
                    <Image source={resolveImageUrl(user.profile_pic)} className="w-32 h-32 rounded-full border-4 border-white bg-gray-200" />
                    <TouchableOpacity 
                      className="absolute bottom-0 right-0 bg-[#FF862F] p-2 rounded-full border-4 border-white"
                      onPress={async () => {
                        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.7 });
                        if(!res.canceled) uploadPhoto(res.assets[0]);
                      }}
                    >
                      <FontAwesome name="camera" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-2xl font-black text-[#3E3E3E] mt-4">{formData.name || 'Driver'}</Text>
                  <Text className="text-gray-400 font-bold">@{formData.username}</Text>
                </View>

                <View className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-50 gap-y-5" style={{ elevation: 4 }}>
                  <Text className="text-base font-black text-[#3E3E3E] mb-1">📋 Informasi Pribadi</Text>
                  <ProfileInput label="Nama Lengkap" value={formData.name} editable={isEditing} onChange={(v:any) => setFormData({...formData, name: v})} />
                  <ProfileInput label="Username" value={formData.username} editable={isEditing} onChange={(v:any) => setFormData({...formData, username: v})} />
                  <ProfileInput label="Email Akun" value={formData.email} editable={isEditing} keyboardType="email-address" onChange={(v:any) => setFormData({...formData, email: v})} />
                  <ProfileInput label="No. WhatsApp" value={formData.phone_number} editable={isEditing} keyboardType="phone-pad" onChange={(v:any) => setFormData({...formData, phone_number: v})} />
                  <ProfileInput label="Tanggal Lahir" value={formData.birthDate} editable={isEditing} placeholder="YYYY-MM-DD" onChange={(v:any) => setFormData({...formData, birthDate: v})} />
                  <View>
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Jenis Kelamin</Text>
                    {isEditing ? (
                      <View className="flex-row gap-x-3">
                        {['male', 'female'].map((g) => (
                          <TouchableOpacity key={g} onPress={() => setFormData({...formData, gender: g})} className={`flex-1 p-3 rounded-2xl border ${formData.gender === g ? 'bg-[#FF862F] border-[#FF862F]' : 'bg-gray-50 border-gray-100'}`}>
                            <Text className={`text-center font-bold ${formData.gender === g ? 'text-white' : 'text-gray-400'}`}>{g === 'male' ? 'Laki-laki' : 'Perempuan'}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : <Text className="text-base font-bold text-gray-700 ml-1">{formData.gender === 'female' ? 'Perempuan' : 'Laki-laki'}</Text>}
                  </View>
                  <ProfileInput label="Bio Singkat" value={formData.bio} editable={isEditing} multiline onChange={(v:any) => setFormData({...formData, bio: v})} />
                </View>

                <TouchableOpacity 
                  onPress={() => setLogoutModalVisible(true)}
                  className="mt-8 bg-red-50 p-6 rounded-[32px] flex-row justify-center items-center border border-red-100"
                >
                  <Ionicons name="log-out" size={24} color="#EF4444" />
                  <Text className="text-[#EF4444] font-black text-lg ml-3">Keluar Akun</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View className="absolute bottom-6 left-6 right-6 bg-white h-20 rounded-[32px] shadow-2xl border border-gray-100 flex-row justify-around items-center px-4" style={{ elevation: 15 }}>
          <TabItem label="Proses" icon="time" active={activeTab === 'proses'} onPress={() => {setActiveTab('proses'); setIsEditing(false)}} />
          <TabItem label="Selesai" icon="checkmark-done-circle" active={activeTab === 'selesai'} onPress={() => {setActiveTab('selesai'); setIsEditing(false)}} />
          <TabItem label="Profile" icon="person" active={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
      </View>

      {/* MODAL KONFIRMASI LOGOUT (Style CustomPopup) */}
      <Modal animationType="fade" transparent={true} visible={logoutModalVisible} onRequestClose={() => setLogoutModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="w-[85%] bg-white rounded-[30px] px-6 pb-6 pt-12 items-center shadow-xl relative">
            <View className="w-20 h-20 rounded-full justify-center items-center absolute -top-10 border-4 border-white bg-red-500">
              <Ionicons name="log-out" size={30} color="white" />
            </View>
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">Keluar Akun</Text>
              <Text className="text-base text-slate-500 text-center leading-5">Yakin ingin keluar dari akun anda?</Text>
            </View>
            <View className="flex-row gap-x-3 w-full">
              <TouchableOpacity onPress={() => setLogoutModalVisible(false)} className="flex-1 py-4 rounded-2xl items-center bg-gray-100">
                <Text className="text-gray-500 font-bold text-lg">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmLogout} className="flex-1 py-4 rounded-2xl items-center bg-red-500">
                <Text className="text-white font-bold text-lg">Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL ALERT SUKSES/ERROR */}
      <CustomPopup visible={modalVisible} onClose={() => setModalVisible(false)} title={modalTitle} message={modalMessage} type={modalType} />
    </View>
  );
}

const ProfileInput = ({ label, value, editable, onChange, multiline, keyboardType, placeholder }: any) => (
  <View>
    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</Text>
    {editable ? (
      <TextInput 
        className={`bg-gray-50 p-4 rounded-2xl font-bold text-gray-700 border border-gray-100 ${multiline ? 'h-24' : ''}`}
        value={value} 
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={placeholder}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    ) : <Text className="text-base font-bold text-gray-700 ml-1">{value || '-'}</Text>}
  </View>
);

const TabItem = ({ label, icon, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} className="items-center justify-center w-1/3">
    <View className={`p-2 rounded-2xl ${active ? 'bg-orange-50' : ''}`}><Ionicons name={icon} size={24} color={active ? '#FF862F' : '#D1D5DB'} /></View>
    <Text className={`text-[10px] mt-1 ${active ? 'text-[#FF862F] font-black' : 'text-gray-400 font-bold'}`}>{label}</Text>
  </TouchableOpacity>
);