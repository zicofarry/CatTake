import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

interface CatCardProps {
  name: string;
  breed: string;
  age: number;
  gender: string;
  status: string;
  imageUrl: string;
  onPress: () => void;
}

export default function CatCard({ name, breed, age, gender, status, imageUrl, onPress }: CatCardProps) {
  // PERBAIKAN DI SINI:
  // Gunakan (status || '') untuk jaga-jaga kalau statusnya kosong/null
  const safeStatus = status || ''; 
  const isAvailable = safeStatus.toLowerCase() === 'available';
  
  const statusColor = isAvailable ? Colors.success : Colors.danger;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>
          {breed || 'Unknown Breed'} • {age} Tahun • {gender}
        </Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {/* Tampilkan status atau fallback text */}
          {safeStatus ? safeStatus.toUpperCase() : 'UNKNOWN STATUS'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  status: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});