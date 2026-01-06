// mobile/components/CatCard.tsx

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveImageUrl as apiResolveImage } from '@/api/apiClient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; 

interface CatCardProps {
  cat?: any;
  name?: string;
  breed?: string;
  gender?: string;
  status?: string;
  imageUrl?: any;
  serverUrl?: string;
  showStatus?: boolean; // Tambahkan ini
  onPress?: () => void; // Buat opsional agar bisa di-disable
  onFavoritePress?: () => void;
}

export default function CatCard(props: CatCardProps) {
  const { cat, serverUrl, onPress, onFavoritePress, showStatus = true } = props; // Default true
  
  if (!cat && !props.name) return null;

  const finalName = props.name || cat?.name || 'No Name';
  const finalBreed = props.breed || cat?.breed || 'Mix';
  const finalGender = props.gender || cat?.gender || 'male';
  const finalStatus = props.status || cat?.adoption_status || cat?.status;
  const isFavorited = props.cat?.isFavorited || false;

  let imageSource: ImageSourcePropType;

  if (props.imageUrl) {
    imageSource = typeof props.imageUrl === 'string' ? { uri: props.imageUrl } : props.imageUrl;
  } else if (cat) {
    const photoPath = cat.image || cat.catImage || cat.photo;
    const resolved = apiResolveImage(photoPath);
    if (resolved && resolved.startsWith('http')) {
      imageSource = { uri: resolved };
    } else {
      const fallback = photoPath ? `${serverUrl}/public/img/cats/${photoPath}` : `${serverUrl}/public/img/cats/NULL.png`;
      imageSource = { uri: fallback };
    }
  } else {
    imageSource = { uri: `${serverUrl}/public/img/cats/NULL.png` };
  }

  return (
    <TouchableOpacity 
      style={[styles.card, !onPress && { opacity: 0.8 }]} // Beri sedikit visual jika tidak bisa diklik
      onPress={onPress} 
      activeOpacity={onPress ? 0.9 : 1} // Hilangkan efek klik jika onPress null
      disabled={!onPress} // Nonaktifkan interaksi jika onPress null
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      
      {/* Update Logika Status Badge */}
      {showStatus && finalStatus && (
        <View style={[styles.statusBadge, { backgroundColor: finalStatus === 'available' ? '#10b981' : '#f59e0b' }]}>
          <Text style={styles.statusText}>{finalStatus === 'available' ? 'Tersedia' : finalStatus}</Text>
        </View>
      )}

      {onFavoritePress && (
        <TouchableOpacity style={styles.favoriteBtn} onPress={(e) => { e.stopPropagation(); onFavoritePress(); }}>
          <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={18} color={isFavorited ? "#ef4444" : "#64748b"} />
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{finalName}</Text>
        <Text style={styles.details} numberOfLines={1}>
          {finalGender === 'male' ? 'Jantan' : 'Betina'} • {finalBreed}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, width: cardWidth, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  image: { width: '100%', height: 150, backgroundColor: '#f8fafc' },
  statusBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 10 },
  statusText: { color: '#fff', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  favoriteBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 6, borderRadius: 20, zIndex: 10 },
  content: { padding: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  details: { fontSize: 11, color: '#64748b', marginTop: 3 },
});