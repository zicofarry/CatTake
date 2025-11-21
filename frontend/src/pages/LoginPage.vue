<template>
  <div class="min-h-screen w-full relative flex flex-col items-center justify-center bg-gray-100 font-sans overflow-x-hidden py-20">
    
    <div class="absolute top-0 left-0 w-full h-[85vh] z-0">
        <div class="bg-gradient-to-tr from-[#3A5F50] to-[#4A6C55] w-full h-full relative">
            <svg 
                class="absolute -bottom-[1px] left-0 w-full h-auto block" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
            >
                <path 
                    fill="#f3f4f6" 
                    fill-opacity="1" 
                    d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,197.3C672,171,768,117,864,112C960,107,1056,149,1152,165.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
            </svg>
        </div>
    </div>

    <div class="relative z-10 w-full px-6 flex flex-col items-center gap-8">
        
        <div class="mb-2">
            <img :src="logoUrl" alt="CatTake Logo" class="w-36 md:w-44 drop-shadow-lg mx-auto">
        </div>

        <div class="bg-white w-full max-w-[420px] p-8 md:p-10 rounded-[30px] shadow-2xl text-center">
            
            <h2 class="text-3xl font-bold text-[#1F1F1F] mb-2">Login</h2>
            <p class="text-gray-400 mb-8 text-sm">Please enter your details</p>
            
            <form @submit.prevent="handleLogin" class="space-y-5 text-left">
                
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-user text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="text" 
                        v-model="identifier" 
                        placeholder="Username" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>

                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-lock text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="password" 
                        v-model="password" 
                        placeholder="Password" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>
                
                <div class="pt-4">
                    <button 
                        type="submit" 
                        class="w-40 mx-auto block py-3 rounded-full text-gray-900 font-bold text-base shadow-[0_4px_14px_rgba(235,205,94,0.5)] hover:shadow-[0_6px_20px_rgba(235,205,94,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                        style="background: linear-gradient(180deg, #FBC02D 0%, #E0C048 100%);"
                    >
                        <span v-if="!isLoading">Login</span>
                        <span v-else>Loading...</span>
                    </button>
                </div>

            </form>
            
            <div class="flex items-center justify-center my-6 gap-3">
                <div class="h-px bg-gray-200 flex-grow"></div>
                <span class="text-gray-400 text-sm font-medium">or</span>
                <div class="h-px bg-gray-200 flex-grow"></div>
            </div>
            
            <button class="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-5 h-5">
                Sign In with Google
            </button>
            
            <div class="mt-8 text-sm text-gray-500">
                Don't have an account? 
                <router-link to="/signup" class="text-[#E0C048] hover:text-[#c9aa38] font-bold no-underline transition-colors">
                    Sign Up
                </router-link>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router'; 
import apiClient from '@/api/http';

import logoCatTake from '@/assets/img/catTakePutih.png';
const logoUrl = logoCatTake;

const router = useRouter(); 
const emit = defineEmits(['user-logged-in']); 

const identifier = ref('');
const password = ref('');
const isLoading = ref(false);

async function handleLogin() {
  if (!identifier.value || !password.value) {
      alert('Mohon isi Email/Username dan Password.');
      return;
  }

  isLoading.value = true;

  try {
      const response = await apiClient.post('/auth/login', {
          identifier: identifier.value,
          password: password.value,
      });

      const { token, role } = response.data.data;

      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', role);
      
      emit('user-logged-in', role); 
      router.push('/'); 
      
  } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login gagal. Cek kredensial atau server.';
      alert(errorMessage);
      console.error("Login Error:", error);
  } finally {
      isLoading.value = false;
  }
}
</script>

<style scoped>
/* Tailwind style */
</style>