import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { resolveImageUrl } from '@/api/apiClient';

const { width } = Dimensions.get('window');
// Menghitung lebar agar pas 2 kolom
const cardWidth = (width - 60) / 2;

interface AlumniCardProps {
  cat: any;
  serverUrl: string;
}

export default function AlumniCard({ cat, serverUrl }: AlumniCardProps) {
  if (!cat) return null;

  // Mengambil gambar menggunakan helper yang sudah ada
  const imageUrl = resolveImageUrl(cat.image || cat.photo, 'cat') || `${serverUrl}/public/img/cats/NULL.png`;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{cat.name || 'Anabul'}</Text>

        {/* Label Status Sukses */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>SUDAH DIADOPSI</Text>
        </View>

        <Text style={styles.adopterText} numberOfLines={2}>
          oleh <Text style={styles.adopterName}>{cat.adopter || 'Seseorang Baik'}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    width: cardWidth,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 130, // Sedikit lebih pendek dari CatCard biasa
    backgroundColor: '#f8fafc',
  },
  content: { padding: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 6
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16a34a',
  },
  adopterText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16
  },
  adopterName: {
    fontWeight: 'bold',
    color: '#334155'
  },
});