<template>
  <div class="auth-wrapper flex justify-center items-center min-h-screen bg-gray-100 relative p-5 z-20">
    <div class="login-box bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center relative z-30">
      
      <h2 class="mt-0 text-3xl font-bold text-gray-800">Login</h2>
      <p class="text-gray-500 mb-8">Please enter your details</p>
      
      <form @submit.prevent="handleLogin">
        <div class="relative mb-5">
          <i class="fas fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
          <input type="text" v-model="identifier" placeholder="Username / Email" required
                 class="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
        </div>
        <div class="relative mb-5">
          <i class="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"></i>
          <input type="password" v-model="password" placeholder="Password" required
                 class="w-full py-3 pl-10 pr-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
        </div>
        
        <button type="submit" 
          class="inline-block w-40 py-3 bg-yellow-500 hover:bg-yellow-600 border-none rounded-full text-gray-800 mt-5 font-bold cursor-pointer shadow-lg transition duration-300"
          style="background: linear-gradient(180deg, #FBC02D 0%, #E0C048 100%); box-shadow: 0 4px 10px rgba(251, 192, 45, 0.4);"
        >
          Login
        </button>
      </form>
      
      <div class="flex items-center text-center text-gray-400 my-6">
        <div class="flex-grow border-b border-gray-300 mx-2"></div>
        <span class="text-sm">or</span>
        <div class="flex-grow border-b border-gray-300 mx-2"></div>
      </div>
      
      <button class="w-full bg-white text-gray-700 border border-gray-300 flex justify-center items-center gap-2 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 shadow-sm">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" class="w-5 h-5">
        Sign In with Google
      </button>
      
      <div class="mt-6 text-sm text-gray-600">
        <p>Don't have an account? 
          <router-link to="/signup" class="text-amber-500 hover:text-amber-600 font-semibold no-underline">Sign Up</router-link>
        </p>
      </div>
    </div>

    <div class="absolute top-10 left-1/2 transform -translate-x-1/2 z-20 md:top-12">
        <img src="../assets/img/catTakePutih.png" alt="Logo CatTake" class="w-32 h-auto md:w-40">
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router'; 
import apiClient from '@/api/http';

const router = useRouter(); 
const emit = defineEmits(['user-logged-in']); // Event ke App.vue

const identifier = ref('');
const password = ref('');
const isLoading = ref(false);

async function handleLogin() {
  // console.log("Payload being sent:", {
  //       identifier: identifier.value,
  //       password: password.value
  //   });
  if (!identifier.value || !password.value) {
      alert('Mohon isi Email/Username dan Password.');
      return;
  }

  isLoading.value = true;

  try {
      // 1. Panggil API Login dengan identifier (email atau username)
      const response = await apiClient.post('/auth/login', {
          identifier: identifier.value,
          password: password.value,
      });

      // 2. Ambil data dari respons Fastify
      const { token, role } = response.data.data;

      // 3. Simpan Token & Role (Sangat Penting)
      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', role);
      
      // 4. Emit event dan Redirect ke halaman utama
      emit('user-logged-in', role); 
      router.push('/'); 
      
  } catch (error) {
      // Tangani error dari backend (misalnya 401 Unauthorized)
      const errorMessage = error.response?.data?.error || 'Login gagal. Cek kredensial atau server.';
      alert(errorMessage);
      console.error("Login Error:", error);
  } finally {
      isLoading.value = false;
  }
}
</script>

<style scoped>
/* Background Wave dari Figma */
.auth-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 65%;
    background: #4A6C55; /* Warna atas pada Figma */
    clip-path: ellipse(80% 60% at 50% 40%);
    z-index: 1; 
}
.auth-wrapper::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 65%;
    background: #E8EAE3; /* Warna bawah pada Figma */
    clip-path: ellipse(85% 60% at 50% 70%);
    z-index: 0;
}
</style>