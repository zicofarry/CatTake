<template>
  <!-- 
    Container Halaman Utama
    pt-20 agar tidak tertutup navbar.
    bg-gray-100 sebagai background abu-abu muda seperti di Figma.
  -->
  <div class="min-h-screen bg-gray-100 font-sans overflow-x-hidden pt-20 pb-32 relative">
    
    <!-- Konten Utama -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-12">
      
      <!-- Grid Layout (Kolom Kiri Info, Kolom Kanan Peta) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- === KOLOM KIRI (Info) === -->
        <div class="lg:col-span-1 space-y-8">

          <!-- 1. KARTU PELACAKAN LANGSUNG -->
          <div class="bg-white p-6 md:p-8 rounded-[40px] shadow-xl">
            <h2 class="text-2xl font-bold text-[#1F1F1F] mb-6 flex items-center">
              <i class="fas fa-map-marker-alt text-[#3A5F50] mr-3"></i>
              Pelacakan Langsung
            </h2>
            
            <!-- Info Laporan -->
            <div class="bg-gray-100 p-6 rounded-3xl space-y-3 mb-6">
              <div class="flex justify-between">
                <span class="text-gray-500">Id:</span>
                <span class="font-bold text-[#1F1F1F]">#{{ trackingData.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Status:</span>
                <span 
                  class="font-bold px-3 py-1 rounded-full text-sm"
                  :class="{
                    'bg-gray-300 text-gray-700': trackingStatus.id === 1,
                    'bg-yellow-200 text-yellow-700 animate-pulse': trackingStatus.id === 2,
                    'bg-green-200 text-green-700': trackingStatus.id === 3,
                  }"
                >
                  {{ trackingStatus.text }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Alamat:</span>
                <span class="font-bold text-[#1F1F1F] truncate">{{ trackingData.alamat }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Tujuan:</span>
                <span class="font-bold text-[#1F1F1F]">{{ trackingData.tujuan }}</span>
              </div>
            </div>

            <!-- Stepper Status (Pending, In Transit, Selesai) -->
            <div class="w-full">
              <div class="relative w-full flex justify-between items-center px-2">
                <!-- Progress Bar Latar Belakang -->
                <div class="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-full bg-gray-200 rounded-full"></div>
                <!-- Progress Bar Aktif (Kuning) -->
                <div 
                  class="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-[#EBCD5E] rounded-full transition-all duration-500"
                  :style="{ width: trackingStatus.progress + '%' }"
                ></div>
                
                <!-- Step 1: Laporan Diterima -->
                <div class="relative z-10 flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full bg-[#EBCD5E] flex items-center justify-center text-white shadow-md">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <span class="text-xs font-medium mt-2 text-center">Laporan Diterima</span>
                </div>
                
                <!-- Step 2: Dalam Perjalanan -->
                <div class="relative z-10 flex flex-col items-center">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors"
                    :class="trackingStatus.id >= 2 ? 'bg-[#EBCD5E] text-white' : 'bg-gray-200 text-gray-500'"
                  >
                    <i class="fas fa-truck"></i>
                  </div>
                  <span class="text-xs font-medium mt-2 text-center">Dalam Perjalanan</span>
                </div>
                
                <!-- Step 3: Selesai -->
                <div class="relative z-10 flex flex-col items-center">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors"
                    :class="trackingStatus.id === 3 ? 'bg-[#EBCD5E] text-white' : 'bg-gray-200 text-gray-500'"
                  >
                    <i class="fas fa-check-circle"></i>
                  </div>
                  <span class="text-xs font-medium mt-2 text-center">Selesai</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. KARTU KURIR -->
          <div class="bg-white p-6 md:p-8 rounded-[40px] shadow-xl">
            <div class="flex items-center gap-4">
              <img :src="trackingData.kurir.foto" alt="Kurir" class="w-16 h-16 rounded-full object-cover border-2 border-gray-100">
              <div class="flex-grow">
                <h3 class="font-bold text-lg text-[#1F1F1F]">{{ trackingData.kurir.nama }}</h3>
                <p class="text-sm text-gray-500">{{ trackingData.kurir.shelter }}</p>
              </div>
              <!-- Tombol Aksi Kurir -->
              <div class="flex gap-3">
                <button @click="showCallModal = true" class="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center hover:bg-green-200 transition">
                  <i class="fas fa-phone-alt text-xl"></i>
                </button>
                <button @click="showChatModal = true" class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-200 transition">
                  <i class="fas fa-comment-dots text-xl"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 3. KARTU LAPORAN KAMU -->
          <div class="bg-white p-6 md:p-8 rounded-[40px] shadow-xl">
            <h2 class="text-2xl font-bold text-[#1F1F1F] mb-6">Laporan Kamu:</h2>
            <div class="space-y-4">
              <!-- Item Laporan -->
              <div class="bg-gray-100 p-4 rounded-2xl">
                <span class="text-sm text-gray-500">Jenis Laporan</span>
                <p class="font-semibold text-[#1F1F1F] text-lg">{{ trackingData.laporan.jenis }}</p>
              </div>
              <!-- Item Laporan -->
              <div class="bg-gray-100 p-4 rounded-2xl">
                <span class="text-sm text-gray-500">Nama Pemilik</span>
                <p class="font-semibold text-[#1F1F1F] text-lg">{{ trackingData.laporan.pemilik }}</p>
              </div>
              <!-- Item Laporan -->
              <div class="bg-gray-100 p-4 rounded-2xl">
                <span class="text-sm text-gray-500">Lokasi</span>
                <p class="font-semibold text-[#1F1F1F] text-lg">{{ trackingData.laporan.lokasi }}</p>
              </div>
              <!-- Item Laporan -->
              <div class="bg-gray-100 p-4 rounded-2xl">
                <span class="text-sm text-gray-500">Deskripsi</span>
                <p class="font-semibold text-[#1F1F1F] text-lg">{{ trackingData.laporan.deskripsi }}</p>
              </div>
              <!-- Item Laporan -->
              <div class="bg-gray-100 p-4 rounded-2xl">
                <span class="text-sm text-gray-500 mb-2 block">Foto</span>
                <img :src="trackingData.laporan.foto" alt="Foto Laporan" class="w-full h-auto rounded-xl object-cover">
              </div>
            </div>
          </div>

        </div>

        <!-- === KOLOM KANAN (Peta) === -->
        <div class="lg:col-span-2">
          <div class="bg-white p-4 rounded-[40px] shadow-xl h-[80vh] w-full flex flex-col">
            <h2 class="text-2xl font-bold text-[#1F1F1F] mb-4 px-4">Lokasi Kurir (Real-time)</h2>
            <!-- Container Peta Leaflet -->
            <div id="trackingMapContainer" class="flex-grow w-full h-full rounded-[30px] overflow-hidden bg-gray-200">
               <!-- Peta akan di-render di sini oleh Leaflet -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- === MODAL INTERAKTIF === -->
    
    <!-- 1. MODAL CHAT (Teleport agar di atas segalanya) -->
    <teleport to="body">
      <div v-if="showChatModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[70vh] animate-fade-in-up">
          <!-- Header Chat -->
          <div class="bg-gray-100 p-4 flex items-center justify-between rounded-t-3xl">
            <div class="flex items-center gap-3">
              <img :src="trackingData.kurir.foto" alt="Kurir" class="w-10 h-10 rounded-full object-cover">
              <h3 class="font-bold text-lg">{{ trackingData.kurir.nama }}</h3>
            </div>
            <button @click="showChatModal = false" class="text-gray-500 hover:text-red-500 transition"><i class="fas fa-times text-xl"></i></button>
          </div>
          <!-- Isi Chat (Dummy) -->
          <div class="flex-grow p-4 space-y-4 overflow-y-auto">
            <div class="flex justify-start"><span class="bg-gray-200 p-3 rounded-2xl max-w-[80%]">Halo, saya sudah di jalan ya!</span></div>
            <div class="flex justify-end"><span class="bg-[#3A5F50] text-white p-3 rounded-2xl max-w-[80%]">Oke, ditunggu!</span></div>
          </div>
          <!-- Input Chat -->
          <div class="p-4 bg-gray-100 flex gap-2">
            <input type="text" placeholder="Ketik pesan..." class="flex-grow p-3 rounded-full border-gray-300 focus:ring-[#EBCD5E] outline-none">
            <button class="bg-[#3A5F50] text-white w-12 h-12 rounded-full flex-none"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 2. MODAL CALL (Teleport) -->
    <teleport to="body">
       <div v-if="showCallModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-fade-in-up">
            <img :src="trackingData.kurir.foto" alt="Kurir" class="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg">
            <h3 class="text-2xl font-bold text-[#1F1F1F]">{{ trackingData.kurir.nama }}</h3>
            <p class="text-lg text-gray-500 animate-pulse">Memanggil...</p>
            <button @click="showCallModal = false" class="mt-6 w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl hover:bg-red-600 transition">
              <i class="fas fa-phone-slash"></i>
            </button>
         </div>
       </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router'; // <-- Impor useRoute
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- DATA STATIS (DUMMY) ---
const trackingData = reactive({
  id: 'fghjk',
  alamat: 'Cimahi',
  tujuan: 'Gerlong',
  kurir: {
    nama: 'Azmi AntarCat',
    shelter: 'Shelter Tigaksonenam',
    foto: 'https://placehold.co/100x100/EBCD5E/3A5F50?text=A',
    posisi: [-6.8722, 107.5919] // Posisi Awal (Misal: Setiabudi)
  },
  laporan: {
    jenis: 'Kucing Hilang',
    pemilik: 'Anas cedua',
    lokasi: 'JL.Geger Asih No.2 Kec.Sukasari',
    deskripsi: 'Aku nemu kucing warna abu belang punya anas...',
    foto: 'https://placehold.co/600x400/E0E0E0/707070?text=Foto+Kucing'
  },
  shelterPos: [-6.8790, 107.5901] // Posisi Shelter (T)
});

// --- STATE MODAL ---
const showChatModal = ref(false);
const showCallModal = ref(false);

// --- STATE TRACKING (Simulasi Real-time) ---
const trackingStatus = ref({ id: 1, text: 'Laporan Diterima', progress: 0 }); // Step 1: Diterima
const courierPosition = ref([...trackingData.kurir.posisi]);
let simulationInterval = null;
let map = null;
let courierMarker = null;

// --- MENGAMBIL ID DARI URL ---
const route = useRoute();
onMounted(() => {
    // Ambil ID dari URL dan masukkan ke data
    trackingData.id = route.params.id || 'ID_NOT_FOUND';
    
    // Mulai Peta & Simulasi
    initializeMapAndSimulation();
});

// --- LEAFLET CUSTOM ICONS ---
const shelterIcon = L.divIcon({
  html: `<div class="bg-[#3A5F50] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">T</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});
const courierIcon = L.divIcon({
  html: `<div class="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse"><i class="fas fa-truck-moving"></i></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// --- FUNGSI PETA & SIMULASI ---
async function initializeMapAndSimulation() {
  await nextTick();
  try {
    map = L.map('trackingMapContainer').setView(trackingData.kurir.posisi, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    L.marker(trackingData.shelterPos, { icon: shelterIcon }).addTo(map).bindPopup("Shelter");
    courierMarker = L.marker(courierPosition.value, { icon: courierIcon }).addTo(map).bindPopup("Kurir");
    startSimulation();
  } catch (error) { console.error("Gagal memuat peta:", error); }
}

onUnmounted(() => {
  if (simulationInterval) clearInterval(simulationInterval);
  if (map) map.remove();
});

// SIMULASI REAL-TIME
function startSimulation() {
  let step = 0;
  trackingStatus.value = { id: 2, text: 'In Transit', progress: 50 }; // Langsung 'In Transit'
  simulationInterval = setInterval(() => {
    step++;
    let newLat = courierPosition.value[0] + 0.0005;
    let newLng = courierPosition.value[1] + 0.0005;
    courierPosition.value = [newLat, newLng];

    if (courierMarker && map) {
      courierMarker.setLatLng(courierPosition.value);
      map.panTo(courierPosition.value);
    }
    
    if (step > 5) {
      trackingStatus.value = { id: 3, text: 'Selesai', progress: 100 };
      if(courierMarker) {
         const doneIcon = L.divIcon({
            html: `<div class="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><i class="fas fa-check"></i></div>`,
            className: '', iconSize: [32, 32], iconAnchor: [16, 16]
         });
         courierMarker.setIcon(doneIcon);
      }
      clearInterval(simulationInterval);
    }
  }, 2000);
}
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
/* Pastikan container peta punya tinggi */
#trackingMapContainer {
  height: 100%;
  width: 100%;
}
</style>
