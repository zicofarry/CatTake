import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient, { API_BASE_URL } from '../api/apiClient';

const { width } = Dimensions.get('window');

export default function ShelterHomeScreen() {
  const router = useRouter();
  const [shelterName, setShelterName] = useState('Shelter');
  const [stats, setStats] = useState({ totalCats: 0, adoptionRequests: 0, rescueReports: 0 });

  useEffect(() => {
    fetchShelterData();
  }, []);

  const fetchShelterData = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        // Ambil nama shelter
        const profileRes = await apiClient.get(`/users/profile/${id}/shelter`);
        setShelterName(profileRes.data.name);

        // Ambil stats sederhana (opsional, bisa disesuaikan endpointnya)
        const catsRes = await apiClient.get(`/cats/shelter/${id}`);
        setStats(prev => ({ ...prev, totalCats: catsRes.data.length }));
      }
    } catch (error) {
      console.error("Gagal load dashboard:", error);
    }
  };

  const menuItems = [
    { 
      title: 'Manajemen Kucing', 
      icon: 'cat', 
      color: '#EBCD5E', 
      desc: 'Tambah & Edit Data',
      route: '/shelter/dashboard' // Arahkan ke file yang kita buat sebelumnya
    },
    { 
      title: 'Laporan Rescue', 
      icon: 'ambulance', 
      color: '#ef4444', 
      desc: 'Cek laporan masuk',
      route: '/shelter/dashboard' // Bisa diarahkan ke tab rescue spesifik nanti
    },
    { 
      title: 'Profil Shelter', 
      icon: 'store', 
      color: '#3A5F50', 
      desc: 'Edit info & lokasi',
      route: '/(tabs)/profile' 
    },
    { 
      title: 'Chat Adopsi', 
      icon: 'comments', 
      color: '#3b82f6', 
      desc: 'Pesan dari adopter',
      route: '/(tabs)/chat' 
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.welcomeLabel}>Selamat Datang,</Text>
            <Text style={styles.shelterName}>{shelterName}</Text>
        </View>
        <Image source={require('../assets/images/cathelo.png')} style={styles.logo} />
      </View>

      {/* STATS CARD */}
      <LinearGradient colors={['#3A5F50', '#2C473C']} style={styles.statsCard}>
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalCats}</Text>
            <Text style={styles.statLabel}>Total Kucing</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Pending Adopsi</Text>
        </View>
      </LinearGradient>

      {/* MENU GRID */}
      <Text style={styles.sectionTitle}>Menu Utama</Text>
      <View style={styles.gridContainer}>
        {menuItems.map((item, index) => (
            <TouchableOpacity 
                key={index} 
                style={styles.card} 
                onPress={() => router.push(item.route as any)}
            >
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                    <FontAwesome5 name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
        ))}
      </View>

      {/* INFO CARD */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#3A5F50" />
        <Text style={styles.infoText}>
            Pastikan data kucing selalu update agar adopter dapat menemukan teman bulu mereka!
        </Text>
      </View>

      <View style={{height: 100}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginTop: 40, marginBottom: 20 
  },
  welcomeLabel: { fontSize: 16, color: '#6b7280' },
  shelterName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  logo: { width: 50, height: 50 },
  
  statsCard: {
    flexDirection: 'row', borderRadius: 20, padding: 20, marginBottom: 30,
    shadowColor: '#3A5F50', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#EBCD5E' },
  statLabel: { fontSize: 12, color: '#fff', opacity: 0.8 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 10 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: (width - 50) / 2, backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 15,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#999' },

  infoBox: {
    flexDirection: 'row', backgroundColor: '#e6f4f1', padding: 15, borderRadius: 12, gap: 10, alignItems: 'center'
  },
  infoText: { flex: 1, fontSize: 12, color: '#3A5F50', lineHeight: 18 }
});