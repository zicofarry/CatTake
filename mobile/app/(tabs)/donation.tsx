import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Image, ImageBackground, Dimensions, StatusBar, Alert, Modal, 
  ActivityIndicator, RefreshControl, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- KONFIGURASI API & GAMBAR ---
// Ganti dengan IP Laptop kamu
import apiClient, { API_BASE_URL } from '../../api/apiClient';
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

const resolveImageUrl = (path: string | null) => {
  if (!path) return null;
  // Jika path cuma nama file (misal "qr1.jpg"), tambahkan prefix
  if (!path.startsWith('http')) {
    return `${serverUrl}/public/img/qr_img/${path}`;
  }
  return path;
};

// --- MOCK DATA SHELTER (Simulasi Database) ---
// Data ini nanti diambil dari endpoint /users/shelters
const MOCK_SHELTERS = [
  { 
    id: 1, 
    shelter_name: "Shelter Depok Bersatu", 
    donation_account_number: "1234-5678-9012-3456", 
    qr_img: "qr1.jpg" 
  },
  { 
    id: 2, 
    shelter_name: "Rumah Kucing Bu Ani", 
    donation_account_number: "8888-7777-6666-5555", 
    qr_img: "qr2.jpg" 
  },
  { 
    id: 3, 
    shelter_name: "CatTake Center Pusat", 
    donation_account_number: "1111-2222-3333-4444", 
    qr_img: "qr3.jpg" 
  }
];

const { width } = Dimensions.get('window');

