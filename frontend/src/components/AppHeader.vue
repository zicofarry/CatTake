<template>
  <header 
    v-if="!isAuthPage"
    class="fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4"
    :class="headerClass"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      
      <div class="hidden md:flex items-center font-bold text-xl">
        <router-link :to="props.userRole === 'driver' ? '/driver/tasks' : '/'">
            <img 
              src="../assets/img/cattake.png" 
              alt="CatTake Logo" 
              class="h-10 md:h-[70px] object-contain drop-shadow-md transition-all duration-300" 
              :class="isScrolled ? 'scale-90' : 'scale-100'"
            >
        </router-link>
      </div>

      <nav 
        v-if="navLinks.length > 0" 
        class="hidden md:flex transition-all duration-300 rounded-full border border-transparent" 
        :class="isScrolled ? 'bg-black/20 p-1 border-white/10' : 'bg-transparent p-0'"
      >
        <ul class="flex list-none gap-1 items-center px-1 m-0 p-0">
          <li v-for="link in navLinks" :key="link.name">
            <router-link 
              :to="link.path" 
              class="px-5 py-2 rounded-full text-base no-underline font-medium transition-all duration-300 border border-transparent hover:bg-[#578d76]/80 hover:shadow-md hover:scale-105 hover:text-white" 
              :class="activePage === link.name 
                ? 'text-[#EBCD5E] font-extrabold' 
                : 'text-white'"
            >
              {{ link.name }}
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="hidden md:block">
        
        <div v-if="props.userRole === 'driver'" class="relative">
             <div v-if="isProfileDropdownOpen" @click="toggleProfileDropdown" class="fixed inset-0 z-30"></div>
             
             <button 
                @click="toggleProfileDropdown"
                class="flex items-center gap-2 bg-[#FF862F] text-white py-1.5 pr-6 pl-2 rounded-full font-semibold cursor-pointer shadow-lg hover:bg-[#e07528] transition duration-200 relative z-40"
            >
                <img 
                    :src="resolveImageUrl(props.profileData && props.profileData.photo ? props.profileData.photo : '/img/NULL.JPG')" 
                    alt="Driver" 
                    class="h-9 w-9 rounded-full object-cover border-2 border-white"
                >
                <span>{{ props.profileData ? props.profileData.name.split(' ')[0] : 'Driver' }}</span>            </button>
             <div v-if="isProfileDropdownOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl p-4 z-40 text-left border border-gray-100">
                <p class="font-bold text-gray-800">{{ props.profileData ? props.profileData.name : 'Driver Profil' }}</p>
                <p class="text-sm text-gray-500 mb-4">{{ props.profileData ? props.profileData.email : 'driver@cattake.com' }}</p>
                <button @click="handleSignOut" class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200">Sign Out</button>
            </div>
        </div>

        <div v-else-if="props.userRole === 'shelter'" class="relative">
             <div v-if="isProfileDropdownOpen" @click="toggleProfileDropdown" class="fixed inset-0 z-30"></div>
            
             <button 
                @click="toggleProfileDropdown"
                class="flex items-center gap-2 bg-[#578d76] text-white py-1.5 pr-6 pl-2 rounded-full font-semibold cursor-pointer shadow-lg hover:bg-green-800 transition duration-200 relative z-40"
            >
                <img 
                    :src="resolveImageUrl(props.profileData && props.profileData.photo ? props.profileData.photo : '/img/profile_default.svg')" 
                    alt="Shelter" 
                    class="h-9 w-9 rounded-full object-cover border-2 border-white"
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
            <div v-if="isProfileDropdownOpen" @click="toggleProfileDropdown" class="fixed inset-0 z-30"></div>
            
            <button 
                @click="toggleProfileDropdown"
                class="flex items-center gap-2 bg-[#578d76] text-white py-1.5 pr-8 pl-2 rounded-full font-semibold cursor-pointer shadow-lg hover:bg-green-800 transition duration-200 relative z-40"
            >
                <img :src="resolveImageUrl(props.profileData && props.profileData.photo ? props.profileData.photo : '../assets/img/diana.png')" alt="Avatar" class="h-9 w-9 rounded-full object-cover border-2 border-white">
                <span>{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
            </button>

            <div v-if="isProfileDropdownOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl p-4 z-40">
                <p class="font-bold text-gray-800">{{ props.profileData ? props.profileData.name : 'User Profil' }}</p>
                <p class="text-sm text-gray-500 mb-4">{{ props.profileData ? props.profileData.email : 'email@user.com' }}</p>

                <button @click="handleEditProfileClick" class="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition duration-200 mb-2">Edit Profile</button>
                <button @click="handleSignOut" class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200">Sign Out</button>
            </div>
        </div>

        <router-link v-else to="/login" class="bg-[#578d76] hover:bg-green-800 text-white font-semibold py-2 px-6 rounded-full transition duration-200 shadow-lg">
            Signup/Login
        </router-link>
      </div>


      <div class="flex items-center gap-4 md:hidden w-full">
          
          <button class="flex flex-col gap-1.5 cursor-pointer p-2" @click="toggleMobileMenu">
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm bg-white"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm bg-white"></span>
              <span class="block w-6 h-0.5 bg-gray-800 rounded-sm bg-white"></span>
          </button>

            <span class="font-semibold text-xl transition-colors text-white">
              {{ props.userRole === 'driver' ? 'Driver' : activePage }}
          </span>
          
          <router-link v-if="props.userRole === 'individu'" to="/profile" class="ml-auto flex items-center gap-2 bg-[#578d76] text-white py-1 pr-2 pl-1 rounded-full font-semibold">
            <img :src="resolveImageUrl(props.profileData && props.profileData.photo ? props.profileData.photo : '/img/NULL.JPG')" alt="Avatar" class="h-8 w-8 rounded-full object-cover">
            <span class="text-sm">{{ props.profileData ? props.profileData.name.split(' ')[0] : 'User' }}</span>
          </router-link>

          <div v-else-if="props.userRole === 'shelter'" class="ml-auto flex items-center gap-2 bg-[#578d76] text-white py-1.5 px-3 rounded-full font-semibold text-sm">
              <span>{{ props.profileData ? props.profileData.name : 'Shelter' }}</span>
          </div>

          <div v-else-if="props.userRole === 'driver'" class="ml-auto flex items-center gap-2 bg-[#FF862F] text-white py-1.5 px-3 rounded-full font-semibold text-sm">
              <span>Driver</span>
          </div>

          <router-link v-else to="/login" class="ml-auto bg-[#578d76] hover:bg-green-800 text-white font-semibold py-1.5 px-4 rounded-full transition duration-200 shadow-md text-sm">
            Login
          </router-link>

      </div>
    </div>
  </header>

  <div v-if="isMobileMenuOpen && !isAuthPage" @click="toggleMobileMenu" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300"></div>
  
  <nav 
      v-if="!isAuthPage"
      :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full']"
      class="fixed top-0 left-0 h-full w-72 shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-50 transition-transform duration-300 flex flex-col pt-6 backdrop-blur-2xl bg-[#1d3b31]/80 border-r border-white/20"
  >
      <div class="px-6 mb-6 flex justify-between items-center border-b border-white/10 pb-4">
          <span class="text-white text-2xl font-extrabold tracking-wider drop-shadow-md">MENU</span>
          <button @click="toggleMobileMenu" class="text-white/70 hover:text-white transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
      </div>
      
      <div class="px-4 mb-8">
        <div v-if="props.userRole === 'driver'" class="flex items-center gap-3 bg-[#FF862F] text-white py-3 px-4 rounded-xl font-semibold shadow-lg">
             <i class="fas fa-shipping-fast"></i> <span>Driver Panel</span>
        </div>
        
        <router-link to="/profile" v-else-if="props.userRole === 'individu'" @click="toggleMobileMenu">
            <div class="flex items-center gap-3 bg-black/20 border border-white/10 text-white py-3 px-4 rounded-xl font-semibold shadow-inner hover:bg-black/30 transition-all">
                <img :src="resolveImageUrl(props.profileData && props.profileData.photo ? props.profileData.photo : '/img/NULL.JPG')" alt="Avatar" class="h-10 w-10 rounded-full object-cover border-2 border-white/50">
                <div class="flex flex-col overflow-hidden">
                    <span class="truncate">{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
                    <span class="text-[10px] text-gray-300 font-normal">Edit Profil</span>
                </div>
            </div>
        </router-link>
        
        <div v-else-if="props.userRole === 'shelter'" class="flex items-center gap-3 bg-black/20 border border-white/10 text-white py-3 px-4 rounded-xl font-semibold shadow-inner">
            <span>{{ props.profileData ? props.profileData.name : 'Memuat...' }}</span>
        </div>
      </div>

      <ul class="flex flex-col list-none p-0 m-0 flex-grow overflow-y-auto px-4 space-y-2">
          <template v-if="props.userRole === 'driver'">
             <li key="tugas-driver">
                <router-link 
                  to="/driver/tasks" 
                  @click="toggleMobileMenu"
                  class="flex items-center gap-4 text-white/80 text-lg font-medium py-3 px-5 rounded-full transition-all duration-300 hover:text-white"
                  active-class="bg-[#EBCD5E] text-[#1F352C] font-bold shadow-lg"
                >
                  <i class="fas fa-tasks w-5 text-center"></i> Daftar Tugas
                </router-link>
             </li>
             </template>

          <template v-else>
            <li v-for="link in navLinks" :key="link.name">
              <router-link 
                :to="link.path" 
                @click="toggleMobileMenu"
                class="flex items-center gap-4 text-white/80 text-lg font-medium py-3 px-5 rounded-full transition-all duration-300 hover:text-white hover:pl-7" 
                :class="{ 'text-[#EBCD5E] font-bold bg-white/10 border-l-4 border-[#EBCD5E] pl-7': activePage === link.name }"
              >
                <i v-if="link.name === 'Beranda'" class="fas fa-home w-5 text-center"></i>
                <i v-else-if="link.name === 'Lapor'" class="fas fa-bullhorn w-5 text-center"></i>
                <i v-else-if="link.name === 'Adopsi'" class="fas fa-paw w-5 text-center"></i>
                <i v-else-if="link.name === 'Donasi'" class="fas fa-hand-holding-heart w-5 text-center"></i>
                <i v-else-if="link.name === 'Komunitas'" class="fas fa-users w-5 text-center"></i>
                <i v-else-if="link.name === 'FAQ'" class="fas fa-question-circle w-5 text-center"></i>
                <i v-else-if="link.name === 'Kucing'" class="fas fa-cat w-5 text-center"></i>
                <i v-else-if="link.name === 'Driver'" class="fas fa-truck w-5 text-center"></i>
                
                {{ link.name }}
              </router-link>
            </li>
          </template>
      </ul>
      
      <div class="p-6 mt-auto border-t border-white/10">
          <button v-if="props.userRole !== 'guest'" @click="handleSignOut" class="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg flex justify-center items-center gap-2 backdrop-blur-sm">
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>

          <router-link v-else to="/login" @click="toggleMobileMenu" class="block w-full text-center bg-[#EBCD5E] hover:bg-[#dcb945] text-gray-900 font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg">
              Signup / Login
          </router-link>
      </div>
  </nav>

</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 

const router = useRouter(); 
const userRole = ref(localStorage.getItem('role') || 'user'); 
const isDriver = computed(() => userRole.value === 'driver');

const props = defineProps({
    userRole: { type: String, default: 'guest' },
    profileData: { type: Object, default: () => null }
});

// --- SCROLL & AUTH LOGIC ---
const isScrolled = ref(false);

const isAuthPage = computed(() => {
    // Update: Menambahkan 'KucingHilang' dan 'Fakta' agar navbar hilang
    return ['Login', 'Signup', 'AdopsiDetail', 'Post', 'Track', 'Profile', 'KucingHilang', 'Fakta', 'DriverTrackingDetail'].includes(route.name);
});

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// --- LOGIKA BARU: Header Class ---
const headerClass = computed(() => {
  // 1. Jika sedang di-scroll, TETAP gunakan style blur (sesuai permintaan jangan diubah)
  if (isScrolled.value) {
    return 'backdrop-blur-md bg-[#1d3b31]/80 shadow-lg';
  }

  // 2. Jika di Homepage ('/') DAN User adalah 'individu', gunakan Hijau Solid
  // (Ini akan aktif hanya saat TIDAK di-scroll, karena kondisi scroll di atas return duluan)
  if (route.path === '/' && (props.userRole === 'individu' || props.userRole === 'guest')) {
    return 'bg-[#3A5F50]'; 
  }

  // 3. Default: Transparan (untuk halaman lain atau user lain saat di top)
  return 'bg-transparent';
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
// ---------------------------

function resolveImageUrl(path) {
    if (!path) return '/img/NULL.JPG';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/public/')) {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const baseServerUrl = baseApiUrl.replace('/api/v1', '');
        return `${baseServerUrl}${path}`;
    }
    return path;
}

const emit = defineEmits(['update-login-status']);

const navLinks = computed(() => {
    if (props.userRole === 'driver') {
        return [];
    }

    const links = [
        { name: 'Beranda', path: '/' },
        { name: 'Lapor', path: '/lapor' },
        { name: 'Adopsi', path: '/adopsi' },
        { name: 'Donasi', path: '/donasi' },
    ];

    if (props.userRole === 'shelter') {
        links.push({ name: 'Kucing', path: '/shelter/cats' });
        links.push({ name: 'Driver', path: '/shelter/driver' });
    } else {
        links.push({ name: 'FAQ', path: '/faq' });
    }
    
    links.push(
      { name: 'Komunitas', path: '/komunitas' },
    );

    return links;
});

const route = useRoute();
const isMobileMenuOpen = ref(false);
const isProfileDropdownOpen = ref(false);

watch(() => props.userRole, (newValue, oldValue) => {}, { immediate: true });

const activePage = computed(() => {
  if (props.userRole === 'driver') return 'Driver';
  const currentLink = navLinks.value.find(link => link.path === route.path);
  return currentLink ? currentLink.name : 'Beranda';
});

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function toggleProfileDropdown() {
    isProfileDropdownOpen.value = !isProfileDropdownOpen.value;
}

function handleEditProfileClick() {
    isProfileDropdownOpen.value = false; 
    router.push('/profile');             
}

function handleSignOut() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    emit('update-login-status', false);
    isProfileDropdownOpen.value = false;
    alert('Anda telah keluar.');
    
    window.location.href = '/login'; 
}
</script>

<style scoped>
</style>