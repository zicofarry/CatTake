import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  TextInput,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// MOCK DATA (Data Palsu untuk Contoh Tampilan)
const MOCK_CHATS = [
  {
    id: '1',
    name: 'Rumah Kucing Bandung',
    lastMessage: 'Siap kak, nanti dikabari ya kalau Mochi sudah vaksin.',
    time: '19/12/25',
    unread: 4,
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200',
    isOfficial: true,
  },
  {
    id: '2',
    name: 'Shelter Peduli Hewan',
    lastMessage: 'Boleh kak, ditunggu kedatangannya besok siang.',
    time: '02/12/25',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=200',
    isOfficial: false,
  },
  {
    id: '3',
    name: 'Cat Rescue Center',
    lastMessage: 'Halo Kak, perkenalkan saya Admin CRC, ada yang bisa dibantu?',
    time: '09/07/25',
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1495360019602-e001b27202ef?q=80&w=200',
    isOfficial: true,
  },
  {
    id: '4',
    name: 'Komunitas Kucing Garut',
    lastMessage: '[Pesan Otomatis] Terima kasih telah menghubungi kami.',
    time: 'Kemarin',
    unread: 3,
    avatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=200',
    isOfficial: false,
  },
];

export default function ChatListScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: `/chat/${item.id}`,
        params: { name: item.name, avatar: item.avatar }
      })}
    >
      {/* Avatar Container */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOfficial && (
           <View style={styles.officialBadge}>
             <Text style={styles.officialText}>Mall</Text>
           </View>
        )}
      </View>
      
      {/* Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
             <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
             {/* Panah kecil ala Shopee (opsional) */}
             <MaterialIcons name="chevron-right" size={16} color="#ccc" />
          </View>
          <Text style={[styles.time, item.unread > 0 && styles.timeActive]}>{item.time}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={[styles.message, item.unread > 0 && styles.messageUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          
          {/* Badge Merah jika ada pesan belum dibaca */}
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
      <Stack.Screen options={{ 
        headerTitle: 'Chat',
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: '500', fontSize: 18 },
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }} />
      
      {/* Search Bar ala Referensi */}
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

      <FlatList
        data={MOCK_CHATS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Abu-abu muda
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },

  // List Item Styles
  listContainer: { paddingBottom: 20 },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  
  // Avatar
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  officialBadge: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    backgroundColor: '#D0011B', // Merah Mall/Shopee
    borderRadius: 4,
    paddingVertical: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Content Text
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    borderBottomWidth: 0, // Tidak pake border di view ini, pake separator
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: '500', // Agak tebal tapi ga bold banget
    color: '#333',
    marginRight: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  timeActive: {
    color: '#ff5722', // Warna oranye dikit kalau unread (opsional)
  },

  // Message & Badge
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: '#888',
    flex: 1,
    marginRight: 10,
  },
  messageUnread: {
    color: '#333', // Lebih gelap kalau belum dibaca
    fontWeight: '400', 
  },
  unreadBadge: {
    backgroundColor: '#ff5722', // Merah notifikasi
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },

  separator: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginLeft: 78, // Indentasi supaya garis tidak nabrak avatar
  },
});