import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, StatusBar 
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient, { API_BASE_URL } from '../../api/apiClient';
import ShelterHomeScreen from '../../components/ShelterHomeScreen'; 

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';
const THEME_COLOR = '#3A5F50';

// ==================================================
// 1. KOMPONEN TAMPILAN USER BIASA
// ==================================================
function UserHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alumniCats, setAlumniCats] = useState<any[]>([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await apiClient.get(`/cats/adopted`);
      const data = response.data;
      if (data.data && Array.isArray(data.data)) {
        setAlumniCats(data.data.slice(0, 3));
      }
    } catch (error) {
      console.log("Gagal ambil alumni:", error);
    } finally {
      setLoadingAlumni(false);
    }
  };

  const getImageUrl = (filename: string) => {
    if (!filename || filename === 'NULL') return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400'; 
    if (filename.startsWith('cat-')) return `${serverUrl}/public/img/cats/${filename}`;
    return filename;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* --- HERO SECTION --- */}
        <View style={[styles.heroSection, { paddingTop: insets.top + 20 }]}>
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={styles.heroGreeting}>Hai, Cat Lovers!</Text>
              <Text style={styles.heroTitle}>Mau tolong anabul siapa hari ini?</Text>
            </View>
            {/* <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications" size={20} color="#fff" />
            </TouchableOpacity> */}
          </View>

          {/* Quick Stats / Banner */}
          <View style={styles.bannerCard}>
            <View style={{flex: 1}}>
              <Text style={styles.bannerTitle}>150+ Nyawa</Text>
              <Text style={styles.bannerSub}>Telah diselamatkan bulan ini.</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={() => router.push('/(tabs)/adopt' as any)}>
                <Text style={styles.bannerBtnText}>Adopsi Sekarang</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={require('../../assets/images/cathelo.png')} 
              style={styles.bannerImage} 
              resizeMode="contain"
            />
          </View>
        </View>

        {/* --- MENU CEPAT (UPDATED) --- */}
        <View style={styles.menuContainer}>
          <View style={styles.quickMenuGrid}>
             {[
               { icon: 'paw', label: 'Adopsi', route: '/(tabs)/adopt', color: '#f97316' }, // Orange
               { icon: 'heart', label: 'Donasi', route: '/(tabs)/donation', color: '#ef4444' }, // Merah
               { icon: 'time', label: 'Riwayat', route: '/(tabs)/report', color: '#3b82f6' }, // Biru (Link ke Report/History)
               { icon: 'help-circle', label: 'FAQ', route: '/(tabs)/faq', color: '#10b981' }, // Hijau
             ].map((menu, index) => (
               <TouchableOpacity key={index} style={styles.menuItem} onPress={() => router.push(menu.route as any)}>
                 <View style={[styles.menuIconBox, { backgroundColor: menu.color + '20' }]}>
                   <Ionicons name={menu.icon as any} size={24} color={menu.color} />
                 </View>
                 <Text style={styles.menuLabel}>{menu.label}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        {/* --- LAYANAN KAMI (Display Only) --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Layanan Kami</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
          clipToPadding={false} 
        >
          <View style={styles.serviceCard}>
            <View style={[styles.iconCircle, {backgroundColor: '#fee2e2'}]}>
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
            </View>
            <Text style={styles.serviceCardTitle}>Darurat</Text>
            <Text style={styles.serviceCardDesc}>Lapor kucing sakit atau terlantar.</Text>
          </View>

          <View style={styles.serviceCard}>
            <View style={[styles.iconCircle, {backgroundColor: '#ffedd5'}]}>
              <Ionicons name="home" size={24} color="#f97316" />
            </View>
            <Text style={styles.serviceCardTitle}>Cari Rumah</Text>
            <Text style={styles.serviceCardDesc}>Berikan rumah untuk mereka.</Text>
          </View>

          <View style={styles.serviceCard}>
            <View style={[styles.iconCircle, {backgroundColor: '#dcfce7'}]}>
              <Ionicons name="chatbubbles" size={24} color="#16a34a" />
            </View>
            <Text style={styles.serviceCardTitle}>Tanya Kami</Text>
            <Text style={styles.serviceCardDesc}>FAQ dan bantuan seputar kucing.</Text>
          </View>
        </ScrollView>

        {/* --- ALUMNI (Hall of Fame) --- */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeaderRow, { paddingRight: 20 }]}>
             <Text style={styles.sectionTitle}>Hall of Fame</Text>
             <TouchableOpacity><Text style={styles.seeAll}>Lihat Semua</Text></TouchableOpacity>
          </View>
        </View>
          
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
          clipToPadding={false}
        >
          {loadingAlumni ? (
             <ActivityIndicator color={THEME_COLOR} /> 
          ) : alumniCats.length === 0 ? (
             <Text style={{color:'#999', fontStyle:'italic'}}>Belum ada data alumni.</Text>
          ) : (
            alumniCats.map((cat: any) => (
              <View key={cat.id} style={styles.alumniCard}>
                <Image source={{ uri: getImageUrl(cat.photo) }} style={styles.alumniImage} />
                <View style={styles.alumniInfo}>
                  <Text style={styles.alumniName}>{cat.name}</Text>
                  <Text style={styles.alumniAdopter}>diadopsi oleh {cat.adopter || 'Seseorang'}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

      </ScrollView>
    </View>
  );
}

// ==================================================
// 2. MAIN SWITCHER
// ==================================================
export default function HomeScreen() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { checkRole(); }, []));

  const checkRole = async () => {
    try {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <View style={{flex:1, backgroundColor:'#F3F4F6'}} />;
  if (userRole === 'shelter') return <ShelterHomeScreen />;
  return <UserHomeScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  
  heroSection: { 
    backgroundColor: THEME_COLOR, 
    paddingHorizontal: 20, 
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroGreeting: { color: '#fbbf24', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 21, fontWeight: 'bold', maxWidth: '80%' },
  notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 50 },

  bannerCard: { 
    backgroundColor: '#2C4A3E', borderRadius: 20, padding: 20, 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: '#d1d5db', fontSize: 12, marginBottom: 12 },
  bannerBtn: { backgroundColor: '#EBCD5E', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#1f2937', fontWeight: 'bold', fontSize: 12 },
  bannerImage: { width: 80, height: 80 },

  menuContainer: { paddingHorizontal: 20, marginTop: -25 },
  quickMenuGrid: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5
  },
  menuItem: { alignItems: 'center', width: '22%' },
  menuIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  menuLabel: { fontSize: 11, fontWeight: '600', color: '#4b5563' },

  sectionContainer: { paddingLeft: 20, marginTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  seeAll: { fontSize: 12, color: THEME_COLOR, fontWeight: 'bold' },

  serviceCard: { 
    backgroundColor: '#fff', width: 140, height: 160, borderRadius: 16, padding: 16, marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4,
    justifyContent: 'center', alignItems: 'center'
  },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceCardTitle: { fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  serviceCardDesc: { fontSize: 10, color: '#9ca3af', textAlign: 'center' },

  alumniCard: { 
    width: 200, backgroundColor: '#fff', borderRadius: 16, marginRight: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4,
    overflow: 'hidden'
  },
  alumniImage: { width: '100%', height: 120 },
  alumniInfo: { padding: 12 },
  alumniName: { fontWeight: 'bold', color: '#1f2937', fontSize: 14 },
  alumniAdopter: { fontSize: 11, color: '#6b7280', marginTop: 2 }
});