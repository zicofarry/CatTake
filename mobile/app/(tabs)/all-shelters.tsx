import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  StatusBar, ImageBackground, TouchableOpacity, TextInput, StyleSheet, Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import ShelterCard from '../../components/ShelterCard';
import StickyBackButton from '../../components/StickyBackButton';

export default function AllSheltersScreen() {
  // ==========================================
  // LOGIC (TETAP SAMA / TIDAK BERUBAH)
  // ==========================================
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [shelters, setShelters] = useState<any[]>([]);
  //const [filteredShelters, setFilteredShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchShelters();
  }, []);

  const resolveImageUrl = (path: string | null, type: 'cat' | 'shelter' = 'cat') => {
    // Cek jika null atau string 'NULL'
    if (!path || path === 'NULL' || path === 'null.png' || path === 'null' || path === '/img/null.png') {
      if (type === 'shelter') {
        return require('../../assets/images/null-shelter.png'); // Gambar lokal shelter
      }
      return require('../../assets/images/null.png'); // Gambar lokal kucing
    }

    // Jika sudah URL lengkap (Cloudinary biasanya http/https)
    if (path.startsWith('http')) {
      return { uri: path };
    }

    // Jika path relatif ke server internal
    if (path.startsWith('cat-')) {
      return { uri: `${serverUrl}/public/img/cats/${path}` };
    }

    return { uri: path };
  };
  
  const fetchShelters = async () => {
    try {
      const response = await apiClient.get('/users/shelters');
      const data = response.data.data ? response.data.data : response.data;
      setShelters(data);
      setFilteredShelters(data);
    } catch (error) {
      console.error("Gagal ambil shelters:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSearch = (text: string) => {
  //   setSearchQuery(text);
  //   if (text === '') {
  //     setFilteredShelters(shelters);
  //   } else {
  //     const filtered = shelters.filter((s: any) => 
  //       s.shelter_name.toLowerCase().includes(text.toLowerCase())
  //     );
  //     setFilteredShelters(filtered);
  //   }
  // };

  const filteredShelters = React.useMemo(() => {
    if (!searchQuery) return shelters;
    return shelters.filter((s: any) => 
      s.shelter_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, shelters]);

  const handleClearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss(); // Pastikan import Keyboard
  };

  // ==========================================
  // VIEW (FULL NATIVEWIND)
  // ==========================================
  return (
    <View className="flex-1 bg-[#2C473C]">
      <StatusBar barStyle="light-content" backgroundColor="#1F352C" />
      
      <StickyBackButton />

      <ImageBackground
        source={require('../../assets/images/bg-texture.png')}
        className="absolute inset-0"
        resizeMode="cover"
      />

      <FlatList
        data={filteredShelters}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        // PaddingTop tetap menggunakan inline style karena nilainya dinamis dari insets
        contentContainerStyle={{ 
          paddingTop: insets.top + 60, 
          paddingHorizontal: 20, 
          paddingBottom: 100 
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListHeaderComponent={
          <View className="mb-6 items-center">
            <Text className="text-[28px] font-bold text-white text-center">
              Semua Shelter
            </Text>
            <Text className="text-[14px] text-gray-300 text-center mt-2 px-5">
              Temukan panti asuhan kucing yang butuh dukunganmu.
            </Text>
            
            <View className="flex-row items-center bg-white/10 border border-white/20 rounded-2xl px-4 py-3 mt-6 w-full">
              <Ionicons name="search" size={20} color="#d1d5db" />
              <TextInput
                placeholder="Cari nama shelter..."
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-2 text-white text-[14px]"
                value={searchQuery}
                onChangeText={setSearchQuery} // <--- Ganti jadi setSearchQuery langsung
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch}>
                   <Ionicons name="close-circle" size={18} color="#d1d5db" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }

        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push(`/shelter/${item.id}` as any)}
            className="w-[48%] mb-4"
          >
            <ShelterCard
              id={item.id}
              name={item.shelter_name}
              address={item.organization_type || "Mandiri"}
              image={resolveImageUrl(item.shelter_picture, 'shelter') || '@/assets/images/null-shelter.png'}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && (
          <View className="mt-20 items-center">
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
            <Text className="text-white text-center mt-2 italic text-[16px]">
              Shelter tidak ditemukan.
            </Text>
          </View>
        )}
      />

      {loading && (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EBCD5E" />
        </View>
      )}
    </View>
  );
}