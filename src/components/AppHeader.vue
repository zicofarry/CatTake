<template>
  <header class="py-4 bg-white shadow-sm sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      
      <!-- LOGO -->
      <div class="flex items-center font-bold text-xl">
        <router-link to="/">
            <!-- Menggunakan Logo yang tampak di Figma -->
            <img src="/assets/img/cattake.png" alt="CatTake Logo" class="h-10 md:h-[70px]">
        </router-link>
      </div>

      <!-- NAVIGASI DESKTOP -->
      <nav class="hidden md:flex bg-green-700 rounded-full p-2 shadow-lg">
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
      
      <!-- USER/LOGIN DESKTOP -->
      <div class="hidden md:block">
        <!-- AFTER LOGIN (DIANA) -->
        <div v-if="isLoggedIn" class="relative">
            <button 
                @click="toggleProfileDropdown"
                class="flex items-center gap-2 bg-green-700 text-white py-1.5 pr-2 pl-1 rounded-full font-semibold cursor-pointer shadow-lg hover:bg-green-800 transition duration-200"
            >
                <img src="/assets/img/diana.png" alt="Avatar Diana" class="h-9 w-9 rounded-full object-cover">
                <span>Diana</span>
            </button>

            <!-- DROPDOWN PROFIL (Pop-up) -->
            <div v-if="isProfileDropdownOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl p-4 z-40">
                <p class="font-bold text-gray-800">{{ userName }}</p>
                <p class="text-sm text-gray-500 mb-4">{{ userEmail }}</p>

                <button class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition duration-200 mb-2">Edit Profile</button>
                <button @click="handleSignOut" class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200">Sign Out</button>
            </div>
        </div>

        <!-- BEFORE LOGIN -->
        <router-link v-else to="/login" class="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-full transition duration-200 shadow-lg">
            Signup/Login
        </router-link>
      </div>


      <!-- USER/MENU MOBILE (Hamburger & Title) -->
      <div class="flex items-center gap-4 md:hidden">
          <span class="font-semibold text-xl">{{ activePage }}</span>
          
          <!-- Hamburger Icon -->
          <button class="flex flex-col gap-1.5 cursor-pointer p-2" @click="toggleMobileMenu">
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
          </button>
      </div>
    </div>
  </header>

  <!-- MOBILE SIDEBAR (Floating/Drawer Menu) -->
  <div v-if="isMobileMenuOpen" @click="toggleMobileMenu" class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"></div>
  <nav 
      :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full']"
      class="fixed top-0 left-0 h-full w-64 bg-green-800 shadow-2xl z-50 transition-transform duration-300 flex flex-col pt-4"
      style="background: linear-gradient(180deg, #638870 0%, #2D5B4D 100%);"
  >
      <div class="p-4 mb-4 text-white text-2xl font-bold border-b border-green-900">MENU</div>
      
      <!-- Profil Mobile -->
      <div v-if="isLoggedIn" class="flex items-center gap-3 bg-green-700 text-white py-2 px-4 rounded-full font-semibold mx-4 mb-4 shadow-lg">
          <img src="/assets/img/diana.png" alt="Avatar Diana" class="h-9 w-9 rounded-full object-cover">
          <span>Diana</span>
      </div>
      <router-link v-else to="/login" class="text-center bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold py-2 px-6 rounded-full transition duration-200 mx-4 mb-4 shadow-lg">
          Signup/Login
      </router-link>

      <!-- Mobile Links -->
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
  </nav>

</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router'; 

// --- Config / Mock Data ---
const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Lapor', path: '/lapor' },
    { name: 'Adopsi', path: '/adopsi' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Komunitas', path: '/komunitas' },
    { name: 'Donasi', path: '/donasi' },
];

const userName = ref('Diana');
const userEmail = ref('dianacantik@gmail.com');

// 1. STATE (Data Reaktif)
const route = useRoute();
const isMobileMenuOpen = ref(false);
const isLoggedIn = ref(true); // Ganti ke false untuk simulasi Before Login
const isProfileDropdownOpen = ref(false);

// 2. COMPUTED PROPERTY (Menentukan halaman aktif)
const activePage = computed(() => {
  const currentLink = navLinks.find(link => link.path === route.path);
  return currentLink ? currentLink.name : 'CatTake';
});

// 3. METHODS (Fungsi)
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function toggleProfileDropdown() {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
}

function handleSignOut() {
    isLoggedIn.value = false;
    isProfileDropdownOpen.value = false;
    alert('Anda telah keluar.');
}
</script>

<style scoped>
/* Hapus semua CSS lama, kecuali jika ada ::before/::after yang kompleks */
/* Gunakan warna kustom jika tidak tersedia di palet default Tailwind: */
/* Misalnya, #638870 (Green-700), #2D5B4D (Green-800), #FBC02D (Yellow-500) */
/* Saya menggunakan green-700, green-800, dan yellow-500 sebagai pendekatan terdekat */
</style>