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
            <button @click="setActiveReportType('stray')" class="min-w-[200px] py-4 px-8 rounded-[25px] font-bold text-xl transition-all duration-300" :class="activeReportType === 'stray' ? 'bg-[#EBCD5E] text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-white/50'">
              Kucing Liar
            </button>
        </div>
        <div class="bg-gray-200/80 backdrop-blur-sm p-3 rounded-[30px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            <button @click="setActiveReportType('missing')" class="min-w-[200px] py-4 px-8 rounded-[25px] font-bold text-xl transition-all duration-300" :class="activeReportType === 'missing' ? 'bg-[#E9B92F] text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-white/50'">
              Kucing Hilang
            </button>
        </div>
      </div>

      <div class="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl relative z-20">
        <form @submit.prevent="submitReport" class="space-y-8">
          
          <div v-if="activeReportType === 'missing'">
            <label for="ownerName" class="block text-xl font-bold text-[#1F1F1F] mb-4">Nama Pemilik (Pelapor)</label>
            <div class="relative">
                <select 
                  id="ownerName" 
                  v-model="reportForm.ownerName" 
                  required
                  class="w-full p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] text-lg appearance-none cursor-pointer"
                >
                  <option value="" disabled selected>Pilih Nama Pemilik</option>
                  <option v-for="owner in dummyOwners" :key="owner.id" :value="owner.name">
                    {{ owner.name }} (ID: {{ owner.id }})
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-6 flex items-center text-gray-600">
                  <i class="fas fa-chevron-down"></i>
                </div>
            </div>
          </div>

          <div>
            <label for="location" class="block text-xl font-bold text-[#1F1F1F] mb-4">Lokasi</label>
            <div class="flex gap-4">
              <div 
                @click="openMapModal"
                class="w-36 h-36 flex-none bg-gray-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm relative cursor-pointer group hover:opacity-90 transition"
                title="Klik untuk buka peta"
              >
                 <img src="../assets/img/maps.png" alt="Peta Lokasi" class="w-full h-full object-cover opacity-70">
                 <img src="../assets/img/map.png" alt="Lokasi Saat Ini" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 group-hover:scale-110 transition-transform">
                 <div class="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1">
                   Buka Peta
                 </div>
              </div>

              <textarea 
                id="location" 
                v-model="reportForm.location" 
                required 
                rows="4" 
                placeholder="Klik peta di samping untuk set lokasi otomatis, atau ketik manual..."
                class="flex-grow p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg resize-none"
              ></textarea>
            </div>
          </div>

          <div>
            <label for="description" class="block text-xl font-bold text-[#1F1F1F] mb-4">Deskripsi</label>
            <textarea id="description" v-model="reportForm.description" required rows="4" placeholder="Jelaskan ciri-ciri kucing..." class="w-full p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg resize-none"></textarea>
          </div>

          <div>
            <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Foto</label>
            <div @click="triggerFileInput" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop" :class="{ 'border-[#EBCD5E] bg-gray-100': isDragging }" class="bg-gray-200 rounded-2xl p-12 text-center cursor-pointer border-2 border-dashed border-gray-400 transition-all duration-300 group hover:border-[#EBCD5E]">
              <p class="text-2xl font-semibold text-gray-500 mb-4 group-hover:text-gray-700 transition">Drag & Drop files here</p>
              <p class="text-xl text-gray-400 mb-6">or</p>
              <input type="file" ref="fileInput" class="hidden" accept="image/png, image/jpeg, image/jpg" @change="handleFileChange">
              <button type="button" class="bg-transparent border-2 border-[#3A5F50] text-[#3A5F50] font-bold py-3 px-10 rounded-xl transition-all group-hover:bg-[#3A5F50] group-hover:text-white pointer-events-none">Browse File</button>
              <p v-if="reportForm.file" class="mt-6 text-[#3A5F50] font-medium text-lg break-all">File terpilih: {{ reportForm.file.name }}</p>
            </div>
          </div>

          <div class="pt-8 text-center">
            <button type="submit" class="inline-block bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-24 rounded-full shadow-[0_6px_20px_rgba(235,205,94,0.4)] transition-transform hover:-translate-y-1 active:scale-95 border-none cursor-pointer">Selesai</button>
          </div>

        </form>
      </div>

    </div>

    <teleport to="body">
      <div v-if="showMapModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-3xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
          <div class="bg-[#3A5F50] p-4 flex justify-between items-center text-white">
            <h3 class="text-xl font-bold">Pilih Lokasi</h3>
            <button @click="closeMapModal" class="text-white hover:text-red-300 transition"><i class="fas fa-times text-2xl"></i></button>
          </div>
          <div id="mapContainer" class="flex-grow w-full relative">
             <div v-if="isLoadingMap" class="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]"><p class="text-gray-500 text-lg animate-pulse">Sedang mencari lokasimu...</p></div>
          </div>
          <div class="p-4 bg-gray-100 text-center">
            <p class="text-gray-600 mb-3 text-sm">Klik pada peta untuk memilih titik lokasi yang tepat.</p>
            <button @click="confirmLocation" class="bg-[#EBCD5E] text-white font-bold py-3 px-12 rounded-full hover:bg-[#dcb945] transition">Pilih Lokasi Ini</button>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const dummyOwners = ref([
    { id: 'OWN001', name: 'Ahmad Supriatna' },
    { id: 'OWN002', name: 'Siti Aminah' },
    { id: 'OWN003', name: 'Budi Santoso' },
    { id: 'OWN004', name: 'Citra Kirana' },
]);

const activeReportType = ref('stray');
const isDragging = ref(false);
const fileInput = ref(null);
const reportForm = reactive({
    ownerName: '',
    location: '',
    description: '',
    file: null,
});

const showMapModal = ref(false);
const isLoadingMap = ref(false);
let map = null;
let marker = null;
const tempLocation = ref('');

function setActiveReportType(type) {
    activeReportType.value = type;
    if (type === 'stray') reportForm.ownerName = '';
}

function triggerFileInput() { fileInput.value.click(); }
function handleFileChange(event) { const file = event.target.files[0]; if (file) reportForm.file = file; }
function handleDragOver() { isDragging.value = true; }
function handleDragLeave() { isDragging.value = false; }
function handleDrop(event) { isDragging.value = false; const file = event.dataTransfer.files[0]; if (file) reportForm.file = file; }

async function openMapModal() {
    showMapModal.value = true;
    isLoadingMap.value = true;
    await nextTick();
    if (!map) {
        map = L.map('mapContainer').setView([-6.2088, 106.8456], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        map.on('click', (e) => { const { lat, lng } = e.latlng; setMarker(lat, lng); });
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (map) { map.setView([latitude, longitude], 16); setMarker(latitude, longitude); }
                isLoadingMap.value = false;
            },
            (error) => { console.error("Gagal ambil lokasi:", error); isLoadingMap.value = false; }
        );
    } else { isLoadingMap.value = false; }
}

function setMarker(lat, lng) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    tempLocation.value = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function confirmLocation() {
    if (tempLocation.value) reportForm.location = tempLocation.value;
    closeMapModal();
}

function closeMapModal() {
    showMapModal.value = false;
    if (map) { map.remove(); map = null; marker = null; }
}

onUnmounted(() => { if (map) map.remove(); });

function submitReport() { alert(`Laporan berhasil dikirim!\nPemilik: ${reportForm.ownerName}\nLokasi: ${reportForm.location}`); }
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
</style>