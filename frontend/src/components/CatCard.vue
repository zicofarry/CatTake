<template>
  <router-link 
    :to="`/adopsi/${cat.id}`" 
    class="block no-underline text-inherit h-full"
  >
    <div class="bg-white rounded-[35px] p-4 pb-6 shadow-[0_5px_20px_rgba(0,0,0,0.08)] flex flex-col h-full transition-transform duration-300 hover:-translate-y-2">
      
      <div class="mb-4">
        <img 
          :src="resolveImageUrl(cat.image || cat.photo)"
          :alt="cat.name" 
          class="w-full h-56 object-cover rounded-[25px] shadow-sm"
        >
      </div>

      <div class="px-2 mb-6 flex justify-between items-start">
        
        <div class="text-gray-900 space-y-1">
          <div class="text-lg">
            <span class="font-bold">Nama:</span> {{ cat.name }}
          </div>
          <div class="text-lg">
            <span class="font-bold">Jenis Kelamin:</span> {{ cat.gender === 'male' ? 'Jantan' : 'Betina' }}
          </div>
          <p class="text-sm text-gray-500">
            <i class="fas fa-home"></i> {{ cat.shelter }}
            <i v-if="cat.is_verified_shelter" class="fas fa-check-circle text-blue-500 ml-1"></i>
        </p>
        </div>

        <button 
          @click.stop.prevent="toggleFavorite" 
          class="w-10 h-10 flex justify-center items-start cursor-pointer transition-transform active:scale-90 hover:scale-110 -mt-1 -mr-2"
          aria-label="Toggle Favorite"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            stroke-width="2" 
            stroke="currentColor" 
            class="w-8 h-8 transition-all duration-300"
            :class="cat.isFavorited ? 'fill-[#D32F2F] stroke-[#D32F2F]' : 'fill-transparent stroke-[#D32F2F]'"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>

      </div>

      <div class="mt-auto px-2">
        <div class="w-full py-3 bg-[#EBCD5E] text-white text-center font-bold text-lg rounded-full shadow-md transition-colors hover:bg-[#e0c355]">
          Rincian
        </div>
      </div>

    </div>
  </router-link>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import axios from 'axios';
import apiClient from '@/api/http';

const props = defineProps({
  cat: { type: Object, required: true }
});

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

async function toggleFavorite() {
  // 1. Ambil token (Asumsi kamu simpan token di localStorage saat login)
  const token = localStorage.getItem('userToken'); 
  console.log("=== MULAI DEBUG FAVORITE ===");
  console.log("1. Nama Key di LocalStorage: 'userToken'");
  console.log("2. Isi Token:", token); // Kalau ini null, berarti salah nama key
  if (!token) {
    alert("Silakan login dulu untuk menyukai kucing ini!");
    return;
  }

  // 2. Simpan status lama buat jaga-jaga kalau error (Backup)
  const previousStatus = props.cat.isFavorited;

  // 3. Optimistic Update: Ubah tampilan DULUAN biar terasa cepat (UX bagus)
  // Vue 3 Reactivity: Mengubah property di dalam object prop akan merender ulang UI
  props.cat.isFavorited = !props.cat.isFavorited;

  try {
    // 4. Panggil API Backend
    // Sesuaikan URL dengan backendmu
    const response = await apiClient.post(`/cats/${props.cat.id}/favorite`);
    
    console.log("Sukses Like/Unlike:", response.data);
    // 5. Sinkronisasi akhir (Opsional, untuk memastikan data sama persis dengan DB)
    // Backend harus return { isFavorited: true/false }
    if (response.data.isFavorited !== undefined) {
      props.cat.isFavorited = response.data.isFavorited;
    }

  } catch (error) {
    console.error("Gagal like:", error);
    // 6. Kalau Error, kembalikan status ke semula (Rollback)
    props.cat.isFavorited = previousStatus;
    alert("Gagal memproses favorite.");
  }
}

</script>