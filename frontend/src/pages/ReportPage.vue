<template>
  <div class="min-h-screen bg-gray-50 font-sans overflow-x-hidden pt-20 pb-32 relative">
    <div v-if="userRole === 'shelter'">
        <!-- Judul Laporan Kucing (Seperti di Figma) -->
        <div class="text-center mb-8 -mt-2">
            <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-gray-800 py-3 px-8 bg-white rounded-full shadow-xl">
                Laporan Kucing
            </h1>
        </div>
        
        <!-- Daftar Laporan -->
        <div class="relative bg-gray-200 p-4 md:p-6 rounded-3xl shadow-2xl overflow-hidden custom-scrollbar max-h-[85vh]">
            <div class="flex flex-col gap-4">
                <ReportCard 
                    v-for="report in mockShelterReports" 
                    :key="report.id" 
                    :report="report"
                />
            </div>
        </div>
      </div>
      
      <!-- TAMPILAN USER/GUEST: FORM LAPORAN -->
      <div v-else>
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
          
          <div v-if="activeReportType === 'missing'" class="relative">
            <label for="ownerName" class="block text-xl font-bold text-[#1F1F1F] mb-4">Nama Pemilik</label>
            
            <div class="relative">
                <input 
                  type="text" 
                  id="ownerName"
                  v-model="searchQuery"
                  @focus="isDropdownOpen = true"
                  @blur="handleBlur"
                  placeholder="Ketik nama pemilik..."
                  autocomplete="off"
                  class="w-full p-5 bg-gray-200 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg"
                >
                <div class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <i class="fas fa-search" v-if="!isDropdownOpen"></i>
                    <i class="fas fa-chevron-up" v-else></i>
                </div>
            </div>

            <transition name="fade">
                <ul v-if="isDropdownOpen" class="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-xl max-h-60 overflow-y-auto border border-gray-100">
                    <li v-if="filteredOwners.length === 0" class="p-4 text-gray-500 text-center">
                        Tidak ada nama yang cocok.
                    </li>
                    <li 
                        v-for="owner in filteredOwners" 
                        :key="owner.id"
                        @mousedown.prevent="selectOwner(owner)"
                        class="p-4 hover:bg-[#EBCD5E]/10 cursor-pointer transition-colors border-b border-gray-50 last:border-none flex justify-between items-center"
                    >
                        <span class="text-[#1F1F1F] font-medium">{{ owner.name }}</span>
                        <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{{ owner.id }}</span>
                    </li>
                </ul>
            </transition>
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
            <button type="button" class="inline-block bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-24 rounded-full shadow-[0_6px_20px_rgba(235,205,94,0.4)] transition-transform hover:-translate-y-1 active:scale-95 border-none cursor-pointer" 
            onclick="window.location.href='/track'">Selesai</button>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LoginOverlay from '../components/LoginOverlay.vue';
import ReportCard from '../components/ReportCardItem.vue'; // Komponen baru

// Mengambil userRole dari localStorage
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');

