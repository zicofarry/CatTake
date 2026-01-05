import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '@/api/apiClient'; // Import base URL untuk gambar

interface LostCatCardProps {
  cat: {
    id: number;
    name: string;
    image: string;
    owner: string;
    breed: string;
    age: number;
    color: string;
    address: string;
    description: string;
    reward: number;
  };
}

export default function LostCatCard({ cat }: LostCatCardProps) {
  const router = useRouter();

  // Helper format Rupiah
  const formatRupiah = (amount: number) => {
    if (!amount || amount === 0) return 'Tidak Ada';
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  // Helper resolve Image (Logic mirip Vue & Community)
  const resolveImg = (path: string) => {
    if (!path || path === 'NULL' || path.includes('NULL.JPG')) return 'https://via.placeholder.com/150';
    if (path.startsWith('http')) return path; // Handle Cloudinary / External
    
    // Handle Local Images (prepend Base URL server)
    // Hapus '/api/v1' jika ada, untuk dapat root URL server
    const cleanBaseUrl = API_BASE_URL?.replace('/api/v1', '') || '';
    
    // Logic path sesuai controller backend/Vue
    if (path.startsWith('/public/')) return `${cleanBaseUrl}${path}`;
    if (path.startsWith('lost-')) return `${cleanBaseUrl}/public/img/lost_cat/${path}`;
    
    return `${cleanBaseUrl}/public/img/${path}`;
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden border border-gray-100 relative w-[48%]"
      onPress={() => router.push(`/post/${cat.id}`)} // Link ke detail
      activeOpacity={0.8}
    >
      
      {/* Badge Reward (Pojok Kanan Atas) */}
      {cat.reward > 0 && (
        <View className="absolute top-0 right-0 bg-[#EBCD5E] z-10 px-3 py-1 rounded-bl-xl shadow-sm">
          <Text className="text-gray-900 text-[10px] font-bold">REWARD!</Text>
        </View>
      )}

      {/* Gambar */}
      <Image 
        source={{ uri: resolveImg(cat.image) }} 
        className="w-full h-32 bg-gray-200"
        resizeMode="cover"
      />

      {/* Konten Text */}
      <View className="p-3">
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>{cat.name}</Text>
        
        <Text className="text-gray-600 text-[10px] mb-2 leading-tight">
          <Text className="font-bold">Pemilik:</Text> {cat.owner} | <Text className="font-bold">Ras:</Text> {cat.breed}
        </Text>

        {/* Info Grid Kecil */}
        <View className="flex-row flex-wrap mb-2">
            <View className="w-1/2 mb-1">
                <Text className="text-gray-400 text-[10px]">Umur:</Text>
                <Text className="text-gray-800 text-[10px] font-medium">{cat.age} Bulan</Text>
            </View>
            <View className="w-1/2 mb-1">
                <Text className="text-gray-400 text-[10px]">Warna:</Text>
                <Text className="text-gray-800 text-[10px] font-medium">{cat.color}</Text>
            </View>
            <View className="w-full">
                <Text className="text-gray-400 text-[10px]">Lokasi:</Text>
                <Text className="text-gray-800 text-[10px] font-medium" numberOfLines={1}>{cat.address}</Text>
            </View>
        </View>

        {/* Deskripsi Singkat */}
        <Text className="text-[10px] italic text-gray-500 border-t border-gray-100 pt-1 mb-2" numberOfLines={2}>
            "{cat.description}"
        </Text>

        {/* Footer Reward */}
        <View className="pt-2 border-t border-gray-200">
            <Text className="text-xs font-bold text-gray-800">
                Reward: {formatRupiah(cat.reward)}
            </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}