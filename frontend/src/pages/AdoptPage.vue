<template>
  <div class="min-h-screen bg-gray-100 font-sans overflow-x-hidden">
    
    <!-- Ambil Role dari localStorage (Simulasi) -->
    <div v-if="userRole === 'shelter'">
        <!-- ============================================== -->
        <!-- TAMPILAN SHELTER: LAPORAN ADOPSI -->
        <!-- Sesuai design Figma 'adopt-shelterpage-Desktop/Mobile.jpg' -->
        <!-- ============================================== -->
         
        <div class="max-w-6xl mx-auto px-4 pt-12 pb-20">
            
            <!-- Judul Laporan Adopsi -->
            <div class="text-center mb-8 -mt-2">
                <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-gray-800 py-3 px-8 bg-white rounded-full shadow-xl">
                    Laporan Adopsi
                </h1>
            </div>

            <!-- Wrapper Daftar Laporan -->
            <div class="relative bg-white p-4 md:p-6 rounded-3xl shadow-2xl overflow-visible">
                <div class="flex flex-col gap-4">
                    <AdoptionReportCard 
                        v-for="report in mockAdoptionReports" 
                        :key="report.id" 
                        :report="report"
                    />
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <!-- ============================================== -->
        <!-- TAMPILAN USER/GUEST: DAFTAR KUCING & FILTER -->
        <!-- ============================================== -->
        <HeroSection 
          title="Berikan Rumah, Dapatkan Cinta."
          subtitle="Mari bersama menciptakan cerita baru bagi mereka, dari kesepian menuju rumah yang hangat dan penuh cinta."
          buttonText="Adopsi Sekarang"
          buttonLink="#listkucing"
          ellipseImg="/img/Ellipse.png"
          ellipseAlt="ellipse"
          mainImg="/img/cathelo.png"
          mainAlt="kucinghalo"
        />

        <div class="relative mt-10 z-10">
            
            <!-- Filter Bar (Sesuai Desain) -->
            <div class="absolute left-0 right-0 -top-8 z-30 px-4 pointer-events-none">
                <div class="max-w-3xl mx-auto flex flex-wrap justify-center items-center gap-4 p-4 pointer-events-auto">
                
                <button 
                    class="flex-1 min-w-[120px] py-3 px-6 bg-white text-gray-800 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-1"
                    :class="activeFilter === 'all' && genderFilter === 'all' ? '!bg-[#EBCD5E] !text-white shadow-[0_15px_30px_-5px_rgba(235,205,94,0.6)]' : 'shadow-[0_15px_35px_-10px_rgba(58,95,80,0.5)]'"
                    @click="setActiveFilter('all')"
                >
                    Semua
                </button>

                <div class="flex-1 min-w-[140px] relative group">
                    <select 
                        class="w-full appearance-none py-3 pl-6 pr-10 bg-white text-gray-800 font-bold text-base rounded-full cursor-pointer focus:outline-none transition-all duration-300 hover:-translate-y-1 text-left"
                        :class="activeFilter === 'gender' ? '!bg-[#EBCD5E] !text-white shadow-[0_15px_30px_-5px_rgba(235,205,94,0.6)]' : 'shadow-[0_15px_35px_-10px_rgba(58,95,80,0.5)]'"
                        :value="genderFilter"
                        @change="setGenderFilter($event.target.value)"
                    >
                        <option value="all" class="text-gray-800 bg-white py-2">Filter</option>
                        <option value="male" class="text-gray-800 bg-white py-2">Jantan</option>
                        <option value="female" class="text-gray-800 bg-white py-2">Betina</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center" :class="activeFilter === 'gender' ? 'text-white' : 'text-gray-800'">
                    <i class="fas fa-caret-down"></i>
                    </div>
                </div>

                <button 
                    class="flex-1 min-w-[120px] py-3 px-6 bg-white text-gray-800 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-1"
                    :class="activeFilter === 'favorite' ? '!bg-[#EBCD5E] !text-white shadow-[0_15px_30px_-5px_rgba(235,205,94,0.6)]' : 'shadow-[0_15px_35px_-10px_rgba(58,95,80,0.5)]'"
                    @click="setActiveFilter('favorite')"
                >
                    Favorit 
                    <span v-if="favoriteCatsCount > 0" class="ml-1">({{ favoriteCatsCount }})</span>
                </button>

                </div>
            </div>

            <!-- List Kucing -->
            <div id="listkucing" class="bg-[#3A5F50] pt-36 pb-28 px-6 rounded-t-[50px] md:rounded-t-[80px] min-h-[700px]">
                <!-- Login Overlay untuk Guest -->
                <LoginOverlay v-if="userRole === 'guest'" message="Silakan login dulu untuk mengadopsi kucing." buttonText="Login Sekarang" loginRoute="/login"/>
                
                <div class="max-w-6xl mx-auto">
                    <transition name="fade" mode="out-in">
                        <div v-if="filteredCats.length === 0" class="flex flex-col items-center justify-center py-32 text-white/80 text-center">
                            <i class="fas fa-cat text-7xl mb-4 opacity-60"></i>
                            <h3 class="text-2xl font-bold">Tidak ditemukan</h3>
                            <button @click="setActiveFilter('all')" class="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">Reset Filter</button>
                        </div>
                    
                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            <div v-for="cat in filteredCats" :key="cat.id" class="h-full">
                                <CatCard :cat="cat" @toggle-favorite="handleToggleFavorite" />
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CatCard from '../components/CatCard.vue';
import HeroSection from '../components/HeroSection.vue';
import LoginOverlay from '../components/LoginOverlay.vue';
import AdoptionReportCard from '../components/AdoptionReportCard.vue'; // Komponen baru

