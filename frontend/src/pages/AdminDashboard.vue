<template>
  <div class="min-h-screen bg-gray-100 pt-32 px-6 pb-20"> 
    
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold mb-6 text-[#3A5F50]">Verifikasi Shelter Pending</h2>

        <div v-if="pendingShelters.length === 0" class="text-center py-10 text-gray-500">
            Tidak ada permintaan verifikasi baru.
        </div>

        <div v-else class="space-y-6">
            <div v-for="shelter in pendingShelters" :key="shelter.id" class="border rounded-xl p-4 flex flex-col md:flex-row gap-6">
                <div class="flex-grow">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-bold">{{ shelter.shelter_name }}</h3>
                        <span class="bg-gray-200 text-xs px-2 py-1 rounded">{{ shelter.organization_type }}</span>
                    </div>
                    <p class="text-sm text-gray-600"><i class="fas fa-envelope w-5"></i> {{ shelter.email }}</p>
                    <p class="text-sm text-gray-600"><i class="fas fa-phone w-5"></i> {{ shelter.contact_phone }}</p>
                    
                    <div class="mt-4">
                        <p class="text-xs font-bold text-gray-400 uppercase mb-1">Dokumen Legalitas</p>
                        <a v-if="shelter.legal_certificate" :href="resolveImageUrl(shelter.legal_certificate)" target="_blank" class="text-blue-600 hover:underline text-sm flex items-center gap-1">
                            <i class="fas fa-file-pdf"></i> Lihat Dokumen
                        </a>
                        <span v-else class="text-red-500 text-sm italic">Belum upload dokumen</span>
                    </div>
                </div>

                <div class="flex flex-col justify-center gap-3 min-w-[150px]">
                    <button @click="processVerification(shelter.id, 'approved')" class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-bold text-sm shadow-md">
                        <i class="fas fa-check"></i> Terima
                    </button>
                    <button @click="processVerification(shelter.id, 'rejected')" class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 font-bold text-sm shadow-md">
                        <i class="fas fa-times"></i> Tolak
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http';

const pendingShelters = ref([]);

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

async function fetchPending() {
    try {
        const res = await apiClient.get('/admin/pending-shelters');
        pendingShelters.value = res.data.data;
    } catch (error) {
        console.error("Gagal load admin data:", error);
        if (error.response?.status === 403) alert("Anda bukan Admin!");
    }
}

async function processVerification(userId, status) {
    if(!confirm(`Yakin ingin ${status === 'approved' ? 'menerima' : 'menolak'} shelter ini?`)) return;

    try {
        await apiClient.post('/admin/verify', {
            targetUserId: userId,
            status: status,
            roleType: 'shelter',
            notes: status === 'approved' ? 'Dokumen valid' : 'Dokumen tidak lengkap'
        });
        alert(`Berhasil di-${status}`);
        fetchPending(); // Refresh list
    } catch (error) {
        alert("Gagal memproses.");
    }
}

onMounted(() => {
    fetchPending();
});
</script>
