import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Platform
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
  const [isLoading, setIsLoading] = useState(false);

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
      // Ganti dengan Web Client ID dari Google Cloud Console kamu
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

    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('Gagal mendapatkan ID Token dari Google');
      }

      // Kirim ke backend sesuai AuthController.js
      const response = await apiClient.post('/auth/google', {
        token: idToken,
        role: selectedRole === 'user' ? 'individu' : 'shelter' // Mapping role ke backend
      });

      showModal(
        'success', 
        'Login Berhasil', 
        `Selamat datang ${response.data.data.full_name || 'di CatTake'}!`
      );
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User membatalkan login, tidak perlu tampilkan error besar
      } else if (error.code === statusCodes.IN_PROGRESS) {
        showModal('error', 'Proses Berjalan', 'Proses login sedang berlangsung.');
      } else {
        console.error("Google Signup Error:", error);
        showModal('error', 'Gagal', 'Terjadi kesalahan saat pendaftaran Google: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    // Logic validasi (TETAP SAMA)
    if (password !== confirmPassword) {
      showModal('error', 'Gagal', 'Password dan Konfirmasi Password harus sama!');
      return;
    }
    if (!selectedRole) {
      showModal('error', 'Gagal', 'Mohon pilih jenis akun (User Biasa atau Shelter)!');
      return;
    }
    if (selectedRole === 'shelter' && !shelterName) {
      showModal('error', 'Gagal', 'Nama Resmi Shelter wajib diisi.');
      return;
    }

    setIsLoading(true);

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
      showModal(
        'success', 
        'Pendaftaran Berhasil!', 
        `Selamat bergabung ${fullName}! Akunmu sudah siap digunakan.`
      );
    } catch (error: any) {
      const errMsg = error.response?.status === 409 ? 'Email/Username sudah terdaftar.' : 'Terjadi kesalahan pada server.';
      showModal('error', 'Pendaftaran Gagal', errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#243d2eff', '#578d76']}
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

      <View style={styles.fixedLogoContainer}>
        <Image 
          source={require('../../assets/images/catTakePutih.png')}
          style={{ width: 150, height: 150, borderRadius: 60 }}
          resizeMode="contain"
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Daftar</Text>
          <Text style={styles.subtitle}>Buat akun kamu sekarang</Text>

          <View style={styles.formContainer}>
            <View>
                <Text style={styles.roleLabel}>DAFTAR SEBAGAI:</Text>
                <View style={styles.roleWrapper}>
                    <TouchableOpacity 
                        style={[styles.roleBtn, selectedRole === 'user' && styles.roleBtnActive]}
                        onPress={() => setSelectedRole('user')}
                    >
                        <Text style={[styles.roleText, selectedRole === 'user' && styles.roleTextActive]}>User Biasa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleBtn, selectedRole === 'shelter' && styles.roleBtnActive]}
                        onPress={() => setSelectedRole('shelter')}
                    >
                        <Text style={[styles.roleText, selectedRole === 'shelter' && styles.roleTextActive]}>Shelter</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome name="envelope" size={16} color={focusEmail ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                style={[styles.input, focusEmail && styles.inputFocused]}
                placeholder="Alamat Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
              />
            </View>

            {selectedRole === 'shelter' && (
                <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                    <FontAwesome name="home" size={18} color={focusShelter ? '#EBCD5E' : '#9CA3AF'} />
                </View>
                <TextInput
                    style={[styles.input, focusShelter && styles.inputFocused]}
                    placeholder="Nama Resmi Shelter (Wajib)"
                    placeholderTextColor="#9CA3AF"
                    value={shelterName}
                    onChangeText={setShelterName}
                    onFocus={() => setFocusShelter(true)}
                    onBlur={() => setFocusShelter(false)}
                />
                </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome name="id-card" size={16} color={focusName ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                style={[styles.input, focusName && styles.inputFocused]}
                placeholder={selectedRole === 'shelter' ? 'Nama Penanggung Jawab' : 'Nama Lengkap'}
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusName(true)}
                onBlur={() => setFocusName(false)}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome name="user" size={18} color={focusUser ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                style={[styles.input, focusUser && styles.inputFocused]}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                onFocus={() => setFocusUser(true)}
                onBlur={() => setFocusUser(false)}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome name="lock" size={18} color={focusPass ? '#EBCD5E' : '#9CA3AF'} />
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

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome name="check-circle" size={18} color={focusConfirm ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                style={[styles.input, focusConfirm && styles.inputFocused]}
                placeholder="Konfirmasi Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusConfirm(true)}
                onBlur={() => setFocusConfirm(false)}
              />
            </View>

            <TouchableOpacity 
                onPress={handleSignup} 
                activeOpacity={0.8} 
                style={[styles.buttonWrapper, (!selectedRole || isLoading) && styles.btnDisabled]}
                disabled={!selectedRole || isLoading}
            >
              <LinearGradient
                colors={['#FBC02D', '#E0C048']}
                style={styles.mainButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1F1F1F" />
                ) : (
                  <Text style={styles.buttonText}>Daftar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>atau</Text>
            <View style={styles.line} />
          </View>
            
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#4B5563" />
            ) : (
              <>
                <Image 
                  source={{ uri: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png' }} 
                  style={styles.googleIcon} 
                />
                <Text style={styles.googleText}>Daftar dengan Google</Text>
              </>
            )}
          </TouchableOpacity>
            
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Masuk disini</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: '65%', zIndex: 0 },
  gradientHeader: { flex: 1, justifyContent: 'flex-end' },
  svgCurve: { marginBottom: -1 },
  fixedLogoContainer: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' },
  logo: { width: 144, height: 144 },
  scrollView: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingTop: 220, paddingBottom: 40, paddingHorizontal: 20 },
  card: { backgroundColor: 'white', width: '100%', maxWidth: 450, borderRadius: 30, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F1F1F', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 24 },
  formContainer: { width: '100%', gap: 16 },
  roleLabel: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 },
  roleWrapper: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 4, borderRadius: 12, gap: 12, marginBottom: 8 },
  roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  roleBtnActive: { backgroundColor: '#3A5F50', elevation: 2 },
  roleText: { fontWeight: '600', fontSize: 14, color: '#6B7280' },
  roleTextActive: { color: 'white' },
  inputGroup: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, paddingLeft: 44, fontSize: 14, color: '#374151', fontWeight: '500' },
  inputFocused: { borderColor: '#EBCD5E', borderWidth: 2 },
  buttonWrapper: { marginTop: 8, alignSelf: 'center', elevation: 5, borderRadius: 9999 },
  btnDisabled: { opacity: 0.6 },
  mainButton: { width: 160, paddingVertical: 12, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#111827', fontWeight: 'bold', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 24, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12, borderRadius: 12, gap: 12 },
  googleIcon: { width: 20, height: 20 },
  googleText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
  footerContainer: { marginTop: 32, flexDirection: 'row' },
  footerText: { fontSize: 14, color: '#6B7280' },
  linkText: { fontSize: 14, color: '#E0C048', fontWeight: 'bold' },
});