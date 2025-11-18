import axios from 'axios';

// Ambil URL API dari environment variable
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Buat instance Axios
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Jika Anda menjalankan server Vue dan Fastify di host berbeda, 
    // ini diperlukan agar browser mengirim cookie dan header Auth.
    withCredentials: true, 
});

// 2. Interceptor: Otomatis tambahkan JWT pada setiap request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            // Mengatur header Authorization: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Interceptor Respons (Opsional: Logout jika Token Expired/401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Jika backend mengembalikan 401 (Unauthorized/Token Expired),
            // Hapus token dan arahkan ke halaman login.
            localStorage.removeItem('userToken');
            // window.location.href = '/login'; // Sesuaikan dengan route login Anda
        }
        return Promise.reject(error);
    }
);

export default apiClient;
