<template>
  <div class="min-h-screen font-sans overflow-x-hidden pt-20 pb-32 relative"
    style="
        background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
        background-repeat: no-repeat;
        background-attachment: fixed;
    ">
    
    <div v-if="userRole === 'shelter'">
        
        <div class="text-center mb-8 pt-10 md:pt-15 space-y-6">
            <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-white drop-shadow-md py-3 px-8">
                Dashboard Adopsi
            </h1>
            
            <div class="flex justify-center">
                <div class="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg inline-flex">
                    <button 
                        @click="activeTab = 'pending'"
                        class="px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2"
                        :class="activeTab === 'pending' ? 'bg-[#EBCD5E] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'"
                    >
                        Menunggu <span v-if="pendingReports.length" class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{{ pendingReports.length }}</span>
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

        <div class="max-w-5xl mx-auto px-4">
            <div class="relative">
                
                <div v-if="activeTab === 'pending'" class="flex flex-col gap-4 animate-fade-in">
                    <div v-if="pendingReports.length === 0" class="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-center text-gray-500 shadow-lg">
                        <i class="fas fa-clipboard-check text-4xl mb-3 opacity-50"></i>
                        <p>Tidak ada permintaan adopsi baru.</p>
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
                    <div v-if="historyReports.length === 0" class="bg-white/80 backdrop-blur-md rounded-3xl p-10 text-center text-gray-500 shadow-lg">
                        <i class="fas fa-history text-4xl mb-3 opacity-50"></i>
                        <p>Belum ada riwayat adopsi.</p>
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
        <div class="md:pt-15">
            <HeroSection 
                mainImg="/img/cathelo.png" 
                mainAlt="Cat Hero"
                mainMaxWidth="500px"
                titleClass="text-5xl md:text-7xl font-bold text-white drop-shadow-lg leading-tight font-sans"
                subtitleClass="text-white mt-4 text-lg drop-shadow-md font-medium leading-relaxed"
            >
                <template #title>
                    Adopsi &<br>Berbagi Cinta
                </template>
                
                <template #subtitle>
                    Berikan rumah yang layak bagi mereka yang membutuhkan, dan temukan sahabat sejati dalam hidupmu.
                </template>
                
                <template #actions>
                    <div class="bg-white/20 backdrop-blur-md p-1.5 rounded-full flex mt-8 shadow-lg border border-white/30 inline-flex justify-center md:justify-start">
                        <button 
                            @click="activeUserTab = 'browse'"
                            class="px-6 py-3 rounded-full font-bold transition-all text-sm md:text-base flex items-center gap-2"
                            :class="activeUserTab === 'browse' ? 'bg-white text-[#3A5F50] shadow-lg' : 'text-white hover:bg-white/10'"
                        >
                            <i class="fas fa-search"></i> Cari Kucing
                        </button>
                        <button 
                            @click="activeUserTab = 'history'"
                            class="px-6 py-3 rounded-full font-bold transition-all text-sm md:text-base flex items-center gap-2"
                            :class="activeUserTab === 'history' ? 'bg-white text-[#3A5F50] shadow-lg' : 'text-white hover:bg-white/10'"
                        >
                            <i class="fas fa-history"></i> Riwayat Saya
                        </button>
                    </div>
                </template>
            </HeroSection>
        </div>

        <div class="relative mt-10 z-10">
            <div v-if="activeUserTab === 'browse'">
                <div class="absolute left-0 right-0 -top-8 z-30 px-4 pointer-events-none">
                    <div class="max-w-3xl mx-auto flex flex-wrap justify-center items-center gap-4 p-4 pointer-events-auto">
                        <button class="flex-1 min-w-[120px] py-3 px-6 bg-white text-gray-800 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-1" :class="activeFilter === 'all' && genderFilter === 'all' ? '!bg-[#EBCD5E] !text-white shadow-lg' : 'shadow-md'" @click="setActiveFilter('all')">Semua</button>
                        <div class="flex-1 min-w-[140px] relative group">
                            <select class="w-full appearance-none py-3 pl-6 pr-10 bg-white text-gray-800 font-bold text-base rounded-full cursor-pointer transition-all duration-300 hover:-translate-y-1" :class="activeFilter === 'gender' ? '!bg-[#EBCD5E] !text-white' : ''" :value="genderFilter" @change="setGenderFilter($event.target.value)">
                                <option value="all">Filter</option>
                                <option value="male">Jantan</option>
                                <option value="female">Betina</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center" :class="activeFilter === 'gender' ? 'text-white' : 'text-gray-800'"><i class="fas fa-caret-down"></i></div>
                        </div>
                        <button class="flex-1 min-w-[120px] py-3 px-6 bg-white text-gray-800 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-1" :class="activeFilter === 'favorite' ? '!bg-[#EBCD5E] !text-white' : ''" @click="setActiveFilter('favorite')">Favorit ({{ favoriteCatsCount }})</button>
                    </div>
                </div>

                <div id="listkucing" class="bg-[#3A5F50] pt-36 pb-40 px-6 rounded-t-[50px] md:rounded-t-[80px] min-h-screen -mb-32">
                    <LoginOverlay v-if="userRole === 'guest'" message="Silakan login dulu untuk mengadopsi kucing." buttonText="Login Sekarang" loginRoute="/login"/>
                    <div class="max-w-6xl mx-auto">
                        <div v-if="filteredCats.length === 0" class="flex flex-col items-center justify-center py-32 text-white/80 text-center">
                            <i class="fas fa-cat text-7xl mb-4 opacity-60"></i>
                            <h3 class="text-2xl font-bold">Tidak ditemukan</h3>
                            <button @click="setActiveFilter('all')" class="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">Reset Filter</button>
                        </div>
                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            <CatCard v-for="cat in filteredCats" :key="cat.id" :cat="cat" @toggle-favorite="handleToggleFavorite" />
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="max-w-4xl mx-auto px-4 pb-20 animate-fade-in mt-10">
                <div v-if="myAdoptions.length === 0" class="text-center py-20 text-white">
                    <i class="fas fa-history text-5xl mb-4 opacity-50"></i>
                    <p class="text-xl">Kamu belum pernah mengajukan adopsi.</p>
                </div>
                <div v-else class="grid gap-4">
                    <div v-for="item in myAdoptions" :key="item.id" class="bg-white rounded-3xl p-5 flex items-center shadow-lg transition-all hover:scale-[1.02]">
                        <img :src="`${item.catImage}`" class="w-20 h-20 rounded-2xl object-cover mr-4" />
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-800">{{ item.catName }}</h3>
                            <p class="text-sm text-gray-500">{{ item.shelterName }}</p>
                            <div class="mt-2">
                                <span :class="{
                                    'bg-yellow-100 text-yellow-600': item.status === 'pending',
                                    'bg-green-100 text-green-600': item.status === 'approved' || item.status === 'completed',
                                    'bg-red-100 text-red-600': item.status === 'rejected'
                                }" class="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {{ item.status }}
                                </span>
                            </div>
                        </div>
                        <button v-if="item.status === 'pending'" @click="cancelAdoption(item.id)" class="bg-red-50 text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@/api/http'; // Import axios instance
