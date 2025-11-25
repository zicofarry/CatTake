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
                        <a v-if="shelter.legal_certificate" :href="resolveUrl(shelter.legal_certificate)" target="_blank" class="text-blue-600 hover:underline text-sm flex items-center gap-1">
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

function resolveUrl(path) {
    return `http://localhost:3000${path}`;
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
