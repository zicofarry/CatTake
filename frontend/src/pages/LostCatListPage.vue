<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http'; 

const lostCats = ref([]);
const isLoading = ref(true);

async function fetchLostCats() {
  try {
    isLoading.value = true;
    const response = await apiClient.get('/lost-cats/list');
    lostCats.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data kucing hilang:", error);
  } finally {
    isLoading.value = false;
  }
}

function resolveImageUrl(path) {
    // 1. Handle Null/Undefined atau string kosong
    if (!path || path === 'NULL' || path === 'NULL.JPG' || path === 'null') {
        return '/img/NULL.JPG'; // Pastikan file placeholder ini ada di frontend
    }

    // 2. Handle URL Eksternal (misal dari Google Login atau link luar)
    if (path.startsWith('http')) {
        return path;
    }

    // --- BAGIAN PENTING: Ambil URL Server Dinamis ---
    // Ambil dari .env (contoh: "http://localhost:3000/api/v1")
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    // Hapus '/api/v1' karena file statis ada di root, bukan di dalam route API
    const serverUrl = apiBase.replace('/api/v1', ''); 

    // 3. Handle Path Lengkap dari Backend (misal: /public/img/...)
    if (path.startsWith('/public/')) {
        return `${serverUrl}${path}`;
    }

    // 4. Handle Berdasarkan Prefix Nama File (Manual Mapping)
    // Ini berguna jika di database cuma tersimpan nama file "profile-123.jpg"
    
    // Foto Profil (User/Driver/Shelter)
    if (path.startsWith('profile-') || path.startsWith('driver-')) {
        return `${serverUrl}/public/img/profile/${path}`;
    }

    // Foto Kucing Hilang
    if (path.startsWith('lost-')) {
        return `${serverUrl}/public/img/lost_cat/${path}`;
    }
    
    // Foto Laporan Penemuan (Rescue)
    if (path.startsWith('report-')) {
        return `${serverUrl}/public/img/report_cat/${path}`;
    }

    // Foto Kucing Adopsi (Cat) - Tambahan dari analisa file CatController.js
    if (path.startsWith('cat-')) {
        return `${serverUrl}/public/img/cats/${path}`;
    }

    // Foto Bukti Transfer - Tambahan dari DonationController.js
    if (path.startsWith('proof-')) {
        return `${serverUrl}/public/img/proof_payment/${path}`;
    }

    // Foto QRIS Shelter - Tambahan dari ShelterProfilePage
    if (path.startsWith('qr-')) {
        return `${serverUrl}/public/img/qr_img/${path}`;
    }

    // Foto Dokumen Legalitas & KTP - Tambahan untuk dokumen
    if (path.startsWith('ktp-')) {
        return `${serverUrl}/public/img/identity/${path}`;
    }
    
    if (path.startsWith('rescue-')) {
        return `${serverUrl}/public/img/rescue_proof/${path}`;
    }

    if (path.startsWith('sim-')) {
        return `${serverUrl}/public/img/licence/${path}`;
    }

    if (path.startsWith('post-')) {
        return `${serverUrl}/public/img/post/${path}`;
    }

    // 5. Default Fallback (Asumsi aset statis lokal di folder public Frontend)
    // Jika tidak cocok dengan pola di atas, anggap file ada di frontend/public/img/
    return `/img/${path}`;
}

function formatRupiah(amount) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) return 'Tidak Ada';
    return `Rp${numAmount.toLocaleString('id-ID')}`;
}

onMounted(() => {
  fetchLostCats();
});
</script>

<template>
  <div class="bg-[#2c473c] min-h-screen p-5 md:p-10 font-sans"
    style="background-image: url('/img/background.png'); background-size: 360px;">
    
    <div class="fixed top-6 left-4 md:top-8 md:left-8 z-[999]">
        <router-link 
          to="/komunitas" 
          class="inline-flex items-center gap-2 bg-[#2D4A45]/80 backdrop-blur-md text-white font-bold py-2.5 px-6 rounded-full shadow-2xl transition-all duration-300 hover:bg-[#2D4A45] hover:-translate-x-1 no-underline border border-white/20"
        >
            <i class="fas fa-arrow-left"></i>
            <span>Kembali</span>
        </router-link>
    </div>

    <div class="max-w-3xl mx-auto pt-16 md:pt-8">
      
      <h1 class="text-4xl font-bold text-white">Daftar Kucing Hilang</h1>
      <p class="text-gray-400 mb-8">Bantu kami menemukan mereka yang sedang dicari pemiliknya.</p>

      <div v-if="isLoading" class="text-center text-white py-10">
        Memuat data kucing hilang...
      </div>

      <div v-else-if="lostCats.length === 0" class="text-center text-gray-400 py-10">
        Tidak ada laporan kucing hilang saat ini.
      </div>

      <div v-else class="flex flex-col gap-5">
        <div v-for="cat in lostCats" :key="cat.id" 
             class="bg-white text-gray-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start gap-5 transition-transform hover:scale-[1.01] relative overflow-hidden">
          
          <div v-if="cat.reward > 0" class="absolute top-0 right-0 bg-[#EBCD5E] text-gray-900 text-xs font-bold px-4 py-1 rounded-bl-xl shadow-md z-10">
              REWARD!
          </div>

          <img 
            :src="resolveImageUrl(cat.image)" 
            :alt="cat.name" 
            class="w-full md:w-32 h-40 md:h-32 rounded-lg object-cover flex-shrink-0 bg-gray-100 border border-gray-200"
            @error="$event.target.src='/img/kucingtidur.png'"
          >
          
          <div class="flex-grow w-full">
            <h2 class="text-xl font-bold text-gray-900">{{ cat.name }}</h2>
            <p class="text-gray-700 mt-1 text-sm leading-relaxed mb-3">
                <span class="font-bold">Pemilik:</span> {{ cat.owner }} | 
                <span class="font-bold">Ras:</span> {{ cat.breed }}
            </p>

            <div class="grid grid-cols-2 text-xs gap-y-2 mb-3">
                <div><span class="text-gray-500 block">Umur:</span> {{ cat.age }} Bulan</div>
                <div><span class="text-gray-500 block">Warna:</span> {{ cat.color }}</div>
                <div class="col-span-2"><span class="text-gray-500 block">Terakhir Dilihat:</span> {{ cat.address }}</div>
            </div>
            
            <p class="text-sm italic text-gray-600 border-t border-gray-100 pt-2 line-clamp-2">"{{ cat.description }}"</p>

            <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span class="text-lg font-bold text-gray-800">Reward: {{ formatRupiah(cat.reward) }}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>