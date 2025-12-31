import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Modal, 
  Dimensions, 
  StatusBar,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Menggunakan icon bawaan Expo
import { Colors } from '@/constants/Colors'; // Menggunakan konstanta warna project

const { width } = Dimensions.get('window');

// --- TIPE DATA DUMMY (Menyesuaikan struktur data Vue) ---
const DUMMY_POSTS = [
  {
    id: 1,
    author: 'Rina CatLover',
    username: 'rinacats',
    profileImg: 'https://i.pravatar.cc/150?img=1',
    time: '2 jam yang lalu',
    title: 'Kucingku gamau makan dry food',
    description: 'Ada saran gak ya teman-teman? Kucingku si Mochi tiba-tiba mogok makan dry food merk biasanya. Padahal biasanya lahap banget.',
    postImg: 'https://loremflickr.com/640/480/cat',
    likes: 12,
    comments: 5,
    isVerified: true,
    isLiked: false,
  },
  {
    id: 2,
    author: 'Budi Santoso',
    username: 'budis',
    profileImg: 'https://i.pravatar.cc/150?img=3',
    time: '5 jam yang lalu',
    title: 'Ditemukan kucing di area Tebet',
    description: 'Halo, baru saja nemu kucing oren di dekat stasiun tebet. Kalungnya warna merah. Kalau ada yang merasa kehilangan bisa hubungi saya.',
    postImg: null,
    likes: 45,
    comments: 12,
    isVerified: false,
    isLiked: true,
  },
  {
    id: 3,
    author: 'Komunitas Kucing Depok',
    username: 'depokcats',
    profileImg: 'https://i.pravatar.cc/150?img=5',
    time: '1 hari yang lalu',
    title: 'Gathering Minggu Ini!',
    description: 'Jangan lupa datang ke acara gathering rutin kita di Taman UI hari Minggu besok jam 8 pagi ya!',
    postImg: 'https://loremflickr.com/640/480/cat,gathering',
    likes: 102,
    comments: 34,
    isVerified: true,
    isLiked: false,
  },
];

export default function CommunityScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('untukAnda'); // 'untukAnda' | 'sorotan'
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

  // --- LOGIC: Handle Like ---
  const handleLike = (id: number) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );
  };

  // --- COMPONENT: Post Card (Mirip PostCard.vue) ---
  const renderPostItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Header Post */}
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.profileImg }} 
          style={styles.avatar} 
        />
        <View style={styles.headerTextContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{item.author}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#3b82f6" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.username}>@{item.username} · {item.time}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Content Post */}
      <View style={styles.cardContent}>
        {item.title ? <Text style={styles.postTitle}>{item.title}</Text> : null}
        <Text style={styles.postDescription} numberOfLines={4}>
          {item.description}
        </Text>
        
        {item.postImg && (
          <Image 
            source={{ uri: item.postImg }} 
            style={styles.postImage}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Footer / Actions */}
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={[styles.actionButton, item.isLiked && styles.likedAction]} 
          onPress={() => handleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={22} 
            color={item.isLiked ? "#FF5757" : "#9ca3af"} 
          />
          <Text style={[styles.actionText, item.isLiked && { color: '#FF5757' }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* --- HEADER --- */}
      {/* Menggunakan background image pattern jika ada, atau warna solid */}
      <ImageBackground 
        source={require('../../assets/images/background.png')} // Pastikan path ini benar sesuai struktur folder
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.4 }} // Supaya teks terbaca
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Komunitas</Text>
              <Text style={styles.headerSubtitle}>Tempat berbagi cerita & menolong kucing</Text>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari di komunitas..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Tabs (Untuk Anda / Sorotan) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'untukAnda' && styles.activeTabButton]}
                onPress={() => setActiveTab('untukAnda')}
              >
                <Text style={[styles.tabText, activeTab === 'untukAnda' && styles.activeTabText]}>
                  Untuk Anda
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'sorotan' && styles.activeTabButton]}
                onPress={() => setActiveTab('sorotan')}
              >
                <Text style={[styles.tabText, activeTab === 'sorotan' && styles.activeTabText]}>
                  Sorotan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* --- CONTENT LIST --- */}
      <View style={styles.contentContainer}>
        {activeTab === 'untukAnda' ? (
           <FlatList
            data={posts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPostItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Tidak ada postingan yang cocok.</Text>
            }
          />
        ) : (
          <View style={styles.centerEmpty}>
            <Text style={styles.emptyText}>Fitur Sorotan (Events/Leaderboard) belum tersedia di mobile.</Text>
          </View>
        )}
      </View>

      {/* --- FAB (Floating Action Button) --- */}
      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* --- MODAL CREATE POST --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buat Postingan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.label}>JUDUL</Text>
              <TextInput 
                style={styles.inputTitle} 
                placeholder="Berikan judul menarik..." 
                value={newPostTitle}
                onChangeText={setNewPostTitle}
              />
              
              <Text style={styles.label}>CERITA KAMU</Text>
              <TextInput 
                style={styles.inputContent} 
                placeholder="Ceritakan pengalamanmu..." 
                multiline 
                numberOfLines={4}
                textAlignVertical="top"
                value={newPostContent}
                onChangeText={setNewPostContent}
              />

              <TouchableOpacity style={styles.imageUploadBox}>
                <Ionicons name="camera" size={24} color="#78C89F" />
                <Text style={{color: '#6b7280', fontSize: 12, marginTop: 4}}>Tambah Foto</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.btnPost}
                onPress={() => {
                   Alert.alert("Sukses", "Postingan berhasil dibuat (simulasi)");
                   setModalVisible(false);
                   setNewPostTitle('');
                   setNewPostContent('');
                }}
              >
                <Text style={styles.btnPostText}>Posting</Text>
                <Ionicons name="paper-plane" size={16} color="#fff" style={{marginLeft: 5}} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Abu-abu muda background
  },
  // --- HEADER STYLES ---
  headerBackground: {
    backgroundColor: '#2c473c', // Warna hijau tua khas Cattake
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 15,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#d1d5db', // Gray-300
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 15,
    elevation: 3, // Shadow Android
    shadowColor: '#000', // Shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  // --- TAB STYLES ---
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 5,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  tabText: {
    color: '#9ca3af', // Text-gray-400
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },

  // --- CONTENT & CARD STYLES ---
  contentContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Shadow mirip web: shadow-md
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  username: {
    fontSize: 12,
    color: '#6b7280',
  },
  moreButton: {
    padding: 4,
  },
  cardContent: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  likedAction: {
    // backgroundColor: '#fee2e2', // Opsional: highlight merah muda tipis
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  // --- FAB STYLES ---
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#78C89F', // Warna hijau Cattake
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  modalBody: {
    gap: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: -8,
  },
  inputTitle: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  inputContent: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 100,
  },
  imageUploadBox: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    marginTop: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnCancelText: {
    color: '#6b7280',
    fontWeight: 'bold',
  },
  btnPost: {
    backgroundColor: '#78C89F',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#78C89F',
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  btnPostText: {
    color: 'white',
    fontWeight: 'bold',
  },
});