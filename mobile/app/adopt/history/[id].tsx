import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '@/api/apiClient';

const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

export default function AdoptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/adopt/my-adoptions/${id}`)
      .then(res => setDetail(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{flex:1}} />;
  if (!detail) return <Text>Data tidak ditemukan</Text>;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pengajuan</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.catSection}>
          <Image source={{ uri: `${BASE_SERVER_URL}/public/img/cats/${detail.catImage}` }} style={styles.catLargeImg} />
          <Text style={styles.catNameLarge}>{detail.catName}</Text>
          <Text style={styles.statusBadgeLarge}>{detail.status.toUpperCase()}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Informasi Adopsi</Text>
          <InfoRow label="Shelter" value={detail.shelterName} />
          <InfoRow label="Alamat Shelter" value={detail.shelterAddress} />
          <InfoRow label="Tanggal Pengajuan" value={detail.appliedDate} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Data Pemohon</Text>
          <InfoRow label="Nama" value={detail.applicantName} />
          <InfoRow label="Alamat" value={detail.applicantAddress} />
        </View>

        {/* Jika ada file surat pernyataan */}
        {detail.statement_letter_path && (
          <View style={styles.infoCard}>
             <Text style={styles.sectionTitle}>Dokumen</Text>
             <Text style={{fontSize: 12, color: '#3b82f6'}}>📄 Surat Pernyataan Terlampir</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }: any) => (
  <View style={{marginBottom: 10}}>
    <Text style={{fontSize: 10, color: '#94a3b8', textTransform: 'uppercase'}}>{label}</Text>
    <Text style={{fontSize: 14, color: '#1e293b', fontWeight: '500'}}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  headerTitle: { fontWeight: 'bold', fontSize: 18 },
  catSection: { alignItems: 'center', marginBottom: 25 },
  catLargeImg: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  catNameLarge: { fontSize: 24, fontWeight: 'bold' },
  statusBadgeLarge: { backgroundColor: '#f1f5f9', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  infoCard: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#3A5F50' }
});
