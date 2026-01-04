import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Modal, StatusBar, ImageBackground 
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image'; // Pastikan install: npx expo install expo-image
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- MOCK DATA (Dummy untuk Tampilan) ---
const mockData = {
  id: 'TRC-882190',
  status: 'assigned', // options: assigned, in_transit, completed
  alamat: 'Jl. Dago No. 12, Bandung',
  tujuan: 'Shelter Meow House, Lembang',
  kurir: {
    nama: 'Budi Santoso',
    role: 'Driver',
    shelter: 'CatTake Official Shelter',
    foto: 'https://cdn-icons-png.flaticon.com/512/147/147144.png', 
    phone: '08123456789'
  },
  laporan: {
    jenis: 'Stray Cat',
    pemilik: 'Siti Aminah',
    lokasi: 'Taman Lansia, Bandung',
    deskripsi: 'Kucing warna oranye, kaki pincang sebelah kanan.',
    foto: 'https://awsimages.detik.net.id/community/media/visual/2022/12/15/kucing-menggaruk-sofa_43.jpeg?w=700&q=90' 
  }
};

export default function TrackingPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Mengambil ID dari URL
  const insets = useSafeAreaInsets();
  
  const [trackingData, setTrackingData] = useState(mockData);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Logic Status
  const currentStep = 
    trackingData.status === 'assigned' ? 1 : 
    trackingData.status === 'in_transit' ? 2 : 3;

  const getStatusLabel = (status: string) => {
    if (status === 'assigned') return 'Driver Menuju Lokasi';
    if (status === 'in_transit') return 'Sedang Dijemput';
    if (status === 'completed') return 'Selesai';
    return 'Menunggu';
  };

  const getStatusColor = (status: string) => {
    if (status === 'assigned') return { bg: '#DBEAFE', text: '#1D4ED8' }; // Blue
    if (status === 'in_transit') return { bg: '#FEF9C3', text: '#A16207' }; // Yellow
    if (status === 'completed') return { bg: '#DCFCE7', text: '#15803D' }; // Green
    return { bg: '#F3F4F6', text: '#374151' };
  };
  
  const statusColors = getStatusColor(trackingData.status);

  return (
    <View style={{ flex: 1, backgroundColor: '#3A5F50' }}>
      <StatusBar barStyle="light-content" backgroundColor="#3A5F50" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* --- HEADER BACK BUTTON --- */}
      <View style={{ position: 'absolute', top: insets.top + 10, left: 16, zIndex: 50 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ 
            flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(45, 74, 69, 0.8)', 
            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, 
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
          }}
        >
          <FontAwesome name="arrow-left" size={16} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Kembali</Text>
        </TouchableOpacity>
      </View>

      {/* --- MAP SECTION (Placeholder) --- */}
      <View style={{ width: '100%', height: '45%', backgroundColor: '#E5E7EB', position: 'relative' }}>
        <ImageBackground
            source={{ uri: 'https://img.freepik.com/free-vector/city-map-navigation-interface_1017-6668.jpg' }}
            style={{ width: '100%', height: '100%', opacity: 0.8 }}
        >
            {/* Marker Dummy */}
            <View style={{ position: 'absolute', top: '40%', left: '50%', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#EBCD5E', width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 5 }}>
                    <FontAwesome name="motorcycle" size={18} color="white" />
                </View>
            </View>
        </ImageBackground>
      </View>

      {/* --- BOTTOM SHEET CONTENT --- */}
      <View style={{ 
          flex: 1, backgroundColor: 'white', marginTop: -32, 
          borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' 
      }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 24 }}>
              
              {/* Drag Indicator */}
              <View style={{ width: '100%', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ width: 48, height: 6, backgroundColor: '#D1D5DB', borderRadius: 3 }} />
              </View>

              {/* STATUS CARD */}
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <FontAwesome name="location-arrow" size={20} color="#1F1F1F" style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F1F1F' }}>
                          {getStatusLabel(trackingData.status)}
                      </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                      <View>
                          <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>Tracking ID</Text>
                          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1F1F1F' }}>{id || trackingData.id}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>Status</Text>
                          <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: statusColors.bg }}>
                              <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize', color: statusColors.text }}>
                                  {trackingData.status.replace('_', ' ')}
                              </Text>
                          </View>
                      </View>
                  </View>

                  {/* TIMELINE */}
                  <View style={{ position: 'relative', paddingHorizontal: 8, marginBottom: 16 }}>
                       {/* Background Line */}
                       <View style={{ position: 'absolute', top: 14, left: 0, width: '100%', height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 }} />
                       {/* Progress Line */}
                       <View 
                          style={{ 
                              position: 'absolute', top: 14, left: 0, height: 6, backgroundColor: '#EBCD5E', borderRadius: 3,
                              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' 
                          }}
                       />
                       
                       <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                          {/* Step 1 */}
                          <View style={{ alignItems: 'center', width: '33%' }}>
                              <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'white', backgroundColor: '#EBCD5E', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                  <FontAwesome name="check" size={12} color="white" />
                              </View>
                              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>Ditugaskan</Text>
                          </View>
                          {/* Step 2 */}
                          <View style={{ alignItems: 'center', width: '33%' }}>
                              <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'white', backgroundColor: currentStep >= 2 ? '#EBCD5E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                  <FontAwesome name="paw" size={12} color="white" />
                              </View>
                              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>Dijemput</Text>
                          </View>
                          {/* Step 3 */}
                          <View style={{ alignItems: 'center', width: '33%' }}>
                              <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'white', backgroundColor: currentStep >= 3 ? '#EBCD5E' : '#D1D5DB', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                  <FontAwesome name="home" size={12} color="white" />
                              </View>
                              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 4, textAlign: 'center' }}>Selesai</Text>
                          </View>
                       </View>
                  </View>

                  <View style={{ borderTopWidth: 1, borderColor: '#E5E7EB', paddingTop: 16, marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ color: '#6B7280', fontSize: 12 }}>Lokasi Jemput:</Text>
                          <Text style={{ fontWeight: 'bold', fontSize: 12, maxWidth: '60%', textAlign: 'right' }} numberOfLines={1}>{trackingData.alamat}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: '#6B7280', fontSize: 12 }}>Tujuan Shelter:</Text>
                          <Text style={{ fontWeight: 'bold', fontSize: 12, maxWidth: '60%', textAlign: 'right' }} numberOfLines={1}>{trackingData.tujuan}</Text>
                      </View>
                  </View>
              </View>

              {/* INFO DRIVER / USER */}
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <Image 
                      source={{ uri: trackingData.kurir.foto }}
                      style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#D1D5DB', borderWidth: 2, borderColor: 'white' }}
                  />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{trackingData.kurir.role}</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#1F1F1F' }}>{trackingData.kurir.nama}</Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }} numberOfLines={1}>{trackingData.kurir.shelter}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                       <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: '#4E7C68', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesome name="phone" size={18} color="white" />
                       </TouchableOpacity>
                       <TouchableOpacity style={{ width: 40, height: 40, backgroundColor: '#4E7C68', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                          <MaterialIcons name="chat-bubble" size={18} color="white" />
                       </TouchableOpacity>
                  </View>
              </View>

              {/* REPORT DETAIL */}
              <View style={{ backgroundColor: '#F9FAFB', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#1F1F1F', marginBottom: 16 }}>Detail Laporan</Text>
                  
                  <View style={{ gap: 12 }}>
                      <InfoItem label="Jenis" value={trackingData.laporan.jenis} />
                      <InfoItem label="Pemilik/Pelapor" value={trackingData.laporan.pemilik} />
                      <InfoItem label="Lokasi" value={trackingData.laporan.lokasi} />
                      <InfoItem label="Deskripsi" value={trackingData.laporan.deskripsi} />
                      
                      <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', marginTop: 8 }}>
                           <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 8, marginBottom: 8 }}>Foto Hewan:</Text>
                           <Image 
                              source={{ uri: trackingData.laporan.foto }}
                              style={{ width: '100%', height: 160, borderRadius: 8, backgroundColor: '#E5E7EB' }}
                              contentFit="cover"
                           />
                      </View>
                  </View>
              </View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const InfoItem = ({ label, value }: { label: string, value: string }) => (
    <View style={{ backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6', width: '100%' }}>
        <Text style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontWeight: '600', fontSize: 14, color: '#1F1F1F' }}>{value}</Text>
    </View>
);