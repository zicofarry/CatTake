<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
    <main class="container">
      <section class="py-10 overflow-hidden">
        <div class="flex flex-col text-center items-center justify-center gap-8 md:flex-row md:text-left">
          
          <div class="md:flex-1">
            <h1 class="text-4xl lg:text-5xl font-bold text-green-700 mb-2">Selamat Datang di Rumah Kucing!</h1>
            <p class="text-lg text-gray-600">Telusuri ribuan kucing yang siap diadopsi dan berikan mereka rumah yang penuh kasih.</p>
          </div>

          <div class="relative w-72 h-72 md:flex-1 flex justify-center items-center">
            <div class="absolute w-80 h-80 bg-green-300 rounded-full z-10 opacity-70"></div>
            <img src="../assets/img/cathelo.png" alt="Kucing di tengah" class="relative w-72 h-72 object-cover rounded-full z-20 shadow-xl">
          </div>

        </div>
      </section>

      <section class="my-10 px-4">
        <div class="flex flex-col gap-4 bg-gray-50 p-4 rounded-2xl max-w-3xl mx-auto md:flex-row md:gap-4 md:p-6 md:max-w-full">
          
          <button 
            class="filter-btn py-3 px-4 border-2 border-green-700 bg-white text-green-700 font-semibold rounded-2xl cursor-pointer transition duration-200 w-full md:w-auto md:flex-grow" 
            :class="{ 'bg-green-700 text-white': activeFilter === 'all' }"
            @click="setActiveFilter('all')"
          >
            Semua
          </button>

          <button 
            class="filter-btn py-3 px-4 border-2 border-green-700 bg-white text-green-700 font-semibold rounded-2xl cursor-pointer transition duration-200 w-full md:w-auto md:flex-grow" 
            :class="{ 'bg-green-700 text-white': activeFilter === 'favorite' }"
            @click="setActiveFilter('favorite')"
          >
            Favorit ({{ favoriteCatsCount }})
          </button>

          <select 
            class="w-full py-3 px-4 border border-gray-300 rounded-2xl bg-white text-base cursor-pointer md:w-auto md:flex-grow"
            :value="genderFilter"
            @change="setGenderFilter($event.target.value)"
          >
            <option value="all">Filter Gender</option>
            <option value="male">Jantan</option>
            <option value="female">Betina</option>
          </select>
        </div>
      </section>

      <section class="cat-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
        <div v-if="filteredCats.length === 0" class="col-span-full text-center py-12 text-lg text-gray-600">
            <p>Tidak ada kucing yang cocok dengan filter Anda.</p>
        </div>

        <CatCard 
          v-for="cat in filteredCats" 
          :key="cat.id" 
          :cat="cat"
          @toggle-favorite="handleToggleFavorite"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CatCard from '../components/CatCard.vue';

// ... (Logika JS Anda tetap sama) ...
const catData = ref([
  { id: 1, name: 'Oyen', shelter: 'CatHouse', gender: 'male', age: '1 Tahun', image: 'oyencat.png', isFavorite: false },
  { id: 2, name: 'Abul', shelter: 'PawCare', gender: 'female', age: '5 Bulan', image: 'minicat.png', isFavorite: true },
  { id: 3, name: 'Simba', shelter: 'Meow Haven', gender: 'male', age: '2 Tahun', image: 'bradercat.png', isFavorite: false },
  { id: 4, name: 'Mueza', shelter: 'CatHouse', gender: 'female', age: '8 Bulan', image: 'mochacat.png', isFavorite: false },
  { id: 5, name: 'Kitty', shelter: 'PawCare', gender: 'female', age: '3 Tahun', image: 'kucing-5.png', isFavorite: false },
]);

const activeFilter = ref('all'); 
const genderFilter = ref('all');

function setActiveFilter(filter) {
  activeFilter.value = filter;
  genderFilter.value = 'all'; 
}

function setGenderFilter(gender) {
    if (gender !== 'all') {
        activeFilter.value = 'gender';
        genderFilter.value = gender;
    } else {
        setActiveFilter('all');
    }
}

function handleToggleFavorite(catId) {
  const cat = catData.value.find(c => c.id === catId);
  if (cat) {
    cat.isFavorite = !cat.isFavorite;
  }
}

const favoriteCatsCount = computed(() => {
  return catData.value.filter(cat => cat.isFavorite).length;
});

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
/* CSS Lama Dihapus */
</style>