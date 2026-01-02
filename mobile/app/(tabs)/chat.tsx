import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import apiClient, { API_BASE_URL } from '@/api/apiClient';

const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

export default function ChatListScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil data inbox dari backend
  const fetchInbox = async () => {
    try {
      const response = await apiClient.get('/chat/inbox');
      setChats(response.data.data); // Data dari ShelterChatController.getInbox
    } catch (error) {
      console.error("Gagal memuat inbox:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInbox();
  }, []);

  // Filter data berdasarkan teks pencarian
  const filteredChats = chats.filter((item: any) => 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const resolveImg = (path: string) => {
    if (!path || path.includes('NULL')) return 'https://i.pravatar.cc/150';
    return path.startsWith('http') ? path : `${BASE_SERVER_URL}${path}`;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: `/chat/${item.partner_id}`, // Navigasi ke ID lawan bicara
        params: { name: item.name, avatar: resolveImg(item.profile_photo) }
      })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: resolveImg(item.profile_photo) }} style={styles.avatar} />
        {item.is_official && ( // Sesuaikan jika ada field official di DB
           <View style={styles.officialBadge}>
             <Text style={styles.officialText}>Mall</Text>
           </View>
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
             <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
             <MaterialIcons name="chevron-right" size={16} color="#ccc" />
          </View>
          <Text style={[styles.time, item.unread > 0 && styles.timeActive]}>
            {new Date(item.time).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={[styles.message, item.unread > 0 && styles.messageUnread]} numberOfLines={1}>
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Chat' }} />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput 
            placeholder="Cari Kontak, Penjual, & Pesan"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3A5F50" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.partner_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Belum ada pesan.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

// ... Styles tetap sama seperti kode asli kamu ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 6, paddingHorizontal: 10, height: 40 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333', height: '100%' },
  listContainer: { paddingBottom: 20 },
  chatItem: { flexDirection: 'row', padding: 16, alignItems: 'flex-start', backgroundColor: '#fff' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', borderWidth: 1, borderColor: '#f0f0f0' },
  officialBadge: { position: 'absolute', bottom: -4, left: 0, right: 0, backgroundColor: '#D0011B', borderRadius: 4, paddingVertical: 1, alignItems: 'center', justifyContent: 'center' },
  officialText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  chatContent: { flex: 1, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: '#333', marginRight: 4 },
  time: { fontSize: 12, color: '#999' },
  timeActive: { color: '#ff5722' },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  message: { fontSize: 14, color: '#888', flex: 1, marginRight: 10 },
  messageUnread: { color: '#333', fontWeight: '400' },
  unreadBadge: { backgroundColor: '#ff5722', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  separator: { height: 1, backgroundColor: '#f5f5f5', marginLeft: 78 },
});