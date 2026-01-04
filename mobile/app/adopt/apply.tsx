import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import apiClient, { API_BASE_URL } from '../../api/apiClient';

const serverUrl = API_BASE_URL ? API_BASE_URL.replace('/api/v1', '') : '';

export default function AdoptionForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [cat, setCat] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({ data: true, photo: false, statement: false });

  // LOGIC: Form State (Tetap sama)
  const [form, setForm] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    job: '',
    address: ''
  });

  // LOGIC: File State (Tetap sama)
  const [identityPhoto, setIdentityPhoto] = useState<any>(null);
  const [statementLetter, setStatementLetter] = useState<any>(null);

  useEffect(() => {
    if (id) fetchCatDetail();
  }, [id]);

  // LOGIC: Fetch Data (Tetap sama)
  const fetchCatDetail = async () => {
    try {
      const res = await apiClient.get(`/cats/${id}`);
      setCat(res.data.data || res.data);
    } catch (err) {
      Alert.alert("Error", "Gagal mengambil detail kucing.");
    }
  };

  // LOGIC: Pickers (Tetap sama)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setIdentityPhoto(result.assets[0]);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) setStatementLetter(result.assets[0]);
  };

  // LOGIC: Handle Submit (Tetap sama, tidak diubah)
  const handleSubmit = async () => {
    if (!identityPhoto || !statementLetter) {
      Alert.alert("Peringatan", "Mohon lengkapi dokumen identitas dan surat pernyataan.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('cat_id', id as string);
    formData.append('nik', form.nik);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('job', form.job);
    formData.append('address', form.address);

    formData.append('identity_photo', {
      uri: identityPhoto.uri,
      name: identityPhoto.fileName || 'identity.jpg',
      type: 'image/jpeg'
    } as any);

    formData.append('statement_letter', {
      uri: statementLetter.uri,
      name: statementLetter.name || 'statement.pdf',
      type: 'application/pdf'
    } as any);

    try {
      await apiClient.post('/adopt/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert("Sukses", "Pengajuan adopsi berhasil dikirim!", [
        { text: "OK", onPress: () => router.replace('/(tabs)/adopt') }
      ]);
    } catch (error: any) {
      Alert.alert("Gagal", error.response?.data?.error || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cat) return <View className="flex-1 justify-center"><ActivityIndicator color="#3A5F50" /></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <Stack.Screen options={{ title: 'Ajukan Adopsi', headerTintColor: '#3A5F50' }} />
      
      <ScrollView className="flex-1 bg-gray-100 p-5">
        
        {/* Ringkasan Kucing */}
        <View className="flex-row items-center bg-white p-4 rounded-3xl mb-5 shadow-sm">
          <Image 
            source={{ uri: `${serverUrl}/public/img/cats/${cat.photo}` }} 
            className="w-16 h-16 rounded-2xl mr-4"
          />
          <View>
            <Text className="text-xl font-bold text-gray-800">{cat.name}</Text>
            <Text className="text-gray-500">{cat.breed} • {cat.age} Bulan</Text>
          </View>
        </View>

        {/* Section 1: Data Pengadopsi */}
        <TouchableOpacity 
          onPress={() => setExpanded({...expanded, data: !expanded.data})}
          className="flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-200"
        >
          <Text className="font-bold text-lg text-[#3A5F50]">Verifikasi Data Pengadopsi</Text>
          <Ionicons name={expanded.data ? "chevron-up" : "chevron-down"} size={20} color="#3A5F50" />
        </TouchableOpacity>
        
        {expanded.data && (
          <View className="bg-white p-4 rounded-b-2xl -mt-2 border-x border-b border-gray-100">
            <TextInput className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3" placeholder="Nama Lengkap" value={form.name} onChangeText={(t) => setForm({...form, name: t})} />
            <TextInput className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3" placeholder="NIK" keyboardType="numeric" value={form.nik} onChangeText={(t) => setForm({...form, nik: t})} />
            <TextInput className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3" placeholder="Nomor Handphone" keyboardType="phone-pad" value={form.phone} onChangeText={(t) => setForm({...form, phone: t})} />
            <TextInput className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3" placeholder="Email" keyboardType="email-address" value={form.email} onChangeText={(t) => setForm({...form, email: t})} />
            <TextInput className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3" placeholder="Pekerjaan" value={form.job} onChangeText={(t) => setForm({...form, job: t})} />
            <TextInput className="bg-gray-50 p-3 rounded-xl border border-gray-200 h-20" placeholder="Alamat" multiline value={form.address} onChangeText={(t) => setForm({...form, address: t})} />
          </View>
        )}

        {/* Section 2: Foto Identitas */}
        <TouchableOpacity 
          onPress={() => setExpanded({...expanded, photo: !expanded.photo})}
          className="flex-row justify-between items-center bg-white p-4 rounded-2xl mt-4 border border-gray-200"
        >
          <Text className="font-bold text-lg text-[#3A5F50]">Foto Identitas (KTP/SIM)</Text>
          <Ionicons name={expanded.photo ? "chevron-up" : "chevron-down"} size={20} color="#3A5F50" />
        </TouchableOpacity>

        {expanded.photo && (
          <View className="bg-white p-4 rounded-b-2xl -mt-2 border-x border-b border-gray-100">
            <TouchableOpacity onPress={pickImage} className="border-2 border-dashed border-gray-300 p-6 rounded-2xl items-center">
              <FontAwesome5 name="id-card" size={32} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">
                {identityPhoto ? identityPhoto.fileName || 'Foto Terpilih' : 'Klik untuk memilih foto KTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 3: Surat Pernyataan */}
        <TouchableOpacity 
          onPress={() => setExpanded({...expanded, statement: !expanded.statement})}
          className="flex-row justify-between items-center bg-white p-4 rounded-2xl mt-4 border border-gray-200"
        >
          <Text className="font-bold text-lg text-[#3A5F50]">Surat Pernyataan Adopsi</Text>
          <Ionicons name={expanded.statement ? "chevron-up" : "chevron-down"} size={20} color="#3A5F50" />
        </TouchableOpacity>

        {expanded.statement && (
          <View className="bg-white p-4 rounded-b-2xl -mt-2 border-x border-b border-gray-100">
            <TouchableOpacity onPress={pickDocument} className="border-2 border-dashed border-gray-300 p-6 rounded-2xl items-center">
              <FontAwesome5 name="file-pdf" size={32} color="#e74c3c" />
              <Text className="text-gray-500 mt-2 text-center">
                {statementLetter ? statementLetter.name : 'Klik untuk upload PDF Surat Pernyataan'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tombol Submit Asli */}
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`bg-[#EBCD5E] p-4 rounded-2xl mt-8 mb-10 items-center shadow-lg ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <Text className="text-[#1F2937] font-extrabold text-lg">AJUKAN ADOPSI</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}