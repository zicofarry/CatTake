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
    if (!path || path.includes('NULL')) return '/img/kucingtidur.png';
    if (path.startsWith('http')) return path;
    return `http://localhost:3000${path}`; 
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