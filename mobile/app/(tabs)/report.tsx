import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, 
  Image, ImageBackground, Alert, Modal, ActivityIndicator, 
  RefreshControl, SafeAreaView, Dimensions, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import apiClient, { API_BASE_URL } from '@/api/apiClient';

const { width, height } = Dimensions.get('window');
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

export default function ReportScreen() {
  // --- STATES UTAMA ---
  const [userRole, setUserRole] = useState('guest');
  const [activeUserTab, setActiveUserTab] = useState<'create' | 'history'>('create');
  const [activeReportType, setActiveReportType] = useState<'stray' | 'missing' | 'my_lost'>('stray');
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Penemuan & Kehilangan)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    lat: '',
    long: '',
    lost_cat_id: null as number | null,
    // Field khusus iklan kehilangan
    name: '', age: '', breed: '', color: '', reward: '', shareToCommunity: false
  });
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Search Kucing Hilang State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // History & UI State
  const [myHistory, setMyHistory] = useState([]);
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // --- FETCH DATA ---
  const loadData = async () => {
    const role = await AsyncStorage.getItem('userRole') || 'guest';
    setUserRole(role);
    if (activeUserTab === 'history') fetchUserHistory();
  };

  const fetchUserHistory = async () => {
    try {
      const res = await apiClient.get('/reports/my-history');
      setMyHistory(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, [activeUserTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, [activeUserTab]);

  // --- HANDLERS ---
  
  // 1. Fitur Search Kucing Hilang (Autocomplete)
  const handleSearchInput = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    
    setIsSearching(true);
    setShowDropdown(true);
    try {
      const res = await apiClient.get(`/lost-cats/search?q=${text}`);
      setSearchResults(res.data);
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const selectLostCat = (cat: any) => {
    setSearchQuery(`${cat.cat_name} - ${cat.owner_name}`);
    setForm({ ...form, lost_cat_id: cat.id });
    setShowDropdown(false);
  };

  // 2. Ambil Foto (Fix Format FormData)
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

  // 3. Peta Leaflet Logic
  const handleMapMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    setForm({ ...form, location: data.address, lat: data.lat, long: data.lng });
    setMapModalVisible(false);
  };

  // 4. Submit Laporan (Discovery & Lost Ad)
  const handleSubmit = async () => {
    if (!form.location || !form.description || !selectedImage) {
      return Alert.alert("Peringatan", "Mohon lengkapi lokasi, deskripsi, dan foto.");
    }

    setIsSubmitting(true);
    const formData = new FormData();

    if (activeReportType === 'my_lost') {
      // Endpoint Iklan Kehilangan
      formData.append('name', form.name);
      formData.append('age', form.age);
      formData.append('breed', form.breed);
      formData.append('color', form.color);
      formData.append('description', form.description);
      formData.append('last_seen_address', form.location);
      formData.append('reward_amount', form.reward);
      formData.append('share_to_community', form.shareToCommunity ? '1' : '0');
    } else {
      // Endpoint Laporan Penemuan (Stray/Missing)
      formData.append('report_type', activeReportType);
      formData.append('location', form.location);
      formData.append('description', form.description);
      formData.append('lat', form.lat || '0');
      formData.append('long', form.long || '0');
      if (form.lost_cat_id) formData.append('lost_cat_id', form.lost_cat_id.toString());
    }

    // PENTING: Fix Not-Null Constraint dengan format objek file RN
    formData.append('photo', selectedImage as any);

    try {
      const endpoint = activeReportType === 'my_lost' ? '/lost-cats' : '/reports';
      await apiClient.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      Alert.alert("Sukses", "Laporan berhasil diproses!");
      setActiveUserTab('history');
      resetForm();
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.error || "Terjadi kesalahan server.");
    } finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', location: '', lat: '', long: '', lost_cat_id: null, name: '', age: '', breed: '', color: '', reward: '', shareToCommunity: false });
    setSelectedImage(null);
    setSearchQuery('');
  };

  const resolveImg = (path: string) => {
    if (!path || path.includes('NULL')) return 'https://i.pravatar.cc/150';
    return path.startsWith('http') ? path : `${BASE_SERVER_URL}${path}`;
  };

  // --- UI COMPONENTS ---

  const LeafletMap = () => (
    <WebView 
      originWhitelist={['*']}
      onMessage={handleMapMessage}
      source={{ html: `
        <!DOCTYPE html><html><head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>#map { height: 100vh; width: 100vw; margin: 0; }</style></head>
        <body><div id="map"></div><script>
          var map = L.map('map').setView([-6.9175, 107.6191], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          var marker;
          map.on('click', function(e) {
            if (marker) map.removeLayer(marker);
            marker = L.marker(e.latlng).addTo(map);
            fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+e.latlng.lat+'&lon='+e.latlng.lng)
              .then(r => r.json()).then(d => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ address: d.display_name, lat: e.latlng.lat, lng: e.latlng.lng }));
              });
          });
        </script></body></html>
      `}}
    />
  );

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={styles.container}
      resizeMode="repeat"
      imageStyle={{ width: 150, height: 150, opacity: 0.15 }}
    >
      <SafeAreaView style={{flex: 1}}>
        <StatusBar barStyle="light-content" />
        <ScrollView 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          contentContainerStyle={{paddingBottom: 100}}
        >
          {/* Header Hero (Sama kayak Vue) */}
          <View style={styles.hero}>
            <Image source={require('../../assets/images/tigakucing.png')} style={styles.heroImg} resizeMode="contain" />
            <Text style={styles.heroTitle}>Lapor & Temukan</Text>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity style={[styles.tabBtn, activeUserTab === 'create' && styles.tabActive]} onPress={() => setActiveUserTab('create')}>
                <Text style={[styles.tabText, activeUserTab === 'create' && {color: '#3A5F50'}]}>Buat Laporan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, activeUserTab === 'history' && styles.tabActive]} onPress={() => setActiveUserTab('history')}>
                <Text style={[styles.tabText, activeUserTab === 'history' && {color: '#3A5F50'}]}>Riwayat Saya</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeUserTab === 'create' ? (
            <View style={{padding: 20}}>
              {/* Tipe Laporan */}
              <View style={styles.typeRow}>
                {(['stray', 'missing', 'my_lost'] as const).map(t => (
                  <TouchableOpacity key={t} onPress={() => setActiveReportType(t)} style={[styles.typeBtn, activeReportType === t && (t==='my_lost'?styles.btnRed:styles.btnYellow)]}>
                    <Text style={[styles.typeText, activeReportType === t && {color:'#fff'}]}>{t==='stray'?'Nemu Liar':t==='missing'?'Nemu Hilang':'Saya Hilang'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.cardForm}>
                {/* Search Bar Khusus Nemu Hilang */}
                {activeReportType === 'missing' && (
                  <View style={{zIndex: 100, marginBottom: 15}}>
                    <Text style={styles.label}>Cari Data Kucing Hilang</Text>
                    <View style={styles.searchBox}>
                      <Ionicons name="search" size={18} color="#94a3b8" />
                      <TextInput style={{flex: 1, marginLeft: 10}} placeholder="Nama kucing atau pemilik..." value={searchQuery} onChangeText={handleSearchInput} />
                    </View>
                    {showDropdown && searchResults.length > 0 && (
                      <View style={styles.dropdown}>
                        {searchResults.map((item: any) => (
                          <TouchableOpacity key={item.id} style={styles.dropdownItem} onPress={() => selectLostCat(item)}>
                            <Image source={{ uri: resolveImg(item.photo) }} style={styles.dropImg} />
                            <View><Text style={{fontWeight:'bold'}}>{item.cat_name}</Text><Text style={{fontSize:10}}>Pemilik: {item.owner_name}</Text></View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Form Khusus Saya Hilang */}
                {activeReportType === 'my_lost' && (
                   <View style={{gap: 12, marginBottom: 15}}>
                      <TextInput style={styles.inputRow} placeholder="Nama Kucing" value={form.name} onChangeText={t=>setForm({...form, name:t})} />
                      <TextInput style={styles.inputRow} placeholder="Umur (Bulan)" keyboardType="numeric" value={form.age} onChangeText={t=>setForm({...form, age:t})} />
                   </View>
                )}

                <Text style={styles.label}>Lokasi Kejadian</Text>
                <View style={styles.locationBox}>
                  <TouchableOpacity style={styles.mapBtn} onPress={() => setMapModalVisible(true)}>
                    <Image source={require('../../assets/images/maps.png')} style={styles.mapThumb} />
                    <Ionicons name="location" size={24} color="red" style={{position:'absolute'}} />
                  </TouchableOpacity>
                  <TextInput style={styles.locInput} placeholder="Klik peta atau ketik alamat..." value={form.location} onChangeText={t=>setForm({...form, location:t})} multiline />
                </View>

                <Text style={styles.label}>Deskripsi Kondisi</Text>
                <TextInput style={[styles.inputRow, {height: 80, textAlignVertical:'top'}]} placeholder="Jelaskan ciri-ciri, warna, atau luka..." value={form.description} onChangeText={t=>setForm({...form, description:t})} multiline />

                <Text style={styles.label}>Foto Bukti</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage.uri }} style={styles.previewImg} />
                  ) : (
                    <View style={{alignItems:'center'}}><Ionicons name="camera" size={40} color="#cbd5e1" /><Text style={{color:'#94a3b8', fontSize: 12}}>Klik untuk ambil foto</Text></View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.submitBtn, activeReportType === 'my_lost' && {backgroundColor:'#ef4444'}]} onPress={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Kirim Laporan</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{padding: 20}}>
              {myHistory.map((item: any) => (
                <View key={item.id} style={styles.historyCard}>
                  <Image source={{ uri: resolveImg(item.photo) }} style={styles.histImg} />
                  <View style={{flex: 1}}>
                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                      <Text style={{fontWeight:'bold'}}>Laporan #{item.id}</Text>
                      <View style={[styles.badge, {backgroundColor: item.assignment_status === 'completed' ? '#d1fae5' : '#fef3c7'}]}>
                        <Text style={{fontSize: 8, fontWeight:'bold'}}>{(item.assignment_status || 'PENDING').toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: 12, color: '#64748b', marginTop: 4}} numberOfLines={1}>{item.location}</Text>
                    <Text style={{fontSize: 10, color: '#94a3b8', marginTop: 2}}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* MODAL PETA */}
        <Modal visible={mapModalVisible} animationType="slide">
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.modalHeader}>
              <Text style={{fontWeight:'bold', fontSize: 18}}>Pilih Lokasi</Text>
              <TouchableOpacity onPress={() => setMapModalVisible(false)}><Ionicons name="close" size={28} /></TouchableOpacity>
            </View>
            <LeafletMap />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c473c' },
  hero: { padding: 24, alignItems: 'center', paddingTop: 30 },
  heroImg: { width: 160, height: 100, marginBottom: 10 },
  heroTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, padding: 4, marginTop: 25 },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontWeight: 'bold', color: '#fff', fontSize: 13 },
  
  typeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  typeBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)' },
  btnYellow: { backgroundColor: '#EBCD5E' },
  btnRed: { backgroundColor: '#ef4444' },
  typeText: { fontWeight: 'bold', color: '#64748b', fontSize: 12 },

  cardForm: { backgroundColor: '#fff', borderRadius: 30, padding: 20, elevation: 5 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  inputRow: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, fontSize: 14 },
  locationBox: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  mapBtn: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', alignItems:'center', justifyContent:'center' },
  mapThumb: { width: '100%', height: '100%', opacity: 0.6 },
  locInput: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, padding: 10, fontSize: 12 },
  uploadBox: { height: 140, backgroundColor: '#f8fafc', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%' },
  submitBtn: { backgroundColor: '#EBCD5E', padding: 16, borderRadius: 15, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, height: 45 },
  dropdown: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: '#fff', elevation: 10, borderRadius: 15, zIndex: 1000 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  dropImg: { width: 30, height: 30, borderRadius: 15 },

  historyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 12, flexDirection: 'row', gap: 12, marginBottom: 12 },
  histImg: { width: 70, height: 70, borderRadius: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }
});