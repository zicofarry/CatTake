<script setup>
// 1. Import computed dan onMounted yang sebelumnya hilang
import { ref, computed, onMounted } from 'vue'; 
import { useRouter } from 'vue-router';
import apiClient from '@/api/http'; // 2. Import apiClient agar bisa fetch data

const router = useRouter();
const activeTab = ref('proses'); 
const tasks = ref([]);
const isLoading = ref(false);

// === 1. FETCH DATA DARI API ===
const fetchDriverTasks = async () => {
  isLoading.value = true;
  try {
    // Pastikan URL ini sesuai dengan backend (/api/v1/rescue/driver-tasks)
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
    // Jangan alert agar tidak mengganggu UX saat reload
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
  
  // Sesuaikan path agar mengarah ke backend public folder
  return `http://localhost:3000${path}`;
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
    
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-[#3E3E3E] mb-2">Halo, Driver! 🚚</h1>
      <p class="text-[#888]">Pantau tugas penyelamatanmu di sini.</p>
    </div>

    <div class="flex gap-4 border-b border-gray-200 mb-6">
      <button 
        @click="activeTab = 'proses'"
        :class="['pb-2 px-6 transition-colors', activeTab === 'proses' ? 'border-b-2 border-[#FF862F] text-[#FF862F] font-bold' : 'text-gray-400 hover:text-gray-600']"
      >
        Berlangsung
      </button>
      <button 
        @click="activeTab = 'selesai'"
        :class="['pb-2 px-6 transition-colors', activeTab === 'selesai' ? 'border-b-2 border-[#FF862F] text-[#FF862F] font-bold' : 'text-gray-400 hover:text-gray-600']"
      >
        Selesai
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500">Memuat data tugas...</p>
    </div>

    <div v-else class="space-y-4">
      
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
        @click="goToDetail(task.id)"
      >
        <div class="flex gap-4">
          <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
            <img :src="task.img" alt="Cat" class="w-full h-full object-cover">
          </div>

          <div class="flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-1">
                <span :class="[
                  'text-xs font-bold px-2 py-1 rounded-full',
                  task.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                ]">
                  {{ task.status === 'completed' ? 'Selesai' : 'Dalam Proses' }}
                </span>
                <span class="text-xs text-gray-400">{{ task.date }}</span>
              </div>
              
              <h3 class="font-bold text-[#3E3E3E] text-lg line-clamp-1">{{ task.catName }}</h3>
              <p class="text-sm text-gray-500 flex items-center gap-1 mt-1 line-clamp-1">
                📍 {{ task.location }}
              </p>
            </div>
            
            <div class="flex justify-between items-center mt-3">
              <span class="text-xs text-gray-400 italic">Ketuk untuk detail</span>
              
              <button class="text-sm bg-[#FF862F] text-white px-4 py-2 rounded-full font-medium hover:bg-[#e07528] shadow-sm">
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTasks.length === 0" class="text-center py-12 text-gray-400">
        <img src="/img/kucingtidur.png" class="w-32 mx-auto opacity-50 mb-4 grayscale" />
        <p class="font-medium">Tidak ada tugas di tab ini.</p>
        <p class="text-sm">Istirahat dulu sejenak! ☕</p>
      </div>

    </div>

  </div>
</template>