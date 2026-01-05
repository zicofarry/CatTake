import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, 
  Dimensions, ActivityIndicator, Modal, TextInput, Alert, Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import apiClient, { API_BASE_URL } from '../../api/apiClient';

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : 'http://192.168.1.5:3000';

// Helper URL Gambar
const resolveImageUrl = (path: string | null, folder: 'profile' | 'license') => {
  if (!path || path === 'null') return null;
  if (path.startsWith('http')) return path;
  return `${serverUrl}/public/img/${folder}/${path}`;
};

// Helper Warna Avatar Random
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
      const mapped = response.data.map((d: any) => ({
        id: d.id,
        name: d.full_name || d.name,
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

      if (form.photo && form.photo.uri) {
        formData.append('photo', {
          uri: form.photo.uri,
          name: 'profile.jpg',
          type: 'image/jpeg'
        } as any);
      }

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
      const msg = error.response?.data?.message || "Terjadi kesalahan.";
      Alert.alert("Gagal", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS UI ---
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
      password: '',
      phone: driver.phone,
      sim: null,
      photo: null
    });
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

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={styles.container}>
      
      {/* HEADER (Gaya Dashboard.tsx) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#3A5F50" />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Manajemen Driver</Text>
            <Text style={styles.headerSubtitle}>Kelola akun petugas penjemputan</Text>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Tombol Tambah (Gaya Dashboard.tsx) */}
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Ionicons name="add-circle" size={20} color="#1f2937" />
            <Text style={styles.addBtnText}>Tambah Driver Baru</Text>
        </TouchableOpacity>

        {isLoading ? (
            <ActivityIndicator size="large" color="#EBCD5E" style={{marginTop: 50}} />
        ) : drivers.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada driver terdaftar.</Text>
        ) : (
            drivers.map((driver, index) => (
                <View key={driver.id} style={styles.driverCard}>
                    {/* Foto/Avatar di Kiri */}
                    {driver.photo ? (
                        <Image 
                            source={{ uri: resolveImageUrl(driver.photo, 'profile') || undefined }} 
                            style={styles.driverImage} 
                        />
                    ) : (
                        <View style={[styles.driverImage, { backgroundColor: getAvatarColor(index), justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 24 }}>{driver.name.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}

                    {/* Info di Kanan */}
                    <View style={styles.driverInfo}>
                        <View style={styles.driverHeader}>
                            <Text style={styles.driverName}>{driver.name}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: driver.is_available ? '#ecfdf5' : '#fff7ed' }]}>
                                <Text style={[styles.statusText, { color: driver.is_available ? '#047857' : '#ea580c' }]}>
                                    {driver.is_available ? 'Aktif' : 'Sibuk'}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={styles.driverSubText}>@{driver.username} • {driver.phone || 'No HP -'}</Text>
                        <Text style={styles.driverEmail} numberOfLines={1}>{driver.email}</Text>
                        
                        {/* Aksi (Gaya Dashboard.tsx) */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity onPress={() => openEditModal(driver)} style={styles.editAction}>
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(driver.id)} style={styles.deleteAction}>
                                <Text style={[styles.actionText, { color: '#ef4444' }]}>Hapus</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))
        )}
      </ScrollView>

      {/* MODAL FORM (Gaya Dashboard.tsx) */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeaderModal}>
                    <Text style={styles.modalTitle}>{isEditing ? 'Edit Data Driver' : 'Tambah Driver'}</Text>
                    <TouchableOpacity onPress={closeModal}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Foto Profil Picker */}
                    <TouchableOpacity onPress={() => pickImage('photo')} style={styles.imagePicker}>
                        {form.photo ? (
                            <Image source={{ uri: form.photo.uri }} style={{ width: '100%', height: '100%' }} />
                        ) : isEditing && drivers.find(d => d.id === editId)?.photo ? (
                            <Image source={{ uri: resolveImageUrl(drivers.find(d => d.id === editId)?.photo, 'profile')! }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="camera" size={32} color="#ccc" />
                                <Text style={{ color: '#999', fontSize: 11 }}>Foto Profil</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>Nama Lengkap</Text>
                    <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Masukkan nama" />

                    <View style={{flexDirection: 'row', gap: 10}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput style={styles.input} value={form.username} onChangeText={t => setForm({...form, username: t})} placeholder="username" autoCapitalize="none" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>No. HP</Text>
                            <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({...form, phone: t})} placeholder="08..." keyboardType="phone-pad" />
                        </View>
                    </View>

                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} value={form.email} onChangeText={t => setForm({...form, email: t})} placeholder="email@driver.com" keyboardType="email-address" autoCapitalize="none" />

                    {!isEditing && (
                        <>
                            <Text style={styles.label}>Password</Text>
                            <TextInput style={styles.input} value={form.password} onChangeText={t => setForm({...form, password: t})} placeholder="******" secureTextEntry />
                        </>
                    )}

                    <Text style={styles.label}>Foto SIM</Text>
                    <TouchableOpacity onPress={() => pickImage('sim')} style={styles.simPicker}>
                        {form.sim ? (
                            <Image source={{ uri: form.sim.uri }} style={{ width: '100%', height: '100%' }} />
                        ) : isEditing && drivers.find(d => d.id === editId)?.sim ? (
                            <Image source={{ uri: resolveImageUrl(drivers.find(d => d.id === editId)?.sim, 'license')! }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                            <View style={{alignItems: 'center'}}>
                                <Ionicons name="image-outline" size={24} color="#9ca3af" />
                                <Text style={{ fontSize: 11, color: '#9ca3af' }}>Pilih Foto SIM</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#1f2937" /> : <Text style={styles.submitBtnText}>Simpan Data</Text>}
                    </TouchableOpacity>
                    
                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  
  // Header
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
  headerSubtitle: { fontSize: 13, color: '#6b7280' },

  content: { padding: 20 },

  // Add Button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#EBCD5E', padding: 12, borderRadius: 12, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  addBtnText: { fontWeight: 'bold', color: '#1f2937' },
  
  emptyText: { textAlign: 'center', marginTop: 40, color: '#9ca3af', fontStyle: 'italic' },

  // Driver Card (Mirip Cat Card di Dashboard.tsx)
  driverCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, flexDirection: 'row',
    overflow: 'hidden', elevation: 2, padding: 12, alignItems: 'center'
  },
  driverImage: { width: 85, height: 85, borderRadius: 100 },
  driverInfo: { flex: 1, marginLeft: 15 },
  driverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  driverSubText: { fontSize: 12, color: '#6b7280', marginVertical: 2 },
  driverEmail: { fontSize: 11, color: '#9ca3af', marginBottom: 8 },
  
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', gap: 10 },
  editAction: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  deleteAction: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  actionText: { fontSize: 12, fontWeight: 'bold', color: '#4b5563' },

  // Modal (Mirip Dashboard.tsx)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '92%' },
  modalHeaderModal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  imagePicker: { 
    width: 90, height: 90, backgroundColor: '#f9fafb', borderRadius: 45, borderWidth: 1, 
    borderColor: '#e5e7eb', borderStyle: 'dashed', alignSelf: 'center', marginBottom: 20, 
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },
  
  simPicker: { 
    height: 120, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, 
    borderColor: '#e5e7eb', borderStyle: 'dashed', marginBottom: 20, 
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
  },

  label: { fontSize: 11, fontWeight: 'bold', color: '#6b7280', marginBottom: 5, textTransform: 'uppercase' },
  input: { 
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', 
    borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 14 
  },
  
  submitBtn: { backgroundColor: '#EBCD5E', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitBtnText: { fontWeight: 'bold', color: '#1f2937', fontSize: 16 }
});