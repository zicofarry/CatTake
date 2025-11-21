<template>
  <div class="min-h-screen w-full relative flex flex-col items-center justify-center bg-gray-100 font-sans overflow-x-hidden py-20">
    
    <div class="absolute top-0 left-0 w-full h-[85vh] z-0">
        <div class="bg-gradient-to-tr from-[#3A5F50] to-[#578d76] w-full h-full relative">
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
            <img src="@/assets/img/catTakePutih.png" alt="CatTake Logo" class="w-36 md:w-44 drop-shadow-lg mx-auto">
        </div>

        <div class="bg-white w-full max-w-[450px] p-8 md:p-10 rounded-[30px] shadow-2xl text-center">
            
            <h2 class="text-3xl font-bold text-[#1F1F1F] mb-2">Sign Up</h2>
            <p class="text-gray-400 mb-6 text-sm">Create your account today</p>
            
            <form @submit.prevent="handleSignup" class="space-y-4 text-left">
                
                <div>
                    <label class="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide text-center">Daftar Sebagai:</label>
                    <div class="flex justify-between gap-3 bg-gray-100 p-1 rounded-xl">
                        <button 
                            type="button"
                            @click="selectedRole = 'user'"
                            :class="{ 
                                'bg-[#3A5F50] text-white shadow-md': selectedRole === 'user',
                                'text-gray-500 hover:bg-gray-200': selectedRole !== 'user'
                            }"
                            class="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                        >
                            User Biasa
                        </button>
                        <button 
                            type="button"
                            @click="selectedRole = 'shelter'"
                            :class="{ 
                                'bg-[#3A5F50] text-white shadow-md': selectedRole === 'shelter',
                                'text-gray-500 hover:bg-gray-200': selectedRole !== 'shelter'
                            }"
                            class="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                        >
                            Shelter
                        </button>
                    </div>
                </div>

                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-envelope text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="email" 
                        v-model="signupEmail" 
                        placeholder="Email Address" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>

                <div class="relative group" v-if="selectedRole === 'shelter'">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-home text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="text" 
                        v-model="shelterName" 
                        placeholder="Nama Resmi Shelter (Wajib)" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>

                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-id-card text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="text" 
                        v-model="fullName" 
                        :placeholder="selectedRole === 'shelter' ? 'Nama Penanggung Jawab' : 'Nama Lengkap'" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>

                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-user text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="text" 
                        v-model="signupUsername" 
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
                        v-model="signupPassword" 
                        placeholder="Password" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>

                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fas fa-check-circle text-gray-400 group-focus-within:text-[#EBCD5E] transition-colors"></i>
                    </div>
                    <input 
                        type="password" 
                        v-model="confirmPassword" 
                        placeholder="Konfirmasi Password" 
                        required
                        class="w-full py-3.5 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EBCD5E] focus:border-transparent transition-all text-sm font-medium shadow-sm"
                    >
                </div>
                
                <div class="pt-2">
                    <button 
                        type="submit" 
                        :disabled="!selectedRole || isLoading"
                        class="w-40 mx-auto block py-3 rounded-full text-gray-900 font-bold text-base shadow-[0_4px_14px_rgba(235,205,94,0.5)] transition-all duration-300"
                        :class="{
                            'hover:shadow-[0_6px_20px_rgba(235,205,94,0.6)] hover:-translate-y-0.5 active:scale-95': selectedRole && !isLoading,
                            'opacity-60 cursor-not-allowed grayscale': !selectedRole || isLoading
                        }"
                        style="background: linear-gradient(180deg, #FBC02D 0%, #E0C048 100%);"
                    >
                        <span v-if="!isLoading">Sign Up</span>
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
                Sign Up with Google
            </button>
            
            <div class="mt-8 text-sm text-gray-500">
                Already have an account? 
                <router-link to="/login" class="text-[#E0C048] hover:text-[#c9aa38] font-bold no-underline transition-colors">
                    Login
                </router-link>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 
import apiClient from '@/api/http';

const router = useRouter(); 
const fullName = ref('');
const signupUsername = ref('');
const signupPassword = ref('');
const confirmPassword = ref('');
const selectedRole = ref(null); 
const signupEmail = ref(''); 
const shelterName = ref(''); 
const isLoading = ref(false); 

async function handleSignup() {
  if (signupPassword.value !== confirmPassword.value) {
    alert('Password dan Konfirmasi Password harus sama!');
    return;
  }
  if (!selectedRole.value) {
    alert('Mohon pilih jenis akun (User Biasa atau Shelter)!');
    return;
  }
  
  if (selectedRole.value === 'shelter' && !shelterName.value) {
    alert('Nama Resmi Shelter wajib diisi.');
    return;
  }

  isLoading.value = true;

  const data = {
    username: signupUsername.value,
    password: signupPassword.value,
    email: signupEmail.value,
    role: selectedRole.value === 'user' ? 'individu' : 'shelter',
    full_name: fullName.value,
    contact_phone: '', 
  };

  if (data.role === 'individu') {
    data.address = null;
    data.nik = null; 
    data.job = null;
    data.gender = null; 
    data.birth_date = null; 
    
  } else if (data.role === 'shelter') {
    data.shelter_name = shelterName.value;
    data.pj_name = fullName.value; 
    data.pj_nik = null; 
    data.organization_type = 'Komunitas'; 
  }

  try {
    await apiClient.post('/auth/register', data);
    
    alert(`Pendaftaran ${selectedRole.value} berhasil! Silakan Login.`);
    router.push('/login');
    
  } catch (error) {
    if (error.response?.status === 409) {
        alert('Gagal: Email/Username/NIK sudah terdaftar.');
    } else {
        const errorMessage = error.response?.data?.error || 'Pendaftaran gagal. Server error.';
        alert(errorMessage);
    }
    console.error('Registration error:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Full Tailwind */
</style>