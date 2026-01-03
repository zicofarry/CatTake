import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, TextInput, Modal, Platform, Dimensions 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

// Import API Client yang sudah ada
import apiClient, { API_BASE_URL } from '../../api/apiClient';

// --- HELPERS ---
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://localhost:3000';

function resolveImageUrl(path: string | null) {
  if (!path || path === 'NULL' || path === 'NULL.JPG' || path === 'null') {
    // Gunakan placeholder lokal jika ada, atau kembalikan null agar RN handle error
    return null; 
  }
  if (path.startsWith('http')) return path;
  
  // Logic mapping path sesuai Vue
  if (path.startsWith('/public/')) return `${serverUrl}${path}`;
  
  const prefixMap = ['profile-', 'driver-', 'lost-', 'report-', 'cat-', 'proof-', 'qr-', 'ktp-', 'rescue-', 'sim-', 'post-'];
  const folderMap: Record<string, string> = {
    'profile-': 'profile', 'driver-': 'profile',
    'lost-': 'lost_cat', 'report-': 'report_cat',
    'cat-': 'cats', 'proof-': 'proof_payment',
    'qr-': 'qr_img', 'ktp-': 'identity',
    'rescue-': 'rescue_proof', 'sim-': 'licence',
    'post-': 'post'
  };

  for (const prefix of prefixMap) {
    if (path.startsWith(prefix)) {
      return `${serverUrl}/public/img/${folderMap[prefix]}/${path}`;
    }
  }

  return `${serverUrl}/public/img/${path}`; // Default fallback
}

// --- TYPES ---
interface Cat {
  id: number;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  adoption_status: string;
  health_status: string;
  description: string;
  photo?: string;
  image?: string;
}

interface RescuedCat {
  assignment_id: number;
  display_name: string;
  report_type: 'missing' | 'stray';
  location: string;
  completion_time: string;
  photo: string;
  description: string;
  // Missing spec
  owner_name?: string;
  owner_contact?: string;
  lost_cat_status?: string;
  lost_cat_id?: number;
  // Stray spec
  report_id?: number;
  is_converted?: boolean;
}

