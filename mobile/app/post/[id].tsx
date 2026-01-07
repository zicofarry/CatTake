import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity,
  ScrollView, Image, Dimensions, ActivityIndicator, Alert,
  Platform, Keyboard, KeyboardAvoidingView // Ditambahkan
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient, { API_BASE_URL } from '@/api/apiClient';

const { width } = Dimensions.get('window');
const BASE_SERVER_URL = API_BASE_URL?.replace('/api/v1', '');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // State baru dari track/[id].tsx

  // States untuk fitur reply & edit
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<any>(null);

  // --- LOGIKA TRACKING KEYBOARD (Sesuai contoh track/[id].tsx) ---
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const resolveImageUrl = (path: string) => {
    if (!path || path === 'NULL' || path === 'NULL.JPG' || path === 'null') return 'https://i.pravatar.cc/150';
    if (path.startsWith('http')) return path;
    const serverUrl = BASE_SERVER_URL;
    if (path.startsWith('/public/')) return `${serverUrl}${path}`;
    if (path.startsWith('profile-') || path.startsWith('driver-')) return `${serverUrl}/public/img/profile/${path}`;
    if (path.startsWith('post-')) return `${serverUrl}/public/img/post/${path}`;
    return `${serverUrl}/public/img/${path}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postRes, userRes] = await Promise.all([
        apiClient.get(`/community/posts/${id}`),
        apiClient.get('/users/profile').catch(() => ({ data: null }))
      ]);
      setPost(postRes.data);
      setComments(postRes.data.commentData || []);
      setCurrentUser(userRes.data?.data || userRes.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      Alert.alert("Error", "Gagal memuat detail postingan.");
    } finally {
      setLoading(false);
    }
  };

  const getOrganizedComments = () => {
    const list: any[] = [];
    const roots = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);

    roots.forEach(root => {
      list.push({ ...root, depth: 0 });
      const processChildren = (parentId: number, currentDepth: number) => {
        replies.filter(r => r.parentId === parentId).forEach(child => {
          const target = comments.find(c => c.id === parentId);
          list.push({
            ...child,
            depth: 1,
            mention: currentDepth > 0 ? target?.user : null
          });
          processChildren(child.id, currentDepth + 1);
        });
      };
      processChildren(root.id, 0);
    });
    return list;
  };

  const handleCommentAction = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingComment) {
        await apiClient.put(`/community/posts/comments/${editingComment.id}`, { content: newComment });
        setEditingComment(null);
      } else {
        await apiClient.post(`/community/posts/${id}/comments`, {
          content: newComment,
          parentId: replyingTo?.id || null
        });
        setReplyingTo(null);
      }
      setNewComment('');
      Keyboard.dismiss();
      fetchData();
    } catch (error) {
      Alert.alert("Error", "Gagal memproses komentar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = (commentId: number) => {
    Alert.alert("Hapus Komentar", "Yakin ingin menghapus komentar ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/community/posts/comments/${commentId}`);
            fetchData();
          } catch (e) { Alert.alert("Error", "Gagal hapus komentar"); }
        }
      }
    ]);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color="#EBCD5E" size="large"/></View>;

  return (
    <ImageBackground source={require('../../assets/images/background.png')} style={styles.container} resizeMode="repeat">
      {/* PERBAIKAN: Menggunakan KeyboardAvoidingView dengan offset dinamis dari track/[id].tsx */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Offset disesuaikan: Android butuh offset saat keyboard tampil (140) seperti di track
        keyboardVerticalOffset={Platform.OS === 'android' ? (isKeyboardVisible ? 0 : -50) : 0}
      >
        <ScrollView
          ref={scrollRef}
          // Tambahkan paddingBottom ekstra agar konten ScrollView tidak tertutup input sticky
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>

          {post && (
            <>
              {/* Card Postingan */}
              <View style={styles.card}>
                <View style={styles.authorSection}>
                  <View style={styles.authorRow}>
                    <Image source={{ uri: resolveImageUrl(post.profileImg) }} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorName} numberOfLines={1}>{post.author}</Text>
                      <Text style={styles.authorUsername}>@{post.username} · {post.time}</Text>
                    </View>
                  </View>
                  {currentUser && Number(post.authorId) === Number(currentUser.id) && (
                    <TouchableOpacity onPress={() => Alert.alert("Opsi Post", "Menu delete post", [{text:"Hapus", onPress: async ()=> { await apiClient.delete(`/community/posts/${id}`); router.back(); }}])}>
                      <Ionicons name="ellipsis-vertical" size={22} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.title}>{post.title}</Text>
                {post.postImg && <Image source={{ uri: resolveImageUrl(post.postImg) }} style={styles.postImage} />}
                <Text style={styles.description}>{post.description}</Text>
              </View>

              {/* Section Daftar Komentar */}
              <View style={styles.commentSection}>
                <Text style={styles.commentTitle}><FontAwesome5 name="comments" size={18} /> Komentar ({post.comments})</Text>

                {getOrganizedComments().map((comment) => (
                  <View key={comment.id} style={[styles.commentItem, { marginLeft: comment.depth * 25 }]}>
                    <Image source={{ uri: resolveImageUrl(comment.profileImg) }} style={[styles.commentAvatar, comment.depth > 0 && { width:32, height:32 }]} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                         <View style={{flex: 1, paddingRight: 8}}>
                            <Text style={styles.commentAuthor} numberOfLines={1}>{comment.user}</Text>
                         </View>
                         <Text style={styles.commentTime} numberOfLines={1}>{comment.time}</Text>
                      </View>

                      <Text style={styles.commentText}>
                        {comment.mention && <Text style={{color: '#3b82f6', fontWeight: '600'}}>@{comment.mention} </Text>}
                        {comment.text}
                      </Text>

                      <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => { setReplyingTo(comment); setEditingComment(null); setNewComment(''); focusInput(); }}>
                          <Text style={styles.actionLink}>Balas</Text>
                        </TouchableOpacity>
                        {currentUser && Number(comment.userId) === Number(currentUser.id) && (
                          <>
                            <TouchableOpacity onPress={() => { setEditingComment(comment); setReplyingTo(null); setNewComment(comment.text); focusInput(); }}>
                              <Text style={styles.actionLink}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteComment(comment.id)}>
                              <Text style={[styles.actionLink, {color: '#ef4444'}]}>Hapus</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
                {comments.length === 0 && <Text style={styles.noComments}>Belum ada komentar.</Text>}
              </View>
            </>
          )}
        </ScrollView>

        {/* PERBAIKAN: Input Bar Sticky dengan padding dinamis (Mengikuti pola chat/track) */}
        <View style={[
          styles.stickyInputBar,
          { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : (isKeyboardVisible ? 10 : 25) }
        ]}>
          {(replyingTo || editingComment) && (
            <View style={styles.contextBar}>
              <Text style={styles.contextText}>
                {replyingTo ? `Membalas @${replyingTo.user}` : `Mengedit komentar...`}
              </Text>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setEditingComment(null); setNewComment(''); }}>
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.inputField}
              placeholder="Gimana menurut kamu?"
              placeholderTextColor="#9ca3af"
              value={newComment}
              onChangeText={setNewComment}
              multiline={false} // Diatur false agar konsisten seperti Chat saat terangkat
              style={{ color: '#1F1F1F', flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0'}}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleCommentAction} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator size="small" color="#1e293b"/> : <Ionicons name="paper-plane" size={20} color="#1e293b" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c473c' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c473c' },
  scrollContent: { padding: 16 },
  backButton: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 74, 69, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 4 },
  authorSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  authorName: { fontWeight: 'bold', fontSize: 17, color: '#111827' },
  authorUsername: { color: '#6b7280', fontSize: 13 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  postImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 16 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },

  // GAYA STICKY (Sesuai sistem chat)
  stickyInputBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },

  commentSection: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  commentTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c473c', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 10 },
  commentItem: { flexDirection: 'row', marginBottom: 18, gap: 10 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9' },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  commentTime: { fontSize: 11, color: '#94a3b8', flexShrink: 1 },
  commentText: { color: '#475569', fontSize: 14, lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: 15, marginTop: 6 },
  actionLink: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  noComments: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: 20 },

  contextBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 8 },
  contextText: { fontSize: 12, color: '#3b82f6', fontStyle: 'italic', fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sendButton: { backgroundColor: '#EBCD5E', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' }
});