<script setup>
import { ref } from 'vue';

// Data dummy untuk fakta kucing
// Kita asumsikan gambar ini ada di folder /public/img/
const catFacts = ref([
  {
    id: 1,
    title: 'Tukang Tidur',
    fact: 'Kucing domestik tidur rata-rata 12-16 jam per hari untuk menghemat energi, sama seperti leluhur liar mereka.',
    image: '/img/kucingtidur.png' // Gambar dari public/img
  },
  {
    id: 2,
    title: 'Pendengaran Super',
    fact: 'Kucing memiliki 32 otot di setiap telinga, memungkinkan mereka memutar telinga 180 derajat dan mendengar frekuensi yang jauh lebih tinggi daripada manusia.',
    image: '/img/logoFaktaKucing.png' // Gambar dari public/img
  },
  {
    id: 3,
    title: 'Sidik Jari Hidung',
    fact: 'Setiap kucing memiliki sidik hidung (nose print) yang unik, mirip seperti sidik jari pada manusia.',
    image: '/img/kucingtidur.png' // (Kita gunakan gambar yang ada)
  },
  {
    id: 4,
    title: 'Tidak Suka Manis',
    fact: 'Kucing adalah salah satu dari sedikit mamalia yang tidak bisa merasakan rasa manis. Lidah mereka tidak memiliki reseptor untuk itu.',
    image: '/img/logoFaktaKucing.png' // (Kita gunakan gambar yang ada)
  },
  {
    id: 5,
    title: 'Getaran Penyembuh',
    fact: 'Dengkuran (purring) kucing bergetar pada frekuensi 25-150 Hz, yang dipercaya dapat membantu menyembuhkan tulang dan otot mereka sendiri.',
    image: '/img/kucingtidur.png' // (Kita gunakan gambar yang ada)
  },
])
</script>

<template>
  <div class="bg-[#2c473c] min-h-screen p-5 md:p-10 font-sans"

    style="
        background-image: url('/img/background.png');
        background-size: 360px; /* ubah ukuran pola */
    ">
    
    <router-link 
      to="/komunitas" 
      class="inline-block bg-[#2D4A45] text-white font-semibold py-2 px-4 rounded-lg mb-6 hover:bg-[#4a6d68] transition-colors">
      &lt; Kembali
    </router-link>

    <div class="max-w-3xl mx-auto">
      
      <h1 class="text-4xl font-bold text-white">Semua Fakta Kucing</h1>
      <p class="text-gray-400 mb-8">Temukan hal-hal menakjubkan tentang sahabat berbulumu.</p>

      <div class="flex flex-col gap-5">
        
        <div v-for="fact in catFacts" :key="fact.id" 
             class="bg-white text-gray-800 rounded-xl p-5 shadow-lg flex items-center gap-5">
          
          <img :src="fact.image" alt="Fakta Kucing" class="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0">
          
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ fact.title }}</h2>
            <p class="text-gray-700 mt-1">{{ fact.fact }}</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>