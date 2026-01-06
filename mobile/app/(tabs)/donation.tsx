import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Image, ImageBackground, Dimensions, StatusBar, Alert, Modal, 
  ActivityIndicator, RefreshControl, Platform, LayoutAnimation, UIManager 
} from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'; // Ditambahkan Stack di sini
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import StickyBackButton from '../../components/StickyBackButton';
import CustomPopup from '../../components/CustomPopup'; 

// Aktifkan animasi untuk Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

export default function DonationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- STATE ---
  const [userRole, setUserRole] = useState<string>('guest');
  const [userId, setUserId] = useState<number | null>(null);
  
  const [shelters, setShelters] = useState<any[]>([]); 
  const [receivedDonations, setReceivedDonations] = useState<any[]>([]); 
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bri' | 'qris' | ''>('');
  const [proofImage, setProofImage] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shelterModalVisible, setShelterModalVisible] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('success');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const selectedShelter = shelters.find(s => s.id === selectedShelterId);

  // --- INIT ---
  useEffect(() => {
    initPage();
  }, []);

  useEffect(() => {
    if (params.shelterId) {
      setSelectedShelterId(Number(params.shelterId));
    }
  }, [params.shelterId]);

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
          await fetchReceivedDonations(decoded.id);
        } else {
          await fetchShelters();
        }
      } else {
        await fetchShelters();
      }
    } catch (e) {
      console.error("Error init:", e);
      fetchShelters(); 
    }
  };

  const fetchShelters = async () => {
    try {
      const response = await apiClient.get('/users/shelters');
      const data = response.data.data ? response.data.data : response.data;
      setShelters(data);
    } catch (error) {
      console.error("Gagal load shelters:", error);
    }
  };

  const fetchReceivedDonations = async (id: number) => {
    try {
      const response = await apiClient.get(`/donations/shelter/${id}`);
      setReceivedDonations(response.data);
    } catch (error) {
      console.error("Gagal load history donasi:", error);
    }
  };

  const toggleDetails = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const getFullImageUrl = (path: string) => {
    if (!path || path.includes('NULL')) return require('../../assets/images/null.png');
    if (path.startsWith('http')) return { uri: path };
    return { uri: `${serverUrl}${path}` };
  };

  const getProofImageUrl = (filename: string) => {
    if (!filename) return null;
    return { uri: `${filename}` };
  };

  // --- HANDLERS (Donatur) ---
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
      showPopup("error", "Data Belum Lengkap", "Mohon lengkapi semua data formulir.");
      return;
    }
    if (parseInt(amount) < 10000) {
      showPopup("error", "Minimal Donasi", "Minimal donasi adalah Rp 10.000");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('shelter_id', selectedShelterId.toString());
    formData.append('payment_method', paymentMethod);
    formData.append('amount', amount);
    formData.append('is_anonymus', isAnonymous ? '1' : '0');
    // @ts-ignore
    formData.append('proof', { uri: proofImage.uri, name: proofImage.name, type: proofImage.type });

    try {
      await apiClient.post('/donations', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showPopup("success", "Berhasil!", "Donasi Anda telah berhasil terkirim.");
      setSelectedShelterId(null); setAmount(''); setPaymentMethod(''); setProofImage(null); setIsAnonymous(false);
    } catch (error: any) {
      showPopup("error", "Gagal", error.response?.data?.message || "Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    // Jika popup yang ditutup adalah popup sukses donasi, arahkan ke Home
    if (popupType === 'success' && userRole !== 'shelter') {
      router.replace('/(tabs)');
    }
  };

  // --- RENDER: SHELTER VIEW ---
  if (userRole === 'shelter') {
    return (
      <View style={[styles.container, { backgroundColor: '#F3F4F6' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#3A5F50" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Laporan Donasi</Text>
                <Text style={styles.headerSubtitle}>Riwayat dana masuk dari donatur</Text>
            </View>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3A5F50" />}
        >
           {isLoading ? (
              <ActivityIndicator size="large" color="#EBCD5E" style={{marginTop: 50}} />
           ) : receivedDonations.length === 0 ? (
              <View style={styles.emptyState}>
                 <Ionicons name="documents-outline" size={60} color="#9ca3af" />
                 <Text style={styles.emptyText}>Belum ada data donasi.</Text>
              </View>
           ) : (
              receivedDonations.map((item) => {
                const isOpen = expandedId === item.id;
                const isAnon = item.donorName === 'Orang Baik';

                return (
                  <View key={item.id} style={[styles.donationCardShelter, isOpen ? styles.cardOpenBorder : styles.cardDefaultBorder]}>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => toggleDetails(item.id)} style={styles.cardHeaderShelter}>
                        <Image source={getFullImageUrl(item.profilePic)} style={styles.donorAvatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.donorActionText} numberOfLines={1}>
                                <Text style={{ fontWeight: 'bold', color: '#1f2937' }}>{item.donorName}</Text> mendonasikan
                            </Text>
                            <Text style={styles.amountTextShelter}>+Rp {item.amount.toLocaleString('id-ID')}</Text>
                            <Text style={styles.dateTextMobile}>{item.dateTime}</Text>
                        </View>
                        <View style={[styles.chevronCircle, isOpen && styles.chevronCircleOpen]}>
                            <Ionicons name="chevron-down" size={16} color={isOpen ? "#a16207" : "#9ca3af"} />
                        </View>
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.cardDropdown}>
                        <View style={styles.divider} />
                        <View style={styles.detailsGrid}>
                          <View style={styles.detailsLeft}>
                            <View style={{ marginBottom: 15 }}>
                              <Text style={styles.detailLabel}>METODE PEMBAYARAN</Text>
                              <View style={styles.methodBadge}>
                                <FontAwesome5 name="credit-card" size={12} color="#EBCD5E" />
                                <Text style={styles.methodText}>{item.paymentMethod === 'bri' ? 'Transfer Bank BRI' : 'QRIS (Scan)'}</Text>
                              </View>
                            </View>
                            <View>
                              <Text style={styles.detailLabel}>STATUS PRIVASI</Text>
                              <View style={[styles.privacyBadge, isAnon ? styles.bgGray : styles.bgGreenBadge]}>
                                <Text style={[styles.privacyText, isAnon ? styles.textGray : styles.textGreenBadge]}>{isAnon ? 'Anonim' : 'Publik'}</Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.detailsRight}>
                            <Text style={styles.detailLabel}>BUKTI TRANSFER</Text>
                            {item.proofFile ? (
                              <Image 
                                source={getProofImageUrl(item.proofFile)} 
                                style={styles.proofImagePortrait} 
                                resizeMode="cover" 
                              />
                            ) : (
                              <View style={styles.noProofBox}><Text style={styles.noProofText}>Tidak ada lampiran</Text></View>
                            )}
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
           )}
        </ScrollView>
      </View>
    );
  }

  // --- RENDER: USER/GUEST VIEW ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
      <Stack.Screen options={{ headerShown: false }} />
      <StickyBackButton /> 
      <ImageBackground source={require('../../assets/images/bg-texture.png')} style={StyleSheet.absoluteFillObject} resizeMode="cover" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 40 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.heroSection}>
          <Image source={require('../../assets/images/donasi.png')} style={styles.heroImage} resizeMode="contain" />
          <Text style={styles.heroTitle}>Satu Donasi, Seribu Harapan.</Text>
          <Text style={styles.heroSubtitle}>Bersama mendukung langkah kecil mereka agar sehat dan dicintai.</Text>
        </View>

        <View style={styles.formCard}>
            <View style={styles.formHeader}><Text style={styles.formTitle}>Formulir Donasi</Text></View>

            <TouchableOpacity style={[styles.anonContainer, isAnonymous && styles.anonActive]} onPress={() => setIsAnonymous(!isAnonymous)}>
               <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>{isAnonymous && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
               <View>
                  <Text style={styles.anonLabel}>Donatur Anonim</Text>
                  <Text style={styles.anonDesc}>Sembunyikan nama Anda dari publik</Text>
               </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>SHELTER TUJUAN</Text>
               <TouchableOpacity style={styles.dropdown} onPress={() => setShelterModalVisible(true)}>
                  <Text style={[styles.dropdownText, !selectedShelter && {color: '#9ca3af'}]}>{selectedShelter ? selectedShelter.shelter_name : '-- Pilih Shelter --'}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
               </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>JUMLAH DONASI</Text>
               <View style={styles.inputWrapper}>
                  <Text style={styles.prefix}>Rp</Text>
                  <TextInput style={styles.inputField} keyboardType="numeric" placeholder="Min. 10.000" value={amount} onChangeText={setAmount} />
               </View>
            </View>

            <View style={styles.inputGroup}>
               <Text style={styles.label}>METODE PEMBAYARAN</Text>
               <View style={styles.radioContainer}>
                  <TouchableOpacity style={[styles.radioBtn, paymentMethod === 'qris' && styles.radioBtnActive]} onPress={() => setPaymentMethod('qris')}>
                     <Text style={[styles.radioText, paymentMethod === 'qris' && {color: '#3A5F50', fontWeight: 'bold'}]}>QRIS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.radioBtn, paymentMethod === 'bri' && styles.radioBtnActive]} onPress={() => setPaymentMethod('bri')}>
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
                     <Image source={{ uri: `${selectedShelter.qr_img}` }} style={{ width: 150, height: 150, borderRadius: 8 }} resizeMode="contain" />
                  </View>
               )}
            </View>

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

      <Modal visible={shelterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Pilih Shelter Penerima</Text>
                 <TouchableOpacity onPress={() => setShelterModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
              </View>
              <ScrollView>
                 {shelters.map((s) => (
                    <TouchableOpacity key={s.id} style={styles.modalItem} onPress={() => { setSelectedShelterId(s.id); setShelterModalVisible(false); }}>
                       <View style={styles.modalAvatar}><Text style={{fontWeight: 'bold', color: '#fff'}}>{s.shelter_name.charAt(0)}</Text></View>
                       <Text style={styles.modalText}>{s.shelter_name}</Text>
                    </TouchableOpacity>
                 ))}
              </ScrollView>
           </View>
        </View>
      </Modal>

      <CustomPopup visible={popupVisible} onClose={handleClosePopup} type={popupType} title={popupTitle} message={popupMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C473C' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 13, color: '#6b7280' },

  // Shelter Styles (Laporan Donasi)
  donationCardShelter: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, borderWidth: 2, overflow: 'hidden', elevation: 2 },
  cardDefaultBorder: { borderColor: '#f3f4f6' },
  cardOpenBorder: { borderColor: '#EBCD5E' },
  cardHeaderShelter: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  donorAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#f3f4f6' },
  donorActionText: { fontSize: 13, color: '#4b5563' },
  amountTextShelter: { fontSize: 18, fontWeight: '900', color: '#3A5F50', marginTop: 2 },
  dateTextMobile: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  chevronCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  chevronCircleOpen: { transform: [{ rotate: '180deg' }], backgroundColor: '#fef9c3' },
  cardDropdown: { backgroundColor: '#fafafa', padding: 16 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },
  detailsGrid: { flexDirection: 'row', gap: 16 },
  detailsLeft: { flex: 1 },
  detailsRight: { flex: 1 },
  detailLabel: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', letterSpacing: 0.5, marginBottom: 6 },
  methodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  methodText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  privacyBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  privacyText: { fontSize: 11, fontWeight: 'bold' },
  bgGray: { backgroundColor: '#f3f4f6' }, textGray: { color: '#6b7280' },
  bgGreenBadge: { backgroundColor: '#dcfce7' }, textGreenBadge: { color: '#15803d' },
  
  // FIXED: Bukti transfer vertikal (memanjang kebawah)
  proofImagePortrait: { width: '100%', height: 220, borderRadius: 8, backgroundColor: '#e2e8f0' },
  
  noProofBox: { height: 150, backgroundColor: '#f3f4f6', borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  noProofText: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic' },
  emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.7 },
  emptyText: { color: '#9ca3af', marginTop: 10 },

  // Donatur Styles (No changes)
  heroSection: { alignItems: 'center', padding: 24, paddingTop: 40 },
  heroImage: { width: 140, height: 140, marginBottom: 15 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  heroSubtitle: { fontSize: 12, color: '#e5e7eb', textAlign: 'center', marginTop: 5, maxWidth: 250 },
  formCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
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