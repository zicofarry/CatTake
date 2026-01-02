import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import apiClient, { API_BASE_URL } from '../../api/apiClient';
import { Colors } from '../../constants/Colors';

// Helper URL Gambar
const SERVER_URL = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.10:3000'; 

export default function ProfileScreen() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Data User
  const [userData, setUserData] = useState<any>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: '', 
    bio: '',
    gender: 'Laki-laki', 
    birthDate: '', 
  });

  const [gameData, setGameData] = useState({
    totalPoints: 0,
    activeQuest: {
      id: 1,
      title: "Penyelamat Kucing Liar",
      description: "Lakukan rescue pada 1 kucing minggu ini.",
      isClaimed: false,
      reward: 50
    },
    achievements: [
      { id: 1, name: "First Rescue", icon: "cat" },
      { id: 2, name: "Donator", icon: "gift" },
      { id: 3, name: "Reporter", icon: "bullhorn" }
    ]
  });

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // Pastikan setiap buka halaman, mode edit mati
      return () => setIsEditing(false);
    }, [])
  );

  // --- FETCH DATA ---
  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');

      if (!userId || !role) return;

      const response = await apiClient.get(`/users/profile/${userId}/${role}`);
      const data = response.data;
      setUserData(data);
      
      const realName = data.name || data.full_name || data.username || '';
      
      let displayGender = 'Laki-laki';
      if (data.gender === 'female' || data.gender === 'Perempuan') displayGender = 'Perempuan';
      
      // Convert YYYY-MM-DD -> DD-MM-YYYY
      let displayDate = '';
      if (data.birth_date) {
        const rawDate = String(data.birth_date).split('T')[0];
        const [y, m, d] = rawDate.split('-');
        if (y && m && d) displayDate = `${d}-${m}-${y}`;
      }

      setFormData({
        name: realName, 
        bio: data.bio || '',
        gender: displayGender,
        birthDate: displayDate, 
      });

      if (data.points) {
        setGameData(prev => ({ ...prev, totalPoints: data.points }));
      }

    } catch (error: any) {
      console.error("Fetch Error:", error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- SIMPAN DATA ---
  const handleSaveChanges = async () => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      
      const dbGender = formData.gender === 'Perempuan' ? 'female' : 'male';

      // Convert DD-MM-YYYY -> YYYY-MM-DD
      let dbDate = formData.birthDate;
      const dateParts = formData.birthDate.split('-');
      if (dateParts.length === 3) {
        dbDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }

      await apiClient.put(`/users/profile/${userId}`, {
        role: role,
        full_name: formData.name,   
        username: formData.name, 
        name: formData.name,
        bio: formData.bio,
        gender: dbGender,
        birth_date: dbDate 
      });

      // === LOGIC PENTING: BALIK KE TAMPILAN AWAL ===
      Alert.alert('Sukses', 'Profil berhasil diperbarui!');
      setIsEditing(false); // Matikan mode edit
      fetchProfile();      // Refresh data tampilan

    } catch (error: any) {
      console.error("Update Error:", error);
      Alert.alert('Gagal', error.response?.data?.error || 'Gagal update profil.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      uploadPhoto(result.assets[0]);
    }
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploadingPhoto(true);
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
      fetchProfile(); 
    } catch (error) {
      Alert.alert('Gagal', 'Gagal upload foto.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleClaimReward = async () => {
    if (gameData.activeQuest.isClaimed) return;
    Alert.alert("Claim Reward", "Menambahkan poin ke akunmu...");
    setTimeout(() => {
        setGameData(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + prev.activeQuest.reward,
            activeQuest: { ...prev.activeQuest, isClaimed: true }
        }));
        Alert.alert("Hore! 🎉", `Kamu mendapatkan +${gameData.activeQuest.reward} Poin!`);
    }, 1000);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userRole', 'userId', 'username']);
    router.replace('/(auth)/login');
  };

  const getFirstName = () => {
    const fullName = formData.name || userData?.name || userData?.full_name || userData?.username || 'User';
    return fullName.split(' ')[0];
  };

  if (loading && !refreshing) return <ActivityIndicator size="large" color={Colors.primary} style={styles.center} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex: 1}}>
      <View style={styles.mainContainer}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil Saya</Text>
          
          {/* TOMBOL EDIT / SIMPAN (HIGHLIGHTED) */}
          <TouchableOpacity 
            style={[
                styles.headerBtnContainer, 
                // Warna background mengikuti state: Orange (Edit/Simpan) atau Abu (Disabled/Read Only)
                { backgroundColor: isEditing ? Colors.primary : '#E5E7EB' }
            ]}
            onPress={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
          >
            <Text style={[
                styles.headerBtnText, 
                // Warna teks: Putih jika Orange, Gelap jika Abu
                { color: isEditing ? 'white' : '#374151' }
            ]}>
              {isEditing ? 'Simpan' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchProfile()}} />}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          
          {/* --- 1. PROFILE CARD --- */}
          <View style={styles.profileCard}>
              <View style={styles.avatarWrapper}>
                  {uploadingPhoto ? <ActivityIndicator color={Colors.primary} /> : (
                      <Image 
                          source={userData?.profile_pic && userData.profile_pic !== 'NULL.JPG' 
                              ? { uri: `${SERVER_URL}/public/img/profile/${userData.profile_pic}` }
                              : require('../../assets/images/Ellipse.png')} 
                          style={styles.avatar} 
                      />
                  )}
                  <TouchableOpacity style={styles.camBtn} onPress={pickImage}>
                      <FontAwesome name="camera" size={14} color="white" />
                  </TouchableOpacity>
              </View>

              <Text style={styles.nameText}>Hai, {getFirstName()}!</Text>
              
              <View style={styles.pointsBadge}>
                  <MaterialCommunityIcons name="star-face" size={20} color="#F59E0B" />
                  <Text style={styles.pointsText}>{gameData.totalPoints} XP</Text>
              </View>
          </View>

          {/* --- 2. INFORMASI PRIBADI --- */}
          <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>📝 Informasi Pribadi</Text>

              <InputItem 
                  label="Nama Lengkap" 
                  value={formData.name} 
                  onChange={(t: string) => setFormData({...formData, name: t})}
                  editable={isEditing}
                  placeholder="Nama Lengkap Kamu"
              />

              {/* Jenis Kelamin */}
              <View style={styles.inputGroup}>
                  <Text style={styles.label}>Jenis Kelamin</Text>
                  {isEditing ? (
                      <View style={styles.radioRow}>
                          {['Laki-laki', 'Perempuan'].map((gender) => (
                              <TouchableOpacity 
                                  key={gender}
                                  style={[
                                    styles.radioBtn, 
                                    formData.gender === gender && { backgroundColor: Colors.primary, borderColor: Colors.primary }
                                  ]}
                                  onPress={() => setFormData({...formData, gender})}
                              >
                                  <Text style={[
                                    styles.radioText, 
                                    formData.gender === gender && { color: 'white' }
                                  ]}>
                                      {gender}
                                  </Text>
                              </TouchableOpacity>
                          ))}
                      </View>
                  ) : (
                      <Text style={styles.readOnlyText}>{formData.gender}</Text>
                  )}
              </View>

              {/* Tanggal Lahir (DD-MM-YYYY) */}
              <InputItem 
                  label="Tanggal Lahir" 
                  value={formData.birthDate} 
                  onChange={(t: string) => setFormData({...formData, birthDate: t})}
                  editable={isEditing}
                  placeholder="DD-MM-YYYY" 
                  keyboardType="numeric"
              />

              {/* Bio (Label Diganti) */}
              <InputItem 
                  label="Bio" 
                  value={formData.bio} 
                  onChange={(t: string) => setFormData({...formData, bio: t})}
                  editable={isEditing}
                  multiline
                  placeholder="Ceritakan tentang dirimu..."
              />

              {/* TOMBOL BATAL PERUBAHAN (HIGHLIGHTED) */}
              {isEditing && (
                  <TouchableOpacity style={styles.cancelBtnFilled} onPress={() => { setIsEditing(false); fetchProfile(); }}>
                      <Text style={styles.cancelTextFilled}>Batal Perubahan</Text>
                  </TouchableOpacity>
              )}
          </View>

          {/* --- 3. GAMIFICATION --- */}
          <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🎯 Aktivitas & Misi</Text>
              
              <View style={styles.questCard}>
                  <View style={styles.questHeader}>
                      <Text style={styles.questTitle}>{gameData.activeQuest.title}</Text>
                      <View style={styles.rewardTag}>
                          <Text style={styles.rewardText}>+{gameData.activeQuest.reward} XP</Text>
                      </View>
                  </View>
                  <Text style={styles.questDesc}>{gameData.activeQuest.description}</Text>
                  
                  <TouchableOpacity 
                      style={[
                        styles.claimBtn, 
                        // Warna Claim button
                        { backgroundColor: gameData.activeQuest.isClaimed ? '#E5E7EB' : Colors.primary }
                      ]}
                      onPress={handleClaimReward}
                      disabled={gameData.activeQuest.isClaimed}
                  >
                      <Text style={[styles.claimText, gameData.activeQuest.isClaimed && { color: '#6B7280' }]}>
                          {gameData.activeQuest.isClaimed ? 'Sudah Diambil' : 'Klaim Hadiah'}
                      </Text>
                  </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: 14 }]}>🏅 Penghargaan</Text>
              <View style={styles.achievementRow}>
                  {gameData.achievements.map((item) => (
                      <View key={item.id} style={styles.badgeItem}>
                          <View style={styles.badgeIconBg}>
                              <MaterialCommunityIcons name={item.icon as any} size={24} color="white" />
                          </View>
                          <Text style={styles.badgeName}>{item.name}</Text>
                      </View>
                  ))}
              </View>
          </View>

          {/* --- 4. LOGOUT --- */}
          <View style={styles.footer}>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={styles.logoutText}>Keluar Akun</Text>
              </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// Komponen Input Reusable
