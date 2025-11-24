<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http'; 

const catFacts = ref([]);
const isLoading = ref(true);

async function fetchFacts() {
  try {
    isLoading.value = true;
    const response = await apiClient.get('/community/facts');
    catFacts.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil fakta kucing:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchFacts();
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
      
      <h1 class="text-4xl font-bold text-white">Semua Fakta Kucing</h1>
      <p class="text-gray-400 mb-8">Temukan hal-hal menakjubkan tentang sahabat berbulumu.</p>

      <div v-if="isLoading" class="text-center text-white py-10">
        Memuat fakta...
      </div>

      <div v-else-if="catFacts.length === 0" class="text-center text-gray-400 py-10">
        Belum ada fakta kucing yang tersedia.
      </div>

      <div v-else class="flex flex-col gap-5">
        <div v-for="fact in catFacts" :key="fact.id" 
             class="bg-white text-gray-800 rounded-xl p-5 shadow-lg flex items-center gap-5 transition-transform hover:scale-[1.01]">
          
          <img 
            :src="fact.image" 
            :alt="fact.title" 
            class="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0 bg-gray-100"
            @error="$event.target.src='/img/logoFaktaKucing.png'"
          >
          
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ fact.title }}</h2>
            <p class="text-gray-700 mt-1 text-sm md:text-base leading-relaxed">
                {{ fact.fact }}
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>