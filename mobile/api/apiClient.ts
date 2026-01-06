import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Ambil langsung dari .env
// EXPO_PUBLIC_API_URL = http://192.168.1.xx:3000/api/v1
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const resolveImageUrl = (path: string | null) => {
  if (
    !path || 
    path === 'NULL' || 
    path === 'null' || 
    path === 'NULL.png' || 
    path === 'Ellipse.png' || 
    path === 'NULL.JPG'
  ) {
    return null;
  }

  // Jika sudah URL Cloudinary (dimulai http), langsung kembalikan
  if (path.startsWith('http')) {
    return path;
  }

  // Karena sudah tidak ada foto di direktori lokal server, 
  // path yang tidak diawali http dianggap tidak valid/kosong.
  return null;
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