// --- MOCK DATA UNTUK SHELTER VIEW ---
const mockShelterReports = ref([
    { id: 1, type: 'missing', date: '2025/10/02 19.08', ownerName: 'Diana Pungky', location: '6°51\'45.8"S 107°35\'17.0"E', description: 'Kucing hilang dari rumah di area Cihanjuang. Berwarna orange, mata kuning, memakai kalung biru.', photoUrl: '/assets/img/kucinghilang1.png', reporter: { name: 'Diana', profilePic: '/img/profileDiana.png' }},
    { id: 2, type: 'stray', date: '2025/10/01 13.25', ownerName: 'N/A', location: '6°53\'12.3"S 107°36\'45.1"E', description: 'Kucing kecil warnanya oranye, badannya kecil, sepertinya dia kelaparan.', photoUrl: '/assets/img/kucingliar2.png', reporter: { name: 'Azmi', profilePic: '/img/profileAzmi.png' }},
    { id: 3, type: 'stray', date: '2025/09/29 09.40', ownerName: 'N/A', location: '6°50\'01.0"S 107°34\'00.0"E', description: 'Ada kucing hitam besar di pasar, kakinya pincang, butuh pertolongan medis.', photoUrl: '/assets/img/kucingliar3.png', reporter: { name: 'Anas', profilePic: '/img/profileAnas.png' }},
    { id: 4, type: 'missing', date: '2025/09/28 07.00', ownerName: 'Rafaela', location: '6°52\'50.0"S 107°35\'30.0"E', description: 'Kucing anggora warna putih, hilang sejak kemarin sore. Sangat penurut.', photoUrl: '/assets/img/kucinghilang2.png', reporter: { name: 'Nanda', profilePic: '/img/profileNanda.png' }},
    { id: 5, type: 'stray', date: '2025/09/27 11.23', ownerName: 'N/A', location: '6°51\'10.0"S 107°36\'10.0"E', description: 'Kucing persia dekil di gang sempit, tidak berani mendekat.', photoUrl: '/assets/img/kucingliar4.png', reporter: { name: 'Aji', profilePic: '/img/profileAji.png' }},
]);
const props = defineProps({
  isLoggedInProp: Boolean
});

// --- DATA PEMILIK (DUMMY) ---
// Tambahkan lebih banyak nama biar kelihatan efek filternya
const dummyOwners = ref([
    { id: 'OWN001', name: 'Ahmad Supriatna' },
    { id: 'OWN002', name: 'Anas Miftakhul Falah' },
    { id: 'OWN003', name: 'Anas Siapa Gitu' },
    { id: 'OWN004', name: 'Budi Santoso' },
    { id: 'OWN005', name: 'Citra Kirana' },
    { id: 'OWN006', name: 'Diana Pungky' },
    { id: 'OWN007', name: 'Eko Patrio' },
]);

// --- STATE UTAMA ---
const activeReportType = ref('stray');
const isDragging = ref(false);
const fileInput = ref(null);
const reportForm = reactive({
    ownerName: '', // Nilai akhir yang akan disubmit
    location: '',
    description: '',
    file: null,
});

// --- STATE AUTOCOMPLETE ---
const searchQuery = ref('');      // Apa yang diketik user
const isDropdownOpen = ref(false); // Apakah dropdown sugesti muncul

// Filter daftar pemilik berdasarkan ketikan user
const filteredOwners = computed(() => {
    if (!searchQuery.value) {
        return dummyOwners.value; // Tampilkan semua jika belum mengetik
    }
    return dummyOwners.value.filter(owner => 
        owner.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// --- FUNGSI AUTOCOMPLETE ---
function selectOwner(owner) {
    searchQuery.value = owner.name;      // Isi input dengan nama yang dipilih
    reportForm.ownerName = owner.name;   // Simpan ke data form
    isDropdownOpen.value = false;        // Tutup dropdown
}

// Saat input kehilangan fokus (klik di luar), tutup dropdown.
// Kita pakai sedikit delay agar event 'click' pada list sempat tereksekusi.
function handleBlur() {
    setTimeout(() => {
        isDropdownOpen.value = false;
    }, 200);
}

// --- STATE PETA ---
const showMapModal = ref(false);
const isLoadingMap = ref(false);
let map = null;
let marker = null;
const tempLocation = ref('');

function setActiveReportType(type) {
    activeReportType.value = type;
    if (type === 'stray') {
        reportForm.ownerName = '';
        searchQuery.value = ''; // Reset juga search query-nya
    }
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
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
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

function submitReport() {
    // Pastikan ownerName terisi dari searchQuery jika user mengetik manual tanpa memilih dari list
    if (activeReportType.value === 'missing' && !reportForm.ownerName) {
        reportForm.ownerName = searchQuery.value;
    }
    alert(`Laporan berhasil dikirim!\nPemilik: ${reportForm.ownerName}\nLokasi: ${reportForm.location}`);
    setTimeout(() => {
      router.push('/track');
    }, 300);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #638870; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
</style>