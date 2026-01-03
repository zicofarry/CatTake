import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Image, ImageBackground, Dimensions, StatusBar, Alert, Modal, 
  ActivityIndicator, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import Router
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import apiClient, { API_BASE_URL } from '../../api/apiClient';

const { width } = Dimensions.get('window');
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

export default function DonationScreen() {
  const router = useRouter(); // Init Router
  const insets = useSafeAreaInsets();

  // --- Data State ---
  const [userRole, setUserRole] = useState<string>('guest');
  const [userId, setUserId] = useState<number | null>(null);
  const [shelters, setShelters] = useState<any[]>([]);
  const [receivedDonations, setReceivedDonations] = useState<any[]>([]);
  
  // --- Form State ---
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bri' | 'qris' | ''>('');
  const [proofImage, setProofImage] = useState<any>(null);
  
  // --- UI State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shelterModalVisible, setShelterModalVisible] = useState(false);

  const selectedShelter = shelters.find(s => s.id === selectedShelterId);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole') || 'guest';
        setUserRole(role);

        if (token) {
          const decoded: any = jwtDecode(token);
          setUserId(decoded.id);
          
          if (role === 'shelter') {
            fetchReceivedDonations(decoded.id);
          } else {
            fetchShelters();
          }
        } else {
          fetchShelters();
        }
      } catch (e) {
        console.error(e);
        fetchShelters();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchShelters = async () => {
    try {
      const response = await apiClient.get('/users/shelters');
      setShelters(response.data);
    } catch (error) {
      console.error("Gagal ambil shelter:", error);
    }
  };

  const fetchReceivedDonations = async (id: number) => {
    try {
      const response = await apiClient.get(`/donations/shelter/${id}`);
      setReceivedDonations(response.data);
    } catch (error) {
      console.error("Gagal ambil donasi masuk:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setProofImage({
        uri: asset.uri,
        name: asset.fileName || `proof_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const submitDonation = async () => {
    if (!selectedShelterId || !amount || !paymentMethod || !proofImage) {
      Alert.alert("Error", "Mohon lengkapi semua data formulir.");
      return;
    }

    if (parseInt(amount) < 10000) {
      Alert.alert("Minimal Donasi", "Minimal donasi adalah Rp 10.000");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('shelter_id', selectedShelterId.toString());
    formData.append('payment_method', paymentMethod);
    formData.append('amount', amount);
    formData.append('is_anonymus', isAnonymous ? '1' : '0');
    
    // @ts-ignore
    formData.append('proof', {
      uri: proofImage.uri,
      name: proofImage.name,
      type: proofImage.type,
    });

    try {
      await apiClient.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Alert.alert("Sukses!", "Donasi berhasil dikirim, tim kami akan segera melakukan verifikasi.");
      setSelectedShelterId(null);
      setAmount('');
      setPaymentMethod('');
      setProofImage(null);
      setIsAnonymous(false);
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan saat mengirim donasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- COMPONENT: Sticky Back Button ---
  const StickyBackButton = () => (
    <View style={[styles.stickyHeader, { top: insets.top + (Platform.OS === 'android' ? 10 : 0) }]}>
      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>
    </View>
  );

  // --- RENDER VIEW: SHELTER ---
  if (userRole === 'shelter') {
    return (
      <ImageBackground source={require('../../assets/images/bg-texture.png')} style={styles.container}>
        <View style={{flex: 1}}>
          <StickyBackButton />
          
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }}>
            <View style={styles.headerShelter}>
              <Text style={styles.heroTitle}>Laporan Donasi</Text>
            </View>
            
            {receivedDonations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="gift-outline" size={60} color="#cbd5e1" />
                <Text style={{color: '#94a3b8', marginTop: 10}}>Belum ada donasi masuk.</Text>
              </View>
            ) : (
              receivedDonations.map((item) => (
                <View key={item.id} style={styles.donationCard}>
                   <View style={styles.donationRow}>
                      <View>
                        <Text style={styles.donorName}>{item.is_anonymus ? 'Hamba Allah (Anonim)' : item.User?.full_name}</Text>
                        <Text style={styles.donationDate}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
                      </View>
                      <Text style={styles.donationAmount}>+ Rp {item.amount.toLocaleString()}</Text>
                   </View>
                   <View style={[styles.statusBadge, { backgroundColor: item.status === 'verified' ? '#ecfdf5' : '#fff7ed' }]}>
                      <Text style={{ fontSize: 10, color: item.status === 'verified' ? '#059669' : '#d97706' }}>
                        {item.status.toUpperCase()}
                      </Text>
                   </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  // --- RENDER VIEW: DONOR ---
  return (
    <ImageBackground source={require('../../assets/images/bg-texture.png')} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.overlay}>
        <View style={{ flex: 1 }}>
          
          {/* TOMBOL KEMBALI STICKY */}
          <StickyBackButton />

          {isLoading ? (
             <ActivityIndicator size="large" color="#fff" style={{marginTop: 100}} />
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 60 }}>
              {/* HERO SECTION */}
              <View style={styles.heroSection}>
                <Image source={require('../../assets/images/donasi.png')} style={styles.heroImage} resizeMode="contain" />
                <Text style={styles.heroTitle}>Satu Donasi, Seribu Harapan.</Text>
                <Text style={styles.heroSubtitle}>Bersama mendukung langkah kecil mereka agar sehat dan dicintai.</Text>
              </View>

              {/* FORM CARD */}
              <View style={styles.formCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Formulir Donasi</Text>
                </View>

                {/* 1. Anonim */}
                <TouchableOpacity 
                  style={[styles.anonBox, isAnonymous && styles.anonBoxActive]}
                  onPress={() => setIsAnonymous(!isAnonymous)}
                >
                  <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                    {isAnonymous && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.anonTitle}>Donatur Anonim</Text>
                    <Text style={styles.anonDesc}>Sembunyikan nama Anda dari daftar publik.</Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Shelter */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>SHELTER TUJUAN</Text>
                  <TouchableOpacity style={styles.inputDropdown} onPress={() => setShelterModalVisible(true)}>
                    <Text style={[styles.inputText, !selectedShelter && {color: '#9ca3af'}]}>
                      {selectedShelter ? selectedShelter.shelter_name : '-- Pilih Shelter --'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* 3. Amount */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>JUMLAH DONASI</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.prefix}>Rp</Text>
                    <TextInput
                      style={[styles.inputField, { paddingLeft: 40 }]}
                      keyboardType="numeric"
                      placeholder="Min. 10.000"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>
                </View>

                {/* 4. Payment Method */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>METODE PEMBAYARAN</Text>
                  <View style={styles.radioGroup}>
                    <TouchableOpacity style={[styles.radioBtn, paymentMethod === 'qris' && styles.radioBtnActive]} onPress={() => setPaymentMethod('qris')}>
                      <Text style={[styles.radioText, paymentMethod === 'qris' && styles.radioTextActive]}>QRIS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.radioBtn, paymentMethod === 'bri' && styles.radioBtnActive]} onPress={() => setPaymentMethod('bri')}>
                      <Text style={[styles.radioText, paymentMethod === 'bri' && styles.radioTextActive]}>BRI</Text>
                    </TouchableOpacity>
                  </View>

                  {paymentMethod === 'bri' && (
                    <View style={styles.infoBoxBlue}>
                      <Text style={styles.infoValue}>{selectedShelter?.donation_account_number || '...'}</Text>
                      <Text style={styles.infoSub}>a/n {selectedShelter?.shelter_name || 'CatTake'}</Text>
                    </View>
                  )}

                  {paymentMethod === 'qris' && selectedShelter?.qr_img && (
                    <View style={styles.infoBoxGray}>
                      <Image 
                        source={{ uri: `${serverUrl}/public/img/qr_img/${selectedShelter.qr_img}` }} 
                        style={styles.qrImage} 
                        resizeMode="contain" 
                      />
                    </View>
                  )}
                </View>

                {/* 5. Upload Proof */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>BUKTI TRANSFER</Text>
                  <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                    {proofImage ? (
                      <Image source={{ uri: proofImage.uri }} style={styles.previewImage} />
                    ) : (
                      <Text style={{color: '#9ca3af'}}>Klik untuk upload bukti</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={submitDonation} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Donasi Sekarang</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Modal Dropdown Shelter */}
          <Modal visible={shelterModalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pilih Shelter</Text>
                  <TouchableOpacity onPress={() => setShelterModalVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
                </View>
                <ScrollView>
                  {shelters.map((s) => (
                    <TouchableOpacity key={s.id} style={styles.modalItem} onPress={() => { setSelectedShelterId(s.id); setShelterModalVisible(false); }}>
                      <Text>{s.shelter_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c473c' },
  overlay: { flex: 1, backgroundColor: 'rgba(44, 71, 60, 0.3)' },
  
  // --- STICKY BUTTON STYLE ---
  stickyHeader: {
    position: 'absolute',
    left: 20,
    zIndex: 100,
    paddingTop: 10 // Di atas scrollview
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', // Putih transparan agar kontras dengan background gelap
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backText: {
    marginLeft: 8,
    fontWeight: '700',
    color: '#374151',
    fontSize: 14
  },
  // ---------------------------

  heroSection: { alignItems: 'center', padding: 24, paddingTop: 10 },
  heroImage: { width: 140, height: 140, marginBottom: 15 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: '#e5e7eb', textAlign: 'center', marginTop: 8 },
  formCard: { backgroundColor: 'white', marginHorizontal: 16, borderRadius: 20, padding: 20, marginTop: 10 },
  cardHeader: { marginBottom: 20, alignItems: 'center' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#4b5563', marginBottom: 5 },
  inputDropdown: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 },
  inputText: { fontSize: 14 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  prefix: { position: 'absolute', left: 12, fontWeight: 'bold', color: '#6b7280' },
  inputField: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 14 },
  radioGroup: { flexDirection: 'row', gap: 10 },
  radioBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  radioBtnActive: { borderColor: '#3A5F50', backgroundColor: '#ecfdf5' },
  radioText: { color: '#6b7280', fontSize: 12 },
  radioTextActive: { color: '#3A5F50', fontWeight: 'bold' },
  infoBoxBlue: { marginTop: 10, padding: 12, backgroundColor: '#eff6ff', borderRadius: 8, alignItems: 'center' },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' },
  infoSub: { fontSize: 11, color: '#4b5563' },
  infoBoxGray: { marginTop: 10, alignItems: 'center' },
  qrImage: { width: 150, height: 150 },
  uploadBox: { height: 100, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  submitButton: { backgroundColor: '#E8C32A', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitText: { fontWeight: 'bold', color: '#1f2937' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  modalTitle: { fontWeight: 'bold', fontSize: 16 },
  modalItem: { paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  
  // Styles for Shelter
  headerShelter: { padding: 24, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  donationCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
  donationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  donorName: { fontWeight: 'bold', color: '#1f2937' },
  donationDate: { fontSize: 12, color: '#6b7280' },
  donationAmount: { color: '#059669', fontWeight: 'bold' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 8 },
  anonBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 15 },
  anonBoxActive: { borderColor: '#3A5F50', backgroundColor: '#f0fdf4' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#3A5F50', borderColor: '#3A5F50' },
  anonTitle: { fontWeight: 'bold', color: '#333' },
  anonDesc: { fontSize: 10, color: '#666' }
});