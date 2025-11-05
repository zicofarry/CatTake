<template>
  <header class="py-4 bg-white shadow-sm sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <div class="flex items-center font-bold text-xl">
        <router-link to="/">
            <img src="/assets/img/cattake.png" alt="CatTake Logo" class="h-8 md:h-[70px]">
        </router-link>
      </div>

      <nav class="hidden md:flex bg-green-600 rounded-full p-2">
        <ul class="flex list-none gap-6 items-center px-4 m-0">
          <li><router-link to="/" class="text-white hover:text-yellow-400 transition-colors p-1.5 rounded-xl" :class="{ 'text-yellow-400 font-semibold': activePage === 'Beranda' }">Beranda</router-link></li>
          <li><router-link to="/lapor" class="text-white hover:text-yellow-400 transition-colors p-1.5 rounded-xl" :class="{ 'text-yellow-400 font-semibold': activePage === 'Lapor' }">Lapor</router-link></li>
          <li><router-link to="/adopsi" class="text-white hover:text-yellow-400 transition-colors p-1.5 rounded-xl" :class="{ 'text-yellow-400 font-semibold': activePage === 'Adopsi' }">Adopsi</router-link></li>
          <li><router-link to="/faq" class="text-white hover:text-yellow-400 transition-colors p-1.5 rounded-xl" :class="{ 'text-yellow-400 font-semibold': activePage === 'FAQ' }">FAQ</router-link></li>
          <li><router-link to="/komunitas" class="text-white hover:text-yellow-400 transition-colors p-1.5 rounded-xl" :class="{ 'text-yellow-400 font-semibold': activePage === 'Komunitas' }">Komunitas</router-link></li>
          <li><router-link to="/donasi" class="text-white hover:text-yellow-400 transition-colors p-1.5 rounded-xl" :class="{ 'text-yellow-400 font-semibold': activePage === 'Donasi' }">Donasi</router-link></li>
        </ul>
      </nav>
      
      <div class="flex items-center gap-4 md:hidden">
          <span class="font-semibold text-xl">{{ activePage }}</span>
          <div class="flex flex-col gap-1.5 cursor-pointer" @click="toggleMobileMenu">
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm"></span>
          </div>
      </div>

      <div v-if="isLoggedIn" class="hidden md:flex items-center gap-3 bg-green-600 text-white py-1.5 px-3 rounded-full font-semibold">
          <img src="/assets/img/diana.png" alt="Avatar Diana" class="h-9 w-9 rounded-full object-cover">
          <span>Diana</span>
      </div>
      <router-link v-else to="/login" class="hidden md:block bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold py-2 px-4 rounded-full transition duration-200">Signup/Login</router-link>
    </div>
  </header>
  </template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router'; 

// 1. STATE (Data Reaktif)
const route = useRoute();
const isMobileMenuOpen = ref(false);
const isLoggedIn = ref(true); 

// 2. COMPUTED PROPERTY 
const activePage = computed(() => {
  switch (route.path) {
    case '/': return 'Beranda';
    case '/lapor': return 'Lapor';
    case '/adopsi': return 'Adopsi';
    case '/faq': return 'FAQ';
    case '/donasi': return 'Donasi';
    case '/komunitas': return 'Komunitas';
    default: return 'CatTake';
  }
});

// 3. METHODS 
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  // TODO: Tambahkan logika untuk menampilkan/menyembunyikan sidebar mobile
}
</script>   