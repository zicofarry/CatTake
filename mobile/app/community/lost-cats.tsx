import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ImageBackground, TouchableOpacity, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/api/apiClient'; // Import apiClient default
import LostCatCard from '../../components/LostCatCard';

export default function LostCatListPage() {
  const router = useRouter();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLostCats();
  }, []);

  const fetchLostCats = async () => {
    try {
      setLoading(true);
      // Panggil langsung endpoint yang sudah ada
      const response = await apiClient.get('/lost-cats/list');
      
      // Backend mengembalikan format: { status: 'success', data: [...] }
      if (response.data && response.data.data) {
        setCats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching lost cats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={{ flex: 1, backgroundColor: '#2c473c' }}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.4 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header (Back Button) */}
        <View className="px-5 pt-2 pb-4">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="self-start bg-[#2D4A45]/80 py-2 px-4 rounded-full flex-row items-center border border-white/20 backdrop-blur-md"
          >
             <Ionicons name="arrow-back" size={18} color="#fff" />
             <Text className="text-white font-bold ml-2 text-sm">Kembali</Text>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View className="px-5 mb-6">
            <Text className="text-3xl font-bold text-white mb-2">Daftar Kucing Hilang</Text>
            <Text className="text-gray-300 text-sm leading-relaxed">
                Bantu kami menemukan mereka yang sedang dicari pemiliknya.
            </Text>
        </View>

        {/* List Content */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EBCD5E" />
            <Text className="text-white mt-4 text-xs">Memuat data...</Text>
          </View>
        ) : (
          <FlatList
            data={cats}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }) => <LostCatCard cat={item} />}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center mt-20 p-5 bg-white/10 rounded-xl">
                <Text className="text-gray-300 italic text-center">Tidak ada laporan kucing hilang saat ini.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}