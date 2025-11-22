<template>
  <div 
    class="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
    :class="{ 'border-l-4 border-l-[#EBCD5E]': report.status === 'pending', 'border-l-4 border-l-green-500': report.status === 'approved' || report.status === 'completed' }"
  >
    <div class="flex items-center justify-between cursor-pointer" @click="toggleDetails">
      
      <div class="flex items-center flex-grow min-w-0 gap-4">
        <img :src="resolveImageUrl(report.adopter.profilePic)" class="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm shrink-0">
        
        <div class="min-w-0 flex-grow">
          <div class="flex items-center gap-2 mb-1">
             <span 
                class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                :class="statusBadgeClass"
             >
                {{ report.status }}
             </span>
             <span class="text-xs text-gray-400">{{ report.date }}</span>
          </div>
          <p class="font-bold text-gray-800 text-base md:text-lg leading-tight truncate">
            {{ report.adopter.name }} <span class="font-normal text-gray-500">ingin mengadopsi</span> {{ report.catName }}
          </p>
        </div>
      </div>

      <div class="flex items-center shrink-0 ml-3">
        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300" :class="{ 'rotate-180': isOpen }">
            <i class="fas fa-chevron-down text-gray-500 text-sm"></i>
        </div>
      </div>
    </div>
    
    <div v-show="isOpen" class="pt-5 mt-4 border-t border-gray-100 animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-sm">
        
        <div class="space-y-2">
          <h4 class="font-bold text-gray-900 mb-2 border-b pb-1 inline-block">Data Pelamar</h4>
          <p><span class="font-medium text-gray-500 w-20 inline-block">NIK:</span> {{ report.adopter.nik }}</p>
          <p><span class="font-medium text-gray-500 w-20 inline-block">HP:</span> {{ report.adopter.phone }}</p>
          <p><span class="font-medium text-gray-500 w-20 inline-block">Email:</span> {{ report.adopter.email }}</p>
          <p><span class="font-medium text-gray-500 w-20 inline-block">Pekerjaan:</span> {{ report.adopter.job }}</p>
          <p><span class="font-medium text-gray-500 w-20 inline-block">Alamat:</span> {{ report.adopter.address }}</p>
        </div>

        <div class="flex flex-col justify-between">
            <div>
                <h4 class="font-bold text-gray-900 mb-2 border-b pb-1 inline-block">Dokumen</h4>
                <div class="mt-1">
                    <a 
                        v-if="report.adopter.documentUrl" 
                        :href="resolveBackendUrl(report.adopter.documentUrl)" 
                        target="_blank"
                        class="flex items-center gap-2 text-[#3A5F50] hover:text-[#2c473c] font-semibold transition-colors p-2 bg-green-50 rounded-lg border border-green-100 w-fit text-sm"
                    >
                        <i class="fas fa-file-pdf text-xl text-red-500"></i>
                        <span>Lihat Surat Pernyataan (PDF)</span>
                    </a>

                     <!-- Bagian Identitas -->
                    <a 
                      v-if="report.adopter.identityUrl" 
                      :href="resolveBackendUrl(report.adopter.identityUrl)" 
                      target="_blank"
                      class="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors p-2 bg-gray-50 rounded-lg border border-gray-200 w-fit text-sm"
                  >
                      <i class="fas fa-id-card text-xl text-blue-500"></i>
                      <span>Lihat Foto Identitas</span>
                  </a>
                  <!-- Bagian Identitas Selesai -->
                  <p v-if="!report.adopter.documentUrl" class="text-gray-400 italic text-xs">Dokumen tidak tersedia.</p>
                </div>
            </div>

            <div v-if="report.status === 'pending'" class="flex gap-3 mt-6 md:mt-0 justify-end">
                <button 
                    @click="$emit('verify', report.id, 'rejected')"
                    class="px-4 py-2 rounded-lg text-red-600 font-bold border border-red-200 hover:bg-red-50 transition"
                >
                    Tolak
                </button>
                <button 
                    @click="$emit('verify', report.id, 'approved')"
                    class="px-6 py-2 rounded-lg bg-[#3A5F50] text-white font-bold shadow-md hover:bg-[#2a463b] hover:shadow-lg transition transform active:scale-95"
                >
                    Setujui Adopsi
                </button>
            </div>
            <div v-else class="mt-4 text-right">
                <span class="text-gray-400 text-sm italic">Permintaan ini telah diproses.</span>
            </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    report: { type: Object, required: true }
});

defineEmits(['verify']); // Event ke parent untuk verifikasi

const isOpen = ref(false);
const toggleDetails = () => { isOpen.value = !isOpen.value; };

const statusBadgeClass = computed(() => {
    switch(props.report.status) {
        case 'pending': return 'bg-yellow-100 text-yellow-700';
        case 'approved': return 'bg-green-100 text-green-700';
        case 'completed': return 'bg-green-100 text-green-700';
        case 'rejected': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
});

// FUNGSI RESOLVER URL KE BACKEND
function resolveBackendUrl(path) {
    if (!path) return '#';

    // Ambil BASE URL Backend (http://localhost:3000)
    // Kita hapus '/api/v1' karena file statis di-serve di root '/public'
    let baseServerUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    baseServerUrl = baseServerUrl.replace('/api/v1', ''); 

    // Path dari DB/Service sudah lengkap "/public/docs/stmt/file.pdf"
    // Jadi tinggal gabung: http://localhost:3000 + /public/docs/...
    return `${baseServerUrl}${path}`;
}

// ... resolveImageUrl untuk foto profil user (bisa pakai logic yang sama atau beda) ...
function resolveImageUrl(path) {
    // 1. Jika path null/undefined atau string 'NULL'/'null', pakai default frontend
    if (!path || path.includes('NULL') || path.includes('null')) {
        return '/img/profile/NULL.JPG'; // Pastikan file ini ada di public frontend, atau pakai '/img/NULL.JPG'
    }

    // 2. Ambil Base URL Backend
    let baseServerUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    baseServerUrl = baseServerUrl.replace('/api/v1', '');

    // 3. Jika path diawali '/public/', gabungkan dengan domain backend
    if (path.startsWith('/public/')) {
        return `${baseServerUrl}${path}`;
    }

    // 4. Jika path adalah URL lengkap (misal Google Login), kembalikan langsung
    if (path.startsWith('http')) {
        return path;
    }

    // 5. Sisanya anggap aset statis frontend
    return path;
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>