const InputItem = ({ label, value, onChange, editable, multiline, placeholder, keyboardType }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    {editable ? (
        <TextInput 
            style={[
              styles.input, 
              multiline && { height: 80, textAlignVertical: 'top' },
              { borderColor: Colors.primary } // Border warna primary saat edit
            ]}
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
        />
    ) : (
        <Text style={styles.readOnlyText}>{value || '-'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1, backgroundColor: '#F3F4F6' },
  
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  
  // Style Tombol Header (Edit/Simpan)
  headerBtnContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8, // Rounded 8 (kotak tidak runcing)
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80
  },
  headerBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  profileCard: {
    backgroundColor: 'white', alignItems: 'center', padding: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 15,
    shadowColor: '#000', shadowOpacity: 0.05, elevation: 3
  },
  avatarWrapper: { marginBottom: 10, position: 'relative' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E5E7EB' },
  camBtn: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary,
    padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white'
  },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, gap: 5, marginTop: 5
  },
  pointsText: { fontWeight: 'bold', color: '#B45309', fontSize: 14 },

  sectionContainer: {
    backgroundColor: 'white', marginHorizontal: 15, marginBottom: 15,
    borderRadius: 15, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, elevation: 2
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 15 },

  questCard: {
    backgroundColor: '#F0F9FF', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD'
  },
  questHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  questTitle: { fontWeight: 'bold', color: '#0369A1', fontSize: 15 },
  rewardTag: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, borderRadius: 4 },
  rewardText: { fontSize: 12, color: '#0284C7', fontWeight: 'bold' },
  questDesc: { color: '#64748B', fontSize: 13, marginBottom: 12 },
  
  claimBtn: {
    padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 5
  },
  claimText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  achievementRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  badgeItem: { alignItems: 'center', width: 70 },
  badgeIconBg: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#8B5CF6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 5
  },
  badgeName: { fontSize: 11, textAlign: 'center', color: '#4B5563' },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: 1, borderRadius: 8, padding: 10,
    fontSize: 15, backgroundColor: '#FFF'
  },
  readOnlyText: { fontSize: 16, color: '#1F2937', paddingVertical: 4 },
  
  radioRow: { flexDirection: 'row', gap: 10 },
  radioBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB'
  },
  radioText: { color: '#374151', fontSize: 14 },

  // Tombol Batal
  cancelBtnFilled: {
    alignItems: 'center', padding: 12, marginTop: 10, 
    backgroundColor: '#FEE2E2', borderRadius: 8
  },
  cancelTextFilled: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 },

  footer: { padding: 20, paddingBottom: 40 },
  logoutBtn: {
    flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 15, 
    borderRadius: 12, justifyContent: 'center', gap: 8, alignItems: 'center'
  },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});