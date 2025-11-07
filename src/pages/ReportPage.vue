<template>
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
          
          <div v-if="activeReportType === 'missing'">
            <label for="ownerName" class="block text-xl font-bold text-[#1F1F1F] mb-4">Nama Pemilik</label>
            <input 
              type="text" 
              id="ownerName" 
              v-model="reportForm.ownerName" 
              required
              placeholder="Masukkan nama pemilik"
              class="w-full p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg"
            >
          </div>

          <div>
            <label for="location" class="block text-xl font-bold text-[#1F1F1F] mb-4">Lokasi</label>
            <div class="flex gap-4">
              <div class="w-36 h-36 flex-none bg-gray-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm relative">
                 <img src="../assets/img/maps.png" alt="Peta Lokasi" class="w-full h-full object-cover opacity-70">
                 <img src="../assets/img/map.png" alt="Lokasi Saat Ini" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
              </div>
              <textarea 
                id="location" 
                v-model="reportForm.location" 
                required 
                rows="4" 
                placeholder="Masukkan alamat lengkap..."
                class="flex-grow p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg resize-none"
              ></textarea>
            </div>
          </div>

          <div>
            <label for="description" class="block text-xl font-bold text-[#1F1F1F] mb-4">Deskripsi</label>
            <textarea 
              id="description" 
              v-model="reportForm.description" 
              required 
              rows="4"
              placeholder="Jelaskan ciri-ciri kucing, kondisi, dll."
              class="w-full p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg resize-none"
            ></textarea>
          </div>

          <div>
            <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Foto</label>
            <div 
              @click="triggerFileInput"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              :class="{ 'border-[#EBCD5E] bg-gray-100': isDragging }"
              class="bg-gray-200 rounded-2xl p-12 text-center cursor-pointer border-2 border-dashed border-gray-400 transition-all duration-300 group hover:border-[#EBCD5E]"
            >
              <p class="text-2xl font-semibold text-gray-500 mb-4 group-hover:text-gray-700 transition">Drag & Drop files here</p>
              <p class="text-xl text-gray-400 mb-6">or</p>
              
              <input 
                type="file" 
                ref="fileInput" 
                class="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                @change="handleFileChange"
              >
              
              <button type="button" class="bg-transparent border-2 border-[#3A5F50] text-[#3A5F50] font-bold py-3 px-10 rounded-xl transition-all group-hover:bg-[#3A5F50] group-hover:text-white pointer-events-none">
                Browse File
              </button>
              
              <p v-if="reportForm.file" class="mt-6 text-[#3A5F50] font-medium text-lg break-all">
                File terpilih: {{ reportForm.file.name }}
              </p>
            </div>
          </div>

          <div class="pt-8 text-center">
            <button type="submit" class="inline-block bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-24 rounded-full shadow-[0_6px_20px_rgba(235,205,94,0.4)] transition-transform hover:-translate-y-1 active:scale-95 border-none cursor-pointer">
              Selesai
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import LoginOverlay from '../components/LoginOverlay.vue';

const activeReportType = ref('stray'); 
const isDragging = ref(false);
const fileInput = ref(null);

const props = defineProps({
  isLoggedInProp: Boolean
});

const reportForm = reactive({
  ownerName: '',
  location: '',
  description: '',
  file: null,
});

function setActiveReportType(type) {
  activeReportType.value = type;
  if (type === 'stray') reportForm.ownerName = '';
}

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) reportForm.file = file;
}

function handleDragOver() {
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) reportForm.file = file;
}

function submitReport() {
  alert(`Laporan berhasil dikirim!`);
}
</script>

<style scoped>
</style>