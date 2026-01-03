import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Dimensions, ActivityIndicator, Modal, TextInput, Alert, Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import apiClient, { API_BASE_URL } from '../../api/apiClient';

const { width } = Dimensions.get('window');
const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

// Helper URL Gambar
const resolveImageUrl = (path: string | null, folder: 'profile' | 'license') => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${serverUrl}/public/img/${folder}/${path}`;
};

// Helper Warna Avatar Random (Mirip Vue)
const getAvatarColor = (index: number) => {
  const colors = ['#60997E', '#4E7C68', '#3A5F50', '#88B09B', '#EBCD5E'];
  return colors[index % colors.length];
};

export default function ShelterDriverPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedDriverId, setExpandedDriverId] = useState<number | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    sim: null as any,
    photo: null as any
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  // --- API ACTIONS ---
  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/drivers');
      // Mapping sesuai struktur backend -> frontend
      const mapped = response.data.map((d: any) => ({
        id: d.id,
        name: d.full_name || d.name, // Handle beda field name
        username: d.username,
        email: d.email,
        phone: d.contact_phone,
        sim: d.license_info,
        photo: d.profile_picture,
        is_available: d.is_available
      }));
      setDrivers(mapped);
    } catch (error) {
      console.error("Gagal load driver:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Konfirmasi", "Yakin ingin menghapus driver ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: async () => {
          try {
            await apiClient.delete(`/drivers/${id}`);
            fetchDrivers();
            Alert.alert("Sukses", "Driver dihapus.");
          } catch (e) {
            Alert.alert("Gagal", "Tidak bisa menghapus driver.");
          }
        } 
      }
    ]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.username || !form.email) {
      Alert.alert("Error", "Nama, Username, dan Email wajib diisi!");
      return;
    }
    if (!isEditing && !form.password) {
      Alert.alert("Error", "Password wajib diisi untuk driver baru!");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      
      if (!isEditing) {
        formData.append('password', form.password);
      }

      // Append File Photo
      if (form.photo && form.photo.uri) {
        formData.append('photo', {
          uri: form.photo.uri,
          name: 'profile.jpg',
          type: 'image/jpeg'
        } as any);
      }

      // Append File SIM
      if (form.sim && form.sim.uri) {
        formData.append('sim', {
          uri: form.sim.uri,
          name: 'sim.jpg',
          type: 'image/jpeg'
        } as any);
      }

      if (isEditing && editId) {
        await apiClient.put(`/drivers/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Alert.alert("Sukses", "Data driver diperbarui.");
      } else {
        await apiClient.post('/drivers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Alert.alert("Sukses", "Driver baru ditambahkan.");
      }
      
      closeModal();
      fetchDrivers();

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Terjadi kesalahan.";
      Alert.alert("Gagal", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS UI ---
  const toggleExpand = (id: number) => {
    setExpandedDriverId(expandedDriverId === id ? null : id);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ name: '', username: '', email: '', password: '', phone: '', sim: null, photo: null });
    setShowModal(true);
  };

  const openEditModal = (driver: any) => {
    setIsEditing(true);
    setEditId(driver.id);
    setForm({
      name: driver.name,
      username: driver.username,
      email: driver.email,
      password: '', // Password kosong saat edit
      phone: driver.phone,
      sim: null, // Reset file picker (tapi preview pakai URL lama)
      photo: null
    });
    // Kita simpan URL lama di object form sementara jika user tidak upload baru
    // Tapi logic display di modal pakai kondisi (form.photo ? form.photo.uri : oldUrl)
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const pickImage = async (field: 'photo' | 'sim') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: field === 'photo' ? [1,1] : [4,3]
    });

    if (!result.canceled) {
      setForm(prev => ({ ...prev, [field]: result.assets[0] }));
    }
  };

  // --- RENDER ---
  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>
      <LinearGradient colors={['#cfe3d4', '#3A5F50']} style={styles.bgGradient} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Driver</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#3A5F50" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
            <ActivityIndicator size="large" color="#3A5F50" style={{marginTop: 50}} />
        ) : drivers.length === 0 ? (
            <View style={styles.emptyBox}>
                <View style={styles.emptyIcon}>
                    <FontAwesome5 name="id-card" size={40} color="#ccc" />
                </View>
                <Text style={styles.emptyTitle}>Belum ada driver</Text>
                <Text style={styles.emptySub}>Tambahkan driver untuk membantu penjemputan.</Text>
            </View>
        ) : (
            drivers.map((driver, index) => (
                <View key={driver.id} style={styles.card}>
                    {/* Header Card (Clickable) */}
                    <TouchableOpacity 
                        style={styles.cardHeader} 
                        onPress={() => toggleExpand(driver.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardLeft}>
                            {driver.photo ? (
                                <Image 
                                    source={{ uri: resolveImageUrl(driver.photo, 'profile') || undefined }} 
                                    style={styles.avatarImg} 
                                />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: getAvatarColor(index) }]}>
                                    <Text style={styles.avatarInitial}>{driver.name.charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                            <View>
                                <Text style={styles.driverName}>{driver.name}</Text>
                                <Text style={styles.driverUsername}>@{driver.username}</Text>
                            </View>
                        </View>
                        <Ionicons 
                            name={expandedDriverId === driver.id ? "chevron-up-circle" : "chevron-down-circle"} 
                            size={28} 
                            color={expandedDriverId === driver.id ? "#EBCD5E" : "#cbd5e1"} 
                        />
                    </TouchableOpacity>

                    {/* Expandable Content */}
                    {expandedDriverId === driver.id && (
                        <View style={styles.cardBody}>
                            <View style={styles.divider} />
                            
                            <View style={styles.infoRow}>
                                <View style={{flex:1}}>
                                    <Text style={styles.label}>EMAIL</Text>
                                    <Text style={styles.value}>{driver.email}</Text>
                                </View>
                                <View style={{flex:1}}>
                                    <Text style={styles.label}>NO. TELEPON</Text>
                                    <Text style={styles.value}>{driver.phone || '-'}</Text>
                                </View>
                            </View>

                            <Text style={[styles.label, {marginTop: 15}]}>FOTO SIM</Text>
                            <View style={styles.simBox}>
                                {driver.sim ? (
                                    <Image 
                                        source={{ uri: resolveImageUrl(driver.sim, 'license') || undefined }} 
                                        style={styles.simImg} 
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={styles.noSimText}>Tidak ada foto SIM</Text>
                                )}
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity onPress={() => openEditModal(driver)} style={styles.editBtn}>
                                    <Text style={styles.btnTextWhite}>Edit Data</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(driver.id)} style={styles.deleteBtn}>
                                    <Text style={styles.btnTextRed}>Hapus</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            ))
        )}
      </ScrollView>

      {/* MODAL FORM */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{isEditing ? 'Edit Driver' : 'Tambah Driver'}</Text>
                    <TouchableOpacity onPress={closeModal}>
                        <Ionicons name="close-circle" size={28} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView contentContainerStyle={styles.modalBody}>
                    {/* Foto Profil */}
                    <TouchableOpacity onPress={() => pickImage('photo')} style={styles.uploadAvatar}>
                        {form.photo ? (
                            <Image source={{ uri: form.photo.uri }} style={styles.uploadAvatarImg} />
                        ) : isEditing && drivers.find(d => d.id === editId)?.photo ? (
                            <Image source={{ uri: resolveImageUrl(drivers.find(d => d.id === editId)?.photo, 'profile')! }} style={styles.uploadAvatarImg} />
                        ) : (
                            <View style={styles.uploadAvatarPlaceholder}>
                                <Ionicons name="camera" size={24} color="#9ca3af" />
                                <Text style={styles.uploadLabel}>Foto</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.inputLabel}>Nama Lengkap</Text>
                    <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Budi Santoso" />

                    <View style={{flexDirection: 'row', gap: 10}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <TextInput style={styles.input} value={form.username} onChangeText={t => setForm({...form, username: t})} placeholder="budidriver" autoCapitalize="none" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.inputLabel}>No. HP</Text>
                            <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({...form, phone: t})} placeholder="0812..." keyboardType="phone-pad" />
                        </View>
                    </View>

                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput style={styles.input} value={form.email} onChangeText={t => setForm({...form, email: t})} placeholder="email@contoh.com" keyboardType="email-address" autoCapitalize="none" />

                    {!isEditing && (
                        <>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput style={styles.input} value={form.password} onChangeText={t => setForm({...form, password: t})} placeholder="******" secureTextEntry />
                        </>
                    )}

                    {/* Foto SIM */}
                    <Text style={styles.inputLabel}>Upload Foto SIM</Text>
                    <TouchableOpacity onPress={() => pickImage('sim')} style={styles.uploadSim}>
                        {form.sim ? (
                            <Image source={{ uri: form.sim.uri }} style={styles.uploadSimImg} />
                        ) : isEditing && drivers.find(d => d.id === editId)?.sim ? (
                            <Image source={{ uri: resolveImageUrl(drivers.find(d => d.id === editId)?.sim, 'license')! }} style={styles.uploadSimImg} />
                        ) : (
                            <View style={{alignItems: 'center'}}>
                                <Ionicons name="image-outline" size={24} color="#9ca3af" />
                                <Text style={styles.uploadLabel}>Pilih Foto SIM</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Simpan Driver</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
  
  header: { 
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 3 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 44, height: 44, backgroundColor: '#EBCD5E', borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // Empty State
  emptyBox: { alignItems: 'center', marginTop: 50, padding: 30, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20 },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  emptySub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 5 },

  // Card Driver
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarImg: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  driverUsername: { fontSize: 12, color: '#6b7280', backgroundColor: '#f3f4f6', alignSelf: 'flex-start', paddingHorizontal: 6, borderRadius: 4, marginTop: 2 },
  
  // Expanded Content
  cardBody: { paddingHorizontal: 15, paddingBottom: 20, backgroundColor: '#f9fafb' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginBottom: 15 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#9ca3af', marginBottom: 3 },
  value: { fontSize: 14, color: '#374151', fontWeight: '500' },
  
  simBox: { height: 120, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 5, overflow: 'hidden' },
  simImg: { width: '100%', height: '100%' },
  noSimText: { fontSize: 12, color: '#9ca3af' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  editBtn: { flex: 1, backgroundColor: '#3A5F50', padding: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#fca5a5', padding: 10, borderRadius: 8, alignItems: 'center' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnTextRed: { color: '#ef4444', fontWeight: 'bold', fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  modalBody: { padding: 20 },

  uploadAvatar: { alignSelf: 'center', marginBottom: 20 },
  uploadAvatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#EBCD5E' },
  uploadAvatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed' },
  
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 5 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 14 },
  
  uploadSim: { height: 100, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  uploadSimImg: { width: '100%', height: '100%', borderRadius: 10, resizeMode: 'cover' },
  uploadLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },

  submitBtn: { backgroundColor: '#3A5F50', padding: 15, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});