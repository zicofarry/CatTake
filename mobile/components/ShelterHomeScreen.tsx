import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Dimensions, RefreshControl, StatusBar, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../api/apiClient';

const { width } = Dimensions.get('window');

export default function ShelterHomeScreen() {
  const router = useRouter();
  const [shelterName, setShelterName] = useState('Partner');
  const [isVerified, setIsVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // State untuk Data Dashboard (Sama seperti Vue)
  const [dashboardData, setDashboardData] = useState({
    incoming_rescue: 0,
    pending_adoption: 0,
    managed_cats: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        // 1. Ambil Profil Shelter (Nama & Status Verifikasi)
        const profileRes = await apiClient.get(`/users/profile/${id}/shelter`);
        setShelterName(profileRes.data.name || 'Partner');
        setIsVerified(profileRes.data.is_verified_shelter || false);

        // 2. Ambil Statistik Dashboard (Endpoint sama dengan Vue)
        try {
            const dashRes = await apiClient.get('/dashboard'); // Pastikan endpoint ini ada di backend
            setDashboardData(dashRes.data.data);
        } catch (err) {
            console.log("Endpoint /dashboard error, pakai data manual/fallback");
            // Fallback: Hitung manual jika endpoint dashboard khusus belum ada
            const catsRes = await apiClient.get(`/cats/shelter/${id}`);
            const rescueRes = await apiClient.get('/rescue/shelter-history'); // Asumsi ada endpoint ini
            
            setDashboardData({
                incoming_rescue: rescueRes.data ? rescueRes.data.filter((r:any) => r.status === 'pending').length : 0,
                pending_adoption: 0, // Perlu endpoint khusus
                managed_cats: catsRes.data.length || 0
            });
        }
      }
    } catch (error) {
      console.error("Gagal load data shelter:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // --- MENU BUTTONS (Sesuai Web + Ditambah Driver) ---
  const menuItems = [
    { 
      title: 'Misi Rescue', 
      subtitle: 'Tugaskan driver',
      icon: 'map-marked-alt', 
      library: 'FontAwesome5',
      color: '#EBCD5E', 
      bgColor: '#FFFBEB', // yellow-50
      route: '/shelter/rescue' // Arahkan ke page rescue nanti
    },
    { 
      title: 'Calon Adopter', 
      subtitle: 'Seleksi berkas',
      icon: 'users', 
      library: 'FontAwesome5',
      color: '#3B82F6', 
      bgColor: '#EFF6FF', // blue-50
      route: '/shelter/adopt' 
    },
    { 
      title: 'Laporan Donasi', 
      subtitle: 'Cek pemasukan',
      icon: 'hand-holding-heart', 
      library: 'FontAwesome5',
      color: '#A855F7', 
      bgColor: '#FAF5FF', // purple-50
      route: '/(tabs)/donation' 
    },
    { 
      title: 'Kucing Saya', 
      subtitle: 'Tambah & edit',
      icon: 'paw', 
      library: 'FontAwesome5',
      color: '#3A5F50', 
      bgColor: '#ECFDF5', // green-50
      route: '/shelter/dashboard' 
    },
    // [BARU: Driver]
    { 
      title: 'Driver', 
      subtitle: 'Pilih & Kelola',
      icon: 'car', 
      library: 'FontAwesome5',
      color: '#F97316', // Orange
      bgColor: '#FFF7ED', // orange-50
      route: '/shelter/driver' 
    }
  ];

  const renderIcon = (item: any) => {
    if (item.library === 'FontAwesome5') return <FontAwesome5 name={item.icon} size={24} color={item.color} />;
    return <Ionicons name={item.icon} size={28} color={item.color} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        
        {/* === HEADER BACKGROUND (Gradient Hijau) === */}
        <LinearGradient 
          colors={['#1F352C', '#3A5F50']} 
          style={styles.headerBackground}
        >
          <View style={styles.headerContent}>
            {/* Tag Dashboard */}
            <View style={styles.dashboardTag}>
              <View style={styles.iconTagBg}>
                <Ionicons name="home" size={12} color="#fff" />
              </View>
              <Text style={styles.dashboardTagText}>DASHBOARD PARTNER</Text>
            </View>

            {/* Greeting - Klik untuk Edit Profil */}
            <TouchableOpacity onPress={() => router.push('/shelter/edit-profile')}>
                <Text style={styles.greetingTitle}>Halo, {shelterName}! 👋</Text>
            </TouchableOpacity>
            
            <Text style={styles.greetingSubtitle}>
              Siap menyelamatkan nyawa hari ini? Berikut ringkasan aktivitas sheltermu.
            </Text>

            {/* Status Akun Badge */}
            <View style={styles.statusBadge}>
                <View style={{alignItems: 'flex-end', marginRight: 10}}>
                    <Text style={styles.statusLabel}>STATUS AKUN</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                        <Ionicons 
                            name={isVerified ? "checkmark-circle" : "time"} 
                            size={14} 
                            color={isVerified ? "#EBCD5E" : "#fef08a"} 
                        />
                        <Text style={[styles.statusValue, { color: isVerified ? "#EBCD5E" : "#fef08a" }]}>
                            {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
                        </Text>
                    </View>
                </View>
                <Image source={require('../assets/images/cathelo.png')} style={styles.statusLogo} />
            </View>
          </View>
        </LinearGradient>

        {/* === CONTENT SECTION (Negative Margin biar numpuk) === */}
        <View style={styles.mainContent}>
            
            {/* 1. STATS CARDS (Vertical Stack) */}
            <View style={styles.statsContainer}>
                
                {/* Card: Rescue Masuk */}
                <TouchableOpacity
                    style={[styles.statCard, { borderLeftColor: '#EBCD5E' }]}
                    onPress={() => router.push('/shelter/rescue')}
                >
                    <View style={styles.statRow}>
                        <View>
                            <Text style={styles.statLabel}>RESCUE MASUK</Text>
                            <Text style={styles.statValue}>{dashboardData.incoming_rescue}</Text>
                            <Text style={styles.statDesc}>Laporan masuk</Text>
                        </View>
                        <View style={[styles.statIconBox, { backgroundColor: '#FEF9C3' }]}>
                            <FontAwesome5 name="ambulance" size={24} color="#dcb945" />
                        </View>
                    </View>
                    <View style={styles.linkRow}>
                        <Text style={[styles.linkText, { color: '#dcb945' }]}>Lihat Laporan</Text>
                        <Ionicons name="arrow-forward" size={14} color="#dcb945" />
                    </View>
                </TouchableOpacity>

                {/* Card: Permintaan Adopsi */}
                <TouchableOpacity
                    style={[styles.statCard, { borderLeftColor: '#3A5F50' }]}
                    onPress={() => router.push('/shelter/adopt')}
                >
                    <View style={styles.statRow}>
                        <View>
                            <Text style={styles.statLabel}>PERMINTAAN ADOPSI</Text>
                            <Text style={styles.statValue}>{dashboardData.pending_adoption}</Text>
                            <Text style={styles.statDesc}>Menunggu verifikasi</Text>
                        </View>
                        <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
                            <FontAwesome5 name="clipboard-check" size={24} color="#3A5F50" />
                        </View>
                    </View>
                    <View style={styles.linkRow}>
                        <Text style={[styles.linkText, { color: '#3A5F50' }]}>Cek Pengajuan</Text>
                        <Ionicons name="arrow-forward" size={14} color="#3A5F50" />
                    </View>
                </TouchableOpacity>

                {/* Card: Kucing Dikelola */}
                <TouchableOpacity 
                    style={[styles.statCard, { borderLeftColor: '#2c473c' }]}
                    onPress={() => router.push('/shelter/dashboard')}
                >
                    <View style={styles.statRow}>
                        <View>
                            <Text style={styles.statLabel}>KUCING DIKELOLA</Text>
                            <Text style={styles.statValue}>{dashboardData.managed_cats}</Text>
                            <Text style={styles.statDesc}>Total penghuni shelter</Text>
                        </View>
                        <View style={[styles.statIconBox, { backgroundColor: '#F3F4F6' }]}>
                            <FontAwesome5 name="cat" size={24} color="#4b5563" />
                        </View>
                    </View>
                    <View style={styles.linkRow}>
                        <Text style={[styles.linkText, { color: '#2c473c' }]}>Kelola Data</Text>
                        <Ionicons name="arrow-forward" size={14} color="#2c473c" />
                    </View>
                </TouchableOpacity>

            </View>

            {/* 2. MENU CEPAT (Grid 2 Kolom) */}
            <Text style={styles.sectionTitle}>Menu Cepat</Text>
            <View style={styles.menuGrid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.menuCard}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.menuIconBg, { backgroundColor: item.bgColor }]}>
                            {renderIcon(item)}
                        </View>
                        <Text style={styles.menuTitle}>{item.title}</Text>
                        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{height: 100}} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  // Header
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 80, // Extra padding for overlapping content
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { zIndex: 1 },
  dashboardTag: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 8 },
  iconTagBg: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 5, borderRadius: 6 },
  dashboardTagText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  greetingTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  greetingSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20, marginBottom: 20 },
  
  // Status Badge in Header
  statusBadge: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
    padding: 12, borderRadius: 16
  },
  statusLabel: { color: '#e5e7eb', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  statusValue: { fontSize: 14, fontWeight: 'bold' },
  statusLogo: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#EBCD5E', backgroundColor: '#fff' },

  // Main Content Area
  mainContent: { paddingHorizontal: 20, marginTop: -50 },

  // Stats Cards
  statsContainer: { gap: 16, marginBottom: 30 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6, // The colored bar on the left
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#6b7280', marginBottom: 4, letterSpacing: 0.5 },
  statValue: { fontSize: 32, fontWeight: '800', color: '#1f2937' },
  statDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  statIconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 15 },
  linkText: { fontSize: 12, fontWeight: 'bold' },

  // Menu Grid
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  menuCard: {
    width: (width - 55) / 2, // 2 Column
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#f3f4f6',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2
  },
  menuIconBg: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  menuTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
  menuSubtitle: { fontSize: 10, color: '#9ca3af', marginTop: 2, textAlign: 'center' }
});