import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// Menghitung lebar kotak agar pas 2 kolom dengan margin
const cardWidth = (width - 60) / 2; 

interface CatCardProps {
  cat: any;
  serverUrl: string;
  onPress: () => void;
  onFavoritePress: () => void;
}

export default function CatCard({ cat, serverUrl, onPress, onFavoritePress }: CatCardProps) {
  if (!cat) return null;

  // Mendukung field 'photo' (list cats) atau 'catImage' (riwayat adopsi)
  const photoName = cat.photo || cat.catImage || 'NULL.png';
  
  // Memastikan tidak ada double slash jika serverUrl diakhiri '/'
  const cleanServerUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
  const imageUrl = `${cleanServerUrl}/public/img/cats/${photoName}`;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      {/* Tombol Favorit (Like) */}
      <TouchableOpacity 
        style={styles.favoriteBtn} 
        onPress={(e) => {
          e.stopPropagation(); // Mencegah klik menembus ke card detail
          onFavoritePress();
        }}
      >
        <Ionicons 
          name={cat.isFavorited ? "heart" : "heart-outline"} 
          size={18} 
          color={cat.isFavorited ? "#ef4444" : "#64748b"} 
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{cat.name || 'No Name'}</Text>
        <Text style={styles.details} numberOfLines={1}>
          {cat.gender === 'male' ? 'Jantan' : 'Betina'} • {cat.breed || 'Mix'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    width: cardWidth,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8fafc',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10
  },
  content: { padding: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  details: { fontSize: 11, color: '#64748b', marginTop: 3 },
});