import React from 'react';
import { View, Text, Image } from 'react-native';

const ShelterCard = ({ name, address, image }: any) => {
  return (
    <View className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      {/* Gambar dengan tinggi fix 120px agar sama dengan alumni */}
      <Image 
        source={image} 
        className="w-full h-[120px]" 
        resizeMode="cover"
      />
      
      <View className="p-3">
        {/* numberOfLines={1} supaya teks tidak berantakan kalau kepanjangan */}
        <Text className="font-bold text-gray-800 text-[14px]" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-[11px] text-gray-500 mt-1" numberOfLines={1}>
          {address}
        </Text>
      </View>
    </View>
  );
};

export default ShelterCard;