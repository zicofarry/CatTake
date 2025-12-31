import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Image, ImageBackground, Alert, Modal, ActivityIndicator, 
  RefreshControl, SafeAreaView, Dimensions, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// --- MOCK DATA ---
const MOCK_SEARCH_RESULTS = [
  { id: 1, cat_name: 'Mochi', owner_name: 'Andi', photo: 'https://placekitten.com/100/100' },
  { id: 2, cat_name: 'Moka', owner_name: 'Budi', photo: 'https://placekitten.com/101/101' },
];

const MOCK_HISTORY = [
  {
    id: 101,
    report_type: 'stray',
    created_at: '2025-05-20T08:30:00Z',
    location: 'Jl. Margonda Raya No. 12, Depok',
    description: 'Kucing oren pincang kaki belakang.',
    photo: null, 
    assignment_status: 'in_transit'
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function ReportScreen() {
  const [activeUserTab, setActiveUserTab] = useState<'create' | 'history'>('create');
  const [activeReportType, setActiveReportType] = useState<'stray' | 'missing' | 'my_lost'>('stray');

  // Form States
  const [reportLocation, setReportLocation] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [selectedLostCat, setSelectedLostCat] = useState<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Lost Cat Form State
  const [lostForm, setLostForm] = useState({
    name: '', age: '', breed: '', color: '', description: '',
    last_seen_address: '', reward_amount: '', shareToCommunity: false
  });
  const [lostImage, setLostImage] = useState<string | null>(null);

  // UI States
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // --- METHODS ---
  const fetchHistory = () => {
    setIsLoadingHistory(true);
    setTimeout(() => {
      setHistoryData(MOCK_HISTORY);
      setIsLoadingHistory(false);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (activeUserTab === 'history') fetchHistory();
  }, [activeUserTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeUserTab === 'history') fetchHistory();
    else setTimeout(() => setRefreshing(false), 1000);
  }, [activeUserTab]);

  const pickImage = async (isLostForm: boolean = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      if (isLostForm) setLostImage(result.assets[0].uri);
      else setReportImage(result.assets[0].uri);
    }
  };

  const handleSearchInput = (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    setTimeout(() => {
      const filtered = MOCK_SEARCH_RESULTS.filter(item => 
        item.cat_name.toLowerCase().includes(text.toLowerCase()) || 
        item.owner_name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const selectLostCat = (cat: any) => {
    setSearchQuery(`${cat.cat_name} - ${cat.owner_name}`);
    setSelectedLostCat(cat);
    setShowDropdown(false);
  };

  const submitDiscoveryReport = () => {
    if (!reportLocation || !reportDescription || !reportImage) {
      Alert.alert("Belum Lengkap", "Mohon lengkapi lokasi, deskripsi, dan foto.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Sukses", "Laporan berhasil dikirim! (Simulasi)");
      setReportLocation(''); setReportDescription(''); setReportImage(null);
      setSearchQuery(''); setSelectedLostCat(null); setActiveUserTab('history');
    }, 2000);
  };

  const submitLostAd = () => {
    if (!lostForm.name || !lostImage) {
      Alert.alert("Belum Lengkap", "Mohon lengkapi nama dan foto kucing.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Sukses", "Iklan Kehilangan berhasil diposting! (Simulasi)");
      setLostForm({
        name: '', age: '', breed: '', color: '', description: '',
        last_seen_address: '', reward_amount: '', shareToCommunity: false
      });
      setLostImage(null);
    }, 2000);
  };

  // --- RENDER ---
  const renderCreateTab = () => (
    <View style={styles.createContainer}>
      <View style={styles.categoryButtons}>
        <TouchableOpacity 
          style={[styles.catBtn, activeReportType === 'stray' && styles.catBtnActive]}
          onPress={() => setActiveReportType('stray')}
        >
          <Text style={[styles.catBtnText, activeReportType === 'stray' && styles.catBtnTextActive]}>Nemu Liar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.catBtn, activeReportType === 'missing' && styles.catBtnActive]}
          onPress={() => setActiveReportType('missing')}
        >
          <Text style={[styles.catBtnText, activeReportType === 'missing' && styles.catBtnTextActive]}>Nemu Hilang</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.catBtn, activeReportType === 'my_lost' && styles.catBtnActiveRed]}
          onPress={() => setActiveReportType('my_lost')}
        >
          <Text style={[styles.catBtnText, activeReportType === 'my_lost' && styles.catBtnTextActive]}>Saya Hilang!</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        {activeReportType !== 'my_lost' ? (
          <View style={styles.formContent}>
            
            {activeReportType === 'missing' && (
              <View style={{zIndex: 10, marginBottom: 15}}>
                <Text style={styles.label}>Cari Data Kucing Hilang</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="search" size={20} color="#9ca3af" />
                  <TextInput 
                    style={styles.input}
                    placeholder="Cari: 'Mochi' atau 'Andi'..."
                    value={searchQuery}
                    onChangeText={handleSearchInput}
                  />
                  {isSearching && <ActivityIndicator size="small" color="#EBCD5E" />}
                </View>
                {showDropdown && searchResults.length > 0 && (
                  <View style={styles.dropdown}>
                    {searchResults.map((item: any) => (
                      <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => selectLostCat(item)}>
                        <Image source={{ uri: item.photo }} style={styles.dropdownImg} />
                        <View>
                          <Text style={styles.dropdownTitle}>{item.cat_name}</Text>
                          <Text style={styles.dropdownSub}>Pemilik: {item.owner_name}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={styles.label}>Lokasi Ditemukan</Text>
            <View style={styles.locationRow}>
              <TouchableOpacity style={styles.mapButton} onPress={() => setMapModalVisible(true)}>
                 {/* maps.png */}
                 <Image source={require('../../assets/images/maps.png')} style={{width: '100%', height: '100%', opacity: 0.5}} resizeMode="cover" />
                 <View style={styles.mapOverlay}><Ionicons name="map" size={24} color="#ef4444" /></View>
              </TouchableOpacity>
              <TextInput 
                style={styles.locationInput}
                multiline
                placeholder="Klik peta atau ketik manual..."
                value={reportLocation}
                onChangeText={setReportLocation}
              />
            </View>

            <Text style={styles.label}>Deskripsi Kondisi</Text>
            <TextInput 
              style={[styles.textArea]}
              placeholder="Jelaskan ciri-ciri, kondisi luka, warna..."
              multiline
              numberOfLines={3}
              value={reportDescription}
              onChangeText={setReportDescription}
            />

            <Text style={styles.label}>Foto Bukti</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(false)}>
              {reportImage ? (
                <View style={{width: '100%', height: '100%'}}>
                  <Image source={{ uri: reportImage }} style={styles.previewImg} />
                  <View style={styles.reuploadBadge}><Text style={{color:'white', fontSize:10}}>Ganti Foto</Text></View>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="camera" size={30} color="#9ca3af" />
                  </View>
                  <Text style={{color: '#6b7280', marginTop: 8, fontWeight: '500'}}>Klik untuk ambil foto</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && {opacity: 0.7}]}
              onPress={submitDiscoveryReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="white"/> : <Text style={styles.submitBtnText}>Kirim Laporan</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContent}>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#991B1B" />
              <Text style={styles.infoText}>Data ini akan dipublikasikan agar komunitas bisa membantu mencari.</Text>
            </View>

            <View style={{flexDirection: 'row', gap: 10}}>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Nama Kucing</Text>
                    <TextInput style={styles.simpleInput} value={lostForm.name} onChangeText={(t)=>setLostForm({...lostForm, name: t})} placeholder="Mochi"/>
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Umur (Bulan)</Text>
                    <TextInput style={styles.simpleInput} keyboardType="numeric" value={lostForm.age} onChangeText={(t)=>setLostForm({...lostForm, age: t})} placeholder="12"/>
                </View>
            </View>

            <Text style={styles.label}>Ciri Khusus</Text>
            <TextInput style={[styles.textArea, {height: 80}]} multiline value={lostForm.description} onChangeText={(t)=>setLostForm({...lostForm, description: t})} placeholder="Ekor pendek..."/>

            <Text style={styles.label}>Lokasi Terakhir</Text>
            <View style={styles.locationRow}>
              <TouchableOpacity style={styles.mapButton} onPress={() => setMapModalVisible(true)}>
                 {/* PERBAIKAN: Pakai background.png */}
                 <Image source={require('../../assets/images/background.png')} style={{width: '100%', height: '100%', opacity: 0.5}} resizeMode="cover" />
                 <View style={styles.mapOverlay}><Ionicons name="map" size={24} color="#ef4444" /></View>
              </TouchableOpacity>
              <TextInput 
                style={styles.locationInput}
                multiline
                placeholder="Klik peta atau ketik..."
                value={lostForm.last_seen_address}
                onChangeText={(t)=>setLostForm({...lostForm, last_seen_address: t})}
              />
            </View>

            <Text style={styles.label}>Foto Kucing</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage(true)}>
              {lostImage ? (
                <Image source={{ uri: lostImage }} style={styles.previewImg} />
              ) : (
                <>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="camera" size={24} color="#9ca3af" />
                  </View>
                  <Text style={{color: '#6b7280', marginTop: 5, fontSize: 12}}>Upload Foto</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitBtnRed, isSubmitting && {opacity: 0.7}]}
              onPress={submitLostAd}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="white"/> : <Text style={styles.submitBtnText}>Pasang Iklan</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.historyContainer}>
      {historyData.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={require('../../assets/images/kucingtidur.png')} style={styles.emptyImg} />
          <Text style={styles.emptyText}>Kamu belum pernah membuat laporan.</Text>
        </View>
      ) : (
        historyData.map((item: any) => (
          <View key={item.id} style={styles.historyCard}>
            <Image source={item.photo ? { uri: item.photo } : require('../../assets/images/NULL.png')} style={styles.historyImg} />
            <View style={styles.historyContent}>
              <View style={styles.historyHeader}>
                <View style={[styles.badge, item.report_type === 'stray' ? styles.badgeOrange : styles.badgeBlue]}>
                  <Text style={[styles.badgeText, item.report_type === 'stray' ? {color:'#ea580c'} : {color:'#2563eb'}]}>
                    {item.report_type === 'stray' ? 'Liar' : 'Hilang'}
                  </Text>
                </View>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
              </View>
              <Text style={styles.historyId}>Laporan #{item.id}</Text>
              <Text style={styles.historyLoc} numberOfLines={1}>{item.location}</Text>
              <Text style={styles.historyDesc} numberOfLines={2}>"{item.description}"</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <ImageBackground source={require('../../assets/images/bg-texture.png')} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <SafeAreaView style={{flex: 1}}>
          <ScrollView contentContainerStyle={{paddingBottom: 100}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />}>
            
            <View style={styles.hero}>
              {/* tigakucing.png */}
              <Image 
                source={require('../../assets/images/tigakucing.png')} 
                style={styles.heroImage}
                resizeMode="contain"
              />
              <Text style={styles.heroTitle}>Lapor & Temukan</Text>
              <Text style={styles.heroSubtitle}>Laporkan penemuan kucing atau umumkan kucingmu yang hilang.</Text>
              
              <View style={styles.mainTabs}>
                <TouchableOpacity style={[styles.mainTabBtn, activeUserTab === 'create' && styles.mainTabActive]} onPress={() => setActiveUserTab('create')}>
                  <Ionicons name="create" size={18} color={activeUserTab === 'create' ? '#3A5F50' : 'white'} />
                  <Text style={[styles.mainTabText, activeUserTab === 'create' && {color: '#3A5F50'}]}>Buat Laporan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mainTabBtn, activeUserTab === 'history' && styles.mainTabActive]} onPress={() => setActiveUserTab('history')}>
                  <Ionicons name="time" size={18} color={activeUserTab === 'history' ? '#3A5F50' : 'white'} />
                  <Text style={[styles.mainTabText, activeUserTab === 'history' && {color: '#3A5F50'}]}>Riwayat Saya</Text>
                </TouchableOpacity>
              </View>
            </View>

            {activeUserTab === 'create' ? renderCreateTab() : renderHistoryTab()}

          </ScrollView>

          <Modal animationType="slide" transparent={true} visible={mapModalVisible} onRequestClose={() => setMapModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pilih Lokasi</Text>
                  <TouchableOpacity onPress={() => setMapModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                </View>
                <View style={styles.mapPlaceholder}>
                    <Text style={{color: '#6b7280'}}>Peta (Simulasi)</Text>
                    <Ionicons name="map" size={50} color="#d1d5db" />
                </View>
                <TouchableOpacity style={styles.modalBtn} onPress={() => {
                        const loc = "Lokasi Terpilih (Simulasi)";
                        if(activeReportType === 'my_lost') setLostForm({...lostForm, last_seen_address: loc});
                        else setReportLocation(loc);
                        setMapModalVisible(false);
                    }}>
                    <Text style={{color:'white', fontWeight:'bold'}}>Pilih Lokasi Ini</Text>
                </TouchableOpacity>
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
  overlay: { flex: 1, backgroundColor: 'rgba(44, 71, 60, 0.8)' },
  
  hero: { padding: 24, paddingTop: 40, alignItems: 'center' },
  heroImage: { width: 180, height: 120, marginBottom: 10 }, 
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },
  heroSubtitle: { color: '#e5e7eb', textAlign: 'center', marginTop: 8, maxWidth: 300, lineHeight: 20 },
  
  mainTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, padding: 4, marginTop: 24 },
  mainTabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, gap: 8 },
  mainTabActive: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  mainTabText: { fontWeight: 'bold', color: 'white' },

  createContainer: { paddingHorizontal: 20, marginTop: 10 },
  categoryButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  catBtn: { backgroundColor: 'rgba(255,255,255,0.8)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, minWidth: 100, alignItems: 'center' },
  catBtnActive: { backgroundColor: '#EBCD5E', transform: [{scale: 1.02}] },
  catBtnActiveRed: { backgroundColor: '#ef4444', transform: [{scale: 1.02}] },
  catBtnText: { fontWeight: 'bold', color: '#4b5563' },
  catBtnTextActive: { color: 'white' },

  formCard: { backgroundColor: 'white', borderRadius: 30, padding: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  formContent: { gap: 16 },
  
  label: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1f2937' },
  simpleInput: { backgroundColor: '#f3f4f6', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#1f2937' },
  textArea: { backgroundColor: '#f3f4f6', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#1f2937', textAlignVertical: 'top', minHeight: 80 },

  locationRow: { flexDirection: 'row', gap: 10 },
  mapButton: { width: 60, height: 60, borderRadius: 15, overflow: 'hidden', backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  mapOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  locationInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 15, paddingHorizontal: 15, fontSize: 16, color: '#1f2937' },

  dropdown: { position: 'absolute', top: 90, left: 0, right: 0, backgroundColor: 'white', borderRadius: 15, padding: 10, zIndex: 100, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, maxHeight: 200 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownImg: { width: 30, height: 30, borderRadius: 15, marginRight: 10, backgroundColor: '#eee' },
  dropdownTitle: { fontWeight: 'bold', fontSize: 14 },
  dropdownSub: { fontSize: 12, color: '#6b7280' },

  uploadBox: { height: 160, backgroundColor: '#f9fafb', borderRadius: 15, borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  previewImg: { width: '100%', height: '100%' },
  reuploadBadge: { position: 'absolute', bottom: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  submitBtn: { backgroundColor: '#EBCD5E', padding: 16, borderRadius: 25, alignItems: 'center', marginTop: 10, shadowColor: '#EBCD5E', shadowOpacity: 0.4, shadowOffset: {width: 0, height: 4}, elevation: 5 },
  submitBtnRed: { backgroundColor: '#ef4444', padding: 16, borderRadius: 25, alignItems: 'center', marginTop: 10, shadowColor: '#ef4444', shadowOpacity: 0.4, shadowOffset: {width: 0, height: 4}, elevation: 5 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  infoBox: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2', marginBottom: 10 },
  infoText: { color: '#991b1b', fontSize: 12, flex: 1 },

  historyContainer: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 50, backgroundColor: 'white', padding: 30, borderRadius: 30 },
  emptyImg: { width: 100, height: 80, marginBottom: 15, opacity: 0.6 },
  emptyText: { color: '#9ca3af', fontSize: 16 },

  historyCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: 'row', gap: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  historyImg: { width: 80, height: 80, borderRadius: 15, backgroundColor: '#f3f4f6' },
  historyContent: { flex: 1 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeOrange: { backgroundColor: '#ffedd5' },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeBlue: { backgroundColor: '#dbeafe' },
  badgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  dateText: { fontSize: 10, color: '#9ca3af' },
  historyId: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  historyLoc: { fontSize: 12, color: '#6b7280', marginVertical: 2 },
  historyDesc: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginBottom: 8 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
  trackBtn: { backgroundColor: '#EBCD5E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, height: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  mapPlaceholder: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  modalBtn: { backgroundColor: '#EBCD5E', padding: 15, borderRadius: 10, alignItems: 'center' },
});