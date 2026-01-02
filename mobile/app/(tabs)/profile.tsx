import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput, 
  ScrollView, Alert, ActivityIndicator, RefreshControl, Keyboard, 
  Platform, KeyboardAvoidingView, SafeAreaView, StatusBar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Tambahkan: npx expo install expo-linear-gradient

import apiClient, { API_BASE_URL } from '../../api/apiClient';
import { Colors } from '../../constants/Colors';

const SERVER_URL = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000'; 

export default function ProfileScreen() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', bio: '', gender: '', birthDate: '', 
  });

  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      return () => setIsEditing(false);
    }, [])
  );

  // --- 1. FETCH PROFILE (Sesuai Logic Vue) ---
  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      if (!userId || !role) return;

      const response = await apiClient.get(`/users/profile/${userId}/${role}`);
      const data = response.data;
      setUserData(data);

      // FIX: Ambil tanggal mentah (YYYY-MM-DD)
      // Jika dari backend "2000-01-30T00:00:00.000Z", ambil "2000-01-30"
      let rawDate = '';
      if (data.birth_date) {
        rawDate = data.birth_date.split('T')[0];
      }

      setFormData({
        name: data.full_name || data.username || data.name || '',
        bio: data.bio || '',
        gender: data.gender || 'male',
        birthDate: rawDate, // Simpan format YYYY-MM-DD agar aman
      });

      if (data.points) setGameData(prev => ({ ...prev, totalPoints: data.points }));
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- 2. UPDATE PROFILE (Sesuai Logic Vue: PATCH) ---
  const handleSaveChanges = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');

      // Pastikan payload sama persis dengan yang diminta backend (seperti di Vue)
      const payload = {
        full_name: formData.name,
        bio: formData.bio,
        gender: formData.gender,
        birth_date: formData.birthDate, // Kirim langsung YYYY-MM-DD
        role: role
      };

      // Gunakan PATCH sesuai versi Vue
      await apiClient.patch(`/users/profile/${userId}`, payload);

      Alert.alert('Sukses', 'Profil berhasil diperbarui!');
      setIsEditing(false);
      fetchProfile(); 
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.error || 'Gagal update profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. UPLOAD PHOTO (Fix FormData) ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadPhoto(result.assets[0]);
    }
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      
      const data = new FormData();
      // @ts-ignore
      data.append('photo', {
        uri: asset.uri,
        name: asset.fileName || `prof-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });
      if(role) data.append('role', role);

      await apiClient.post(`/users/profile/${userId}/photo`, data, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert("Sukses", "Foto profil diperbarui!");
      fetchProfile(); 
    } catch (error) {
      Alert.alert('Gagal', 'Gagal upload foto.');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. CLAIM ACHIEVEMENT (Logic Vue) ---
  const handleClaimAchievement = async (id: number) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/gamification/claim/${id}`);
      Alert.alert("Hore! 🎉", `Kamu mendapatkan poin!`);
      fetchProfile();
    } catch (error: any) {
      Alert.alert("Info", error.response?.data?.error || "Gagal klaim hadiah");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'username']);
    router.replace('/(auth)/login');
  };

  if (loading && !refreshing) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#E8EAE3', '#A9C2B7']} style={styles.mainContainer}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <TouchableOpacity 
            onPress={isEditing ? handleSaveChanges : () => setIsEditing(true)}
            style={[styles.editBtn, isEditing && {backgroundColor: Colors.primary}]}
          >
            {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : 
              <Text style={[styles.editBtnText, isEditing && {color: '#fff'}]}>{isEditing ? 'Simpan' : 'Edit'}</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProfile()}} />}
        >
          {/* PROFILE CARD */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image 
                source={userData?.profile_pic && userData.profile_pic !== 'NULL.JPG' 
                  ? { uri: `${SERVER_URL}/public/img/profile/${userData.profile_pic}` }
                  : require('../../assets/images/Ellipse.png')} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
                <FontAwesome name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{formData.name || 'User'}</Text>
            <View style={styles.xpBadge}>
              <MaterialCommunityIcons name="trophy" size={16} color="#B45309" />
              <Text style={styles.xpText}>{userData?.total_points || 0} Poin</Text>
            </View>
          </View>

          {/* FORM INPUTS */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>📝 Informasi Pribadi</Text>
            
            <ProfileInput 
              label="Nama Lengkap" 
              value={formData.name} 
              editable={isEditing} 
              onChange={(v) => setFormData({...formData, name: v})} 
            />
            {/* Tanggal Lahir */}
            <ProfileInput 
              label="Tanggal Lahir" 
              value={formData.birthDate} 
              editable={isEditing} 
              placeholder="YYYY-MM-DD (Contoh: 2000-01-30)" 
              keyboardType="numeric" // Biar muncul angka di keyboard
              onChange={(v) => setFormData({...formData, birthDate: v})} 
            />

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

            <ProfileInput 
              label="Bio" 
              value={formData.bio} 
              editable={isEditing} 
              multiline 
              onChange={(v) => setFormData({...formData, bio: v})} 
            />
          </View>

          {/* QUESTS (Mirip Vue) */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>🎯 Quest Tersedia</Text>
            {quests.length === 0 ? <Text style={styles.emptyText}>Belum ada quest.</Text> : 
              quests.map((q: any, i) => (
                <View key={i} style={styles.questItem}>
                  <View style={styles.questInfo}>
                    <Text style={styles.questName}>{q.name}</Text>
                    <Text style={styles.questPoints}>{q.points} XP</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, {width: `${(q.progress / q.target) * 100}%`}]} />
                  </View>
                  <Text style={styles.progressText}>{q.progress} / {q.target}</Text>
                </View>
              ))
            }
          </View>

          {/* ACHIEVEMENTS */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>🏅 Achievements</Text>
            {achievements.length === 0 ? <Text style={styles.emptyText}>Belum ada achievement.</Text> :
              achievements.map((a: any, i) => (
                <View key={i} style={[styles.achievementBox, a.isClaimed && {backgroundColor: '#f0fdf4'}]}>
                  <View style={{flex: 1}}>
                    <Text style={styles.achievementName}>{a.name}</Text>
                    <Text style={styles.achievementDesc}>{a.description}</Text>
                  </View>
                  {!a.isClaimed ? (
                    <TouchableOpacity style={styles.claimBtn} onPress={() => handleClaimAchievement(a.id)}>
                      <Text style={styles.claimBtnText}>Klaim</Text>
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                  )}
                </View>
              ))
            }
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Sub-komponen Input
const ProfileInput = ({ label, value, editable, onChange, multiline }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    {editable ? (
      <TextInput 
        style={[styles.input, multiline && {height: 80, textAlignVertical: 'top'}]} 
        value={value} 
        onChangeText={onChange}
        multiline={multiline}
      />
    ) : (
      <Text style={styles.valueText}>{value || '-'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  mainContainer: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: 'rgba(255,255,255,0.8)' 
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { marginLeft: 5, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  editBtn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  editBtnText: { fontWeight: 'bold', color: '#374151' },

  profileSection: { alignItems: 'center', marginVertical: 30 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderSize: 4, borderColor: '#fff' },
  cameraIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: Colors.primary, p: 8, borderRadius: 20, borderWidth: 3, borderColor: '#fff', padding: 8 },
  userName: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#1f2937' },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  xpText: { marginLeft: 5, color: '#B45309', fontWeight: 'bold' },

  formCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#374151' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 12, color: '#6b7280', fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  valueText: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  input: { borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 5, fontSize: 16 },
  
  radioGroup: { flexDirection: 'row', gap: 10 },
  radioBtn: { flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radioText: { fontWeight: '600', color: '#6b7280' },

  questItem: { marginBottom: 15 },
  questInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  questName: { fontWeight: 'bold', color: '#374151' },
  questPoints: { color: Colors.primary, fontWeight: 'bold' },
  progressBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#15803d' },
  progressText: { fontSize: 10, color: '#9ca3af', textAlign: 'right', marginTop: 2 },

  achievementBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
  achievementName: { fontWeight: 'bold', color: '#1f2937' },
  achievementDesc: { fontSize: 12, color: '#6b7280' },
  claimBtn: { backgroundColor: '#EBCD5E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  claimBtnText: { fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' },

  logoutBtn: { margin: 20, backgroundColor: '#fee2e2', padding: 15, borderRadius: 15, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});