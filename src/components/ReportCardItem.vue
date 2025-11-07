<template>
  <!-- Card Laporan Masuk (Shelter View) -->
  <div 
    class="bg-white p-4 rounded-xl shadow-md transition-all duration-300"
    :class="{ 'shadow-lg': isOpen }"
  >
    <!-- Header/Tombol Toggle -->
    <div class="flex items-center justify-between cursor-pointer" @click="toggleDetails">
      
      <!-- Kiri: Foto Pelapor, Nama Pelapor & Tipe Laporan -->
      <div class="flex items-center flex-grow min-w-0">
        <img :src="report.reporter.profilePic" :alt="'Foto ' + report.reporter.name" class="w-12 h-12 rounded-full object-cover mr-4 shrink-0">
        <div class="min-w-0 flex-grow pr-4">
          <p class="font-semibold text-gray-800 text-base md:text-lg truncate">
            {{ report.reporter.name }} Melapor Kucing {{ report.type === 'stray' ? 'Liar' : 'Hilang' }}
          </p>
          <!-- Tanggal Mobile (Di bawah nama) -->
          <p class="text-xs text-gray-500 block md:hidden mt-0.5">{{ report.date }} WIB</p>
        </div>
      </div>

      <!-- Kanan: Tanggal Desktop & Ikon Toggle -->
      <div class="flex items-center shrink-0 ml-auto text-right space-x-3">
        <!-- Tanggal Desktop -->
        <p class="text-sm text-gray-500 font-medium whitespace-nowrap hidden md:block">{{ report.date }} WIB</p>
        
        <!-- Ikon Toggle -->
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          class="h-5 w-5 text-gray-600 transition-transform duration-300 shrink-0"
          :class="{ 'rotate-180': isOpen }" 
        >
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <!-- Detail Laporan (Konten yang bisa di-toggle) -->
    <div v-show="isOpen" class="pt-4 mt-4 border-t border-gray-200 space-y-4">
      
      <!-- Nama Pemilik (Hanya untuk Kucing Hilang) -->
      <div v-if="report.type === 'missing'">
        <h3 class="text-sm font-bold text-gray-800 mb-1">Nama Pemilik</h3>
        <div class="bg-gray-100 p-3 rounded-lg text-gray-700 text-sm md:text-base">{{ report.ownerName }}</div>
      </div>
      
      <!-- Lokasi -->
      <div>
        <h3 class="text-sm font-bold text-gray-800 mb-1">Lokasi</h3>
        <div class="bg-gray-100 p-3 rounded-lg text-gray-700 text-sm md:text-base">{{ report.location }}</div>
      </div>

      <!-- Deskripsi -->
      <div>
        <h3 class="text-sm font-bold text-gray-800 mb-1">Deskripsi</h3>
        <div class="bg-gray-100 p-3 rounded-lg text-gray-700 text-sm md:text-base">{{ report.description }}</div>
      </div>
      
      <!-- Foto Laporan -->
      <div>
        <h3 class="text-sm font-bold text-gray-800 mb-2">Foto</h3>
        <img :src="report.photoUrl" alt="Foto Kucing Dilaporkan" class="w-full max-w-sm rounded-lg shadow-md object-cover">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    report: {
        type: Object,
        required: true,
        default: () => ({
            id: 0,
            type: 'stray', // 'stray' atau 'missing'
            date: '0000/00/00 00.00',
            ownerName: 'N/A',
            location: 'Lokasi tidak diketahui',
            description: 'Deskripsi tidak tersedia',
            photoUrl: 'img/placeholder.png',
            reporter: {
                name: 'Guest',
                profilePic: '/img/profile_default.png',
            }
        })
    }
});

const isOpen = ref(false);

const toggleDetails = () => {
    isOpen.value = !isOpen.value;
};
</script>
