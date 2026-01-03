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
  // SafeAreaView, // Hapus ini
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // [1] Import Insets
import apiClient, { API_BASE_URL } from '@/api/apiClient';

const { width } = Dimensions.get('window');
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

export default function CommunityScreen() {
  const insets = useSafeAreaInsets(); // [2] Panggil Hooks

  // --- STATE (TIDAK BERUBAH) ---
  const [activeTab, setActiveTab] = useState('untukAnda'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState({
    events: [],
    popular: [],
    missing: [],
    activeMembersByActivity: [],
    activeMembersByPoints: [],
    fact: null
  });

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- API CALLS (TIDAK BERUBAH) ---
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/community/posts');
      setPosts(res.data);
    } catch (e) {
      console.error("Fetch Posts Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebar = async () => {
    try {
      const res = await apiClient.get('/community/sidebar');
      setSidebarData(res.data.data);
    } catch (e) {
      console.error("Sidebar Error:", e);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSidebar();
  }, []);

  // --- HANDLERS (TIDAK BERUBAH) ---
  const handleLike = async (id: number) => {
    try {
      setPosts(current => current.map(p => p.id === id ? {
        ...p, 
        isLiked: !p.isLiked, 
        likes: p.isLiked ? (parseInt(p.likes) || 1) - 1 : (parseInt(p.likes) || 0) + 1
      } : p));
      
      await apiClient.post(`/community/posts/${id}/like`);
    } catch (e) {
      fetchPosts(); 
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent) return Alert.alert("Peringatan", "Konten tidak boleh kosong");
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (newPostTitle) formData.append('title', newPostTitle);
      formData.append('content', newPostContent);
      
      await apiClient.post('/community/posts', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });

      setModalVisible(false);
      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts();
      Alert.alert("Sukses", "Postingan berhasil dibuat");
    } catch (e) {
      Alert.alert("Error", "Gagal memposting. Pastikan Anda sudah login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS (TIDAK BERUBAH) ---
  const resolveImg = (path: string) => {
    if (!path || path.includes('NULL')) return 'https://i.pravatar.cc/150';
    return path.startsWith('http') ? path : `${BASE_SERVER_URL}${path}`;
  };

  const renderPostItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: resolveImg(item.profileImg) }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.authorName}>{item.author}</Text>
            {item.isVerified && <Ionicons name="checkmark-circle" size={14} color="#3b82f6" style={{marginLeft:4}} />}
          </View>
          <Text style={styles.username}>@{item.username} · {item.time}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
        <Text style={styles.postDescription} numberOfLines={4}>{item.description}</Text>
        {item.postImg && (
          <Image source={{ uri: resolveImg(item.postImg) }} style={styles.postImage} resizeMode="cover" />
        )}
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id)}>
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? "#FF5757" : "#6b7280"} 
          />
          <Text style={[styles.actionText, item.isLiked && {color:'#FF5757'}]}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={styles.actionText}>{item.comments || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SorotanTab = () => (
    <ScrollView style={styles.sorotanContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.sideCard}>
        <Text style={styles.sideTitle}>Event Mendatang</Text>
        {sidebarData.events.length === 0 ? <Text style={styles.emptySide}>Belum ada event.</Text> :
          sidebarData.events.map((ev: any, i) => (
            <View key={i} style={styles.eventItem}>
              <View style={styles.eventRow}>
                <Image source={require('../../assets/images/calendar.png')} style={styles.sideIcon} />
                <View>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventSub}>{ev.date}</Text>
                </View>
              </View>
              <View style={styles.eventDetailRow}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text style={styles.eventDetailText}>{ev.time}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.eventDetailText}>{ev.location}</Text>
              </View>
            </View>
          ))
        }
      </View>

      <View style={styles.sideCard}>
        <Text style={styles.sideTitle}>Kucing Hilang</Text>
        {sidebarData.missing.length === 0 ? <Text style={styles.emptySide}>Tidak ada laporan.</Text> :
          sidebarData.missing.map((cat: any, i) => (
            <View key={i} style={styles.lostItem}>
              <Image source={{ uri: resolveImg(cat.image) }} style={styles.lostImg} />
              <View style={{flex:1}}>
                <Text style={styles.lostName}>{cat.name}</Text>
                <Text style={styles.lostAddr} numberOfLines={1}>Lokasi: {cat.address}</Text>
                {cat.reward > 0 && <Text style={styles.lostReward}>Reward: Rp{cat.reward.toLocaleString('id-ID')}</Text>}
              </View>
            </View>
          ))
        }
      </View>

      <View style={styles.sideCard}>
        <Text style={styles.sideTitle}>Leaderboard Paws (Poin)</Text>
        {sidebarData.activeMembersByPoints.map((m: any, i) => (
          <View key={i} style={styles.leaderItem}>
            <View>
              <Image source={{ uri: resolveImg(m.profilePic) }} style={styles.leaderAvatar} />
              {i < 3 && (
                <View style={[styles.badge, { backgroundColor: i===0?'#fbbf24':i===1?'#9ca3af':'#f97316' }]}>
                  <FontAwesome5 name="crown" size={7} color="#fff" />
                </View>
              )}
            </View>
            <View>
              <Text style={styles.leaderName}>{m.name}</Text>
              <Text style={styles.leaderScore}>{m.score.toLocaleString('id-ID')} Poin</Text>
            </View>
          </View>
        ))}
      </View>

      {sidebarData.fact && (
        <View style={styles.sideCard}>
          <Text style={styles.sideTitle}>Fakta Kucing</Text>
          <View style={styles.factRow}>
            <Image source={{ uri: resolveImg(sidebarData.fact.image) }} style={styles.factImg} />
            <Text style={styles.factText}>{sidebarData.fact.fact}</Text>
          </View>
        </View>
      )}
      <View style={{ height: 120 }} />
    </ScrollView>
  );

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={styles.fullBackground}
      imageStyle={{
        width: 400,
        height: 700,
      }}
      resizeMode="repeat"
    >
      {/* [3] Ganti SafeAreaView dengan View biasa */}
      <View style={styles.safeContainer}>
        <StatusBar barStyle="light-content" />
        
        {/* [4] Tambahkan paddingTop dinamis di sini */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.mainTitle}>Komunitas</Text>
          <Text style={styles.mainSub}>Tempat berbagi cerita & menolong kucing bersama</Text>
          
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput 
              placeholder="Cari di komunitas..." 
              placeholderTextColor="#9ca3af"
              style={styles.searchInputs}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity onPress={() => setActiveTab('untukAnda')} style={[styles.tabBtn, activeTab === 'untukAnda' && styles.tabActive]}>
              <Text style={[styles.tabTextHeader, activeTab === 'untukAnda' && styles.tabLabelActive]}>Untuk Anda</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('sorotan')} style={[styles.tabBtn, activeTab === 'sorotan' && styles.tabActive]}>
              <Text style={[styles.tabTextHeader, activeTab === 'sorotan' && styles.tabLabelActive]}>Sorotan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {activeTab === 'untukAnda' ? (
            loading ? <ActivityIndicator color="#78C89F" style={{marginTop:20}} /> :
            <FlatList 
              data={posts.filter((p: any) => (p.title + p.description).toLowerCase().includes(searchQuery.toLowerCase()))}
              renderItem={renderPostItem}
              keyExtractor={(item: any) => item.id.toString()}
              contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.empty}>Belum ada postingan yang cocok.</Text>}
            />
          ) : <SorotanTab />}
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        {/* Modal Create Post */}
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
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
                  placeholder="Judul menarik..." 
                  style={styles.input} 
                  value={newPostTitle} 
                  onChangeText={setNewPostTitle} 
                />
                <Text style={styles.label}>CERITA KAMU</Text>
                <TextInput 
                  placeholder="Ceritakan pengalamanmu..." 
                  multiline 
                  numberOfLines={4}
                  style={[styles.input, { height: 120, textAlignVertical: 'top' }]} 
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
                  <Text style={{fontWeight:'bold', color:'#6b7280'}}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.postBtn, isSubmitting && {opacity: 0.7}]} 
                  onPress={handleCreatePost}
                  disabled={isSubmitting}
                >
                  <Text style={styles.postBtnText}>{isSubmitting ? 'Mengirim...' : 'Posting'}</Text>
                  {!isSubmitting && <Ionicons name="paper-plane" size={16} color="#fff" style={{marginLeft:8}} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fullBackground: { flex: 1, backgroundColor: '#2c473c' },
  safeContainer: { flex: 1 },
  // Hapus paddingTop statis dari sini, karena sudah di-handle inline
  header: { padding: 20, /* paddingTop: 10 */ }, 
  mainTitle: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  mainSub: { color: '#cbd5e1', marginBottom: 20, fontSize: 13, lineHeight: 18 },
  searchBox: { 
    backgroundColor: '#fff', borderRadius: 25, flexDirection: 'row', 
    alignItems: 'center', paddingHorizontal: 15, height: 45, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  searchInputs: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1e293b' },
  tabBar: { flexDirection: 'row', justifyContent: 'center', gap: 30 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#fff' },
  tabTextHeader: { color: '#94a3b8', fontWeight: 'bold', fontSize: 14 },
  tabLabelActive: { color: '#fff' },
  content: { flex: 1 },
  empty: { color: '#fff', textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerTextContainer: { marginLeft: 12 },
  authorName: { fontWeight: 'bold', fontSize: 15, color: '#1e293b' },
  username: { color: '#64748b', fontSize: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  postTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 6, color: '#0f172a' },
  postDescription: { color: '#334155', lineHeight: 20, fontSize: 14 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 12 },
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, marginTop: 12, gap: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#64748b', fontWeight: 'bold', fontSize: 14 },

  sorotanContainer: { padding: 16 },
  sideCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  sideTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  sideIcon: { width: 22, height: 22, resizeMode: 'contain' },
  emptySide: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' },
  eventItem: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 },
  eventRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  eventTitle: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  eventSub: { fontSize: 11, color: '#64748b' },
  eventDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  eventDetailText: { fontSize: 12, color: '#475569' },
  lostItem: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  lostImg: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f1f5f9' },
  lostName: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  lostAddr: { fontSize: 11, color: '#64748b' },
  lostReward: { fontSize: 11, fontWeight: 'bold', color: '#2c473c', marginTop: 3 },
  leaderItem: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 },
  leaderAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  leaderName: { fontWeight: 'bold', fontSize: 13, color: '#1e293b' },
  leaderScore: { fontSize: 11, color: '#3A5F50', fontWeight: 'bold' },
  badge: { position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  factRow: { flexDirection: 'row', gap: 12 },
  factImg: { width: 64, height: 64, borderRadius: 12 },
  factText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },

  fab: { 
    position: 'absolute', 
    bottom: 110, 
    right: 25, 
    width: 60, height: 60, 
    borderRadius: 30, backgroundColor: '#78C89F', alignItems: 'center', 
    justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, zIndex: 99
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  modalBody: { gap: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8' },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 14, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  imageUploadBox: { 
    borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', 
    borderRadius: 12, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' 
  },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, gap: 12 },
  btnCancel: { padding: 12 },
  postBtn: { backgroundColor: '#78C89F', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  postBtnText: { color: '#fff', fontWeight: 'bold' }
});