import CatCard from '../components/CatCard.vue';
import HeroSection from '../components/HeroSection.vue';
import LoginOverlay from '../components/LoginOverlay.vue';
import AdoptionReportCard from '../components/AdoptionReportCard.vue'; // Komponen baru
const SERVER_URL = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '');

// Mengambil userRole dari localStorage
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const adoptionReports = ref([]); // Data laporan untuk shelter
const catData = ref([]); // Data kucing untuk user/guest
const activeTab = ref('pending'); // Default tab
const activeUserTab = ref('browse'); // Tab User
const myAdoptions = ref([]);

// Fetch data riwayat
async function fetchUserHistory() {
    try {
        const res = await apiClient.get('/adopt/my-adoptions');
        myAdoptions.value = res.data;
    } catch (err) { console.error(err); }
}

// Fungsi cancel
async function cancelAdoption(id) {
    if (!confirm('Batalkan pengajuan ini?')) return;
    try {
        await apiClient.delete(`/adopt/cancel/${id}`);
        fetchUserHistory();
        alert('Pengajuan dibatalkan.');
    } catch (err) { alert(err.response.data.error); }
}

// Menggunakan activeUserTab (bukan viewMode)
watch(activeUserTab, (newVal) => {
    if (newVal === 'history') fetchUserHistory();
});

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