<template>
  <router-link 
    :to="`/adopsi/${cat.id}`" 
    class="block no-underline text-inherit h-full"
  >
    <div class="bg-white rounded-[35px] p-4 pb-6 shadow-[0_5px_20px_rgba(0,0,0,0.08)] flex flex-col h-full transition-transform duration-300 hover:-translate-y-2">
      
      <div class="mb-4">
        <img 
          :src="resolveImageUrl(cat.image || cat.photo)"
          :alt="cat.name" 
          class="w-full h-56 object-cover rounded-[25px] shadow-sm"
        >
      </div>

      <div class="px-2 mb-6 flex justify-between items-start">
        
        <div class="text-gray-900 space-y-1">
          <div class="text-lg">
            <span class="font-bold">Nama:</span> {{ cat.name }}
          </div>
          <div class="text-lg">
            <span class="font-bold">Jenis Kelamin:</span> {{ cat.gender === 'male' ? 'Jantan' : 'Betina' }}
          </div>
        </div>

        <button 
          @click.stop.prevent="toggleFavorite" 
          class="w-10 h-10 flex justify-center items-start cursor-pointer transition-transform active:scale-90 hover:scale-110 -mt-1 -mr-2"
          aria-label="Toggle Favorite"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            stroke-width="2" 
            stroke="currentColor" 
            class="w-8 h-8 transition-all duration-300"
            :class="cat.isFavorited ? 'fill-[#D32F2F] stroke-[#D32F2F]' : 'fill-transparent stroke-[#D32F2F]'"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </button>

      </div>

      <div class="mt-auto px-2">
        <div class="w-full py-3 bg-[#EBCD5E] text-white text-center font-bold text-lg rounded-full shadow-md transition-colors hover:bg-[#e0c355]">
          Rincian
        </div>
      </div>

    </div>
  </router-link>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import axios from 'axios';

const props = defineProps({
  cat: { type: Object, required: true }
});

function resolveImageUrl(imageName) {
    if (!imageName) return '/img/NULL.JPG'; // Gambar default local jika null
    if (imageName.startsWith('http')) return imageName; // Jika URL external
    
    // Arahkan ke folder backend public/img/cats
    return `http://localhost:3000/public/img/cats/${imageName}`;
}

async function toggleFavorite() {
  // 1. Ambil token (Asumsi kamu simpan token di localStorage saat login)
  const token = localStorage.getItem('userToken'); 
  console.log("=== MULAI DEBUG FAVORITE ===");
  console.log("1. Nama Key di LocalStorage: 'userToken'");
  console.log("2. Isi Token:", token); // Kalau ini null, berarti salah nama key
  if (!token) {
    alert("Silakan login dulu untuk menyukai kucing ini!");
    return;
  }

  // 2. Simpan status lama buat jaga-jaga kalau error (Backup)
  const previousStatus = props.cat.isFavorited;

  // 3. Optimistic Update: Ubah tampilan DULUAN biar terasa cepat (UX bagus)
  // Vue 3 Reactivity: Mengubah property di dalam object prop akan merender ulang UI
  props.cat.isFavorited = !props.cat.isFavorited;

  try {
    // 4. Panggil API Backend
    // Sesuaikan URL dengan backendmu
    const url = `http://localhost:3000/api/v1/cats/${props.cat.id}/favorite`;
    console.log("3. Mengirim request ke:", url);
    const response = await axios.post(url, {}, {
      headers: {
        // 3. Format Header harus pas: "Bearer <spasi> token"
        Authorization: `Bearer ${token}` 
      }
    });
    console.log("4. Sukses!", response.data);
    // 5. Sinkronisasi akhir (Opsional, untuk memastikan data sama persis dengan DB)
    // Backend harus return { isFavorited: true/false }
    if (response.data.isFavorited !== undefined) {
      props.cat.isFavorited = response.data.isFavorited;
    }

  } catch (error) {
    console.error("Gagal like:", error);
    // 6. Kalau Error, kembalikan status ke semula (Rollback)
    props.cat.isFavorited = previousStatus;
    alert("Gagal memproses favorite.");
  }
}

</script>