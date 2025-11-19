<template>
  <header class="py-4 bg-white shadow-sm sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      
      <div class="flex items-center font-bold text-xl">
        <router-link to="/">
            <img src="../assets/img/cattake.png" alt="CatTake Logo" class="h-10 md:h-[70px]">
        </router-link>
      </div>

      <nav class="hidden md:flex bg-[#578d76] rounded-full p-2 shadow-lg">
        <ul class="flex list-none gap-4 items-center px-2 m-0 p-0">
          <li v-for="link in navLinks" :key="link.name">
            <router-link 
              :to="link.path" 
              class="text-white hover:text-yellow-400 transition-colors p-1.5 px-3 rounded-full text-base no-underline" 
              :class="{ 'text-yellow-400 font-semibold': activePage === link.name }"
            >
              {{ link.name }}
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="hidden md:block">
        <div v-if="props.userRole === 'shelter'" class="relative">
             <button 
                @click="toggleProfileDropdown"
                class="flex items-center gap-2 bg-[#578d76] text-white py-2 px-4 rounded-full font-semibold cursor-pointer shadow-lg hover:bg-green-800 transition duration-200"
            >
                <span>{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
            </button>
            <div v-if="isProfileDropdownOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl p-4 z-40 text-left">
                <p class="font-bold text-gray-800">{{ props.profileData ? props.profileData.name : 'Shelter Profil' }}</p>
                <p class="text-sm text-gray-500 mb-4">{{ props.profileData ? props.profileData.email : 'email@cattake.com' }}</p>

                <button @click="handleSignOut" class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200">Sign Out</button>
            </div>
        </div>

        <div v-else-if="props.userRole === 'individu'" class="relative">
            <button 
                @click="toggleProfileDropdown"
                class="flex items-center gap-2 bg-[#578d76] text-white py-1.5 pr-8 pl-2 rounded-full font-semibold cursor-pointer shadow-lg hover:bg-green-800 transition duration-200"
            >
                <img :src="props.profileData && props.profileData.photo ? props.profileData.photo : '../assets/img/diana.png'" alt="Avatar" class="h-9 w-9 rounded-full object-cover">
                <span>{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
            </button>

            <div v-if="isProfileDropdownOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl p-4 z-40">
                <p class="font-bold text-gray-800">{{ props.profileData ? props.profileData.name : 'User Profil' }}</p>
                <p class="text-sm text-gray-500 mb-4">{{ props.profileData ? props.profileData.email : 'email@user.com' }}</p>

                <router-link to="/profile" class="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition duration-200 mb-2 no-underline">Edit Profile</router-link>
                <button @click="handleSignOut" class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200">Sign Out</button>
            </div>
        </div>

        <router-link v-else to="/login" class="bg-[#578d76] hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-full transition duration-200 shadow-lg">
            Signup/Login
        </router-link>
      </div>


      <div class="flex items-center gap-4 md:hidden">
        <div v-if="props.userRole === 'individu'" class="flex items-center gap-2 bg-[#578d76] text-white py-1 pr-2 pl-1 rounded-full font-semibold">
          <img :src="props.profileData && props.profileData.photo ? props.profileData.photo : '../assets/img/diana.png'" alt="Avatar" class="h-8 w-8 rounded-full object-cover">
          <span>{{ props.profileData ? props.profileData.name : 'User' }}</span>
          </div>
          <div v-else-if="props.userRole === 'shelter'" class="flex items-center gap-2 bg-[#578d76] text-white py-1.5 px-3 rounded-full font-semibold text-sm">
              <span>{{ props.profileData ? props.profileData.name : 'Shelter' }}</span>
          </div>
          <router-link v-else to="/login" class="bg-[#578d76] hover:bg-green-800 text-white font-semibold py-1.5 px-4 rounded-full transition duration-200 shadow-md">
            Login
          </router-link>

          <span class="font-semibold text-xl flex-grow">{{ activePage }}</span>
          
          <button class="flex flex-col gap-1.5 cursor-pointer p-2" @click="toggleMobileMenu">
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
          </button>
      </div>
    </div>
  </header>

  <div v-if="isMobileMenuOpen" @click="toggleMobileMenu" class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"></div>
  <nav 
      :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full']"
      class="fixed top-0 left-0 h-full w-64 shadow-2xl z-50 transition-transform duration-300 flex flex-col pt-4"
      style="background: linear-gradient(180deg, #638870 0%, #2D5B4D 100%);"
  >
      <div class="p-4 mb-4 text-white text-2xl font-bold border-b border-green-900">MENU</div>
      
      <router-link to="/profile" v-if="props.userRole === 'individu'">
          <div class="flex items-center gap-3 bg-[#578d76] text-white py-2 px-4 rounded-full font-semibold mx-4 mb-4 shadow-lg">
              <img :src="props.profileData && props.profileData.photo ? props.profileData.photo : '../assets/img/diana.png'" alt="Avatar Diana" class="h-9 w-9 rounded-full object-cover">
              <span>{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
          </div>
      </router-link>
       <div v-else-if="props.userRole === 'shelter'" class="flex items-center gap-3 bg-[#578d76] text-white py-2 px-4 rounded-full font-semibold mx-4 mb-4 shadow-lg">
          <span>{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
      </div>

      <ul class="flex flex-col list-none p-0 m-0">
          <li v-for="link in navLinks" :key="link.name">
            <router-link 
              :to="link.path" 
              @click="toggleMobileMenu"
              class="block text-white text-lg font-medium py-3 px-4 border-b border-green-900 no-underline hover:bg-green-700 transition duration-200" 
              :class="{ 'text-yellow-400 font-semibold': activePage === link.name }"
            >
              {{ link.name }}
            </router-link>
          </li>
      </ul>
      
      <button v-if="props.userRole !== 'guest'" @click="handleSignOut" class="mt-auto mx-4 mb-4 p-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200">
        Sign Out
      </button>

      <router-link v-else to="/login" @click="toggleMobileMenu" class="mt-auto text-center bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold py-3 px-6 rounded-full transition duration-200 mx-4 mb-4 shadow-lg">
          Signup/Login
      </router-link>
  </nav>

</template>

<script setup>
import { ref, computed,watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router'; 



// Props dari App.vue (menerima status dan peran)
const props = defineProps({
    userRole: { type: String, default: 'guest' },
    profileData: { type: Object, default: () => null }
});

// Emits ke App.vue (untuk mengirim status logout)
const emit = defineEmits(['update-login-status']);

// --- Config / Mock Data ---
const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Lapor', path: '/lapor' },
    { name: 'Adopsi', path: '/adopsi' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Komunitas', path: '/komunitas' },
    { name: 'Donasi', path: '/donasi' },
];


// 1. STATE (Data Reaktif)
const route = useRoute();
const isMobileMenuOpen = ref(false);
const isProfileDropdownOpen = ref(false);

// State login diambil dari prop
// const userRole = ref(props.userRole);

// watchEffect(() => {
//     userRole.value = props.userRole;
// });
watch(() => props.userRole, (newValue, oldValue) => {
    // DEBUGGING POINT 3: Cek kapan Header menerima nilai baru
    console.log(`DEBUG C: Header menerima userRole baru: ${oldValue} -> ${newValue}`);
}, { immediate: true }); // immediate: true agar running saat load

// 2. COMPUTED PROPERTY (Menentukan halaman aktif)
const activePage = computed(() => {
  const currentLink = navLinks.find(link => link.path === route.path);
  return currentLink ? currentLink.name : 'Beranda';
});

// 3. METHODS (Fungsi)
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function toggleProfileDropdown() {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
}


function handleSignOut() {
    // Kirim event ke App.vue untuk mengubah status login
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    emit('update-login-status', false);
    isProfileDropdownOpen.value = false;
    alert('Anda telah keluar.');
}
</script>

<style scoped>
/* Anda mungkin perlu menambahkan warna kustom ke tailwind.config.js jika warna di sini tidak akurat */
/* Contoh: #638870 (Green-700), #2D5B4D (Green-800), #FBC02D (Yellow-500) */
</style>