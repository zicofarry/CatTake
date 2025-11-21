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
            <img src="@/assets/img/catTakePutih.png" alt="CatTake Logo" class="w-36 md:w-44 drop-shadow-lg mx-auto">
        </div>

        <div class="login-box bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center relative z-30">
      
          <h2 class="mt-0 text-3xl font-bold text-gray-800">Sign Up</h2>
          <p class="text-gray-500 mb-8">Please enter your details</p>
          
          <form @submit.prevent="handleSignup">
            
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">Daftar Sebagai:</h3>
                <div class="flex justify-between gap-3">
                    <button 
                        type="button"
                        @click="selectedRole = 'user'"
                        :class="{ 
                            'bg-green-700 text-white shadow-md': selectedRole === 'user',
                            'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200': selectedRole !== 'user'
                        }"
                        class="flex-1 py-2 rounded-xl font-semibold transition duration-200"
                    >
                        User Biasa
                    </button>
                    <button 
                        type="button"
                        @click="selectedRole = 'shelter'"
                        :class="{ 
                            'bg-green-700 text-white shadow-md': selectedRole === 'shelter',
                            'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200': selectedRole !== 'shelter'
                        }"
                        class="flex-1 py-2 rounded-xl font-semibold transition duration-200"
                    >
                        Shelter
                    </button>
                </div>
            </div>

            <div class="relative mb-5">
              <input type="email" v-model="signupEmail" placeholder="Email" required
                    class="w-full py-3 px-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
            </div>

            <div class="relative mb-5" v-if="selectedRole === 'shelter'">
              <input type="text" v-model="shelterName" placeholder="Nama Resmi Shelter (Wajib)" required
                    class="w-full py-3 px-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
            </div>
            <div class="relative mb-5">
              <input type="text" v-model="fullName" :placeholder="selectedRole === 'shelter' ? 'Nama Lengkap Penanggung Jawab' : 'Nama Lengkap'" required
                     class="w-full py-3 px-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
            </div>
            <div class="relative mb-5">
              <input type="text" v-model="signupUsername" placeholder="Username" required
                     class="w-full py-3 px-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
            </div>
            <div class="relative mb-5">
              <input type="password" v-model="signupPassword" placeholder="Password" required
                     class="w-full py-3 px-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
            </div>
            <div class="relative mb-5">
              <input type="password" v-model="confirmPassword" placeholder="Konfirmasi Password" required
                     class="w-full py-3 px-4 border border-gray-200 rounded-xl font-sans text-base shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
            </div>
            
            <button type="submit" 
              :disabled="!selectedRole"
              class="inline-block w-40 py-3 bg-yellow-500 border-none rounded-full text-gray-800 mt-5 font-bold cursor-pointer shadow-lg transition duration-300"
              :class="{ 
                  'hover:bg-yellow-600 opacity-100': selectedRole,
                  'opacity-50 cursor-not-allowed': !selectedRole 
              }"
              style="background: linear-gradient(180deg, #FBC02D 0%, #E0C048 100%); box-shadow: 0 4px 10px rgba(251, 192, 45, 0.4);"
            >
              Sign Up
            </button>
          </form>
          
          <div class="flex items-center text-center text-gray-400 my-6">
            <div class="flex-grow border-b border-gray-300 mx-2"></div>
            <span class="text-sm">or</span>
            <div class="flex-grow border-b border-gray-300 mx-2"></div>
          </div>
          
          <button class="w-full bg-white text-gray-700 border border-gray-300 flex justify-center items-center gap-2 py-3 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 shadow-sm">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" class="w-5 h-5">
            Sign Up with Google
          </button>
          
          <div class="mt-6 text-sm text-gray-600">
            <p>Already have an account? 
              <router-link to="/login" class="text-amber-500 hover:text-amber-600 font-semibold no-underline">Login</router-link>
            </p>
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