<script setup>
import { ref, computed, onMounted } from 'vue'; 
import { useRouter } from 'vue-router';
import apiClient from '@/api/http'; 

const router = useRouter();
const activeTab = ref('proses'); 
const tasks = ref([]);
const isLoading = ref(false);

// === 1. FETCH DATA DARI API ===
const fetchDriverTasks = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/rescue/driver-tasks');
    
    tasks.value = response.data.data.map(item => ({
      id: item.trackingId, 
      reportId: item.report?.id,
      status: item.status,
      catName: item.report?.cat_name || 'Kucing Tanpa Nama',
      location: item.report?.location || 'Lokasi tidak diketahui',
      distance: 'Calculating...', 
      date: formatDate(item.createdAt),
      img: resolveImageUrl(item.report?.photo)
    }));
  } catch (error) {
    console.error("Gagal mengambil tugas driver:", error);
  } finally {
    isLoading.value = false;
  }
};

// === 2. HELPER FUNCTIONS ===
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const resolveImageUrl = (path) => {
  if (!path) return '/img/kucingtidur.png';
  if (path.startsWith('http')) return path;
  
  // PERHATIAN: Gunakan Base URL Dinamis (disarankan)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// === 3. FILTER LOGIC ===
const filteredTasks = computed(() => {
  if (activeTab.value === 'proses') {
    return tasks.value.filter(t => 
      ['assigned', 'in_transit', 'prosess', 'pending'].includes(t.status)
    );
  }
  if (activeTab.value === 'selesai') {
    return tasks.value.filter(t => 
      ['completed', 'sheltered', 'selesai'].includes(t.status)
    );
  }
  return [];
});

const goToDetail = (id) => {
  router.push(`/driver/tracking/${id}`);
};

onMounted(() => {
  fetchDriverTasks();
});
</script>

<template>
  <div class="min-h-screen bg-[#FFFBF5] pb-24 pt-24 px-4 md:px-20">
    
    <div class="mb-10 pt-4">
      <h1 class="text-4xl font-extrabold text-[#3E3E3E] mb-1 tracking-tight">Halo, Driver! 🚚</h1>
      <p class="text-lg text-gray-500">Pantau tugas penyelamatanmu di sini.</p>
    </div>

    <div class="flex gap-8 border-b-2 border-gray-100 mb-8 mt-4">
      <button 
        @click="activeTab = 'proses'"
        :class="['pb-3 px-6 transition-all duration-300 rounded-t-lg', activeTab === 'proses' ? 'border-b-4 border-[#FF862F] text-[#FF862F] font-extrabold' : 'text-gray-500 hover:text-[#FF862F] hover:bg-gray-50']"
      >
        <i class="fas fa-clock mr-2" v-if="activeTab === 'proses'"></i> Berlangsung
      </button>
      <button 
        @click="activeTab = 'selesai'"
        :class="['pb-3 px-6 transition-all duration-300 rounded-t-lg', activeTab === 'selesai' ? 'border-b-4 border-[#FF862F] text-[#FF862F] font-extrabold' : 'text-gray-500 hover:text-[#FF862F] hover:bg-gray-50']"
      >
        <i class="fas fa-check-circle mr-2" v-if="activeTab === 'selesai'"></i> Selesai
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
      <p class="text-gray-500">Memuat data tugas...</p>
    </div>

    <div v-else class="space-y-6">
      
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="bg-white p-5 rounded-3xl shadow-lg transition-all cursor-pointer transform hover:shadow-xl hover:-translate-y-1"
        @click="goToDetail(task.id)"
      >
        <div class="flex gap-5">
          
          <div class="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 relative shadow-inner border border-gray-200">
            <img :src="task.img" :alt="task.catName" class="w-full h-full object-cover">
          </div>

          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span :class="[
                  'text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-md flex items-center gap-1',
                  task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                ]">
                  <i :class="task.status === 'completed' ? 'fas fa-check' : 'fas fa-sync-alt fa-spin'" class="text-[10px]"></i>
                  {{ task.status === 'completed' ? 'Selesai' : 'Dalam Proses' }}
                </span>
                
                <span class="text-sm text-gray-400 font-medium">{{ task.date }}</span>
              </div>
              
              <h3 class="font-extrabold text-[#3E3E3E] text-2xl line-clamp-1 mb-1">{{ task.catName }}</h3>
              
              <p class="text-base text-gray-500 flex items-center gap-2 mt-1 line-clamp-1 font-medium">
                <i class="fas fa-map-marker-alt text-red-400 text-sm"></i> {{ task.location }}
              </p>
            </div>
            
            <div class="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200">
              <span class="text-sm text-gray-400 italic font-normal">Tracking ID: {{ task.id }}</span>
              
              <button class="bg-[#FF862F] text-white px-6 py-3 rounded-full font-bold shadow-xl transform active:scale-95 hover:bg-[#ff7b18] transition-all flex items-center gap-2">
                Lihat Detail
                <i class="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTasks.length === 0" class="text-center py-16 text-gray-400 bg-white rounded-3xl shadow-md border border-gray-100">
        <img src="/img/kucingtidur.png" class="w-32 mx-auto opacity-40 mb-4" />
        <p class="font-medium text-lg text-gray-600">Hore! Tidak ada tugas baru.</p>
        <p class="text-base text-gray-500">Waktunya istirahat atau cek tab Selesai. ☕</p>
      </div>

    </div>

  </div>
</template>