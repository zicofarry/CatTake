import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Image, ImageBackground, Dimensions, StatusBar, Alert, Modal, 
  ActivityIndicator, RefreshControl 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import StickyBackButton from '../../components/StickyBackButton';
// Helper agar URL gambar dari backend bisa tampil di HP
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

export default function DonationScreen() {
   const insets = useSafeAreaInsets();

  // --- STATE ---
  const [userRole, setUserRole] = useState<string>('guest');
  const [userId, setUserId] = useState<number | null>(null);
  const [shelterName, setShelterName] = useState(''); 
  
  // Data
  const [shelters, setShelters] = useState<any[]>([]); // List shelter (untuk Donatur)
  const [receivedDonations, setReceivedDonations] = useState<any[]>([]); // History (untuk Shelter)
  
  // Form Donasi
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bri' | 'qris' | ''>('');
  const [proofImage, setProofImage] = useState<any>(null);
  
  // UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shelterModalVisible, setShelterModalVisible] = useState(false);

  const selectedShelter = shelters.find(s => s.id === selectedShelterId);

  // --- INIT ---
  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    setIsLoading(true);
    await checkRoleAndFetch();
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkRoleAndFetch();
    setRefreshing(false);
  };

  const checkRoleAndFetch = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const role = await AsyncStorage.getItem('userRole') || 'guest';
      setUserRole(role);

      if (token) {
        const decoded: any = jwtDecode(token);
        setUserId(decoded.id);

        if (role === 'shelter') {
          // KHUSUS SHELTER: Ambil Laporan Donasi Masuk
          // Endpoint: GET /api/v1/donations/shelter/:id
          await fetchReceivedDonations(decoded.id);
        } else {
          // KHUSUS USER: Ambil List Shelter
          // Endpoint: GET /api/v1/users/shelters
          await fetchShelters();
        }
      } else {
        // GUEST
        await fetchShelters();
      }
    } catch (e) {
      console.error("Error init:", e);
      fetchShelters(); 
    }
  };

  // --- API FUNCTIONS ---

  // 1. Ambil List Shelter (Sesuai server.js -> userRoutes)
  const fetchShelters = async () => {
    try {
      const response = await apiClient.get('/users/shelters');
      setShelters(response.data);
    } catch (error) {
      console.error("Gagal load shelters:", error);
    }
  };

  // 2. Ambil History Donasi (Sesuai server.js -> donationRoutes)
  const fetchReceivedDonations = async (id: number) => {
    try {
      const response = await apiClient.get(`/donations/shelter/${id}`);
      setReceivedDonations(response.data);
    } catch (error) {
      console.error("Gagal load history donasi:", error);
    }
  };

  // --- HANDLERS ---
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
      Alert.alert("Data Belum Lengkap", "Mohon lengkapi semua data formulir.");
      return;
    }
    
    if (parseInt(amount) < 10000) {
      Alert.alert("Minimal Donasi", "Minimal donasi adalah Rp 10.000");
      return;
    }

    setIsSubmitting(true);
    
    // Gunakan FormData agar cocok dengan @fastify/multipart di server.js
    const formData = new FormData();
    formData.append('shelter_id', selectedShelterId.toString());
    formData.append('payment_method', paymentMethod);
    formData.append('amount', amount);
    formData.append('is_anonymus', isAnonymous ? '1' : '0');
    
    // File Upload
    formData.append('proof', {
      uri: proofImage.uri,
      name: proofImage.name,
      type: proofImage.type,
    });

    try {
      // POST ke /api/v1/donations
      await apiClient.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Alert.alert("Berhasil!", "Donasi Anda sedang diverifikasi oleh shelter.");
      
      // Reset
      setSelectedShelterId(null);
      setAmount('');
      setPaymentMethod('');
      setProofImage(null);
      setIsAnonymous(false);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal", error.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER: SHELTER VIEW ---
  if (userRole === 'shelter') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
        
        <View style={styles.headerShelter}>
           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View>
                 <Text style={styles.headerSubtitle}>Laporan Pemasukan</Text>
                 <Text style={styles.headerTitle}>Donasi Masuk</Text>
              </View>
              <View style={styles.iconBox}>
                 <FontAwesome5 name="hand-holding-heart" size={20} color="#EBCD5E" />
              </View>
           </View>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
           {isLoading ? (
              <ActivityIndicator size="large" color="#EBCD5E" style={{marginTop: 50}} />
           ) : receivedDonations.length === 0 ? (
              <View style={styles.emptyState}>
                 <Ionicons name="documents-outline" size={60} color="#9ca3af" />
                 <Text style={{color: '#9ca3af', marginTop: 10}}>Belum ada data donasi.</Text>
              </View>
           ) : (
              receivedDonations.map((item) => (
                <View key={item.id} style={styles.donationCard}>
                   <View style={styles.cardTopRow}>
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </Text>
                      <View style={[styles.statusBadge, item.status === 'verified' ? styles.bgSuccess : styles.bgPending]}>
                         <Text style={[styles.statusText, item.status === 'verified' ? styles.textSuccess : styles.textPending]}>
                            {item.status ? item.status.toUpperCase() : 'PENDING'}
                         </Text>
                      </View>
                   </View>
                   <View style={styles.cardBody}>
                      <View style={styles.avatarBox}>
                         <Text style={styles.avatarText}>
                            {item.is_anonymus ? 'A' : (item.User?.full_name?.charAt(0) || 'D')}
                         </Text>
                      </View>
                      <View style={{flex: 1}}>
                         <Text style={styles.donorName}>
                            {item.is_anonymus ? 'Hamba Allah' : (item.User?.full_name || 'Donatur')}
                         </Text>
                         <Text style={styles.paymentMethod}>
                            Via {item.payment_method?.toUpperCase()}
                         </Text>
                      </View>
                      <Text style={styles.amountText}>
                         +Rp {parseInt(item.amount).toLocaleString('id-ID')}
                      </Text>
                   </View>
                </View>
              ))
           )}
        </ScrollView>
      </View>
    );
  }

  // --- RENDER: USER/GUEST VIEW ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
      <StickyBackButton /> 
      <ImageBackground 
        source={require('../../assets/images/bg-texture.png')} 
        style={StyleSheet.absoluteFillObject} 
        resizeMode="cover"
      />

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.heroSection}>
          <Image source={require('../../assets/images/donasi.png')} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.heroTitle}>Satu Donasi, Seribu Harapan.</Text>
          <Text style={styles.heroSubtitle}>Bersama mendukung langkah kecil mereka agar sehat dan dicintai.</Text>
        </View>

        <View style={styles.formCard}>
            <View style={styles.formHeader}>
               <Text style={styles.formTitle}>Formulir Donasi</Text>
            </View>

            {/* Checkbox Anonim */}
            <TouchableOpacity 
              style={[styles.anonContainer, isAnonymous && styles.anonActive]}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
               <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                  {isAnonymous && <Ionicons name="checkmark" size={14} color="#fff" />}
               </View>
               <View>
                  <Text style={styles.anonLabel}>Donatur Anonim</Text>
                  <Text style={styles.anonDesc}>Sembunyikan nama Anda dari publik</Text>
               </View>
            </TouchableOpacity>

            {/* Dropdown Shelter */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>SHELTER TUJUAN</Text>
               <TouchableOpacity style={styles.dropdown} onPress={() => setShelterModalVisible(true)}>
                  <Text style={[styles.dropdownText, !selectedShelter && {color: '#9ca3af'}]}>
                     {selectedShelter ? selectedShelter.shelter_name : '-- Pilih Shelter --'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
               </TouchableOpacity>
            </View>

            {/* Input Nominal */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>JUMLAH DONASI</Text>
               <View style={styles.inputWrapper}>
                  <Text style={styles.prefix}>Rp</Text>
                  <TextInput
                    style={styles.inputField}
                    keyboardType="numeric"
                    placeholder="Min. 10.000"
                    value={amount}
                    onChangeText={setAmount}
                  />
               </View>
            </View>

            {/* Metode Pembayaran */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>METODE PEMBAYARAN</Text>
               <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={[styles.radioBtn, paymentMethod === 'qris' && styles.radioBtnActive]} 
                    onPress={() => setPaymentMethod('qris')}
                  >
                     <Text style={[styles.radioText, paymentMethod === 'qris' && {color: '#3A5F50', fontWeight: 'bold'}]}>QRIS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.radioBtn, paymentMethod === 'bri' && styles.radioBtnActive]} 
                    onPress={() => setPaymentMethod('bri')}
                  >
                     <Text style={[styles.radioText, paymentMethod === 'bri' && {color: '#3A5F50', fontWeight: 'bold'}]}>Transfer BRI</Text>
                  </TouchableOpacity>
               </View>

               {paymentMethod === 'bri' && (
                  <View style={styles.infoBoxBlue}>
                     <Ionicons name="information-circle" size={18} color="#1e3a8a" />
                     <View>
                        <Text style={styles.infoBankTitle}>Bank BRI (Shelter)</Text>
                        <Text style={styles.infoRekening}>{selectedShelter?.donation_account_number || 'Pilih shelter dulu'}</Text>
                        <Text style={styles.infoOwner}>a/n {selectedShelter?.shelter_name || '...'}</Text>
                     </View>
                  </View>
               )}

               {paymentMethod === 'qris' && selectedShelter?.qr_img && (
                  <View style={styles.infoBoxGray}>
                     <Text style={{fontSize: 12, marginBottom: 5}}>Scan QRIS di bawah ini:</Text>
                     <Image 
                       source={{ uri: `${serverUrl}/public/img/qr_img/${selectedShelter.qr_img}` }} 
                       style={{ width: 150, height: 150, borderRadius: 8 }} 
                       resizeMode="contain" 
                     />
                  </View>
               )}
            </View>

            {/* Upload Bukti */}
            <View style={styles.inputGroup}>
               <Text style={styles.label}>BUKTI TRANSFER</Text>
               <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                  {proofImage ? (
                     <Image source={{ uri: proofImage.uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                  ) : (
                     <View style={{alignItems: 'center'}}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#9ca3af" />
                        <Text style={{color: '#9ca3af', fontSize: 12, marginTop: 4}}>Klik untuk upload</Text>
                     </View>
                  )}
               </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={submitDonation} disabled={isSubmitting}>
               {isSubmitting ? <ActivityIndicator color="#1f2937" /> : <Text style={styles.submitText}>Donasi Sekarang</Text>}
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL SHELTER */}
      <Modal visible={shelterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Pilih Shelter Penerima</Text>
                 <TouchableOpacity onPress={() => setShelterModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                 </TouchableOpacity>
              </View>
              <ScrollView>
                 {shelters.map((s) => (
                    <TouchableOpacity 
                       key={s.id} 
                       style={styles.modalItem}
                       onPress={() => { setSelectedShelterId(s.id); setShelterModalVisible(false); }}
                    >
                       <View style={styles.modalAvatar}>
                          <Text style={{fontWeight: 'bold', color: '#fff'}}>{s.shelter_name.charAt(0)}</Text>
                       </View>
                       <Text style={styles.modalText}>{s.shelter_name}</Text>
                    </TouchableOpacity>
                 ))}
              </ScrollView>
           </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C473C' },
  headerShelter: {
    paddingTop: 60, paddingHorizontal: 24, paddingBottom: 30,
    backgroundColor: '#3A5F50', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#EBCD5E', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  iconBox: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.7 },
  donationCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 8 },
  dateText: { fontSize: 12, color: '#6b7280' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bgSuccess: { backgroundColor: '#ECFDF5' }, bgPending: { backgroundColor: '#FFFBEB' },
  textSuccess: { color: '#059669', fontSize: 10, fontWeight: 'bold' }, textPending: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: 'bold', color: '#4B5563' },
  donorName: { fontWeight: 'bold', color: '#1F2937', fontSize: 14 },
  paymentMethod: { fontSize: 11, color: '#6B7280' },
  amountText: { fontWeight: 'bold', color: '#059669', fontSize: 16 },
  heroSection: { alignItems: 'center', padding: 24, paddingTop: 40 },
  heroImage: { width: 140, height: 140, marginBottom: 15 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  heroSubtitle: { fontSize: 12, color: '#e5e7eb', textAlign: 'center', marginTop: 5, maxWidth: 250 },
  formCard: { 
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 24, 
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
  },
  formHeader: { alignItems: 'center', marginBottom: 20 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#6B7280', marginBottom: 6, letterSpacing: 0.5 },
  anonContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 20, gap: 12 },
  anonActive: { backgroundColor: '#ECFDF5', borderColor: '#3A5F50' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxActive: { backgroundColor: '#3A5F50', borderColor: '#3A5F50' },
  anonLabel: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  anonDesc: { fontSize: 11, color: '#6B7280' },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14 },
  dropdownText: { fontSize: 14, color: '#1F2937' },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  prefix: { position: 'absolute', left: 14, fontWeight: 'bold', color: '#6B7280', zIndex: 1 },
  inputField: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, paddingLeft: 40, fontSize: 16, fontWeight: '600', color: '#1F2937' },
  radioContainer: { flexDirection: 'row', gap: 10 },
  radioBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#fff' },
  radioBtnActive: { borderColor: '#3A5F50', backgroundColor: '#ECFDF5' },
  radioText: { fontSize: 12, color: '#6B7280' },
  infoBoxBlue: { marginTop: 10, padding: 15, backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#DBEAFE', flexDirection: 'row', gap: 12, alignItems: 'center' },
  infoBankTitle: { fontSize: 10, color: '#1E3A8A', fontWeight: 'bold' },
  infoRekening: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginVertical: 2 },
  infoOwner: { fontSize: 11, color: '#60A5FA' },
  infoBoxGray: { marginTop: 10, padding: 15, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  uploadBox: { height: 100, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  submitBtn: { backgroundColor: '#EBCD5E', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#EBCD5E', shadowOpacity: 0.3, shadowRadius: 5, elevation: 3 },
  submitText: { fontWeight: 'bold', color: '#1F2937', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  modalAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3A5F50', justifyContent: 'center', alignItems: 'center' },
  modalText: { fontSize: 15, color: '#374151', fontWeight: '500' }
});