export default function ShelterDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cats' | 'rescue'>('cats');
  const [isLoading, setIsLoading] = useState(true);
  const [shelterName, setShelterName] = useState('Memuat...');
  const [shelterId, setShelterId] = useState<number | null>(null);

  // Data State
  const [cats, setCats] = useState<Cat[]>([]);
  const [rescuedCats, setRescuedCats] = useState<RescuedCat[]>([]);

  // Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Add/Edit Cat)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [catForm, setCatForm] = useState({
    name: '', breed: '', age: '', gender: 'male', health_status: 'healthy', description: '', photo: null as any
  });

  // Form State (Convert Rescue)
  const [convertForm, setConvertForm] = useState({
    reportId: null as number | null,
    name: '', gender: 'male', breed: 'Domestik', age: '12', description: '', photoPath: ''
  });

  // --- ACTIONS ---

  const getShelterInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const decoded: any = jwtDecode(token);
        setShelterId(decoded.id);
        
        // Fetch Detail Profile Shelter
        const res = await apiClient.get(`/users/profile/${decoded.id}/shelter`);
        setShelterName(res.data.name || 'Shelter');
        return decoded.id;
      }
    } catch (error) {
      console.error("Token Error:", error);
    }
    return null;
  };

  const fetchData = async () => {
    setIsLoading(true);
    const id = await getShelterInfo();
    if (id) {
      try {
        const [catsRes, rescueRes] = await Promise.all([
          apiClient.get(`/cats/shelter/${id}`),
          apiClient.get('/rescue/shelter-history')
        ]);
        setCats(catsRes.data);
        setRescuedCats(rescueRes.data);
      } catch (error) {
        console.error("Gagal load data:", error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS: Image Picker ---
  const pickImage = async (isConvert = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        name: asset.uri.split('/').pop(),
        type: 'image/jpeg', // Default type
      };

      if (!isConvert) {
        setCatForm({ ...catForm, photo: file });
      }
      // Note: Convert form biasanya pakai foto existing dari report, tapi kalau mau ganti bisa diimplementasi disini
    }
  };

  // --- HANDLERS: CRUD Kucing ---
  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setCatForm({ name: '', breed: '', age: '', gender: 'male', health_status: 'healthy', description: '', photo: null });
    setShowCatModal(true);
  };

  const openEditModal = (cat: Cat) => {
    setIsEditing(true);
    setEditId(cat.id);
    setCatForm({
      name: cat.name,
      breed: cat.breed,
      age: cat.age.toString(),
      gender: cat.gender,
      health_status: cat.health_status,
      description: cat.description,
      photo: null // Foto tidak diubah kecuali user upload baru
    });
    setShowCatModal(true);
  };

  const submitCat = async () => {
    if (!catForm.name || !catForm.gender) return Alert.alert("Error", "Nama dan Gender wajib diisi!");
    if (!isEditing && !catForm.photo) return Alert.alert("Error", "Foto wajib diisi!");
    if (!shelterId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('shelter_id', shelterId.toString());
      formData.append('name', catForm.name);
      formData.append('gender', catForm.gender);
      if (!isEditing) formData.append('adoption_status', 'available');
      formData.append('breed', catForm.breed);
      formData.append('age', catForm.age);
      formData.append('health_status', catForm.health_status);
      formData.append('description', catForm.description);

      if (catForm.photo) {
        formData.append('photo', catForm.photo as any);
      }

      if (isEditing && editId) {
        await apiClient.put(`/cats/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert("Sukses", "Data diperbarui");
      } else {
        await apiClient.post('/cats', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert("Sukses", "Kucing ditambahkan");
      }
      setShowCatModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCat = (id: number) => {
    Alert.alert("Hapus", "Yakin ingin menghapus data ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/cats/${id}`);
            fetchData();
          } catch (e) { Alert.alert("Gagal hapus"); }
        } 
      }
    ]);
  };

  // --- HANDLERS: Rescue Actions ---
  const returnToOwner = async (lostCatId?: number) => {
    if (!lostCatId) return;
    Alert.alert("Konfirmasi", "Kucing sudah dikembalikan ke pemilik?", [
      { text: "Batal", style: "cancel" },
      { text: "Ya, Selesai", onPress: async () => {
          try {
            await apiClient.post('/rescue/return-owner', { lostCatId });
            Alert.alert("Sukses", "Status diperbarui");
            fetchData();
          } catch (e) { Alert.alert("Gagal update status"); }
        }
      }
    ]);
  };

  const openConvertModal = (item: RescuedCat) => {
    const cleanPhotoPath = item.photo ? item.photo.split('/').pop() || '' : '';
    setConvertForm({
      reportId: item.report_id || null,
      name: 'Kucing Rescue',
      gender: 'male',
      breed: 'Domestik',
      age: '12',
      description: item.description,
      photoPath: cleanPhotoPath
    });
    setShowConvertModal(true);
  };

  const submitConvert = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/rescue/move-adoption', {
        ...convertForm,
        age: parseInt(convertForm.age)
      });
      Alert.alert("Sukses", "Kucing dipindahkan ke katalog adopsi!");
      setShowConvertModal(false);
      fetchData();
      setActiveTab('cats');
    } catch (e) {
      Alert.alert("Gagal", "Gagal memindahkan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#3A5F50" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Manajemen Kucing</Text>
                <Text style={styles.headerSubtitle}>{shelterName}</Text>
            </View>
        </View>

        {/* --- TABS --- */}
        <View style={styles.tabContainer}>
            <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'cats' && styles.tabBtnActive]} 
                onPress={() => setActiveTab('cats')}
            >
                <Text style={[styles.tabText, activeTab === 'cats' && styles.tabTextActive]}>Siap Adopsi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tabBtn, activeTab === 'rescue' && styles.tabBtnActive]} 
                onPress={() => setActiveTab('rescue')}
            >
                <Text style={[styles.tabText, activeTab === 'rescue' && styles.tabTextActive]}>Hasil Rescue</Text>
            </TouchableOpacity>
        </View>

        {/* --- CONTENT --- */}
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
            {isLoading ? (
                <ActivityIndicator size="large" color="#EBCD5E" style={{ marginTop: 50 }} />
            ) : (
                <>
                    {/* === TAB: CATS === */}
                    {activeTab === 'cats' && (
                        <View>
                            <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
                                <Ionicons name="add-circle" size={20} color="#1f2937" />
                                <Text style={styles.addBtnText}>Tambah Manual</Text>
                            </TouchableOpacity>

                            {cats.length === 0 ? (
                                <Text style={styles.emptyText}>Belum ada kucing siap adopsi.</Text>
                            ) : (
                                cats.map((cat) => (
                                    <View key={cat.id} style={styles.catCard}>
                                        <Image 
                                            source={{ uri: resolveImageUrl(cat.photo || cat.image || null) || undefined }} 
                                            style={styles.catImage} 
                                        />
                                        <View style={styles.catInfo}>
                                            <View style={styles.catHeader}>
                                                <Text style={styles.catName}>{cat.name}</Text>
                                                <Ionicons 
                                                    name={cat.gender === 'male' ? 'male' : 'female'} 
                                                    size={16} 
                                                    color={cat.gender === 'male' ? '#3b82f6' : '#ec4899'} 
                                                />
                                            </View>
                                            <Text style={styles.catDetail}>{cat.breed} • {cat.age} Bulan</Text>
                                            <View style={styles.badgeContainer}>
                                                <Text style={styles.badgeText}>{cat.health_status}</Text>
                                            </View>
                                            
                                            <View style={styles.actionRow}>
                                                <TouchableOpacity onPress={() => openEditModal(cat)} style={styles.editAction}>
                                                    <Text style={styles.actionText}>Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => deleteCat(cat.id)} style={styles.deleteAction}>
                                                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Hapus</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    {/* === TAB: RESCUE === */}
                    {activeTab === 'rescue' && (
                        <View>
                            {rescuedCats.length === 0 ? (
                                <Text style={styles.emptyText}>Belum ada riwayat rescue.</Text>
                            ) : (
                                rescuedCats.map((item) => (
                                    <View key={item.assignment_id} style={styles.rescueCard}>
                                        <View style={styles.rescueHeader}>
                                            <Text style={[styles.typeBadge, item.report_type === 'missing' ? styles.typeMissing : styles.typeStray]}>
                                                {item.report_type === 'missing' ? 'Kucing Hilang' : 'Kucing Liar'}
                                            </Text>
                                            <Text style={styles.dateText}>{new Date(item.completion_time).toLocaleDateString()}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', gap: 12, marginVertical: 10 }}>
                                            <Image source={{ uri: resolveImageUrl(item.photo) || undefined }} style={styles.rescueImage} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.rescueName}>{item.display_name}</Text>
                                                <Text style={styles.rescueLoc} numberOfLines={2}>
                                                    <Ionicons name="location" color="#ef4444" /> {item.location}
                                                </Text>
                                            </View>
                                        </View>

                                        {item.report_type === 'missing' && (
                                            <View style={styles.ownerBox}>
                                                <Text style={styles.ownerLabel}>Pemilik: {item.owner_name}</Text>
                                                <Text style={styles.ownerContact}>{item.owner_contact}</Text>
                                                <Text style={{ marginTop: 4, fontWeight: 'bold', color: item.lost_cat_status === 'returned' ? 'green' : 'blue' }}>
                                                    Status: {item.lost_cat_status?.toUpperCase()}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Actions */}
                                        <View style={{ marginTop: 10 }}>
                                            {item.report_type === 'missing' && item.lost_cat_status !== 'returned' && (
                                                <TouchableOpacity onPress={() => returnToOwner(item.lost_cat_id)} style={styles.greenBtn}>
                                                    <Text style={styles.btnTextWhite}>Sudah Dikembalikan</Text>
                                                </TouchableOpacity>
                                            )}

                                            {item.report_type === 'stray' && !item.is_converted && (
                                                <TouchableOpacity onPress={() => openConvertModal(item)} style={styles.darkBtn}>
                                                    <Text style={styles.btnTextWhite}>Masuk Katalog Adopsi</Text>
                                                </TouchableOpacity>
                                            )}

                                            {item.is_converted && (
                                                 <View style={styles.disabledBtn}>
                                                    <Text style={styles.disabledBtnText}>Sudah di Katalog</Text>
                                                 </View>
                                            )}
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </>
            )}
        </ScrollView>

        {/* --- MODAL ADD/EDIT CAT --- */}
        <Modal visible={showCatModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{isEditing ? 'Edit Kucing' : 'Tambah Kucing'}</Text>
                        <TouchableOpacity onPress={() => setShowCatModal(false)}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity onPress={() => pickImage(false)} style={styles.imagePicker}>
                            {catForm.photo ? (
                                <Image source={{ uri: catForm.photo.uri }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="camera" size={32} color="#ccc" />
                                    <Text style={{ color: '#999', fontSize: 12 }}>Upload Foto</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.label}>Nama</Text>
                        <TextInput style={styles.input} value={catForm.name} onChangeText={t => setCatForm({...catForm, name: t})} />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Ras</Text>
                                <TextInput style={styles.input} value={catForm.breed} onChangeText={t => setCatForm({...catForm, breed: t})} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Umur (Bln)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={catForm.age} onChangeText={t => setCatForm({...catForm, age: t})} />
                            </View>
                        </View>

                        <Text style={styles.label}>Gender</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                            {['male', 'female'].map(g => (
                                <TouchableOpacity 
                                    key={g} 
                                    style={[styles.radioBtn, catForm.gender === g && styles.radioBtnActive]}
                                    onPress={() => setCatForm({...catForm, gender: g as 'male'|'female'})}
                                >
                                    <Text style={catForm.gender === g ? {color: '#fff'} : {color: '#666'}}>
                                        {g === 'male' ? 'Jantan' : 'Betina'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Status Kesehatan</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {['healthy', 'vaccinated', 'sick', 'sterilized'].map(s => (
                                <TouchableOpacity 
                                    key={s} 
                                    style={[styles.chip, catForm.health_status === s && styles.chipActive]}
                                    onPress={() => setCatForm({...catForm, health_status: s})}
                                >
                                    <Text style={[styles.chipText, catForm.health_status === s && {color:'#fff'}]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Deskripsi</Text>
                        <TextInput 
                            style={[styles.input, { height: 80 }]} 
                            multiline 
                            value={catForm.description} 
                            onChangeText={t => setCatForm({...catForm, description: t})} 
                        />

                        <TouchableOpacity 
                            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
                            onPress={submitCat} 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Simpan Data</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>

        {/* --- MODAL CONVERT --- */}
        <Modal visible={showConvertModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Masuk Katalog Adopsi</Text>
                    <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Lengkapi data sebelum dipublish.</Text>
                    
                    <ScrollView>
                        <Text style={styles.label}>Nama Kucing</Text>
                        <TextInput style={styles.input} value={convertForm.name} onChangeText={t => setConvertForm({...convertForm, name: t})} />
                        
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Gender</Text>
                                <TextInput style={styles.input} value="male" editable={false} /> 
                                {/* Simplifikasi: Idealnya dropdown */}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Umur</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={convertForm.age} onChangeText={t => setConvertForm({...convertForm, age: t})} />
                            </View>
                        </View>

                        <Text style={styles.label}>Deskripsi</Text>
                        <TextInput style={[styles.input, { height: 60 }]} multiline value={convertForm.description} onChangeText={t => setConvertForm({...convertForm, description: t})} />

                        <TouchableOpacity style={styles.submitBtn} onPress={submitConvert} disabled={isSubmitting}>
                             {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Simpan ke Katalog</Text>}
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.cancelBtn, {marginTop: 10}]} onPress={() => setShowConvertModal(false)}>
                            <Text style={{ textAlign: 'center', color: '#666' }}>Batal</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { 
    paddingTop: Platform.OS === 'android' ? 50 : 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: '#fff', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280' },
  
  tabContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    gap: 10,
    backgroundColor: '#fff' 
  },
  tabBtn: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: 25, 
    alignItems: 'center', 
    backgroundColor: '#f3f4f6' 
  },
  tabBtnActive: { backgroundColor: '#3A5F50' },
  tabText: { fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },

  content: { padding: 20 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EBCD5E', padding: 12, borderRadius: 12, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  addBtnText: { fontWeight: 'bold', color: '#1f2937' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#9ca3af', fontStyle: 'italic' },

  // Cat Card
  catCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, flexDirection: 'row',
    overflow: 'hidden', elevation: 2, padding: 10, alignItems: 'center'
  },
  catImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#eee' },
  catInfo: { flex: 1, marginLeft: 12 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  catDetail: { fontSize: 12, color: '#666', marginVertical: 2 },
  badgeContainer: { flexDirection: 'row', marginBottom: 6 },
  badgeText: { fontSize: 10, backgroundColor: '#ecfdf5', color: '#047857', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actionRow: { flexDirection: 'row', gap: 10 },
  editAction: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  deleteAction: { backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  actionText: { fontSize: 12, fontWeight: 'bold', color: '#4b5563' },

  // Rescue Card
  rescueCard: { backgroundColor: '#fff', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 2 },
  rescueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  typeMissing: { backgroundColor: '#fef2f2', color: '#dc2626' },
  typeStray: { backgroundColor: '#fff7ed', color: '#ea580c' },
  dateText: { fontSize: 12, color: '#9ca3af' },
  rescueImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#eee' },
  rescueName: { fontWeight: 'bold', fontSize: 16 },
  rescueLoc: { fontSize: 12, color: '#666' },
  ownerBox: { backgroundColor: '#eff6ff', padding: 10, borderRadius: 8, marginTop: 5 },
  ownerLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
  ownerContact: { fontSize: 12, color: '#3b82f6' },
  greenBtn: { backgroundColor: '#16a34a', padding: 10, borderRadius: 8, alignItems: 'center' },
  darkBtn: { backgroundColor: '#3A5F50', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  disabledBtn: { backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  disabledBtnText: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  imagePicker: { 
    width: 100, height: 100, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, 
    borderColor: '#e5e7eb', borderStyle: 'dashed', alignSelf: 'center', marginBottom: 20, 
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 5, textTransform: 'uppercase' },
  input: { 
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', 
    borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 14 
  },
  radioBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  radioBtnActive: { backgroundColor: '#3A5F50', borderColor: '#3A5F50' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#3A5F50', borderColor: '#3A5F50' },
  chipText: { fontSize: 12, color: '#666' },
  submitBtn: { backgroundColor: '#EBCD5E', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { fontWeight: 'bold', color: '#1f2937', fontSize: 16 },
  cancelBtn: { padding: 15 },
});