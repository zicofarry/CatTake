<template>
  <!-- Wrapper Utama: Background Hijau (Desktop) / Putih (Mobile partial) -->
  <div class="min-h-screen bg-gray-50 md:bg-[#3A5F50] font-sans pt-20 pb-20">
    
    <!-- Tampilan Desktop: Judul di Tengah -->
    <div class="hidden md:flex justify-center mb-8">
        <div class="bg-white py-3 px-16 rounded-full shadow-lg">
            <h1 class="text-3xl font-bold text-[#1F1F1F]">Driver</h1>
        </div>
    </div>

    <!-- === KONTEN UTAMA (KARTU PUTIH) === -->
    <div class="max-w-5xl mx-auto px-0 md:px-6">
      <div class="bg-white w-full min-h-[600px] md:rounded-[40px] p-6 md:p-12 shadow-none md:shadow-2xl relative">
        
        <!-- Tombol Tambah Driver -->
        <button class="bg-[#EBCD5E] hover:bg-[#dcb945] text-white text-lg font-bold py-3 px-8 rounded-full shadow-md mb-8 transition-transform hover:-translate-y-0.5 flex items-center gap-2">
           <span>+</span> Tambahkan Driver
        </button>

        <!-- LIST DRIVER (Scrollable Area) -->
        <div class="space-y-4 pr-2 md:pr-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            
            <!-- LOOPING DATA DRIVER -->
            <div 
              v-for="driver in drivers" 
              :key="driver.id"
              class="bg-gray-200/80 rounded-2xl overflow-hidden transition-all duration-300 border border-transparent hover:border-gray-300"
            >
                <!-- Header Accordion (Selalu Muncul) -->
                <div 
                  @click="toggleDriver(driver.id)"
                  class="p-4 md:p-5 flex items-center justify-between cursor-pointer"
                >
                    <div class="flex items-center gap-4">
                        <!-- Avatar Inisial (Lingkaran) -->
                        <div 
                          class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm overflow-hidden"
                          :class="getAvatarColor(driver.id)"
                        >
                           <img v-if="driver.avatar" :src="driver.avatar" class="w-full h-full object-cover">
                           <span v-else>{{ driver.name.charAt(0) }}</span>
                        </div>

                        <span class="font-bold text-xl text-[#1F1F1F]">{{ driver.name }}</span>
                    </div>

                    <!-- Icon Panah (Rotate saat aktif) -->
                    <div class="transform transition-transform duration-300" :class="{ 'rotate-180': expandedDriverId === driver.id }">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>

                <!-- Isi Accordion (Muncul saat di-expand) -->
                <div 
                  v-show="expandedDriverId === driver.id"
                  class="px-6 pb-6 pt-0"
                >
                    <div class="space-y-4 mt-2">
                        <!-- Email -->
                        <div>
                            <label class="block text-sm font-bold text-[#1F1F1F] mb-1 ml-1">Email</label>
                            <div class="bg-white w-full p-3 rounded-xl text-gray-700 border border-transparent shadow-sm">
                                {{ driver.email }}
                            </div>
                        </div>

                        <!-- Foto SIM -->
                        <div>
                            <label class="block text-sm font-bold text-[#1F1F1F] mb-1 ml-1">Foto SIM</label>
                            <div class="bg-white w-full h-40 rounded-xl border border-transparent flex items-center justify-center text-gray-400 shadow-sm overflow-hidden">
                                <img v-if="driver.sim" :src="driver.sim" class="w-full h-full object-cover">
                                <span v-else>Tidak ada foto SIM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Scrollbar Track Visual (Hiasan di kanan seperti di desain) -->
        <div class="absolute top-32 right-4 bottom-10 w-2 bg-gray-100 rounded-full hidden md:block pointer-events-none">
            <div class="w-full h-1/3 bg-gray-300 rounded-full"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// DATA DUMMY DRIVER
const drivers = ref([
    { 
      id: 1, 
      name: 'Sapri', 
      email: 'sapri@gmail.com', 
      avatar: null, 
      sim: null 
    },
    { 
      id: 2, 
      name: 'Adit', 
      email: 'aditya@gmail.com', 
      avatar: 'https://placehold.co/100x100/333/FFF?text=A', 
      sim: null 
    },
    { 
      id: 3, 
      name: 'Budi', 
      email: 'budi_driver@yahoo.com', 
      avatar: null, 
      sim: null 
    },
    { 
      id: 4, 
      name: 'Cecep', 
      email: 'cecep.gorbacep@gmail.com', 
      avatar: null, 
      sim: null 
    },
    { 
      id: 5, 
      name: 'Dedi', 
      email: 'dedi.kurniawan@gmail.com', 
      avatar: null, 
      sim: null 
    },
]);

// STATE ACCORDION
const expandedDriverId = ref(2); // Default Adit terbuka sesuai gambar

function toggleDriver(id) {
    if (expandedDriverId.value === id) {
        expandedDriverId.value = null; // Tutup jika diklik lagi
    } else {
        expandedDriverId.value = id; // Buka yang baru
    }
}

function getAvatarColor(id) {
    // Ganti warna background avatar beda-beda dikit biar variasi
    const colors = ['bg-[#60997E]', 'bg-[#4E7C68]', 'bg-[#3A5F50]', 'bg-[#88B09B]'];
    return colors[id % colors.length];
}
</script>

<style scoped>
/* Custom Scrollbar agar mirip desain */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #D1D5DB; /* gray-300 */
  border-radius: 20px;
  border: 3px solid transparent;
  background-clip: content-box;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #9CA3AF;
}
</style>
