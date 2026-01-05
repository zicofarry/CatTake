import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { resolveImageUrl } from '@/api/apiClient'; 

interface LostCatCardProps {
  cat: {
    id: number;
    name: string;
    image: string;
    owner: string; // Sekarang berisi full_name dari backend
    breed: string;
    age: number;
    color: string;
    address: string;
    description: string;
    reward: number;
  };
}

export default function LostCatCard({ cat }: LostCatCardProps) {

  // Helper format Reward (Instruksi 4 & 5)
  const formatReward = (amount: any) => {
    // Pastikan kita bekerja dengan angka, buang string jika ada
    const numericAmount = parseFloat(amount);

    // Jika 0.00 atau tidak ada data, tampilkan "Tidak Ada"
    if (!numericAmount || numericAmount === 0) {
      return 'Tidak Ada';
    }

    // Gunakan Math.floor untuk memastikan desimal .00 benar-benar hilang
    // toLocaleString('id-ID') otomatis memberikan titik sebagai pemisah ribuan
    const formattedNumber = Math.floor(numericAmount).toLocaleString('id-ID');
    
    return `Rp${formattedNumber}`;
  };

  const imageUrl = resolveImageUrl(cat.image, 'lost') || 'https://via.placeholder.com/150';

  return (
    <View 
      className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden border border-gray-100 relative w-[48%]"
    >
      
      {/* Badge Reward */}
      {cat.reward > 0 && (
        <View className="absolute top-0 right-0 bg-[#EBCD5E] z-10 px-3 py-1 rounded-bl-xl shadow-sm">
          <Text className="text-gray-900 text-[10px] font-bold">REWARD!</Text>
        </View>
      )}

      {/* Gambar */}
      <Image 
        source={{ uri: imageUrl }} 
        className="w-full h-32 bg-gray-200"
        resizeMode="cover"
      />

      <View style={{ padding: 12 }}>
        {/* Nama Kucing */}
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>{cat.name}</Text>
        
        {/* Pemilik (Full Name) & Ras */}
        <Text className="text-gray-600 text-[10px] mb-1 leading-tight">
          <Text className='text-gray-500 text-[10px]'>Pemilik: </Text>
          <Text className="ftext-gray-800 text-[10px] font-semibold">{cat.owner}</Text>
        </Text>
        <Text className="text-gray-600 text-[10px] mb-1 leading-tight">
          <Text className='text-gray-500 text-[10px]'>Ras:</Text>
          <Text className="text-gray-800 text-[10px] font-semibold"> {cat.breed}</Text>
        </Text>
        <Text className="text-gray-600 text-[10px] mb-1 leading-tight">
          <Text className='text-gray-500 text-[10px]'>Umur:</Text>
          <Text className="text-gray-800 text-[10px] font-semibold"> {cat.age} Bulan</Text>
        </Text>
        <Text className="text-gray-600 text-[10px] mb-1 leading-tight">
          <Text className='text-gray-500 text-[10px]'>Warna:</Text>
          <Text className="text-gray-800 text-[10px] font-semibold"> {cat.color}</Text>
        </Text>

        {/* Info List Vertikal (Instruksi 2: Kebawah saja) */}
        <View className="mb-3">
            <View>
                <Text className="text-gray-500 text-[10px]">Lokasi Terakhir:</Text>
                <Text className="text-gray-800 text-[10px] font-semibold" numberOfLines={2}>{cat.address}</Text>
            </View>
        </View>

        {/* Deskripsi (Instruksi 3: Bold agar jelas) */}
        <Text className="text-[10px] text-gray-700 font-bold border-t border-gray-100 pt-2 mb-3" numberOfLines={3}>
            "{cat.description}"
        </Text>

        {/* Footer Reward (Instruksi 4 & 5) */}
        <View className="pt-2 border-t border-gray-200">
            <Text className="text-[10px] text-gray-400">Nilai Imbalan:</Text>
            <Text className="text-xs font-bold text-[#3A5F50]">
                {formatReward(cat.reward)}
            </Text>
        </View>
      </View>
    </View>
  );
}