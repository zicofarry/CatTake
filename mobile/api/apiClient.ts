import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Ambil langsung dari .env
// EXPO_PUBLIC_API_URL = http://192.168.1.xx:3000/api/v1
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const resolveImageUrl = (path: string | null, type: 'profile' | 'cat' | 'qr' | 'legal' | 'lost' | 'post' = 'profile') => {
  if (!path || path === 'NULL' || path === 'null' || path === 'NULL.JPG' || path === 'NULL.png' || path === 'Ellipse.png') {
    return null;
  }

  // JIKA SUDAH URL CLOUDINARY (dimulai http), LANGSUNG KEMBALIKAN
  if (path.startsWith('http')) {
    return path;
  }

  // JIKA MASIH DATA LOKAL LAMA (hanya nama file), TAMBAHKAN PREFIX SERVER
  const baseUrl = API_BASE_URL?.replace('/api/v1', '') || '';
  const folderMap = {
    profile: '/public/img/profile/',
    cat: '/public/img/cats/',
    qr: '/public/img/qr_img/',
    legal: '/public/docs/legal/',
    lost: '/public/img/lost_cat/',
    post: '/public/img/post/'
  };

  // Bersihkan path jika ada sisa-sisa prefix lama yang tersimpan di DB
  const cleanPath = path.replace(/^\/public\/img\/(profile|cats|qr_img|lost_cat|post)\//, '');
  
  return `${baseUrl}${folderMap[type]}${cleanPath}`;
};

// 2. Buat instance axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor Request (untuk Token)
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;