import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  Alert, ActivityIndicator, RefreshControl, SafeAreaView 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import { Colors } from '../../constants/Colors';

// Ambil URL root server untuk gambar
const SERVER_URL = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

export default function AdoptionHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adoptions, setAdoptions] = useState([]);

  // Fetch data setiap kali halaman difokuskan (mirip onMounted di Vue)
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get('/adopt/my-adoptions');
      setAdoptions(response.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = (id: number) => {
    Alert.alert(
      "Batalkan Pengajuan",
      "Apakah Anda yakin ingin membatalkan pengajuan adopsi ini?",
      [
        { text: "Kembali", style: "cancel" },
        { 
          text: "Ya, Batalkan", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.delete(`/adopt/cancel/${id}`);
              Alert.alert("Sukses", "Pengajuan berhasil dibatalkan.");
              fetchHistory();
            } catch (error: any) {
              Alert.alert("Gagal", error.response?.data?.error || "Terjadi kesalahan.");
            }
          } 
        }
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { bg: '#FEF3C7', text: '#D97706' };
      case 'approved': 
      case 'completed': return { bg: '#DCFCE7', text: '#15803D' };
      case 'rejected': return { bg: '#FEE2E2', text: '#B91C1C' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Adopsi</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={adoptions}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Kamu belum pernah mengajukan adopsi.</Text>
          </View>
        }
        renderItem={({ item }: any) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <View style={styles.card}>
              <Image 
                source={{ uri: `${SERVER_URL}/public/img/cats/${item.catImage}` }} 
                style={styles.catImage} 
              />
              <View style={styles.cardContent}>
                <Text style={styles.catName}>{item.catName}</Text>
                <Text style={styles.shelterName}>{item.shelterName}</Text>
                <Text style={styles.dateText}>{item.appliedDate}</Text>
                
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {item.status === 'pending' && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 20, backgroundColor: '#fff', elevation: 2 
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  card: { 
    backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 15, 
    flexDirection: 'row', alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  catImage: { width: 80, height: 80, borderRadius: 15, marginRight: 15 },
  cardContent: { flex: 1 },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  shelterName: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  dateText: { fontSize: 11, color: '#9CA3AF' },
  statusBadge: { 
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 20, marginTop: 8 
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  cancelBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#9CA3AF', marginTop: 10, textAlign: 'center' }
});