// Mengambil userRole dari localStorage
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');

// --- MOCK DATA UNTUK SHELTER VIEW ---
const mockAdoptionReports = ref([
    { id: 1, catName: 'Oyen', date: '2025/10/02 19.08', adopter: { name: 'Diana', profilePic: '/img/profileDiana.png', nik: '327XXXXXXXXX1', phone: '08XXXXXXX1', email: 'dianacantik@gmail.com', job: 'Guru', address: 'Jl. Gegerkalong Girang No.116 Kota Bandung.' }},
    { id: 2, catName: 'Kurkur', date: '2025/09/30 13.25', adopter: { name: 'Azmi', profilePic: '/img/profileAzmi.png', nik: '327XXXXXXXXX2', phone: '08X-XXX-XXX', email: 'azmi@mail.com', job: 'Pegawai Swasta', address: 'Jl. Asia Afrika No. 12, Bandung.' }},
    { id: 3, catName: 'Cemong', date: '2025/09/29 09.40', adopter: { name: 'Anas', profilePic: '/img/profileAnas.png', nik: '327XXXXXXXXX3', phone: '08X-XXX-XXX', email: 'anas@mail.com', job: 'Mahasiswa', address: 'Jl. Merdeka No. 5, Cimahi.' }},
    { id: 4, catName: 'Bolang', date: '2025/09/29 07.00', adopter: { name: 'Nanda', profilePic: '/img/profileNanda.png', nik: '327XXXXXXXXX4', phone: '08X-XXX-XXX', email: 'nanda@mail.com', job: 'Wirausaha', address: 'Komplek Permata Hijau Blok C, Jakarta.' }},
]);


// --- LOGIKA UNTUK USER VIEW ---
// const catData = ref([
//   { id: 1, name: 'Oyen', shelter: 'CatHouse', gender: 'male', age: '6 Bulan', image: 'oyencat.png', isFavorite: false },
//   { id: 2, name: 'Abul', shelter: 'PawCare', gender: 'male', age: '5 Bulan', image: 'minicat.png', isFavorite: false },
//   { id: 3, name: 'Simba', shelter: 'Meow Haven', gender: 'male', age: '2 Tahun', image: 'bradercat.png', isFavorite: false },
//   { id: 4, name: 'Mueza', shelter: 'CatHouse', gender: 'female', age: '8 Bulan', image: 'mochacat.png', isFavorite: false },
//   { id: 5, name: 'Kitty', shelter: 'PawCare', gender: 'female', age: '3 Tahun', image: 'kitty.png', isFavorite: false },
// ]);
const catData = ref([]); // Asalnya ada data, sekarang kosong

// 3. TAMBAHKAN 'onMounted' UNTUK MENGAMBIL DATA
onMounted(async () => {
  try {
    // Panggil backend Anda
    const response = await fetch('http://localhost:3000/api/kucing'); 
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari server');
    }
    
    const dataFromBackend = await response.json();
    
    // 4. MASUKKAN DATA DARI BACKEND KE 'catData'
    catData.value = dataFromBackend; 
    
  } catch (error) {
    console.error('Error saat fetching data kucing:', error);
    // Handle error, mungkin tampilkan pesan di UI
  }
});

const activeFilter = ref('all'); 
const genderFilter = ref('all');

function setActiveFilter(filter) {
  activeFilter.value = filter;
  genderFilter.value = 'all'; 
}

function setGenderFilter(gender) {
    if (gender === 'all') {
        setActiveFilter('all');
    } else {
        activeFilter.value = 'gender';
        genderFilter.value = gender;
    }
}

function handleToggleFavorite(catId) {
  const cat = catData.value.find(c => c.id === catId);
  if (cat) {
    cat.isFavorite = !cat.isFavorite;
  }
}

const favoriteCatsCount = computed(() => catData.value.filter(cat => cat.isFavorite).length);

const filteredCats = computed(() => {
  let list = catData.value;
  if (activeFilter.value === 'favorite') {
    list = list.filter(cat => cat.isFavorite);
  } else if (activeFilter.value === 'gender' && genderFilter.value !== 'all') {
    list = list.filter(cat => cat.gender === genderFilter.value);
  }
  return list;
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #638870;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1; 
    border-radius: 10px;
}

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>