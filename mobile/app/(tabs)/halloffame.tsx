import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  StatusBar, ImageBackground, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient, { API_BASE_URL } from '../../api/apiClient';
import AlumniCard from '../../components/AlumniCard';
import StickyBackButton from '../../components/StickyBackButton';

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

export default function HallOfFameScreen() {
  const insets = useSafeAreaInsets();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await apiClient.get(`/cats/adopted`);
      if (response.data.data) {
        setCats(response.data.data);
      }
    } catch (error) {
      console.error("Gagal ambil alumni:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
      <StickyBackButton />

      {/* Tekstur background yang sama dengan halaman riwayat */}
      <ImageBackground
        source={require('../../assets/images/bg-texture.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      <FlatList
        data={cats}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 50 }]}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Hall of Fame</Text>
            <Text style={styles.subtitle}>Bahagianya mereka yang telah menemukan rumah baru selamanya.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AlumniCard cat={item} serverUrl={serverUrl} />
        )}
        ListEmptyComponent={!loading && (
          <Text style={styles.emptyText}>Belum ada pahlawan kecil di sini.</Text>
        )}
      />

      {loading && (
        <ActivityIndicator size="large" color="#EBCD5E" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2C473C' }, // Warna tema hijau gelap
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  header: { marginBottom: 25, paddingTop: 30, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 13, color: '#d1d5db', textAlign: 'center', marginTop: 5, paddingHorizontal: 10 },
  emptyText: { color: '#fff', textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
});