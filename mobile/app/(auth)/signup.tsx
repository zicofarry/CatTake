import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

// IMPORT GOOGLE SIGN IN
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import apiClient, { API_BASE_URL } from '../../api/apiClient';
// IMPORT KOMPONEN POPUP
import CustomPopup from '../../components/CustomPopup'; 

export default function SignupScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [shelterName, setShelterName] = useState('');
  
  const [selectedRole, setSelectedRole] = useState<'user' | 'shelter' | null>(null);

  // --- PERBAIKAN BUG: PEMISAHAN LOADING STATE ---
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // States untuk Focus Effect
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusShelter, setFocusShelter] = useState(false);
  const [focusName, setFocusName] = useState(false);
  const [focusUser, setFocusUser] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
  const [focusConfirm, setFocusConfirm] = useState(false);

  // --- STATE UNTUK MODAL POPUP ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // --- CONFIG GOOGLE SIGN IN ---
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '845303611060-f0660l7kgva0k0f610mag698b9a9b86u.apps.googleusercontent.com', 
      offlineAccess: true,
    });
  }, []);

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // --- LOGIKA GOOGLE SIGNUP ---
  const handleGoogleSignup = async () => {
    if (!selectedRole) {
      showModal('error', 'Pilih Peran', 'Mohon pilih daftar sebagai User atau Shelter terlebih dahulu sebelum menggunakan Google.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      try { await GoogleSignin.signOut(); } catch (e) {}
      
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('Gagal mendapatkan ID Token dari Google');

      const response = await apiClient.post('/auth/google', {
        token: idToken,
        role: selectedRole === 'user' ? 'individu' : 'shelter' 
      });

      showModal('success', 'Login Berhasil', `Selamat datang ${response.data.data.full_name || 'di CatTake'}!`);
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        showModal('error', 'Gagal', 'Terjadi kesalahan saat pendaftaran Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignup = async () => {
    // 1. Validasi Apakah Role Sudah Dipilih
    if (!selectedRole) {
      showModal('error', 'Gagal', 'Mohon pilih jenis akun (User Biasa atau Shelter)!');
      return;
    }

    // 2. Validasi Field Kosong (Email, Nama, User, PW)
    if (!email || !fullName || !username || !password || !confirmPassword) {
        showModal('error', 'Field Kosong', 'Semua field wajib diisi sebelum mendaftar.');
        return;
    }

    // 3. Validasi Khusus Shelter
    if (selectedRole === 'shelter' && !shelterName) {
      showModal('error', 'Gagal', 'Nama Resmi Shelter wajib diisi.');
      return;
    }

    // 4. Validasi Konfirmasi Password
    if (password !== confirmPassword) {
      showModal('error', 'Gagal', 'Password dan Konfirmasi Password harus sama!');
      return;
    }

    setIsManualLoading(true);

    const data: any = {
      username: username,
      password: password,
      email: email,
      role: selectedRole === 'user' ? 'individu' : 'shelter',
      full_name: fullName,
      contact_phone: '', 
    };

    if (data.role === 'individu') {
      data.address = null;
    } else if (data.role === 'shelter') {
      data.shelter_name = shelterName;
      data.pj_name = fullName; 
      data.organization_type = 'Komunitas'; 
    }

    try {
      await apiClient.post(`/auth/register`, data);
      showModal('success', 'Pendaftaran Berhasil!', `Selamat bergabung ${fullName}! Akunmu sudah siap digunakan.`);
    } catch (error: any) {
      const errMsg = error.response?.status === 409 ? 'Email/Username sudah terdaftar.' : 'Terjadi kesalahan pada server.';
      showModal('error', 'Pendaftaran Gagal', errMsg);
    } finally {
      setIsManualLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f3f4f6]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <View className="absolute top-0 left-0 right-0 h-[65%] z-0">
        <LinearGradient
          colors={['#3A5F50', '#578d76']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          className="flex-1 justify-end"
        >
           <Svg height={120} width="100%" viewBox="0 0 1440 320" className="mb-[-1px]" preserveAspectRatio="none">
            <Path fill="#f3f4f6" d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,197.3C672,171,768,117,864,112C960,107,1056,149,1152,165.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </Svg>
        </LinearGradient>
      </View>

      {/* Logo Section - Tanpa z-index agar tertutup card */}
      <View className="absolute top-[40px] left-0 right-0 items-center">
        <Image 
            source={require('../../assets/images/catTakePutih.png')} 
            style={{ width: 144, height: 144, borderRadius: 72 }}
            resizeMode="contain"
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ alignItems: 'center', paddingTop: 220, paddingBottom: 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View className="bg-white w-full max-w-[450px] rounded-[30px] p-[32px] items-center shadow-2xl" style={{ elevation: 8, shadowColor: '#000' }}>
          <Text className="text-[28px] font-bold text-[#1F1F1F] mb-[8px]">Sign Up</Text>
          <Text className="text-[14px] text-[#9CA3AF] mb-[24px]">Create your account today</Text>

          <View className="w-full gap-[16px]">
            {/* Pemilihan Role - Dipastikan hanya set state */}
            <View>
                <Text className="text-[12px] font-bold text-[#6B7280] mb-[8px] text-center tracking-[0.5px]">DAFTAR SEBAGAI:</Text>
                <View className="flex-row bg-[#F3F4F6] p-[4px] rounded-[12px] gap-[12px] mb-[8px]">
                    <TouchableOpacity 
                        className={`flex-1 py-[10px] items-center rounded-[8px] ${selectedRole === 'user' ? 'bg-[#3A5F50]' : ''}`}
                        style={selectedRole === 'user' ? { elevation: 2 } : {}}
                        onPress={() => setSelectedRole('user')}
                    >
                        <Text className={`font-[600] text-[14px] ${selectedRole === 'user' ? 'text-white' : 'text-[#6B7280]'}`}>User Biasa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className={`flex-1 py-[10px] items-center rounded-[8px] ${selectedRole === 'shelter' ? 'bg-[#3A5F50]' : ''}`}
                        style={selectedRole === 'shelter' ? { elevation: 2 } : {}}
                        onPress={() => setSelectedRole('shelter')}
                    >
                        <Text className={`font-[600] text-[14px] ${selectedRole === 'shelter' ? 'text-white' : 'text-[#6B7280]'}`}>Shelter</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Input Groups */}
            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="envelope" size={16} color={focusEmail ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-[1px] rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusEmail ? 'border-[#EBCD5E] border-2' : 'border-[#E5E7EB]'}`}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
                editable={!isManualLoading && !isGoogleLoading}
              />
            </View>

            {selectedRole === 'shelter' && (
                <View className="relative justify-center">
                  <View className="absolute left-[16px] z-10">
                    <FontAwesome name="home" size={18} color={focusShelter ? '#EBCD5E' : '#9CA3AF'} />
                  </View>
                  <TextInput
                    className={`bg-[#F9FAFB] border-[1px] rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusShelter ? 'border-[#EBCD5E] border-2' : 'border-[#E5E7EB]'}`}
                    placeholder="Nama Resmi Shelter (Wajib)"
                    placeholderTextColor="#9CA3AF"
                    value={shelterName}
                    onChangeText={setShelterName}
                    onFocus={() => setFocusShelter(true)}
                    onBlur={() => setFocusShelter(false)}
                    editable={!isManualLoading && !isGoogleLoading}
                  />
                </View>
            )}

            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="id-card" size={16} color={focusName ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-[1px] rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusName ? 'border-[#EBCD5E] border-2' : 'border-[#E5E7EB]'}`}
                placeholder={selectedRole === 'shelter' ? 'Nama Penanggung Jawab' : 'Nama Lengkap'}
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusName(true)}
                onBlur={() => setFocusName(false)}
                editable={!isManualLoading && !isGoogleLoading}
              />
            </View>

            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="user" size={18} color={focusUser ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-[1px] rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusUser ? 'border-[#EBCD5E] border-2' : 'border-[#E5E7EB]'}`}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusUser(true)}
                onBlur={() => setFocusUser(false)}
                editable={!isManualLoading && !isGoogleLoading}
              />
            </View>

            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="lock" size={18} color={focusPass ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-[1px] rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusPass ? 'border-[#EBCD5E] border-2' : 'border-[#E5E7EB]'}`}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusPass(true)}
                onBlur={() => setFocusPass(false)}
                editable={!isManualLoading && !isGoogleLoading}
              />
            </View>

            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="check-circle" size={18} color={focusConfirm ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-[1px] rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusConfirm ? 'border-[#EBCD5E] border-2' : 'border-[#E5E7EB]'}`}
                placeholder="Konfirmasi Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusConfirm(true)}
                onBlur={() => setFocusConfirm(false)}
                editable={!isManualLoading && !isGoogleLoading}
              />
            </View>

            {/* Tombol Signup Utama */}
            <TouchableOpacity 
                onPress={handleSignup} 
                activeOpacity={0.8} 
                className={`mt-[8px] self-center shadow-lg ${(!selectedRole || isManualLoading || isGoogleLoading) ? 'opacity-60' : ''}`}
                style={{ borderRadius: 9999, elevation: 5, shadowColor: '#EBCD5E' }}
                disabled={isManualLoading || isGoogleLoading}
            >
              <LinearGradient colors={['#FBC02D', '#E0C048']} style={{ borderRadius: 9999, width: 160, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }}>
                {isManualLoading ? <ActivityIndicator color="#1F1F1F" /> : <Text className="text-[#111827] font-bold text-[16px]">Sign Up</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center w-full my-[24px] gap-[12px]">
            <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
            <Text className="text-[#9CA3AF] text-[14px] font-[500]">or</Text>
            <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
          </View>
            
          {/* TOMBOL GOOGLE */}
          <TouchableOpacity 
            className={`flex-row items-center justify-center w-full bg-white border border-[#E5E7EB] py-[12px] rounded-[12px] gap-[12px] ${isManualLoading || isGoogleLoading ? 'opacity-50' : ''}`}
            onPress={handleGoogleSignup}
            disabled={isManualLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#4B5563" />
            ) : (
              <>
                <Image source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }} className="w-[20px] h-[20px]" />
                <Text className="text-[#4B5563] text-[14px] font-[600]">Sign Up with Google</Text>
              </>
            )}
          </TouchableOpacity>
            
          <View className="mt-[32px] flex-row">
            <Text className="text-[14px] text-[#6B7280]">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} disabled={isManualLoading || isGoogleLoading}>
                <Text className="text-[14px] text-[#E0C048] font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL POPUP CUSTOM */}
      <CustomPopup
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          if (modalType === 'success') router.push('/login');
        }}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
      />
    </View>
  );
}