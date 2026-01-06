import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, 
  Linking, FlatList, RefreshControl, Alert, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// IMPORT CLIENT PUSAT
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import CatCard from '../../components/CatCard'; 

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000'; 

export default function ShelterProfileScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  
  const [shelter, setShelter] = useState<any>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cats' | 'about'>('cats');
  const [refreshing, setRefreshing] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("Memuat alamat...");

  // --- HELPER GAMBAR ---
  const resolveImageUrl = (path: string | null, type: 'shelter' | 'cat' | 'qr' = 'cat') => {
    if (!path || path === 'null' || path === 'NULL' || path === 'null.png') {
        if (type === 'shelter') return require('../../assets/images/null-shelter.png');
        if (type === 'cat') return { uri: 'https://via.placeholder.com/150' };
        return null;
    }
    if (path.startsWith('http')) return { uri: path };
    return { uri: `${serverUrl}/public/img/${type === 'cat' ? 'cats' : 'shelters'}/${path}` };
  };

  // --- REVERSE GEOCODING (NOMINATIM) ---
  const fetchAddressText = async (lat: any, lon: any) => {
    try {
      if (!lat || !lon) return setResolvedAddress("Lokasi tidak tersedia");
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
        headers: { 'User-Agent': 'CatTake-App' }
      });
      const data = await res.json();
      setResolvedAddress(data.display_name || "Alamat tidak ditemukan");
    } catch (error) {
      setResolvedAddress("Gagal memuat alamat");
    }
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const [profileRes, catsRes] = await Promise.all([
        apiClient.get(`/users/profile/${id}/shelter`),
        apiClient.get(`/cats/shelter/${id}`)
      ]);

      const shelterData = profileRes.data.data || profileRes.data;
      setShelter(shelterData);
      setCats(catsRes.data.data || catsRes.data || []);

      // Ambil alamat teks jika koordinat tersedia
      if (shelterData.latitude && shelterData.longitude) {
        fetchAddressText(shelterData.latitude, shelterData.longitude);
      }
    } catch (error: any) {
      console.error("Gagal load shelter:", error);
      if (error.response?.status === 404) router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (id) fetchData(); }, [id]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // --- TAMPILAN HEADER ---
  const renderHeader = () => {
    if (!shelter) return null;

    const tagline = shelter.bio ? shelter.bio.split('.')[0] : 'Menyelamatkan anabul dengan cinta.';
    const isVerified = Boolean(shelter.verified);

    return (
      <View style={styles.headerContainer}>
        <View style={styles.heroWrapper}>
            <LinearGradient colors={['#3A5F50', '#2c473c']} style={styles.bannerImage}>
                <View style={styles.bannerOverlay} />
            </LinearGradient>

            <View style={styles.profileImageWrapper}>
                <Image source={resolveImageUrl(shelter.photo, 'shelter')} style={styles.profileImage} />
                {isVerified && (
                    <View style={styles.verifiedBadgeLarge}>
                        <MaterialIcons name="verified" size={24} color="#3A5F50" />
                    </View>
                )}
            </View>
        </View>

        <View style={styles.shelterInfoCard}>
            <View className="flex-row items-center justify-center mb-2">
                <Text style={styles.shelterName}>{shelter.name}</Text>
                {isVerified && <MaterialIcons name="verified" size={20} color="#3B82F6" style={{marginLeft: 4}} />}
            </View>
            
            <View style={styles.typeTag}>
                 <FontAwesome5 name="hand-holding-heart" size={12} color="#3A5F50" style={{marginRight: 6}} />
                 <Text style={styles.typeTagText}>{shelter.organization_type || 'Shelter Mandiri'}</Text>
            </View>

            <Text style={styles.shelterTagline} numberOfLines={2}>"{tagline}"</Text>

            <TouchableOpacity 
                style={styles.locationRow} 
                onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${shelter.latitude},${shelter.longitude}`)}
            >
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText} numberOfLines={1}>{resolvedAddress}</Text>
                <Ionicons name="open-outline" size={14} color="#3A5F50" style={{marginLeft: 4}} />
            </TouchableOpacity>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{cats.length}</Text>
                    <Text style={styles.statLabel}>Siap Adopsi</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{shelter.established_date ? new Date(shelter.established_date).getFullYear() : '2024'}</Text>
                    <Text style={styles.statLabel}>Sejak</Text>
                </View>
            </View>

            <View style={styles.actionButtonContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.chatButton]} 
                  onPress={() => router.push({ pathname: `/chat/${shelter.id}`, params: { name: shelter.name, avatar: shelter.photo }})}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color="white" /> 
                  <Text style={styles.actionButtonTextWhite}>Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.donateButton]}
                    onPress={() => router.push({ pathname: '/(tabs)/donation', params: { shelterId: shelter.id }})}
                >
                  <FontAwesome5 name="donate" size={18} color="#3A5F50" />
                  <Text style={styles.actionButtonTextGreen}>Donasi</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'cats' && styles.tabActive]} onPress={() => setActiveTab('cats')}>
            <Text style={[styles.tabText, activeTab === 'cats' && styles.tabTextActive]}>KUCING ({cats.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'about' && styles.tabActive]} onPress={() => setActiveTab('about')}>
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>TENTANG KAMI</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#EBCD5E" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, headerTransparent: true, title: '', headerTintColor: 'white' }} />

      <FlatList
        data={activeTab === 'cats' ? cats : []}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.listColumnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
            <View style={styles.gridItem}>
                <CatCard
                    name={item.name}
                    breed={item.breed}
                    gender={item.gender}
                    status={item.adoption_status}
                    // Kirim hasil resolveImageUrl apa adanya (bisa Object atau Number)
                    imageUrl={resolveImageUrl(item.photo, 'cat')} 
                    onPress={
                      item.adoption_status === 'adopted' 
                        ? undefined // Jika sudah diadopsi, tidak bisa diklik
                        : () => router.push(`/adopt/${item.id}`)
                    }
                />
            </View>
        )}
        ListEmptyComponent={() => {
            if (activeTab === 'about') {
                return (
                    <View style={styles.aboutContainer}>
                        <View style={styles.aboutCard}>
                            <Text style={styles.sectionTitle}>Profil Shelter</Text>
                            
                            <View style={styles.infoRow}>
                                <View style={styles.infoIconBg}><MaterialIcons name="calendar-today" size={20} color="#3A5F50" /></View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Berdiri Sejak</Text>
                                    <Text style={styles.infoValue}>{shelter?.established_date ? new Date(shelter.established_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoIconBg}><MaterialIcons name="phone" size={20} color="#3A5F50" /></View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Kontak WhatsApp</Text>
                                    <Text style={styles.infoValue}>{shelter?.contact_phone || '-'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoIconBg}><FontAwesome name="bank" size={18} color="#3A5F50" /></View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Rekening Donasi</Text>
                                    <Text style={styles.infoValue}>{shelter?.donation_account_number || '-'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.aboutCard}>
                            <Text style={styles.sectionTitle}>QR Code Donasi</Text>
                            {shelter?.qr_img ? (
                                <Image source={resolveImageUrl(shelter.qr_img, 'qr')} style={{ width: '100%', height: 300, borderRadius: 12 }} resizeMode="contain" />
                            ) : (
                                <Text style={styles.emptyText}>QR Code belum tersedia.</Text>
                            )}
                        </View>
                    </View>
                );
            }
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>Belum Ada Kucing</Text>
                    <Text style={styles.emptyText}>Daftar kucing akan segera diupdate.</Text>
                </View>
            );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: { backgroundColor: '#F8F9FA' },
  heroWrapper: { position: 'relative', alignItems: 'center' },
  bannerImage: { height: 180, width: '100%', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileImageWrapper: { position: 'absolute', bottom: -50, alignItems: 'center' },
  profileImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#fff' },
  verifiedBadgeLarge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 15, padding: 4, elevation: 4 },
  shelterInfoCard: { marginTop: 60, marginHorizontal: 20, alignItems: 'center', paddingBottom: 20 },
  shelterName: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
  typeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  typeTagText: { color: '#3A5F50', fontSize: 12, fontWeight: '600' },
  shelterTagline: { fontSize: 14, color: '#718096', textAlign: 'center', fontStyle: 'italic', marginBottom: 12, paddingHorizontal: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 },
  locationText: { fontSize: 13, color: '#718096', marginLeft: 6, flex: 1 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', justifyContent: 'space-around', elevation: 2, marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#3A5F50' },
  statLabel: { fontSize: 12, color: '#A0AEC0' },
  statDivider: { width: 1, height: '80%', backgroundColor: '#E2E8F0' },
  actionButtonContainer: { flexDirection: 'row', width: '100%', gap: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 20, gap: 8 },
  chatButton: { backgroundColor: '#3A5F50' },
  donateButton: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#3A5F50' },
  actionButtonTextWhite: { color: 'white', fontWeight: 'bold' },
  actionButtonTextGreen: { color: '#3A5F50', fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#EBCD5E' },
  tabText: { fontSize: 12, fontWeight: 'bold', color: '#A0AEC0' },
  tabTextActive: { color: '#3A5F50' },
  listColumnWrapper: { gap: 15, paddingHorizontal: 20 },
  listContent: { paddingBottom: 40 },
  gridItem: { flex: 1, marginBottom: 15 },
  aboutContainer: { padding: 20 },
  aboutCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoIconBg: { width: 36, height: 36, backgroundColor: '#E6FFFA', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#A0AEC0' },
  infoValue: { fontSize: 15, color: '#2D3748', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748' },
  emptyText: { color: '#A0AEC0', textAlign: 'center', marginTop: 5 },
});