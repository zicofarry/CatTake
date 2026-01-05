import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput, 
  ScrollView, Alert, ActivityIndicator, RefreshControl, Keyboard, 
  StatusBar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient, { resolveImageUrl } from '@/api/apiClient';
import { Colors } from '@/constants/Colors';

export default function UserProfile() { 
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '', 
    bio: '', 
    gender: '', 
    birth_date: '', 
  });

  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // --- HELPER DATE (STRICT STRING MANIPULATION) ---
  const formatDateForDisplay = (rawDate) => {
    if (!rawDate) return '';
    
    // Jika yang datang adalah angka timestamp (949190400000)
    if (typeof rawDate === 'number') {
      const d = new Date(rawDate);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}-${month}-${year}`;
    }

    // Jika format ISO string
    const dateOnly = String(rawDate).substring(0, 10);
    const parts = dateOnly.split('-');
    if (parts.length !== 3) return String(rawDate);
    
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
  };

  const formatDateForBackend = (displayDate: string) => {
    if (!displayDate) return null;
    const parts = displayDate.split('-');
    if (parts.length !== 3) return displayDate;
    // Return YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      return () => setIsEditing(false);
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await apiClient.get(`/users/profile/${userId}/individu`);
      const data = response.data;

      setUserData(data);

      setQuests(data.quests || []);
      setAchievements(data.achievements || []);

      // FIX TANGGAL: Ambil teks aslinya saja (YYYY-MM-DD)
      let dateFix = '';
      if (data.birth_date) {
        const d = new Date(data.birth_date);
        // Gunakan getUTCDate agar tidak terpengaruh jam (timezone)
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        dateFix = `${day}-${month}-${year}`; // Jadi 30-01-2000
      }

      setFormData({
        full_name: data.name || data.full_name || '',
        bio: data.bio || '',
        gender: data.gender || 'male', // Pastikan gender masuk ke state
        birth_date: dateFix,
      });

    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSaveChanges = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const parts = formData.birth_date.split('-'); 
    
      // 2. Susun manual menjadi YYYY-MM-DD (Contoh: 2000-01-30)
      // Ini adalah STRING MURNI, tidak akan terpengaruh Timezone
      const dateForBackend = `${parts[2]}-${parts[1]}-${parts[0]}`;

      const payload = {
        full_name: formData.full_name, // Pastikan key ini sama dengan backend
        bio: formData.bio,
        gender: formData.gender,      // Pastikan gender dikirim
        birth_date: dateForBackend,   // Kirim string hasil susunan manual
        role: 'individu'
      };

      console.log("PAYLOAD SIAP KIRIM:", payload);
      await apiClient.patch(`/users/profile/${userId}`, payload);
      Alert.alert('Sukses', 'Profil berhasil diperbarui!');
      setIsEditing(false);
      fetchProfile(); 
    } catch (error: any) {
      Alert.alert('Gagal', 'Pastikan format tanggal DD-MM-YYYY');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) uploadPhoto(result.assets[0]);
  };

  const uploadPhoto = async (asset: any) => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const data = new FormData();
      // @ts-ignore
      data.append('photo', {
        uri: asset.uri,
        name: `prof-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      data.append('role', 'individu');

      await apiClient.post(`/users/profile/${userId}/photo`, data, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProfile(); 
    } catch (error) {
      Alert.alert('Gagal', 'Gagal upload foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id: number) => {
    try {
      await apiClient.post(`/gamification/claim/${id}`);
      Alert.alert("Hore! 🏆", "Poin berhasil diklaim!");
      fetchProfile();
    } catch (error: any) {
      Alert.alert("Info", error.response?.data?.error || "Gagal klaim.");
    }
  };

  if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  const finalAvatar = userData?.photo?.startsWith('http') 
    ? userData.photo 
    : resolveImageUrl(userData?.photo, 'profile');

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#E8EAE3', '#A9C2B7']} style={styles.mainContainer}>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profil Individu</Text>
            <TouchableOpacity 
              onPress={isEditing ? handleSaveChanges : () => setIsEditing(true)} 
              style={[styles.editBtn, isEditing && {backgroundColor: Colors.primary}]}
            >
              {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : 
                <Text style={[styles.editBtnText, isEditing && {color: '#fff'}]}>{isEditing ? 'Simpan' : 'Edit'}</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image source={finalAvatar ? { uri: finalAvatar } : require('@/assets/images/null.png')} style={styles.avatar} />
                <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}><FontAwesome name="camera" size={16} color="white" /></TouchableOpacity>
              </View>
              {/* Menampilkan Nama Lengkap di bawah Foto */}
              <Text style={styles.userName}>{formData.full_name || 'User'}</Text>
              <View style={styles.xpBadge}>
                <MaterialCommunityIcons name="trophy" size={16} color="#B45309" />
                <Text style={styles.xpText}>{Math.floor(userData?.total_points || 0).toLocaleString('id-ID')} Poin</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>📝 Data Akun</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.input} 
                    value={formData.full_name} 
                    onChangeText={(v) => setFormData({...formData, full_name: v})} 
                  />
                ) : (
                  <Text style={styles.valueText}>{formData.full_name || '-'}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tanggal Lahir (DD-MM-YYYY)</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.input} 
                    value={formData.birth_date} 
                    placeholder="Contoh: 30-01-2000" 
                    keyboardType="numeric" 
                    onChangeText={(v) => setFormData({...formData, birth_date: v})} 
                  />
                ) : (
                  <Text style={styles.valueText}>{formData.birth_date || '-'}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jenis Kelamin</Text>
                {isEditing ? (
                  <View style={styles.radioGroup}>
                    {['male', 'female'].map((g) => (
                      <TouchableOpacity 
                        key={g} 
                        style={[styles.radioBtn, formData.gender === g && styles.radioActive]}
                        onPress={() => setFormData({...formData, gender: g})}
                      >
                        <Text style={[styles.radioText, formData.gender === g && {color: '#fff'}]}>
                          {g === 'male' ? 'Laki-laki' : 'Perempuan'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.valueText}>{formData.gender === 'female' ? 'Perempuan' : 'Laki-laki'}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.input} 
                    value={formData.bio} 
                    multiline 
                    onChangeText={(v) => setFormData({...formData, bio: v})} 
                  />
                ) : (
                  <Text style={styles.valueText}>{formData.bio || 'Belum ada bio.'}</Text>
                )}
              </View>
            </View>

            {/* QUEST & ACHIEVEMENT TETAP SAMA KARENA SUDAH BENER */}
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>📜 Quest (Misi)</Text>
              {quests.length === 0 ? <Text style={styles.emptyText}>Tidak ada misi aktif.</Text> : 
                quests.map((q: any, i: number) => (
                  <View key={i} style={styles.questItem}>
                    <Text style={styles.questName}>{q.name}</Text>
                    <View style={styles.progressBg}><View style={[styles.progressFill, {width: `${Math.min((q.progress / q.target) * 100, 100)}%`}]} /></View>
                    <Text style={styles.progressText}>{q.progress} / {q.target}</Text>
                  </View>
                ))
              }
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>🏅 Pencapaian</Text>
              {achievements.length === 0 ? <Text style={styles.emptyText}>Belum ada achievement.</Text> :
                achievements.map((a: any, i: number) => (
                  <View key={i} style={[styles.achievementBox, a.isClaimed && {backgroundColor: '#f0fdf4'}]}>
                    <View style={{flex: 1}}>
                      <Text style={styles.achievementName}>{a.name}</Text>
                      <Text style={styles.achievementDesc}>{a.description}</Text>
                    </View>
                    {!a.isClaimed && a.progress >= a.target ? (
                      <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaim(a.id)}><Text style={styles.claimBtnText}>Klaim</Text></TouchableOpacity>
                    ) : a.isClaimed ? (
                      <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                    ) : <Text style={{fontSize: 10, color: '#9ca3af'}}>Proses</Text>}
                  </View>
                ))
              }
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}><Text style={styles.logoutText}>Sign Out</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  editBtn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  editBtnText: { fontWeight: 'bold', color: '#374151' },
  profileSection: { alignItems: 'center', marginVertical: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff', backgroundColor: '#e2e8f0' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: Colors.primary, borderRadius: 20, padding: 8, borderWidth: 3, borderColor: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#1f2937' },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  xpText: { marginLeft: 5, color: '#B45309', fontWeight: 'bold' },
  formCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#374151' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, color: '#6b7280', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  input: { borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 5, fontSize: 16, color: '#1f2937' },
  disabledInput: { borderBottomWidth: 0, color: '#4b5563' },
  valueText: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  
  // Gaya Radio Button untuk Gender
  radioGroup: { flexDirection: 'row', gap: 10, marginTop: 5 },
  radioBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radioText: { fontWeight: 'bold', color: '#64748b' },

  questItem: { marginBottom: 15 },
  questName: { fontWeight: 'bold', color: '#374151', fontSize: 13 },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginVertical: 5 },
  progressFill: { height: '100%', backgroundColor: '#15803d', borderRadius: 4 },
  progressText: { fontSize: 10, color: '#9ca3af', textAlign: 'right' },
  achievementBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
  achievementName: { fontWeight: 'bold', color: '#1f2937', fontSize: 14 },
  achievementDesc: { fontSize: 12, color: '#6b7280' },
  claimBtn: { backgroundColor: '#EBCD5E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  claimBtnText: { fontWeight: 'bold', fontSize: 12 },
  logoutBtn: { margin: 20, backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', fontSize: 12 },
  backBtn: { padding: 5 }
});