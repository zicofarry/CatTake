import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, 
  ScrollView, Image, Dimensions, ActivityIndicator, Alert, 
  KeyboardAvoidingView, Platform 
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

  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States untuk fitur reply & edit
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<any>(null);

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

  // --- LOGIKA NESTING KOMENTAR (Level 2 Max) ---
  const getOrganizedComments = () => {
    const list: any[] = [];
    const roots = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);

    roots.forEach(root => {
      list.push({ ...root, depth: 0 });
      const processChildren = (parentId: number, currentDepth: number) => {
        replies.filter(r => r.parentId === parentId).forEach(child => {
          // Cari user yang dibalas untuk mention
          const target = comments.find(c => c.id === parentId);
          list.push({ 
            ...child, 
            depth: 1, // Mentok level 2 (Depth 1)
            mention: currentDepth > 0 ? target?.user : null 
          });
          processChildren(child.id, currentDepth + 1);
        });
      };
      processChildren(root.id, 0);
    });
    return list;
  };

  // --- HANDLERS ---
  const handleCommentAction = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingComment) {
        // Edit Komentar
        await apiClient.put(`/community/posts/comments/${editingComment.id}`, { content: newComment });
        setEditingComment(null);
      } else {
        // Tambah/Reply Komentar
        await apiClient.post(`/community/posts/${id}/comments`, { 
          content: newComment,
          parentId: replyingTo?.id || null
        });
        setReplyingTo(null);
      }
      setNewComment('');
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
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          try {
            await apiClient.delete(`/community/posts/comments/${commentId}`);
            fetchData();
          } catch (e) { Alert.alert("Error", "Gagal hapus komentar"); }
        }
      }
    ]);
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color="#EBCD5E" size="large"/></View>;

  return (
    <ImageBackground source={require('../../assets/images/background.png')} style={styles.container} resizeMode="repeat">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>

          {post && (
            <>
              {/* Card Postingan (Logika titik tiga post tetap sama) */}
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

              {/* Section Komentar */}
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
                         {/* TIMESTAMP: Diperbaiki agar tidak overflow */}
                         <Text style={styles.commentTime} numberOfLines={1}>{comment.time}</Text>
                      </View>
                      
                      <Text style={styles.commentText}>
                        {comment.mention && <Text style={{color: '#3b82f6', fontWeight: '600'}}>@{comment.mention} </Text>}
                        {comment.text}
                      </Text>

                      <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => { setReplyingTo(comment); setEditingComment(null); setNewComment(''); }}>
                          <Text style={styles.actionLink}>Balas</Text>
                        </TouchableOpacity>
                        {currentUser && Number(comment.userId) === Number(currentUser.id) && (
                          <>
                            <TouchableOpacity onPress={() => { setEditingComment(comment); setReplyingTo(null); setNewComment(comment.text); }}>
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
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Input Box Melayang dengan Info Context (Edit/Reply) */}
        <View style={[styles.footerInput, { paddingBottom: insets.bottom + 10 }]}>
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
              style={styles.inputField} 
              placeholder="Tulis komentar..." 
              value={newComment} 
              onChangeText={setNewComment} 
              multiline
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
  backButton: { position: 'absolute', left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(45, 74, 69, 0.8)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, zIndex: 10 },
  backButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 4 },
  authorSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  authorName: { fontWeight: 'bold', fontSize: 17, color: '#111827' },
  authorUsername: { color: '#6b7280', fontSize: 13 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  postImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 16 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  commentSection: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  commentTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c473c', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 10 },
  commentItem: { flexDirection: 'row', marginBottom: 18, gap: 10 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9' },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  commentTime: { fontSize: 11, color: '#94a3b8', flexShrink: 1 }, //
  commentText: { color: '#475569', fontSize: 14, lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: 15, marginTop: 6 },
  actionLink: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  noComments: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: 20 },
  footerInput: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  contextBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  contextText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  inputField: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100, fontSize: 14 },
  sendButton: { backgroundColor: '#EBCD5E', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});