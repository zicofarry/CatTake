import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// IMPORT CLIENT PUSAT
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import CatCard from '../../components/CatCard'; 

const { width } = Dimensions.get('window');

// SETUP URL GAMBAR DINAMIS
const serverUrl = API_BASE_URL 
  ? API_BASE_URL.replace('/api/v1', '') 
  : 'http://localhost:3000'; 

export default function ShelterProfileScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [shelter, setShelter] = useState<any>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cats' | 'about'>('cats');
  const [refreshing, setRefreshing] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const [profileRes, catsRes] = await Promise.all([
        apiClient.get(`/users/profile/${id}/shelter`),
        apiClient.get(`/cats/shelter/${id}`)
      ]);

      setShelter(profileRes.data.data || profileRes.data);
      const catsData = catsRes.data.data || catsRes.data;
      setCats(Array.isArray(catsData) ? catsData : []);

    } catch (error: any) {
      console.error("Gagal load shelter:", error);
      if (error.response?.status === 404) {
        Alert.alert("Tidak Ditemukan", "Data shelter tidak ditemukan.");
        router.back();
      } else if (error.response?.status === 401) {
         Alert.alert("Akses Ditolak", "Silakan login kembali.", [
            { text: "Login", onPress: () => router.replace('/login') }
         ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const openWhatsApp = (phone: string) => {
    if (!phone) return Alert.alert("Info", "Nomor WhatsApp tidak tersedia.");
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) formatted = '62' + formatted.slice(1);
    Linking.openURL(`https://wa.me/${formatted}`);
  };

  // Fungsi Buka Maps dengan Koordinat
  const openMaps = (lat: any, long: any) => {
    if (!lat || !long) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${long}`;
    const label = shelter?.name || 'Shelter Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    if (url) Linking.openURL(url);
  };

  // --- HEADER TAMPILAN BARU ---
  const renderHeader = () => {
    if (!shelter) return null;

    const profileImg = shelter.photo 
      ? { uri: `${serverUrl}/public/img/profile/${shelter.photo}` }
      : require('../../assets/images/profileKomunitas1.png'); 

    const tagline = shelter.bio ? shelter.bio.split('.')[0] : 'Menyelamatkan dan mencarikan rumah bagi kucing jalanan.';

    return (
      <View style={styles.headerContainer}>
        {/* 1. Banner Hero Imersif */}
        <View style={styles.heroWrapper}>
            <LinearGradient
                colors={['#3A5F50', '#2c473c']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.bannerImage}
            >
                <View style={styles.bannerOverlay} />
            </LinearGradient>

            {/* Foto Profil di Tengah */}
            <View style={styles.profileImageWrapper}>
                <Image source={profileImg} style={styles.profileImage} />
                {shelter.verified && (
                    <View style={styles.verifiedBadgeLarge}>
                        <MaterialIcons name="verified" size={24} color="#3A5F50" />
                    </View>
                )}
            </View>
        </View>

        {/* 2. Kartu Informasi Shelter */}
        <View style={styles.shelterInfoCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6}}>
                <Text style={styles.shelterName}>{shelter.name}</Text>
                {shelter.verified && (
                    <MaterialIcons name="verified" size={20} color="#3B82F6" style={{marginLeft: 4, marginTop: 2}} />
                )}
            </View>
            
            <View style={styles.typeTag}>
                 <FontAwesome5 name="hand-holding-heart" size={12} color="#3A5F50" style={{marginRight: 6}} />
                 <Text style={styles.typeTagText}>{shelter.organization_type || 'Komunitas Pecinta Kucing'}</Text>
            </View>

            <Text style={styles.shelterTagline} numberOfLines={2}>
                "{tagline}."
            </Text>

            {/* --- UPDATE: MENAMPILKAN LATITUDE & LONGITUDE --- */}
            <TouchableOpacity 
                style={styles.locationRow} 
                onPress={() => openMaps(shelter.latitude, shelter.longitude)}
                activeOpacity={shelter.latitude ? 0.7 : 1}
            >
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {shelter.latitude && shelter.longitude 
                    ? `${shelter.latitude}, ${shelter.longitude}` 
                    : 'Lokasi belum diatur'}
                </Text>
            </TouchableOpacity>
            {/* ----------------------------------------------- */}

            {/* Statistik Ringkas */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{cats.length}</Text>
                    <Text style={styles.statLabel}>Siap Adopsi</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{shelter.created_at ? new Date(shelter.created_at).getFullYear() : '2024'}</Text>
                    <Text style={styles.statLabel}>Berdiri Sejak</Text>
                </View>
            </View>

            {/* Tombol Aksi Utama */}
            <View style={styles.actionButtonContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.chatButton]} 
                  onPress={() => openWhatsApp(shelter.contact_phone)}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="whatsapp" size={20} color="white" />
                  <Text style={styles.actionButtonTextWhite}>Hubungi Kami</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.donateButton]}
                    activeOpacity={0.8}
                >
                  <FontAwesome5 name="donate" size={18} color="#3A5F50" />
                  <Text style={styles.actionButtonTextGreen}>Donasi</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* 3. Tab Menu */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'cats' && styles.tabActive]}
            onPress={() => setActiveTab('cats')}
          >
            <Text style={[styles.tabText, activeTab === 'cats' && styles.tabTextActive]}>SIAP DIADOPSI ({cats.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>TENTANG KAMI</Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'cats' && cats.length > 0 && (
            <View style={styles.listHeaderTitle}>
                <Text style={styles.headerTitleText}>Teman Berbulu Mencari Rumah</Text>
                <Text style={styles.headerSubtitleText}>Pilih dan berikan mereka kesempatan kedua.</Text>
            </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EBCD5E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        headerTransparent: true, 
        title: '',
        headerTintColor: 'white',
        headerLeft: () => (
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButton}
                activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
        )
      }} />

      <FlatList
        data={activeTab === 'cats' ? cats : []}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.listColumnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EBCD5E']} />
        }
        initialNumToRender={6}
        renderItem={({ item }) => {
            if (activeTab !== 'cats') return null;
            return (
                <View style={styles.gridItem}>
                    <CatCard
                        name={item.name}
                        breed={item.breed}
                        age={item.age}
                        gender={item.gender}
                        status={item.adoption_status}
                        imageUrl={item.photo ? `${serverUrl}/public/img/cats/${item.photo}` : 'https://via.placeholder.com/150'}
                        onPress={() => router.push(`/adopt/${item.id}`)}
                    />
                </View>
            );
        }}
        ListEmptyComponent={() => {
            if (activeTab === 'about') {
                return (
                    <View style={styles.aboutContainer}>
                        <View style={styles.aboutCard}>
                            <Text style={styles.sectionTitle}>Visi & Misi Kami</Text>
                            <Text style={styles.aboutText}>{shelter?.bio || 'Belum ada deskripsi yang ditambahkan.'}</Text>
                        </View>
                        <View style={styles.aboutCard}>
                            <Text style={styles.sectionTitle}>Informasi Kontak & Donasi</Text>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconBg}><MaterialIcons name="person" size={20} color="#3A5F50" /></View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Penanggung Jawab</Text>
                                    <Text style={styles.infoValue}>{shelter?.pj_name || '-'}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconBg}><FontAwesome name="bank" size={18} color="#3A5F50" /></View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Rekening Donasi</Text>
                                    <Text style={styles.infoValue}>{shelter?.donation_account_number || '-'}</Text>
                                    <Text style={styles.infoSubValue}>A.n {shelter?.name || '-'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={styles.emptyContainer}>
                         <Image source={require('../../assets/images/tigakucing.png')} style={{width: 120, height: 120, opacity:0.5, marginBottom: 16}} resizeMode="contain" />
                        <Text style={styles.emptyTitle}>Belum Ada Kucing</Text>
                        <Text style={styles.emptyText}>Shelter ini belum menambahkan daftar kucing yang siap diadopsi.</Text>
                    </View>
                );
            }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
  backButton: {
    width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 10,
  },

  headerContainer: { backgroundColor: '#F8F9FA', marginBottom: 10 },
  heroWrapper: { position: 'relative', alignItems: 'center' },
  bannerImage: { height: 180, width: '100%', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  
  profileImageWrapper: {
    position: 'absolute', bottom: -50, alignItems: 'center', justifyContent: 'center',
  },
  profileImage: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#fff', backgroundColor: '#eee',
  },
  verifiedBadgeLarge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 15, padding: 4, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.2, shadowRadius:4, elevation:4
  },

  shelterInfoCard: {
    marginTop: 60, marginHorizontal: 20, alignItems: 'center', paddingBottom: 20,
  },
  shelterName: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', textAlign: 'center', marginBottom: 0 },
  
  typeTag: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12, marginTop: 8
  },
  typeTagText: { color: '#3A5F50', fontSize: 12, fontWeight: '600' },
  shelterTagline: { fontSize: 14, color: '#718096', textAlign: 'center', fontStyle: 'italic', marginBottom: 16, paddingHorizontal: 20 },
  
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  locationText: { fontSize: 14, color: '#718096', marginLeft: 6 },

  statsContainer: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 30, width: '100%', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 24,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#3A5F50' },
  statLabel: { fontSize: 12, color: '#A0AEC0', marginTop: 4 },
  statDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0' },

  actionButtonContainer: { flexDirection: 'row', width: '100%', gap: 12 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 25, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  chatButton: { backgroundColor: '#3A5F50' },
  donateButton: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#3A5F50' },
  actionButtonTextWhite: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  actionButtonTextGreen: { color: '#3A5F50', fontWeight: 'bold', fontSize: 15 },

  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginTop: 10, marginHorizontal: 20 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#EBCD5E' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#A0AEC0', letterSpacing: 0.5 },
  tabTextActive: { color: '#3A5F50' },

  listHeaderTitle: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 10 },
  headerTitleText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  headerSubtitleText: { fontSize: 14, color: '#718096', marginTop: 4 },
  listColumnWrapper: { gap: 16, paddingHorizontal: 20 },
  listContent: { paddingBottom: 40 },
  gridItem: { flex: 1, marginBottom: 16 },

  aboutContainer: { padding: 20 },
  aboutCard: {
    backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 16 },
  aboutText: { fontSize: 15, color: '#4A5568', lineHeight: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIconBg: { width: 40, height: 40, backgroundColor: '#E6FFFA', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#A0AEC0', marginBottom: 2 },
  infoValue: { fontSize: 16, color: '#2D3748', fontWeight: '600' },
  infoSubValue: { fontSize: 13, color: '#718096', marginTop: 2 },

  emptyContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginTop: 10 },
  emptyText: { marginTop: 8, color: '#A0AEC0', fontSize: 14, textAlign: 'center' },
});