import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

// IP Address Backend (Sesuai IP Hotspot kamu yang terakhir)
const API_URL = 'http://10.173.4.177:3000';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [alumniCats, setAlumniCats] = useState<any[]>([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);

  // Ambil data alumni (Hall of Fame)
  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cats/adopted`);
      const data = await response.json();
      
      // Ambil 3 data pertama saja jika ada
      if (data.data && Array.isArray(data.data)) {
        setAlumniCats(data.data.slice(0, 3));
      }
    } catch (error) {
      console.log("Gagal ambil alumni:", error);
    } finally {
      setLoadingAlumni(false);
    }
  };

  // Helper untuk URL Gambar
  const getImageUrl = (filename: string) => {
    if (!filename || filename === 'NULL') {
      return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400'; 
    }
    // Jika nama file dimulai dengan 'cat-', berarti dari server lokal
    if (filename.startsWith('cat-')) {
      return `${API_URL}/public/img/cats/${filename}`;
    }
    return filename;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* --- HERO SECTION --- */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeLine} />
              <Text style={styles.badgeText}>TENTANG KAMI</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Menciptakan Dunia Lebih Baik Bagi <Text style={styles.textPrimary}>Bangsa Kucing</Text>
            </Text>
            
            {/* PERBAIKAN: Tag penutup sekarang benar menggunakan </Text> */}
            <Text style={styles.heroSubtitle}>
              Setiap kucing berhak mendapatkan tempat yang hangat. CatTake hadir untuk memastikan tidak ada lagi anabul yang terlantar.
            </Text>

            {/* Statistik */}
            <View style={styles.statsContainer}>
              <View>
                <Text style={styles.statNumber}>150+</Text>
                <Text style={styles.statLabel}>Nyawa Selamat</Text>
              </View>
              <View>
                <Text style={styles.statNumber}>80+</Text>
                <Text style={styles.statLabel}>Rumah Baru</Text>
              </View>
              <View>
                <Text style={styles.statNumber}>1k+</Text>
                <Text style={styles.statLabel}>Teman Meow</Text>
              </View>
            </View>
          </View>

          {/* Gambar Hero */}
          <View style={styles.heroImageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} 
              style={styles.heroImage} 
            />
            {/* Floating Card */}
            <View style={styles.floatingCard}>
              <View style={styles.floatingIconBg}>
                <Ionicons name="happy" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.floatingTitle}>Status Misi</Text>
                <Text style={styles.floatingSubtitle}>Banyak Kucing Bahagia</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- MARQUEE (Running Text Dummy) --- */}
        <View style={styles.marqueeContainer}>
          <Text style={styles.marqueeText}>
            RESCUE • MEOW • SAVE LIVES • ADOPT • RESCUE • MEOW • SAVE LIVES
          </Text>
        </View>

        {/* --- LAYANAN KAMI --- */}
        <View style={styles.serviceSection}>
          <View style={styles.sectionHeaderCenter}>
            <Text style={styles.sectionBadge}>LAYANAN KAMI</Text>
            <Text style={styles.sectionTitleWhite}>Bantu Anabul Dengan Cara Kamu</Text>
          </View>

          {/* Card 1: Lapor */}
          <TouchableOpacity style={styles.serviceCard} onPress={() => router.push('/(tabs)/report' as any)}>
            <View style={styles.serviceIconBg}>
              <Ionicons name="camera" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.serviceTitle}>Lapor Penemuan</Text>
            <Text style={styles.serviceDesc}>
              Lihat kucing terlantar? Foto dan laporkan lokasinya agar bisa segera kami selamatkan.
            </Text>
            <Text style={styles.serviceLink}>Buat Laporan &rarr;</Text>
          </TouchableOpacity>

          {/* Card 2: Adopsi */}
          <TouchableOpacity style={styles.serviceCard} onPress={() => router.push('/(tabs)/adopt' as any)}>
            <View style={[styles.serviceIconBg, { backgroundColor: '#EBCD5E' }]}>
               <Ionicons name="paw" size={32} color="#1F352C" />
            </View>
            <Text style={styles.serviceTitle}>Adopsi Anabul</Text>
            <Text style={styles.serviceDesc}>
              Temukan kucing impianmu yang siap untuk diadopsi hari ini dari shelter terpercaya.
            </Text>
            <Text style={[styles.serviceLink, { color: '#EBCD5E' }]}>Cari Kucing &rarr;</Text>
          </TouchableOpacity>

          {/* Card 3: Komunitas */}
          <TouchableOpacity style={styles.serviceCard} onPress={() => router.push('/(tabs)/community' as any)}>
            <View style={styles.serviceIconBg}>
              <Ionicons name="people" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.serviceTitle}>Komunitas Pecinta</Text>
            <Text style={styles.serviceDesc}>
              Gabung dengan pecinta kucing lainnya. Berbagi tips, cerita lucu, dan dukung shelter.
            </Text>
            <Text style={styles.serviceLink}>Gabung Sekarang &rarr;</Text>
          </TouchableOpacity>
        </View>

        {/* --- CARA KERJA --- */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsHeader}>Langkah Mudah Menyelamatkan <Text style={{color: Colors.primary}}>Nyawa</Text></Text>
          
          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>01</Text>
            <View style={styles.stepIconBg}>
              <Ionicons name="search" size={24} color="#3A5F50" />
            </View>
            <Text style={styles.stepTitle}>Snap & Lapor</Text>
            <Text style={styles.stepDesc}>Ambil foto kucing yang butuh bantuan dan pastikan lokasinya akurat.</Text>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>02</Text>
            <View style={styles.stepIconBg}>
              <Ionicons name="checkmark-circle" size={24} color="#d97706" />
            </View>
            <Text style={styles.stepTitle}>Verifikasi</Text>
            <Text style={styles.stepDesc}>Laporan akan diverifikasi oleh shelter terdekat untuk memastikan kondisi.</Text>
          </View>

          <View style={styles.stepCard}>
            <Text style={styles.stepNumber}>03</Text>
            <View style={styles.stepIconBg}>
              <Ionicons name="heart" size={24} color="#f97316" />
            </View>
            <Text style={styles.stepTitle}>Rescue & Adopsi</Text>
            <Text style={styles.stepDesc}>Kucing diselamatkan, dirawat, dan siap dicarikan rumah baru.</Text>
          </View>
        </View>

        {/* --- ALUMNI (Hall of Fame) --- */}
        <View style={styles.alumniSection}>
          <Text style={styles.sectionBadgeCenter}>HALL OF FAME</Text>
          <Text style={styles.alumniHeader}>Alumni CatTake</Text>
          <Text style={styles.alumniSubHeader}>Mereka yang telah menemukan rumah barunya.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alumniScroll}>
            
            {/* Loading Dummy */}
            {loadingAlumni && [1,2,3].map(i => (
              <View key={i} style={[styles.alumniCard, { opacity: 0.5 }]}>
                <View style={[styles.alumniImage, { backgroundColor: '#e5e7eb' }]} />
                <View style={styles.alumniContent}>
                  <View style={{width: 80, height: 16, backgroundColor: '#e5e7eb', marginBottom: 8}} />
                  <View style={{width: 100, height: 12, backgroundColor: '#e5e7eb'}} />
                </View>
              </View>
            ))}

            {/* Pesan jika kosong */}
            {!loadingAlumni && alumniCats.length === 0 && (
              <View style={{ padding: 20 }}>
                <Text style={{ color: '#9ca3af' }}>Belum ada alumni saat ini.</Text>
              </View>
            )}

            {/* Data Alumni */}
            {!loadingAlumni && alumniCats.map((cat: any) => (
              <View key={cat.id} style={styles.alumniCard}>
                <Image 
                  source={{ uri: getImageUrl(cat.photo) }} 
                  style={styles.alumniImage}
                  resizeMode="cover"
                />
                <View style={styles.alumniContent}>
                  <Text style={styles.alumniName} numberOfLines={1}>{cat.name}</Text>
                  <Text style={styles.alumniInfo} numberOfLines={1}>
                    Adopter: {cat.adopter || 'Anonim'}
                  </Text>
                  <View style={styles.adoptedBadge}>
                    <Text style={styles.adoptedText}>ADOPTED</Text>
                  </View>
                </View>
              </View>
            ))}

          </ScrollView>
        </View>

        <View style={{height: 50}} /> 
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  textPrimary: { color: '#3A5F50' },

  // --- HERO ---
  heroSection: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  heroContent: { marginBottom: 20 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badgeLine: { width: 30, height: 4, backgroundColor: Colors.primary, marginRight: 8, borderRadius: 2 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#3A5F50', letterSpacing: 1 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#1f2937', lineHeight: 44, marginBottom: 16 },
  heroSubtitle: { fontSize: 16, color: '#6b7280', lineHeight: 24, marginBottom: 24 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 20 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#3A5F50' },
  statLabel: { fontSize: 12, color: '#9ca3af' },
  
  heroImageContainer: { marginTop: 30, position: 'relative' },
  heroImage: { width: '100%', height: 300, borderRadius: 30 },
  floatingCard: { 
    position: 'absolute', bottom: -20, left: 20, 
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', 
    padding: 12, borderRadius: 16, 
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
  },
  floatingIconBg: { backgroundColor: '#ffedd5', padding: 8, borderRadius: 20, marginRight: 12 },
  floatingTitle: { fontSize: 10, color: '#9ca3af' },
  floatingSubtitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },

  // --- MARQUEE ---
  marqueeContainer: { backgroundColor: '#1F352C', paddingVertical: 12, marginTop: 40 },
  marqueeText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },

  // --- SERVICE ---
  serviceSection: { backgroundColor: '#1F352C', padding: 24, paddingBottom: 40 },
  sectionHeaderCenter: { alignItems: 'center', marginBottom: 30 },
  sectionBadge: { color: Colors.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  sectionTitleWhite: { color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  
  serviceCard: { 
    backgroundColor: '#2C4A3E', borderRadius: 24, padding: 24, marginBottom: 16, 
    borderWidth: 1, borderColor: '#3A5F50' 
  },
  serviceIconBg: { 
    width: 50, height: 50, backgroundColor: '#3A5F50', borderRadius: 16, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 16 
  },
  serviceTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  serviceDesc: { fontSize: 14, color: '#d1d5db', lineHeight: 22, marginBottom: 20 },
  serviceLink: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },

  // --- STEPS ---
  stepsSection: { padding: 24, backgroundColor: '#F9FAFB' },
  stepsHeader: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 24 },
  stepCard: { 
    backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 16, 
    borderWidth: 1, borderColor: '#e5e7eb', position: 'relative', overflow: 'hidden' 
  },
  stepNumber: { position: 'absolute', right: -10, bottom: -15, fontSize: 80, fontWeight: 'bold', color: '#f3f4f6' },
  stepIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#6b7280' },

  // --- ALUMNI ---
  alumniSection: { paddingVertical: 40, backgroundColor: '#fff' },
  sectionBadgeCenter: { textAlign: 'center', color: Colors.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  alumniHeader: { fontSize: 28, fontWeight: 'bold', color: '#3A5F50', textAlign: 'center', marginTop: 8 },
  alumniSubHeader: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  alumniScroll: { paddingHorizontal: 24, paddingBottom: 20 },
  alumniCard: { 
    width: 200, backgroundColor: '#fff', borderRadius: 16, marginRight: 16, 
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f3f4f6'
  },
  alumniImage: { width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#f3f4f6' },
  alumniContent: { padding: 12 },
  alumniName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  alumniInfo: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  adoptedBadge: { marginTop: 8, backgroundColor: '#10b981', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  adoptedText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});