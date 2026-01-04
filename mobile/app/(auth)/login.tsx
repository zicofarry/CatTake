import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
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

import { API_BASE_URL } from '../../api/apiClient';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State untuk Focus Input
  const [focusUser, setFocusUser] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  // State untuk Modal Popup
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    // Jika sukses, baru pindahkan user ke home
    if (modalType === 'success') {
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    // 1. Validasi Input
    if (!identifier || !password) {
      showModal('error', 'Perhatian', 'Mohon isi Email/Username dan Password.');
      return;
    }

    setIsLoading(true);

    try {
      // console.log("1. Mengirim data login...", { username: identifier }); 

      // 2. Request ke Backend
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier, 
        password,
      });

      // console.log("2. STATUS RESPONSE:", response.status);
      
      const resData = response.data.data; 

      // 3. Cek apakah token ada
      if (resData && resData.token) {
        // console.log("3. Login Berhasil, menyimpan session...");
        
        await AsyncStorage.setItem('userToken', resData.token);
        await AsyncStorage.setItem('userRole', String(resData.role || 'user'));
        await AsyncStorage.setItem('userId', String(resData.id || ''));
        await AsyncStorage.setItem('username', String(resData.username || identifier));
        
        showModal('success', 'Berhasil Masuk!', 'Selamat datang kembali di CatTake.');
      } else {
        // console.log("4. Token tidak ditemukan di response.");
        showModal('error', 'Login Gagal', 'Data user tidak ditemukan dalam respon server.');
      }
      
    } catch (error: any) {
      // console.log("!!! ERROR LOGIN !!!");
      let errorMessage = 'Login gagal. Cek kredensial atau server.';

      if (error.response) {
        console.log("Status Error:", error.response.status);
        console.log("Data Error:", JSON.stringify(error.response.data));
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        console.log("Tidak ada respon dari server.");
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }

      showModal('error', 'Login Gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#3A5F50', '#578d76']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >
           <Svg
            height={120}
            width="100%"
            viewBox="0 0 1440 320"
            style={styles.svgCurve}
            preserveAspectRatio="none"
          >
            <Path
              fill="#f3f4f6"
              d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,197.3C672,171,768,117,864,112C960,107,1056,149,1152,165.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </Svg>
        </LinearGradient>
      </View>

      {/* Logo */}
      <View style={styles.fixedLogoContainer}>
        <Image 
          source={require('../../assets/images/catTakePutih.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Please enter your details</Text>

          <View style={styles.formContainer}>
            
            {/* Input Username */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome 
                    name="user" 
                    size={18} 
                    color={focusUser ? '#EBCD5E' : '#9CA3AF'} 
                />
              </View>
              <TextInput
                style={[styles.input, focusUser && styles.inputFocused]}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                onFocus={() => setFocusUser(true)}
                onBlur={() => setFocusUser(false)}
              />
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome 
                    name="lock" 
                    size={18} 
                    color={focusPass ? '#EBCD5E' : '#9CA3AF'} 
                />
              </View>
              <TextInput
                style={[styles.input, focusPass && styles.inputFocused]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusPass(true)}
                onBlur={() => setFocusPass(false)}
              />
            </View>
            
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.buttonWrapper}>
              <LinearGradient
                colors={['#FBC02D', '#E0C048']}
                style={styles.mainButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1F1F1F" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
            
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>
            
          <TouchableOpacity style={styles.googleButton}>
            <Image 
              source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }} 
              style={styles.googleIcon} 
            />
            <Text style={styles.googleText}>Sign In with Google</Text>
          </TouchableOpacity>
            
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal Popup Custom */}
      <CustomPopup
        visible={modalVisible}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%', 
    zIndex: 0, 
  },
  gradientHeader: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  svgCurve: {
    marginBottom: -1,
  },
  fixedLogoContainer: {
    position: 'absolute',
    top: 50, 
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 120, 
    height: 120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 200, 
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 420,
    borderRadius: 30,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    gap: 20,
  },
  inputGroup: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2, 
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 44,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: '#EBCD5E',
  },
  buttonWrapper: {
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: '#EBCD5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 5,
    borderRadius: 9999,
  },
  mainButton: {
    width: 160,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 32,
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    fontSize: 14,
    color: '#E0C048',
    fontWeight: 'bold',
  },
});