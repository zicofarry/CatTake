import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomPopup from '../../components/CustomPopup'; 

// Import apiClient dan API_BASE_URL
import apiClient, { API_BASE_URL } from '../../api/apiClient';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // PEMISAHAN LOADING STATE (Solusi Bug Loading)
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [focusUser, setFocusUser] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

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

  const handleModalClose = async () => {
    setModalVisible(false);
    if (modalType === 'success') {
      const role = await AsyncStorage.getItem('userRole');
      if (role === 'driver') {
        router.replace('/driver');
      } else if (role === 'shelter') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      try { await GoogleSignin.signOut(); } catch (e) {}
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error("Gagal mendapatkan Token dari Google");

      const result = await apiClient.post('/auth/google', { token: idToken });
      const resData = result.data.data;

      if (resData && resData.token) {
        await AsyncStorage.setItem('userToken', resData.token);
        await AsyncStorage.setItem('userRole', String(resData.role || 'user'));
        await AsyncStorage.setItem('userId', String(resData.id || ''));
        await AsyncStorage.setItem('username', String(resData.username || resData.name));
        showModal('success', 'Berhasil Masuk!', 'Selamat datang di CatTake melalui Google.');
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        showModal('error', 'Login Google Gagal', error.response?.data?.error || 'Terjadi kesalahan.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      showModal('error', 'Perhatian', 'Mohon isi Email/Username dan Password.');
      return;
    }
    setIsManualLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { identifier, password });
      const resData = response.data.data; 

      if (resData && resData.token) {
        await AsyncStorage.setItem('userToken', resData.token);
        await AsyncStorage.setItem('userRole', String(resData.role || 'user'));
        await AsyncStorage.setItem('userId', String(resData.id || ''));
        await AsyncStorage.setItem('username', String(resData.username || identifier));
        showModal('success', 'Berhasil Masuk!', 'Selamat datang kembali di CatTake.');
      } else {
        showModal('error', 'Login Gagal', 'Data tidak ditemukan.');
      }
    } catch (error: any) {
      showModal('error', 'Login Gagal', error.response?.data?.error || 'Login gagal.');
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

      {/* 1. PERBAIKAN LOGO: Pakai style langsung biar pasti BUAT (60 = setengah dari 120) */}
      <View className="absolute top-[50px] left-0 right-0 items-center z-10">
        <Image 
          source={require('../../assets/images/catTakePutih.png')} 
          style={{ width: 120, height: 120, borderRadius: 60 }} 
          resizeMode="contain"
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ alignItems: 'center', paddingTop: 200, paddingBottom: 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View className="bg-white w-full max-w-[420px] rounded-[30px] p-[32px] shadow-2xl items-center" style={{ elevation: 8, shadowColor: '#000' }}>
          <Text className="text-[28px] font-bold text-[#1F1F1F] mb-[8px]">Login</Text>
          <Text className="text-[14px] text-[#9CA3AF] mb-[32px]">Please enter your details</Text>

          <View className="w-full gap-[20px]">
            {/* Input Username */}
            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="user" size={18} color={focusUser ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-2 rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusUser ? 'border-[#EBCD5E]' : 'border-transparent'}`}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={setIdentifier}
                onFocus={() => setFocusUser(true)}
                onBlur={() => setFocusUser(false)}
                editable={!isManualLoading && !isGoogleLoading}
              />
            </View>

            {/* Input Password */}
            <View className="relative justify-center">
              <View className="absolute left-[16px] z-10">
                <FontAwesome name="lock" size={18} color={focusPass ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                className={`bg-[#F9FAFB] border-2 rounded-[12px] py-[14px] px-[16px] pl-[44px] text-[14px] text-[#374151] font-[500] ${focusPass ? 'border-[#EBCD5E]' : 'border-transparent'}`}
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
            
            {/* 2. PERBAIKAN TOMBOL: Gunakan borderRadius: 9999 di style untuk meyakinkan NativeWind */}
            <TouchableOpacity 
              onPress={handleLogin} 
              activeOpacity={0.8} 
              disabled={isManualLoading || isGoogleLoading}
              className={`mt-[16px] self-center shadow-lg ${(isManualLoading || isGoogleLoading) ? 'opacity-50' : ''}`}
              style={{ borderRadius: 9999, elevation: 5, shadowColor: '#EBCD5E' }}
            >
              <LinearGradient 
                colors={['#FBC02D', '#E0C048']} 
                style={{ borderRadius: 9999, width: 160, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }}
              >
                {isManualLoading ? (
                  <ActivityIndicator color="#1F1F1F" />
                ) : (
                  <Text className="text-[#111827] font-bold text-[16px]">Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
            
          <View className="flex-row items-center w-full my-[24px] gap-[12px]">
            <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
            <Text className="text-[#9CA3AF] text-[14px] font-[500]">or</Text>
            <View className="flex-1 h-[1px] bg-[#E5E7EB]" />
          </View>
            
          <TouchableOpacity 
            className={`flex-row items-center justify-center w-full bg-white border border-[#E5E7EB] py-[12px] rounded-[12px] gap-[12px] ${(isManualLoading || isGoogleLoading) ? 'opacity-50' : ''}`}
            onPress={handleGoogleLogin}
            disabled={isManualLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
                <ActivityIndicator color="#4B5563" />
            ) : (
              <>
                <Image source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }} className="w-[20px] h-[20px]" />
                <Text className="text-[#4B5563] text-[14px] font-[600]">Sign In with Google</Text>
              </>
            )}
          </TouchableOpacity>
            
          <View className="mt-[32px] flex-row">
            <Text className="text-[14px] text-[#6B7280]">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')} disabled={isManualLoading || isGoogleLoading}>
                <Text className="text-[14px] text-[#E0C048] font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomPopup visible={modalVisible} onClose={handleModalClose} title={modalTitle} message={modalMessage} type={modalType} />
    </View>
  );
}