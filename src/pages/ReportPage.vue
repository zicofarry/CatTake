<template>
<<<<<<< Updated upstream
  <div class="min-h-screen bg-gray-100">
    <main>
      <div class="text-center pt-8 pb-4">
        <h1 class="text-5xl font-bold text-gray-800">Lapor Kucing!</h1>
      </div>

      <ReportTypeButtons v-model="reportType" />

      <section class="p-4 md:p-8">
        <form 
          id="report-form" 
          @submit.prevent="submitReport"
          class="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-3xl mx-auto"
        >
=======
  <div class="min-h-screen bg-gray-50 font-sans overflow-x-hidden pt-20 pb-32 relative">
    
    <div class="relative w-full h-[400px] overflow-visible bg-[#A0C8B1] z-0">
        <div class="absolute inset-0 bg-gradient-to-r from-[#A0C8B1] to-[#60997E] opacity-90 overflow-hidden"></div>
        
        <div class="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-center justify-center gap-12">
            <div class="flex-shrink-0">
               <h1 class="text-6xl md:text-7xl font-bold text-[#1F1F1F] drop-shadow-sm leading-tight">
                  Lapor<br>Kucing!
               </h1>
            </div>
            <div class="h-full flex items-end">
                <img 
                  src="../assets/img/tigakucing.png" 
                  alt="Tiga Kucing" 
                  class="h-[85%] md:h-[135%] w-auto object-contain object-bottom md:translate-y-16"
                >
            </div>
        </div>
    </div>

    <div class="max-w-4xl mx-auto px-6 relative z-10 mt-12 md:mt-32">
      
      
      <div class="flex flex-wrap justify-center gap-6 mb-12">
        <div class="bg-gray-200/80 backdrop-blur-sm p-3 rounded-[30px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
          <button 
          @click="setActiveReportType('stray')"
          class="min-w-[200px] py-4 px-8 rounded-[25px] font-bold text-xl transition-all duration-300"
          :class="activeReportType === 'stray' ? 'bg-[#EBCD5E] text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-white/50'"
          >
          Kucing Liar
        </button>
      </div>
      <div class="bg-gray-200/80 backdrop-blur-sm p-3 rounded-[30px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
        <button 
        @click="setActiveReportType('missing')"
        class="min-w-[200px] py-4 px-8 rounded-[25px] font-bold text-xl transition-all duration-300"
        :class="activeReportType === 'missing' ? 'bg-[#E9B92F] text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-white/50'"
        >
              Kucing Hilang
            </button>
          </div>
        </div>
        
        <div class="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl relative z-20">
          
          <LoginOverlay 
            :isLoggedIn="isLoggedInProp" 
            message="Kamu perlu login dulu sebelum melaporkan kucing." 
            buttonText="Login Sekarang" 
            loginRoute="/login"
          />
          
          <form @submit.prevent="submitReport" class="space-y-8">
>>>>>>> Stashed changes
          
          <div class="mb-6" v-if="reportType === 'lost'">
            <label for="owner-name" class="block font-semibold mb-2">Nama Pemilik</label>
            <input type="text" id="owner-name" name="owner-name" placeholder="Masukkan nama Anda"
                   class="w-full p-4 border-none bg-gray-100 rounded-xl font-sans text-base">
          </div>
          
          <div class="mb-6">
            <label for="location" class="block font-semibold mb-2">Lokasi</label>
            <div class="flex items-center bg-gray-100 rounded-xl">
              <div class="p-4 bg-gray-300 rounded-l-xl">
                <i class="fas fa-map-marker-alt text-gray-700"></i>
              </div>
              <input type="text" id="location" name="location" placeholder="Masukkan lokasi atau alamat"
                     class="flex-grow p-4 border-none bg-transparent rounded-r-xl font-sans text-base">
            </div>
          </div>

          <div class="mb-6">
            <label for="description" class="block font-semibold mb-2">Deskripsi</label>
            <textarea id="description" name="description" rows="4" placeholder="Ciri-ciri kucing, kondisi, dll."
                      class="w-full p-4 border-none bg-gray-100 rounded-xl font-sans text-base"></textarea>
          </div>

          <div class="mb-6">
            <label for="photo" class="block font-semibold mb-2">Foto</label>
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-100">
              <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
              <p class="mt-2 mb-1 font-semibold">Drag & Drop file di sini</p>
              <span class="text-gray-500 mb-4 block">atau</span>
              <label for="file-input" class="inline-block border border-green-800 text-green-800 py-2 px-4 rounded-lg cursor-pointer hover:bg-green-100 transition duration-200">Pilih File</label>
              <input type="file" id="file-input" hidden multiple>
            </div>
          </div>

          <button type="submit" 
            class="w-full p-4 text-xl font-bold bg-yellow-500 hover:bg-yellow-600 text-gray-800 border-none rounded-xl cursor-pointer mt-4 shadow-md transition duration-200"
          >
            Selesai
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
<<<<<<< Updated upstream
import { ref } from 'vue';
import ReportTypeButtons from '../components/ReportTypeButtons.vue';
=======
import { ref, reactive } from 'vue';
import LoginOverlay from '../components/LoginOverlay.vue';

const props = defineProps({
  isLoggedInProp: Boolean
});
>>>>>>> Stashed changes

const reportType = ref('stray'); 

function submitReport() {
  alert(`Laporan ${reportType.value === 'stray' ? 'Kucing Liar' : 'Kucing Hilang'} berhasil diajukan!`);
}
</script>

<style scoped>
/* CSS Lama Dihapus */
</style>