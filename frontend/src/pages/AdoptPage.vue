<template>
  <div class="min-h-screen bg-gray-100 font-sans overflow-x-hidden">
    
    <!-- Ambil Role dari localStorage (Simulasi) -->
    <div v-if="userRole === 'shelter'">
        <div class="max-w-5xl mx-auto px-4 pt-12 pb-20">
            
            <div class="text-center mb-8 space-y-6">
                <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-gray-800">
                    Dashboard Adopsi
                </h1>
                
                <div class="flex justify-center">
                    <div class="bg-white p-1.5 rounded-full shadow-md inline-flex">
                        <button 
                            @click="activeTab = 'pending'"
                            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
                            :class="activeTab === 'pending' ? 'bg-[#EBCD5E] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'"
                        >
                            Menunggu ({{ pendingReports.length }})
                        </button>
                        <button 
                            @click="activeTab = 'history'"
                            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300"
                            :class="activeTab === 'history' ? 'bg-[#3A5F50] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'"
                        >
                            Riwayat
                        </button>
                    </div>
                </div>
            </div>

            <div class="relative">
                
                <div v-if="activeTab === 'pending'" class="flex flex-col gap-4 animate-fade-in">
                    <div v-if="pendingReports.length === 0" class="text-center py-16 bg-white rounded-3xl shadow-sm">
                        <i class="fas fa-clipboard-check text-4xl text-gray-300 mb-3"></i>
                        <p class="text-gray-500">Tidak ada permintaan adopsi baru.</p>
                    </div>
                    <AdoptionReportCard 
                        v-else
                        v-for="report in pendingReports" 
                        :key="report.id" 
                        :report="report"
                        @verify="handleVerification"
                    />
                </div>

                <div v-if="activeTab === 'history'" class="flex flex-col gap-4 animate-fade-in">
                    <div v-if="historyReports.length === 0" class="text-center py-16 bg-white rounded-3xl shadow-sm">
                        <i class="fas fa-history text-4xl text-gray-300 mb-3"></i>
                        <p class="text-gray-500">Belum ada riwayat adopsi.</p>
                    </div>
                    <AdoptionReportCard 
                        v-else
                        v-for="report in historyReports" 
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
import apiClient from '@/api/http'; // Import axios instance
import CatCard from '../components/CatCard.vue';
import HeroSection from '../components/HeroSection.vue';
import LoginOverlay from '../components/LoginOverlay.vue';
import AdoptionReportCard from '../components/AdoptionReportCard.vue'; // Komponen baru

// Mengambil userRole dari localStorage
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const adoptionReports = ref([]); // Data laporan untuk shelter
const catData = ref([]); // Data kucing untuk user/guest
const activeTab = ref('pending'); // Default tab

// --- LOGIKA FILTERING ---
const pendingReports = computed(() => {
    return adoptionReports.value.filter(r => r.status === 'pending');
});

const historyReports = computed(() => {
    return adoptionReports.value.filter(r => r.status !== 'pending');
});

// --- FETCH DATA ---
async function fetchData() {
    try {
        if (userRole.value === 'shelter') {
            // Ambil data (sudah otomatis filter by shelterId di backend via token)
            const response = await apiClient.get('/adopt/my-reports');
            adoptionReports.value = response.data;
        } else {
            // User view
            const response = await apiClient.get('/adopt/cats');
            catData.value = response.data; 
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// --- FETCH DATA ---
onMounted(async () => {
    fetchData();
});

// --- HANDLE VERIFIKASI (Disetujui/Ditolak) ---
async function handleVerification(id, status) {
    const actionText = status === 'approved' ? 'menyetujui' : 'menolak';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} adopsi ini?`)) return;

    try {
        // Panggil API verify
        await apiClient.patch(`/adopt/verify/${id}`, { status });
        
        alert(`Adopsi berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}!`);
        
        // Refresh data agar pindah tab/status terupdate
        await fetchData();
    } catch (error) {
        console.error("Gagal verifikasi:", error);
        alert("Terjadi kesalahan saat memproses verifikasi.");
    }
}

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
    cat.isFavorited = !cat.isFavorited;
  }
}

const favoriteCatsCount = computed(() => catData.value.filter(cat => cat.isFavorited).length);

const filteredCats = computed(() => {
  let list = catData.value;
  if (activeFilter.value === 'favorite') {
    list = list.filter(cat => cat.isFavorited);
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