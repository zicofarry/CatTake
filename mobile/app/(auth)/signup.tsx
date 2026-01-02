import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api'; 

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

  const handleSignup = async () => {
    // ... logic validasi sama ...
    if (password !== confirmPassword) {
      Alert.alert('Gagal', 'Password dan Konfirmasi Password harus sama!');
      return;
    }
    if (!selectedRole) {
      Alert.alert('Gagal', 'Mohon pilih jenis akun (User Biasa atau Shelter)!');
      return;
    }
    if (selectedRole === 'shelter' && !shelterName) {
      Alert.alert('Gagal', 'Nama Resmi Shelter wajib diisi.');
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
      await axios.post(`${API_URL}/auth/register`, data);
      Alert.alert(
        'Sukses', 
        `Pendaftaran ${selectedRole} berhasil! Silakan Login.`,
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error: any) {
      if (error.response?.status === 409) {
          Alert.alert('Gagal', 'Email/Username sudah terdaftar.');
      } else {
          Alert.alert('Error', error.response?.data?.error || 'Server Error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Background */}
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

      {/* 2. Logo Fixed (Di Belakang Scroll) */}
      <View style={styles.fixedLogoContainer}>
        <Image 
            source={require('../../../frontend/src/assets/img/catTakePutih.png')} 
            style={styles.logo}
            resizeMode="contain"
        />
      </View>

      {/* 3. ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Create your account today</Text>

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

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome name="envelope" size={16} color={focusEmail ? '#EBCD5E' : '#9CA3AF'} />
              </View>
              <TextInput
                style={[styles.input, focusEmail && styles.inputFocused]}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
              />
            </View>

            {/* Shelter Name */}
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

            {/* Full Name */}
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

            {/* Username */}
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

            {/* Password */}
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

            {/* Confirm Password */}
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
                  <Text style={styles.buttonText}>Sign Up</Text>
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
              source={{ uri: 'https://www.svgrepo.com/show/475656/google-color.svg' }} 
              style={styles.googleIcon} 
            />
            <Text style={styles.googleText}>Sign Up with Google</Text>
          </TouchableOpacity>
            
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
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
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    // Tanpa zIndex
  },
  logo: {
    width: 144,
    height: 144,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 220, // Jarak dari atas
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 450,
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
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  roleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleBtnActive: {
    backgroundColor: '#3A5F50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#6B7280',
  },
  roleTextActive: {
    color: 'white',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 44,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  // Style Focus
  inputFocused: {
    borderColor: '#EBCD5E',
    borderWidth: 2,
  },
  buttonWrapper: {
    marginTop: 8,
    alignSelf: 'center',
    shadowColor: '#EBCD5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 5,
    borderRadius: 9999,
  },
  btnDisabled: {
    opacity: 0.6,
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