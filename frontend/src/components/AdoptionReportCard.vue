<template>
  <!-- Card Laporan Adopsi -->
  <div 
    class="bg-gray-200 p-4 rounded-xl shadow-md transition-all duration-300"
    :class="{ 'shadow-lg': isOpen }"
  >
    <div class="flex items-center justify-between cursor-pointer" @click="toggleDetails">
      
      <!-- Kiri: Foto Pengadopsi, Nama Kucing & Pengadopsi -->
      <div class="flex items-center flex-grow min-w-0">
        <img :src="report.adopter.profilePic" :alt="'Foto ' + report.adopter.name" class="w-12 h-12 rounded-full object-cover mr-4 shrink-0">
        <div class="min-w-0 flex-grow pr-4">
          <p class="font-semibold text-gray-800 text-base md:text-lg truncate">
            {{ report.catName }} telah diadopsi oleh {{ report.adopter.name }}
          </p>
          <!-- Tanggal Mobile -->
          <p class="text-xs text-gray-500 block md:hidden">{{ report.date }} WIB</p>
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
    
    <!-- Detail Pengadopsi (Konten yang bisa di-toggle) -->
    <div v-show="isOpen" class="pt-4 mt-4 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-gray-700 text-sm">
        <div class="col-span-1">
          <p><span class="font-bold">Nama:</span> {{ report.adopter.name }}</p>
          <p><span class="font-bold">NIK:</span> {{ report.adopter.nik }}</p>
          <p><span class="font-bold">No.HP:</span> {{ report.adopter.phone }}</p>
          <p><span class="font-bold">Email:</span> {{ report.adopter.email }}</p>
          <p><span class="font-bold">Pekerjaan:</span> {{ report.adopter.job }}</p>
        </div>
        <div class="col-span-1 mt-3 md:mt-0">
          <p><span class="font-bold">Alamat:</span> {{ report.adopter.address }}</p>
        </div>
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
            catName: 'Kucing A',
            date: '0000/00/00 00.00',
            adopter: {
                name: 'Anonim',
                profilePic: '/assets/img/profile_default.png',
                nik: 'XXX-XXX-XXX',
                phone: '08X-XXX-XXX',
                email: 'anonim@mail.com',
                job: 'Tidak Diketahui',
                address: 'Alamat Tidak Tersedia.'
            }
        })
    }
});

const isOpen = ref(false);

const toggleDetails = () => {
    isOpen.value = !isOpen.value;
};
</script>