export default function DonationScreen() {
  // Form State
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bri' | 'qris' | ''>('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  
  // Data State
  const [shelters, setShelters] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State (Dropdown Modal)
  const [shelterModalVisible, setShelterModalVisible] = useState(false);

  // --- Computed Data ---
  const selectedShelter = shelters.find(s => s.id === selectedShelterId);

  // --- Methods ---
  
  // 1. Fetch Shelter List
  const fetchShelters = () => {
    // Simulasi Fetch API
    setIsLoading(true);
    setTimeout(() => {
      setShelters(MOCK_SHELTERS);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  // 2. Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  // 3. Submit Donation
  const submitDonation = async () => {
    if (!selectedShelterId || !amount || !paymentMethod || !proofImage) {
      Alert.alert("Form Belum Lengkap", "Mohon lengkapi semua kolom formulir.");
      return;
    }

    if (parseInt(amount) < 10000) {
      Alert.alert("Minimal Donasi", "Minimal donasi adalah Rp 10.000");
      return;
    }

    setIsSubmitting(true);
    
    // Simulasi Proses Upload ke Backend
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Terima Kasih!", "Donasi Anda berhasil dikirim dan menunggu verifikasi admin.");
      
      // Reset Form
      setSelectedShelterId(null);
      setAmount('');
      setPaymentMethod('');
      setProofImage(null);
      setIsAnonymous(false);
    }, 2000);
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/bg-texture.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <SafeAreaView style={{flex: 1}}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            
            {/* HERO SECTION (Sesuai Frontend) */}
            <View style={styles.heroSection}>
              <Image 
                source={require('../../assets/images/donasi.png')} 
                style={styles.heroImage} 
                resizeMode="contain"
              />
              <Text style={styles.heroTitle}>Satu Donasi, Seribu Harapan.</Text>
              <Text style={styles.heroSubtitle}>
                Bersama mendukung langkah kecil mereka, dari jalanan penuh bahaya menuju tempat yang aman, sehat, dan dicintai.
              </Text>
            </View>

            {/* FORM CARD */}
            <View style={styles.formCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Formulir Donasi</Text>
                <Text style={styles.cardSubtitle}>Lengkapi data di bawah untuk menyalurkan kebaikanmu</Text>
              </View>

              {/* 1. Checkbox Anonim */}
              <TouchableOpacity 
                style={[styles.anonBox, isAnonymous && styles.anonBoxActive]}
                onPress={() => setIsAnonymous(!isAnonymous)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                  {isAnonymous && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.anonTitle}>Sembunyikan Nama Saya</Text>
                  <Text style={styles.anonDesc}>Nama Anda tidak akan ditampilkan di daftar donatur publik (Anonim).</Text>
                </View>
              </TouchableOpacity>

              {/* 2. Pilih Shelter */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>SHELTER TUJUAN</Text>
                <TouchableOpacity 
                  style={styles.inputDropdown} 
                  onPress={() => setShelterModalVisible(true)}
                >
                  <Text style={[styles.inputText, !selectedShelter && {color: '#9ca3af'}]}>
                    {selectedShelter ? selectedShelter.shelter_name : '-- Pilih Shelter Penerima --'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* 3. Jumlah Donasi */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>JUMLAH DONASI</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.prefix}>Rp</Text>
                  <TextInput
                    style={[styles.inputField, { paddingLeft: 40 }]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                <Text style={styles.helperText}>*Minimal donasi Rp 10.000</Text>
              </View>

              {/* 4. Metode Pembayaran */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>METODE PEMBAYARAN</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={[styles.radioBtn, paymentMethod === 'qris' && styles.radioBtnActive]}
                    onPress={() => setPaymentMethod('qris')}
                  >
                    <Ionicons name="qr-code-outline" size={20} color={paymentMethod === 'qris' ? '#3A5F50' : '#6b7280'} />
                    <Text style={[styles.radioText, paymentMethod === 'qris' && styles.radioTextActive]}>QRIS (Scan)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.radioBtn, paymentMethod === 'bri' && styles.radioBtnActive]}
                    onPress={() => setPaymentMethod('bri')}
                  >
                    <Ionicons name="card-outline" size={20} color={paymentMethod === 'bri' ? '#3A5F50' : '#6b7280'} />
                    <Text style={[styles.radioText, paymentMethod === 'bri' && styles.radioTextActive]}>Transfer BRI</Text>
                  </TouchableOpacity>
                </View>

                {/* Info Pembayaran Dinamis */}
                {paymentMethod === 'bri' && (
                  <View style={styles.infoBoxBlue}>
                    <Ionicons name="information-circle" size={24} color="#1e40af" />
                    <View>
                      <Text style={styles.infoTitle}>Bank BRI</Text>
                      <Text style={styles.infoValue}>
                        {selectedShelter ? selectedShelter.donation_account_number : 'Pilih shelter dulu...'}
                      </Text>
                      <Text style={styles.infoSub}>a/n {selectedShelter ? selectedShelter.shelter_name : '...'}</Text>
                    </View>
                  </View>
                )}

                {paymentMethod === 'qris' && (
                  <View style={styles.infoBoxGray}>
                    <Text style={styles.scanText}>Scan QRIS di bawah ini:</Text>
                    {selectedShelter && selectedShelter.qr_img ? (
                      <View style={styles.qrContainer}>
                        <Image 
                          source={{ uri: resolveImageUrl(selectedShelter.qr_img) || undefined }} 
                          style={styles.qrImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.infoSub}>{selectedShelter.shelter_name}</Text>
                      </View>
                    ) : (
                      <View style={styles.qrPlaceholder}>
                        <Ionicons name="qr-code" size={40} color="#d1d5db" />
                        <Text style={{color:'#9ca3af', marginTop:5}}>
                          {selectedShelterId ? 'QR Code tidak tersedia' : 'Pilih shelter terlebih dahulu'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* 5. Upload Bukti */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>BUKTI TRANSFER</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                  {proofImage ? (
                    <View style={{width: '100%', height: '100%'}}>
                      <Image source={{ uri: proofImage }} style={styles.previewImage} />
                      <View style={styles.reuploadBadge}><Text style={{color:'white', fontSize:10}}>Ganti Foto</Text></View>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={40} color="#9ca3af" />
                      <Text style={styles.uploadText}>Klik untuk upload bukti</Text>
                      <Text style={styles.uploadSubText}>Format: JPG, PNG (Max 10MB)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && {opacity: 0.7}]}
                onPress={submitDonation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#1f2937" />
                ) : (
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <Text style={styles.submitText}>Selesaikan Donasi</Text>
                    <Ionicons name="arrow-forward" size={20} color="#1f2937" />
                  </View>
                )}
              </TouchableOpacity>

            </View>
          </ScrollView>

          {/* Modal Pilih Shelter */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={shelterModalVisible}
            onRequestClose={() => setShelterModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pilih Shelter</Text>
                  <TouchableOpacity onPress={() => setShelterModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {shelters.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.modalItem}
                      onPress={() => {
                        setSelectedShelterId(item.id);
                        setShelterModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item.shelter_name}</Text>
                      {selectedShelterId === item.id && <Ionicons name="checkmark" size={20} color="#3A5F50" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c473c' },
  overlay: { flex: 1, backgroundColor: 'rgba(44, 71, 60, 0.5)' }, // Overlay dikurangi opacity-nya biar tekstur kelihatan

  // Hero Section
  heroSection: { alignItems: 'center', padding: 24, paddingTop: 40, paddingBottom: 60 },
  heroImage: { width: 180, height: 180, marginBottom: 20 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 10, textShadowColor:'rgba(0,0,0,0.3)', textShadowRadius: 4 },
  heroSubtitle: { fontSize: 14, color: '#e5e7eb', textAlign: 'center', lineHeight: 22, maxWidth: 300 },

  // Form Card
  formCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    marginHorizontal: 16, 
    borderRadius: 24, 
    padding: 24, 
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)'
  },
  cardHeader: { marginBottom: 24, alignItems: 'center' },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center' },

  // Inputs
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#4b5563', marginBottom: 8, letterSpacing: 0.5 },
  
  // Anon Checkbox
  anonBox: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', marginBottom: 24 },
  anonBoxActive: { borderColor: '#558a74', backgroundColor: '#ecfdf5' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#d1d5db', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#558a74', borderColor: '#558a74' },
  anonTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  anonDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  // Dropdown
  inputDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16 },
  inputText: { fontSize: 16, color: '#1f2937' },

  // Amount Input
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  prefix: { position: 'absolute', left: 16, fontSize: 16, fontWeight: 'bold', color: '#6b7280', zIndex: 1 },
  inputField: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 18, fontWeight: '600', color: '#1f2937' },
  helperText: { fontSize: 11, color: '#6b7280', marginTop: 4, marginLeft: 4 },

  // Payment Method
  radioGroup: { flexDirection: 'row', gap: 10 },
  radioBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  radioBtnActive: { borderColor: '#558a74', backgroundColor: '#ecfdf5' },
  radioText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  radioTextActive: { color: '#3A5F50' },

  // Info Box
  infoBoxBlue: { marginTop: 12, padding: 16, backgroundColor: '#eff6ff', borderColor: '#dbeafe', borderWidth: 1, borderRadius: 12, flexDirection: 'row', gap: 12 },
  infoBoxGray: { marginTop: 12, padding: 16, backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  infoTitle: { fontWeight: 'bold', color: '#1e40af', fontSize: 14 },
  infoValue: { fontSize: 18, fontWeight: 'bold', color: '#1e3a8a', marginVertical: 4, fontFamily: 'monospace' },
  infoSub: { fontSize: 12, color: '#4b5563' },
  scanText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  qrContainer: { padding: 8, backgroundColor: 'white', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  qrImage: { width: 180, height: 180 },
  qrPlaceholder: { padding: 20, alignItems: 'center', justifyContent: 'center' },

  // Upload
  uploadBox: { height: 140, borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  uploadText: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginTop: 8 },
  uploadSubText: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  previewImage: { width: '100%', height: '100%' },
  reuploadBadge: { position: 'absolute', bottom: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  // Button
  submitButton: { backgroundColor: '#E8C32A', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#E8C32A', shadowOpacity: 0.4, shadowOffset: {width: 0, height: 4}, elevation: 5 },
  submitText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { fontSize: 16, color: '#374151' },
});