import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, 
  Linking, Platform, StatusBar, StyleSheet, Modal, 
  TextInput, KeyboardAvoidingView, Keyboard 
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { FontAwesome, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { API_BASE_URL } from '@/api/apiClient';
import ConfirmModal from '@/components/ConfirmModal';
import CustomPopup from '@/components/CustomPopup';

// Bersihkan URL dari /api/v1 untuk akses folder public
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

export default function TrackingPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const chatScrollRef = useRef<ScrollView>(null);

  // --- STATES ---
  const [role, setRole] = useState<'individu' | 'driver' | 'shelter' | string>('individu');
  const [userId, setUserId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [courierPos, setCourierPos] = useState({ latitude: 0, longitude: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // --- STATES MODAL CHAT ---
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // --- POPUP & CONFIRM ---
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' | 'info' });
  const [confirmModal, setConfirmModal] = useState({
    visible: false, title: '', message: '', onConfirm: () => {}, type: 'danger' as 'danger' | 'warning', icon: 'trash-outline' as any
  });

  const showPopup = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    setPopupConfig({ title, message, type });
    setPopupVisible(true);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);
  
  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedId = await AsyncStorage.getItem('userId');
      setRole(storedRole || 'individu');
      setUserId(Number(storedId) || 0);
      await fetchTrackingData();
    };
    init();
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      const res = await apiClient.get(`/rescue/tracking/${id}`);
      setTrackingData(res.data);
      
      if (res.data.kurir_lat && res.data.kurir_long) {
        setCourierPos({ 
          latitude: Number(res.data.kurir_lat), 
          longitude: Number(res.data.kurir_long) 
        });
      }
      setIsLoading(false);
    } catch (e) {
      console.error("Fetch Tracking Error:", e);
      setIsLoading(false);
    }
  };

  // --- REAL-TIME TRACKING ---
  useEffect(() => {
    if (!trackingData || trackingData.status === 'completed') return;

    const interval = setInterval(async () => {
      if (role === 'driver') {
        try {
          let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const newPos = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setCourierPos(newPos);
          
          await apiClient.post('/rescue/location', { 
            assignmentId: trackingData.db_id, 
            lat: loc.coords.latitude, 
            long: loc.coords.longitude 
          });
        } catch (err) { console.warn("Driver Loc Error:", err); }
      } else {
        try {
          const res = await apiClient.get(`/rescue/location/${trackingData.db_id}`);
          if (res.data.status === 'success' && res.data.data) {
            setCourierPos({ latitude: Number(res.data.data.lat), longitude: Number(res.data.data.long) });
          }
        } catch (e) { console.warn("User Loc Error:", e); }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [trackingData, role]);

  // --- CHAT LOGIC ---
  useEffect(() => {
    let chatInterval: any;
    if (showChatModal) {
      fetchChatMessages();
      chatInterval = setInterval(fetchChatMessages, 3000);
    }
    return () => clearInterval(chatInterval);
  }, [showChatModal]);

  const fetchChatMessages = async () => {
    try {
      const res = await apiClient.get(`/rescue/chat/${trackingData.id}`);
      setChatMessages(res.data);
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    try {
      await apiClient.post('/rescue/chat', { trackingId: trackingData.id, message: chatInput });
      setChatInput('');
      fetchChatMessages();
    } catch (e) { showPopup("Gagal", "Gagal mengirim pesan", "error"); }
  };

  const deleteMessage = (messageId: number) => {
    setConfirmModal({
      visible: true, title: "Hapus Pesan?", message: "Pesan tidak bisa dikembalikan.", type: 'danger', icon: 'trash-outline',
      onConfirm: async () => {
        try {
          await apiClient.delete(`/rescue/chat/${messageId}`);
          fetchChatMessages();
          setConfirmModal(prev => ({ ...prev, visible: false }));
        } catch (e) {}
      }
    });
  };

  const clearAllChat = () => {
    setConfirmModal({
      visible: true, title: "Bersihkan Chat?", message: "Hapus semua riwayat chat?", type: 'warning', icon: 'refresh-circle-outline',
      onConfirm: async () => {
        try {
          await apiClient.delete(`/rescue/chat/clear/${trackingData.id}`);
          setChatMessages([]);
          setConfirmModal(prev => ({ ...prev, visible: false }));
        } catch (e) {}
      }
    });
  };
  
  // --- IMAGE RESOLVER ---
  const resolveImg = (path: any) => {
    if (!path || path === 'NULL' || path === 'null') return 'https://i.pravatar.cc/300';
    if (typeof path === 'string' && path.startsWith('http')) return path;

    // Logic folder backend
    let folder = 'img';
    if (path && (path.startsWith('profile-') || path.startsWith('driver-'))) folder = 'img/profile';
    else if (path && path.startsWith('report-')) folder = 'img/report_cat';
    else if (path && path.startsWith('lost-')) folder = 'img/lost_cat';
    else if (path && path.startsWith('rescue-')) folder = 'img/rescue_proof';
    
    return `${BASE_SERVER_URL}/public/${folder}/${path}`;
  };

  // --- UPDATE STATUS (DRIVER) ---
  const handleUpdateStatus = async (targetStatus: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.5 });
    if (result.canceled) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('assignmentId', trackingData.db_id.toString());
    formData.append('status', targetStatus);
    formData.append('photo', {
      uri: result.assets[0].uri,
      name: `proof_${targetStatus}.jpg`,
      type: 'image/jpeg'
    } as any);

    try {
      await apiClient.post('/rescue/update-status', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showPopup("Sukses", "Status berhasil diperbarui", "success");
      fetchTrackingData();
    } catch (e) {
      showPopup("Error", "Gagal memperbarui status", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- [1. LOADING CHECK] ---
  if (isLoading || !trackingData) {
    return (
      <View className="flex-1 bg-[#3A5F50] items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4 font-bold">Memuat Tracking...</Text>
      </View>
    );
  }

  // --- [2. LOGIC PROFILE HELPER] ---
  const currentStep = trackingData.status === 'assigned' ? 1 : trackingData.status === 'in_transit' ? 2 : 3;
  const isDriver = role === 'driver';

  const targetProfile = isDriver 
    ? {
        name: trackingData.laporan.pemilik,
        roleLabel: 'Pemilik Laporan',
        photo: trackingData.laporan.foto_profil, // Foto Profil User
        phone: trackingData.laporan.phone,
        statusLabel: 'Kontak Pelapor'
      }
    : {
        name: trackingData.kurir.nama || 'Sedang Mencari Driver...',
        roleLabel: trackingData.kurir.shelter || 'Driver Cattake',
        photo: trackingData.kurir.foto, // Foto Profil Driver
        phone: trackingData.kurir.phone,
        statusLabel: 'Driver Penjemput'
      };

  const getStatusLabel = (status: string) => {
    if (status === 'assigned') return 'Driver Menuju Lokasi';
    if (status === 'in_transit') return 'Sedang Dijemput';
    if (status === 'completed') return 'Selesai';
    return 'Menunggu Konfirmasi';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#3A5F50' }}>
      <StatusBar barStyle="light-content" backgroundColor="#3A5F50" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={{ top: insets.top + 10 }} className="absolute left-4 z-50">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center bg-[#2D4A45]/90 px-4 py-2.5 rounded-full border border-white/20 shadow-xl backdrop-blur-md"
        >
          <FontAwesome name="arrow-left" size={14} color="white" />
          <Text className="text-white font-bold ml-3 text-xs">Kembali</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CHAT */}
      <Modal visible={showChatModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-[85%] rounded-t-[40px] overflow-hidden">
            <View className="bg-[#3A5F50] p-5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => setShowChatModal(false)}>
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                  <Text className="text-white font-bold text-lg">{targetProfile.name}</Text>
                  <Text className="text-white/70 text-[10px] uppercase font-bold">Chat Real-time</Text>
                </View>
              </View>
              <TouchableOpacity onPress={clearAllChat} className="bg-red-500/20 p-2 rounded-lg">
                <MaterialIcons name="delete-sweep" size={22} color="#ff7675" />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === 'android' ? (isKeyboardVisible ? 140 : 0) : 0}
            >
              <ScrollView 
                ref={chatScrollRef}
                className="flex-1 bg-slate-50 p-4"
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {chatMessages.map((msg, index) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <View key={index} className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <View className={`max-w-[85%] p-3 rounded-2xl ${isMe ? 'bg-[#EBCD5E] rounded-tr-none' : 'bg-white rounded-tl-none border border-slate-100'}`}>
                        <View className="flex-row items-start">
                          <Text className="text-[#1F1F1F] text-sm leading-5 flex-shrink mr-2">{msg.message}</Text>
                          {isMe && (
                            <TouchableOpacity onPress={() => deleteMessage(msg.id)} className="mt-1">
                              <Ionicons name="trash-outline" size={13} color="#C0392B" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text className="text-[9px] opacity-40 mt-1 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : (isKeyboardVisible ? 10 : 25) }} className="p-4 bg-white border-t border-slate-100 flex-row items-center gap-3">
                <TextInput 
                  className="flex-1 bg-slate-100 rounded-full px-5 py-3 text-sm text-[#1F1F1F]"
                  placeholder="Ketik pesan..."
                  placeholderTextColor="#94a3b8"
                  value={chatInput}
                  onChangeText={setChatInput}
                />
                <TouchableOpacity onPress={sendMessage} className="bg-[#4E7C68] w-12 h-12 rounded-full items-center justify-center">
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
      
      {/* MAP VIEW */}
      <View style={{ width: '100%', height: isMapExpanded ? '100%' : '45%', backgroundColor: '#E5E7EB' }}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: Number(trackingData.posisi_awal[0]),
            longitude: Number(trackingData.posisi_awal[1]),
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          }}
        >
          <Marker coordinate={{ latitude: Number(trackingData.posisi_awal[0]), longitude: Number(trackingData.posisi_awal[1]) }} title="Jemput">
             <View className="bg-red-500 p-2 rounded-full border-2 border-white shadow-sm">
                <Ionicons name="location" size={14} color="white" />
             </View>
          </Marker>

          <Marker coordinate={{ latitude: Number(trackingData.posisi_akhir[0]), longitude: Number(trackingData.posisi_akhir[1]) }} title="Shelter">
             <View className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-sm">
                <Ionicons name="home" size={14} color="white" />
             </View>
          </Marker>

          <Polyline 
            coordinates={[
              { latitude: Number(trackingData.posisi_awal[0]), longitude: Number(trackingData.posisi_awal[1]) },
              { latitude: Number(trackingData.posisi_akhir[0]), longitude: Number(trackingData.posisi_akhir[1]) }
            ]}
            strokeColor="#3A5F50" strokeWidth={3} lineDashPattern={[20, 10]}
          />

          {courierPos.latitude !== 0 && (
            <Marker coordinate={courierPos} flat anchor={{x: 0.5, y: 0.5}} title="Driver">
               <View className="bg-[#EBCD5E] p-2.5 rounded-full border-2 border-white shadow-2xl">
                  <FontAwesome5 name="car" size={10} color="white" />
               </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity 
          onPress={() => setIsMapExpanded(!isMapExpanded)}
          style={{ bottom: isMapExpanded ? insets.bottom + 20 : 60 }}
          className="absolute right-4 bg-white p-3 rounded-full shadow-2xl z-50 border border-slate-100"
        >
          <MaterialIcons name={isMapExpanded ? "fullscreen-exit" : "fullscreen"} size={24} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET INFO */}
      {!isMapExpanded && (
        <View className="flex-1 bg-white -mt-8 rounded-t-[30px] shadow-2xl overflow-hidden">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View className="p-6">
                
                <View className="w-full items-center mb-4">
                    <View className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </View>

                {/* STATUS & PROGRESS */}
                <View className="bg-slate-50 rounded-[24px] p-5 mb-6 border border-slate-100">
                    <View className="flex-row items-center mb-4">
                        <FontAwesome name="location-arrow" size={18} color="#1F1F1F" />
                        <Text className="text-lg font-bold text-[#1F1F1F] ml-3">
                            {getStatusLabel(trackingData.status)}
                        </Text>
                    </View>

                    <View className="flex-row justify-between mb-6">
                        <View>
                            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Tracking ID</Text>
                            <Text className="font-bold text-base text-[#1F1F1F]">{trackingData.id}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Status</Text>
                            <View className={`px-3 py-1 rounded-lg ${currentStep === 3 ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <Text className={`text-[10px] font-bold capitalize ${currentStep === 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {trackingData.status.replace('_', ' ')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* TIMELINE */}
                    <View className="relative px-2 mb-4">
                        <View className="absolute top-4 left-0 w-full h-1.5 bg-slate-200 rounded-full" />
                        <View 
                            style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
                            className="absolute top-4 left-0 h-1.5 bg-[#EBCD5E] rounded-full"
                        />
                        <View className="flex-row justify-between w-full">
                            <StepItem icon="check" label="Ditugaskan" active={true} />
                            <StepItem icon="paw" label="Dijemput" active={currentStep >= 2} />
                            <StepItem icon="home" label="Selesai" active={currentStep >= 3} />
                        </View>
                    </View>
                </View>

                {/* --- CONTACT PROFILE CARD (USER/DRIVER) --- */}
                <View className="bg-white rounded-[24px] p-5 flex-row items-center mb-6 border border-slate-100 shadow-sm elevation-2">
                    {/* FOTO PROFIL */}
                    <Image 
                        source={{ uri: resolveImg(targetProfile.photo) }}
                        style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0f0f0' }}
                        contentFit="cover"
                        transition={500}
                    />
                    <View className="flex-1 ml-4 justify-center">
                        <Text className="text-[10px] font-bold text-[#4E7C68] uppercase tracking-widest mb-1">
                          {targetProfile.statusLabel}
                        </Text>
                        <Text className="font-bold text-lg text-[#1F1F1F] leading-tight" numberOfLines={1}>
                          {targetProfile.name}
                        </Text>
                        <Text className="text-xs text-slate-500 italic mt-0.5" numberOfLines={1}>
                          {targetProfile.roleLabel}
                        </Text>
                    </View>
                    
                    {/* Tombol Aksi */}
                    {(targetProfile.name !== 'Sedang Mencari Driver...' && 
                      targetProfile.name !== 'Menunggu Driver' && 
                      role !== 'shelter') && (
                      
                      <View className="flex-row gap-3 ml-2">
                          {/* Tombol Telepon */}
                          {targetProfile.phone && targetProfile.phone !== '-' && (
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${targetProfile.phone}`)} className="w-11 h-11 bg-[#EBCD5E] rounded-full items-center justify-center shadow-sm">
                              <FontAwesome name="phone" size={18} color="white" />
                            </TouchableOpacity>
                          )}
                          
                          {/* Tombol Chat */}
                          <TouchableOpacity onPress={() => setShowChatModal(true)} className="w-11 h-11 bg-[#4E7C68] rounded-full items-center justify-center shadow-sm">
                            <MaterialIcons name="chat-bubble" size={20} color="white" />
                          </TouchableOpacity>
                      </View>
                    )}
                </View>

                {/* ACTION BUTTON (DRIVER ONLY) */}
                {role === 'driver' && trackingData.status !== 'completed' && (
                    <TouchableOpacity 
                      onPress={() => handleUpdateStatus(trackingData.status === 'assigned' ? 'in_transit' : 'completed')}
                      disabled={isSubmitting}
                      className="bg-[#EBCD5E] py-4 rounded-2xl items-center shadow-lg mb-6 active:scale-[0.98]"
                    >
                    {isSubmitting ? <ActivityIndicator color="white" /> : (
                        <Text className="text-white font-bold text-base uppercase tracking-widest">
                        {trackingData.status === 'assigned' ? 'Ambil Foto Penjemputan' : 'Konfirmasi Sampai Shelter'}
                        </Text>
                    )}
                    </TouchableOpacity>
                )}

                {/* REPORT DETAIL */}
                <View className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 shadow-sm">
                    <Text className="font-bold text-lg text-[#1F1F1F] mb-4">Detail Laporan</Text>
                    <View className="gap-3">
                        <InfoItem label="Jenis" value={trackingData.laporan.jenis === 'stray' ? 'Kucing Liar' : 'Kucing Hilang'} />
                        <InfoItem label="Lokasi Jemput" value={trackingData.alamat} />
                        <InfoItem label="Tujuan Shelter" value={trackingData.tujuan} />
                        
                        {/* [TAMBAHKAN INI] Agar deskripsi laporan muncul */}
                        <InfoItem label="Keterangan" value={trackingData.laporan.deskripsi || '-'} />
                        
                        <View className="bg-white p-2 rounded-2xl border border-slate-100 mt-2">
                            <Text className="text-[10px] text-slate-400 uppercase font-bold ml-2 my-2">Foto Kucing:</Text>
                            <Image 
                                source={{ uri: resolveImg(trackingData.laporan.foto) }}
                                style={{ width: '100%', height: 200, borderRadius: 12, backgroundColor: '#f0f0f0' }}
                                contentFit="cover"
                            />
                        </View>
                    </View>
                </View>

            </View>
            </ScrollView>
        </View>
    )}

    {/* MODALS */}
    <ConfirmModal 
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        icon={confirmModal.icon}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
      />
      <CustomPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        title={popupConfig.title}
        message={popupConfig.message}
        type={popupConfig.type}
      />
    </View>
  );
}

const StepItem = ({ icon, label, active }: { icon: any, label: string, active: boolean }) => (
  <View className="items-center w-1/3">
      <View className={`w-8 h-8 rounded-full border-2 border-white items-center justify-center z-10 shadow-sm ${active ? 'bg-[#EBCD5E]' : 'bg-slate-300'}`}>
          <FontAwesome name={icon} size={12} color="white" />
      </View>
      <Text className="text-[9px] font-bold mt-2 text-center text-slate-600 uppercase tracking-tighter">{label}</Text>
  </View>
);

const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <View className="bg-white px-4 py-3 rounded-xl border border-slate-50 w-full shadow-sm">
        <Text className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">{label}</Text>
        <Text className="font-semibold text-[13px] text-slate-800 leading-5">{value}</Text>
    </View>
);