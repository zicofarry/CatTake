<template>
  <div class="min-h-screen bg-white font-sans overflow-x-hidden">
    
    <div class="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-40 md:pb-48">
      <div class="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">
        <div class="relative w-full md:w-1/2 flex justify-center md:justify-start mt-10 md:mt-0">
          <div class="absolute bg-[#3A5F50] w-[115%] h-[115%] md:w-[125%] md:h-[125%] -left-[5%] -top-[5%] md:-left-[10%] md:-top-[10%] rounded-[48%_52%_68%_32%/60%_45%_55%_40%] rotate-[-8deg] -z-10 opacity-95"></div>
          <img src="../assets/img/cathelo.png" alt="Kucing" class="relative z-10 max-w-[280px] md:max-w-sm lg:max-w-md object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500">
        </div>
        <div class="w-full md:w-1/2 text-left space-y-6 pl-0 md:pl-8">
          <h1 class="text-5xl md:text-6xl lg:text-[5rem] font-serif font-bold text-[#1F1F1F] leading-[1.1] tracking-tight">
            Berikan Rumah,<br>
            Dapatkan Cinta.
          </h1>
          <p class="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed font-medium">
            Mari bersama menciptakan cerita baru bagi mereka, dari kesepian menuju rumah yang hangat dan penuh cinta.
          </p>
          <div class="pt-6">
            <button class="bg-[#EBCD5E] hover:bg-[#e0c355] text-white font-bold text-lg px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(235,205,94,1)] transition-all hover:-translate-y-1 active:scale-95">
              Adopsi Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="relative mt-10 z-10">
        
        <div class="absolute left-0 right-0 -top-8 z-30 px-4 pointer-events-none">
            <div class="max-w-3xl mx-auto flex flex-wrap justify-center items-center gap-4 p-4 pointer-events-auto">
            
            <button 
                class="flex-1 min-w-[120px] py-3 px-6 bg-white text-gray-800 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-1"
                :class="activeFilter === 'all' && genderFilter === 'all' ? '!bg-[#EBCD5E] !text-white shadow-[0_15px_30px_-5px_rgba(235,205,94,0.6)]' : 'shadow-[0_15px_35px_-10px_rgba(58,95,80,0.5)]'"
                @click="setActiveFilter('all')"
            >
                Semua
            </button>

            <div class="flex-1 min-w-[140px] relative group">
                <select 
                    class="w-full appearance-none py-3 pl-6 pr-10 bg-white text-gray-800 font-bold text-base rounded-full cursor-pointer focus:outline-none transition-all duration-300 hover:-translate-y-1 text-left"
                    :class="activeFilter === 'gender' ? '!bg-[#EBCD5E] !text-white shadow-[0_15px_30px_-5px_rgba(235,205,94,0.6)]' : 'shadow-[0_15px_35px_-10px_rgba(58,95,80,0.5)]'"
                    :value="genderFilter"
                    @change="setGenderFilter($event.target.value)"
                >
                    <option value="all" class="text-gray-800 bg-white py-2">Filter</option>
                    <option value="male" class="text-gray-800 bg-white py-2">Jantan</option>
                    <option value="female" class="text-gray-800 bg-white py-2">Betina</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center" :class="activeFilter === 'gender' ? 'text-white' : 'text-gray-800'">
                  <i class="fas fa-caret-down"></i>
                </div>
            </div>

            <button 
                class="flex-1 min-w-[120px] py-3 px-6 bg-white text-gray-800 font-bold text-base rounded-full transition-all duration-300 hover:-translate-y-1"
                :class="activeFilter === 'favorite' ? '!bg-[#EBCD5E] !text-white shadow-[0_15px_30px_-5px_rgba(235,205,94,0.6)]' : 'shadow-[0_15px_35px_-10px_rgba(58,95,80,0.5)]'"
                @click="setActiveFilter('favorite')"
            >
                Favorit 
                <span v-if="favoriteCatsCount > 0" class="ml-1">({{ favoriteCatsCount }})</span>
            </button>

            </div>
        </div>

        <div class="bg-[#3A5F50] pt-36 pb-28 px-6 rounded-t-[50px] md:rounded-t-[80px] min-h-[700px]">
            <div class="max-w-6xl mx-auto">
                
                <transition name="fade" mode="out-in">
                  
                  <div v-if="filteredCats.length === 0" class="flex flex-col items-center justify-center py-32 text-white/80 text-center">
                      <i class="fas fa-cat text-7xl mb-4 opacity-60"></i>
                      <h3 class="text-2xl font-bold">Tidak ditemukan</h3>
                      <button @click="setActiveFilter('all')" class="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">Reset Filter</button>
                  </div>
                
                  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                       <div v-for="cat in filteredCats" :key="cat.id" class="h-full">
                          <CatCard :cat="cat" @toggle-favorite="handleToggleFavorite" />
                       </div>
                  </div>

                </transition>

            </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CatCard from '../components/CatCard.vue';

// --- DATA ---
const catData = ref([
  { id: 1, name: 'Oyen', shelter: 'CatHouse', gender: 'male', age: '1 Tahun', image: 'oyencat.png', isFavorite: false },
  { id: 2, name: 'Abul', shelter: 'PawCare', gender: 'male', age: '5 Bulan', image: 'minicat.png', isFavorite: false },
  { id: 3, name: 'Simba', shelter: 'Meow Haven', gender: 'male', age: '2 Tahun', image: 'bradercat.png', isFavorite: false },
  { id: 4, name: 'Mueza', shelter: 'CatHouse', gender: 'female', age: '8 Bulan', image: 'mochacat.png', isFavorite: false },
  { id: 5, name: 'Kitty', shelter: 'PawCare', gender: 'female', age: '3 Tahun', image: 'kucing-5.png', isFavorite: false },
]);

// --- STATE FILTER ---
const activeFilter = ref('all'); 
const genderFilter = ref('all');

// --- METHODS ---
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
    cat.isFavorite = !cat.isFavorite;
  }
}

// --- COMPUTED ---
const favoriteCatsCount = computed(() => catData.value.filter(cat => cat.isFavorite).length);

const filteredCats = computed(() => {
  let list = catData.value;
  if (activeFilter.value === 'favorite') {
    list = list.filter(cat => cat.isFavorite);
  } else if (activeFilter.value === 'gender' && genderFilter.value !== 'all') {
    list = list.filter(cat => cat.gender === genderFilter.value);
  }
  return list;
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>