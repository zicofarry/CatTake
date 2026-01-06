import React, { useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient, { resolveImageUrl } from '@/api/apiClient';
import { Colors } from '@/constants/Colors'; 

const THEME_COLOR = '#3A5F50'; 

export default function ChatListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [searchText, setSearchText] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbox = async () => {
    try {
      if (!refreshing) setLoading(true); 
      const response = await apiClient.get('/chat/inbox');
      setChats(response.data.data); 
    } catch (error) {
      console.error("Gagal memuat inbox:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchInbox(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInbox();
  }, []);

  const filteredChats = chats.filter((item: any) => 
    item.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    // 1. Resolve URL Cloudinary
    const imageUrl = resolveImageUrl(item.profile_photo);

    // 2. Tentukan Fallback berdasarkan Role (Shelter vs Individu/Driver)
    // Asumsi: Backend mengirimkan property 'role' atau 'is_shelter'
    const isShelter = item.role === 'shelter' || item.is_official === true;
    const fallbackImage = isShelter 
      ? require('@/assets/images/null-shelter.png') 
      : require('@/assets/images/null.png');

    return (
      <TouchableOpacity 
        style={styles.chatCard}
        activeOpacity={0.9}
        onPress={() => router.push({
          pathname: `/chat/${item.partner_id}`,
          params: { name: item.name, avatar: item.profile_photo }
        })}
      >
        <View style={styles.avatarContainer}>
          {/* Tampilkan Cloudinary jika ada, jika tidak pakai require() lokal */}
          <Image 
            source={imageUrl ? { uri: imageUrl } : fallbackImage} 
            style={styles.avatar} 
          />
          
          {/* Badge is_official (Dinamis untuk Individu & Shelter) */}
          {item.is_official && (
             <View style={styles.verifiedBadge}>
               <Ionicons name="checkmark-circle" size={12} color="white" />
             </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.time, item.unread > 0 && styles.timeActive]}>
              {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
          <View style={styles.messageRow}>
            <Text 
              style={[styles.message, item.unread > 0 ? styles.messageUnread : styles.messageRead]} 
              numberOfLines={1}
            >
              {item.last_message}
            </Text>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitleText}>Pesan</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput 
            placeholder="Cari teman diskusi..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={THEME_COLOR} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={item => item.partner_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLOR} colors={[THEME_COLOR]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#ccc" style={{marginBottom: 10}} />
                <Text style={styles.emptyText}>Belum ada obrolan.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  headerContainer: { 
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 20, 
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    elevation: 5,
    zIndex: 10
  },
  headerTitleText: {
    color: '#fff', fontSize: 24, fontWeight: 'bold',
    marginBottom: 15, marginLeft: 5
  },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    borderRadius: 25, paddingHorizontal: 15, height: 45,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333', height: '100%' },
  contentContainer: { flex: 1 },
  listPadding: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 5 },
  chatCard: { 
    flexDirection: 'row', padding: 16, alignItems: 'center', backgroundColor: '#fff',
    marginBottom: 12, borderRadius: 16, elevation: 2,
  },
  avatarContainer: { position: 'relative', marginRight: 15 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#eee' },
  verifiedBadge: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: '#3b82f6', // Biru untuk verified individu/umum
    borderRadius: 10, width: 18, height: 18, 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1.5, borderColor: '#fff' 
  },
  chatContent: { flex: 1, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#1f2937', flex: 1, marginRight: 8 },
  time: { fontSize: 11, color: '#9ca3af' },
  timeActive: { color: THEME_COLOR, fontWeight: '600' },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  message: { fontSize: 14, flex: 1, marginRight: 10 },
  messageRead: { color: '#6b7280' },
  messageUnread: { color: '#1f2937', fontWeight: '600' },
  unreadBadge: { backgroundColor: Colors.primary || '#f97316', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', fontSize: 14 }
});