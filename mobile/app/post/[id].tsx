import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity,
  ScrollView, Image, Dimensions, ActivityIndicator,
  Platform, Keyboard, KeyboardAvoidingView, Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import apiClient, { API_BASE_URL } from '@/api/apiClient';

// IMPORT CUSTOM COMPONENTS
import ConfirmModal from '@/components/ConfirmModal';
import CustomPopup from '@/components/CustomPopup';

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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // States untuk fitur reply & edit komentar
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingComment, setEditingComment] = useState<any>(null);

  // States untuk Menu & Edit (Post & Komentar)
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [commentMenuVisible, setCommentMenuVisible] = useState<{ visible: boolean, comment: any }>({ visible: false, comment: null });

  // States untuk UI Feedback
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState({ type: 'success' as any, title: '', message: '' });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [postDeleteConfirmVisible, setPostDeleteConfirmVisible] = useState(false);
  const [targetDelete, setTargetDelete] = useState<any>(null);

  const showPopup = (type: any, title: string, message: string) => {
    setPopupData({ type, title, message });
    setPopupVisible(true);
  };

  // --- 1. INITIALIZATION & AUTH ---
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const decoded: any = jwtDecode(token);
          setCurrentUserId(Number(decoded.id));
        }
      } catch (e) { console.error("Auth Init Error:", e); }
    };
    init();
    fetchData();
  }, [id]);

  // --- 2. TRACK KEYBOARD ---
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
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
      showPopup('error', 'Error', 'Gagal memuat detail postingan.');
    } finally { setLoading(false); }
  };

  // --- 3. LOGIKA KOMENTAR REKURSIF (Flatten Tree) ---
  const getOrganizedComments = () => {
    const list: any[] = [];
    const flatten = (items: any[], currentDepth: number, parentName: string | null, isReply: boolean) => {
      items.forEach(item => {
        const isDeep = currentDepth >= 1;
        list.push({
          ...item,
          depth: isDeep ? 1 : currentDepth,
          mention: isDeep ? parentName : null,
          isReply: isReply
        });
        if (item.replies && item.replies.length > 0) {
          flatten(item.replies, currentDepth + 1, item.user, true);
        }
      });
    };
    flatten(comments, 0, null, false);
    return list;
  };

  // --- 4. AKSI POSTINGAN ---
  const handleUpdatePost = async () => {
    if (!editPostContent.trim()) return showPopup('error', 'Peringatan', 'Konten tidak boleh kosong.');
    setIsSubmitting(true);
    try {
      await apiClient.put(`/community/posts/${id}`, { title: editPostTitle, content: editPostContent });
      setIsEditingPost(false);
      showPopup('success', 'Berhasil', 'Cerita kamu telah diperbarui.');
      fetchData();
    } catch (e) { showPopup('error', 'Gagal', 'Gagal mengupdate postingan.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeletePost = async () => {
    try {
      await apiClient.delete(`/community/posts/${id}`);
      setPostDeleteConfirmVisible(false);
      router.back();
    } catch (e) { showPopup('error', 'Gagal', 'Gagal menghapus postingan.'); }
  };

  // --- 5. AKSI KOMENTAR ---
  const handleCommentAction = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingComment) {
        const route = editingComment.isReply ? 'replies' : 'comments';
        await apiClient.put(`/community/${route}/${editingComment.id}`, { content: newComment });
        setEditingComment(null);
      } else {
        if (replyingTo) {
          const rootCommentId = replyingTo.comment_id || replyingTo.id;
          await apiClient.post(`/community/comments/${rootCommentId}/replies`, {
            content: newComment,
            parentReplyId: replyingTo.isReply ? replyingTo.id : null
          });
        } else {
          await apiClient.post(`/community/posts/${id}/comments`, { content: newComment });
        }
        setReplyingTo(null);
      }
      setNewComment('');
      Keyboard.dismiss();
      fetchData();
    } catch (error) { showPopup('error', 'Gagal', 'Gagal mengirim komentar.'); }
    finally { setIsSubmitting(false); }
  };

  const executeDeleteComment = async () => {
    if (!targetDelete) return;
    try {
      const route = targetDelete.isReply ? 'replies' : 'comments';
      await apiClient.delete(`/community/${route}/${targetDelete.id}`);
      setConfirmVisible(false);
      fetchData();
    } catch (e) { showPopup('error', 'Gagal', 'Gagal hapus komentar.'); }
  };

  const focusInput = () => inputRef.current?.focus();

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color="#EBCD5E" size="large" /></View>;

  return (
    <ImageBackground source={require('../../assets/images/background.png')} style={styles.container} resizeMode="repeat">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? (isKeyboardVisible ? 0 : -50) : 0}
      >
        <ScrollView
          ref={scrollRef}
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
              <View style={styles.card}>
                <View style={styles.authorSection}>
                  <View style={styles.authorRow}>
                    <Image source={{ uri: resolveImageUrl(post.profileImg) }} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorName} numberOfLines={1}>{post.author}</Text>
                      <Text style={styles.authorUsername}>@{post.username} · {post.time}</Text>
                    </View>
                  </View>
                  {/* TITIK TIGA POSTINGAN */}
                  {(currentUserId === Number(post.authorId) || (currentUser && Number(post.authorId) === Number(currentUser.id))) && (
                    <TouchableOpacity onPress={() => setPostMenuVisible(true)} style={{ padding: 5 }}>
                      <Ionicons name="ellipsis-vertical" size={22} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.title}>{post.title}</Text>
                {post.postImg && <Image source={{ uri: resolveImageUrl(post.postImg) }} style={styles.postImage} />}
                <Text style={styles.description}>{post.description}</Text>
              </View>

              <View style={styles.commentSection}>
                <Text style={styles.commentTitle}><FontAwesome5 name="comments" size={18} /> Komentar ({post.comments})</Text>

                {getOrganizedComments().map((comment) => (
                  <View key={`${comment.isReply ? 'r' : 'c'}-${comment.id}`} style={[styles.commentItem, { marginLeft: comment.depth * 25 }]}>
                    <Image source={{ uri: resolveImageUrl(comment.profileImg) }} style={[styles.commentAvatar, comment.depth > 0 && { width: 32, height: 32 }]} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.commentAuthor} numberOfLines={1}>{comment.user}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.commentTime}>{comment.time}</Text>
                          {/* TITIK TIGA KOMENTAR */}
                          {(currentUserId === Number(comment.userId) || (currentUser && Number(comment.userId) === Number(currentUser.id))) && (
                            <TouchableOpacity onPress={() => setCommentMenuVisible({ visible: true, comment })}>
                              <Ionicons name="ellipsis-horizontal" size={16} color="#94a3b8" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      <Text style={styles.commentText}>
                        {comment.mention && <Text style={{ color: '#78C89F', fontWeight: 'bold' }}>@{comment.mention} </Text>}
                        {comment.text}
                      </Text>

                      <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => { setReplyingTo(comment); setEditingComment(null); setNewComment(''); focusInput(); }}>
                          <Text style={styles.actionLink}>Balas</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                {comments.length === 0 && <Text style={styles.noComments}>Belum ada komentar.</Text>}
              </View>
            </>
          )}
        </ScrollView>

        {/* INPUT BAR STICKY */}
        <View style={[styles.stickyInputBar, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : (isKeyboardVisible ? 10 : 25) }]}>
          {(replyingTo || editingComment) && (
            <View style={styles.contextBar}>
              <Text style={styles.contextText}>{replyingTo ? `Membalas @${replyingTo.user}` : `Mengedit komentar...`}</Text>
              <TouchableOpacity onPress={() => { setReplyingTo(null); setEditingComment(null); setNewComment(''); }}><Ionicons name="close-circle" size={20} color="#64748b" /></TouchableOpacity>
            </View>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef} value={newComment} onChangeText={setNewComment} placeholder="Gimana menurut kamu?" placeholderTextColor="#9ca3af"
              style={{ color: '#1F1F1F', flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0' }}
              multiline={false}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleCommentAction} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator size="small" color="#1e293b" /> : <Ionicons name="paper-plane" size={20} color="#1e293b" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* --- MODAL MENU POSTINGAN --- */}
      <Modal visible={postMenuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setPostMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setPostMenuVisible(false); setIsEditingPost(true); setEditPostTitle(post.title || ''); setEditPostContent(post.description || ''); }}>
              <Ionicons name="create-outline" size={20} color="#334155" />
              <Text style={styles.menuText}>Edit Cerita</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setPostMenuVisible(false); setPostDeleteConfirmVisible(true); }}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuText, { color: '#ef4444' }]}>Hapus Cerita</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL MENU KOMENTAR --- */}
      <Modal visible={commentMenuVisible.visible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setCommentMenuVisible({ visible: false, comment: null })}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { 
                const c = commentMenuVisible.comment;
                setCommentMenuVisible({ visible: false, comment: null });
                setEditingComment(c);
                setReplyingTo(null);
                setNewComment(c.text);
                focusInput();
              }}>
              <Ionicons name="create-outline" size={20} color="#334155" />
              <Text style={styles.menuText}>Edit Komentar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { 
                setTargetDelete(commentMenuVisible.comment);
                setCommentMenuVisible({ visible: false, comment: null });
                setConfirmVisible(true);
              }}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={[styles.menuText, { color: '#ef4444' }]}>Hapus Komentar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- MODAL EDIT POSTINGAN --- */}
      <Modal visible={isEditingPost} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Postingan</Text>
              <TouchableOpacity onPress={() => setIsEditingPost(false)}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>JUDUL</Text>
              <TextInput placeholder="Judul menarik..." style={styles.input} value={editPostTitle} onChangeText={setEditPostTitle} />
              <Text style={styles.label}>CERITA KAMU</Text>
              <TextInput placeholder="Ceritakan pengalamanmu..." multiline style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={editPostContent} onChangeText={setEditPostContent} />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setIsEditingPost(false)} style={styles.btnCancel}><Text style={{ fontWeight: 'bold', color: '#6b7280' }}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.postBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleUpdatePost} disabled={isSubmitting}>
                <Text style={styles.postBtnText}>{isSubmitting ? 'Mengirim...' : 'Update'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal visible={confirmVisible} onClose={() => setConfirmVisible(false)} onConfirm={executeDeleteComment} title="Hapus Komentar?" message="Yakin ingin menghapus tanggapan kamu?" />
      <ConfirmModal visible={postDeleteConfirmVisible} onClose={() => setPostDeleteConfirmVisible(false)} onConfirm={handleDeletePost} title="Hapus Postingan?" message="Cerita kamu akan dihapus secara permanen." />
      <CustomPopup visible={popupVisible} onClose={() => setPopupVisible(false)} type={popupData.type} title={popupData.title} message={popupData.message} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c473c' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2c473c' },
  scrollContent: { padding: 16 },
  backButton: { position: 'absolute', left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(45, 74, 69, 0.8)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.2, borderColor: '#FFFFFF', zIndex: 10 },
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
  stickyInputBar: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', elevation: 20 },
  commentSection: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  commentTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c473c', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 10 },
  commentItem: { flexDirection: 'row', marginBottom: 18, gap: 10 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9' },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  commentTime: { fontSize: 11, color: '#94a3b8' },
  commentText: { color: '#475569', fontSize: 14, lineHeight: 20 },
  commentActions: { flexDirection: 'row', gap: 15, marginTop: 6 },
  actionLink: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  noComments: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: 20 },
  contextBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 8 },
  contextText: { fontSize: 12, color: '#78C89F', fontStyle: 'italic', fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sendButton: { backgroundColor: '#EBCD5E', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  menuBox: { backgroundColor: '#fff', width: 220, borderRadius: 20, padding: 8, elevation: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  menuText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalBody: { gap: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8' },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 25, gap: 12 },
  btnCancel: { padding: 12 },
  postBtn: { backgroundColor: '#78C89F', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  postBtnText: { color: '#fff', fontWeight: 'bold' }
});