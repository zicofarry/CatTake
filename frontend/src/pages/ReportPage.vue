<template>
  <div class="min-h-screen bg-gray-50 font-sans overflow-x-hidden pt-20 pb-32 relative">
    
    <div v-if="userRole === 'shelter'">
        <div class="text-center mb-8 -mt-2">
            <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-gray-800 py-3 px-8 bg-white rounded-full shadow-xl">
                Laporan Kucing
            </h1>
        </div>
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
      
    <div v-else>
      
      <div class="relative w-full h-[400px] overflow-visible bg-[#A0C8B1] z-0">
          <div class="absolute inset-0 bg-gradient-to-r from-[#A0C8B1] to-[#60997E] opacity-90 overflow-hidden"></div>
          <div class="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-center justify-center gap-12">
              <div class="flex-shrink-0 text-center md:text-left">
                <h1 class="text-5xl md:text-7xl font-bold text-[#1F1F1F] drop-shadow-sm leading-tight">
                    Lapor &<br>Temukan
                </h1>
                <p class="text-white mt-4 text-lg max-w-md hidden md:block">
                  Laporkan penemuan kucing liar, kucing orang lain yang hilang, atau umumkan kucingmu yang hilang.
                </p>
              </div>
              <div class="h-full flex items-end">
                  <img 
                    src="../assets/img/tigakucing.png" 
                    alt="Tiga Kucing" 
                    class="h-[75%] md:h-[135%] w-auto object-contain object-bottom md:translate-y-16"
                  >
              </div>
          </div>
      </div>

      <div class="max-w-4xl mx-auto px-6 relative z-10 mt-12 md:mt-32">
        
        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <div class="bg-gray-200/80 backdrop-blur-sm p-2 rounded-[25px]">
              <button 
                @click="setActiveReportType('stray')"
                class="min-w-[160px] py-3 px-6 rounded-[20px] font-bold text-lg transition-all duration-300"
                :class="activeReportType === 'stray' ? 'bg-[#EBCD5E] text-white shadow-md scale-105' : 'bg-transparent text-gray-600 hover:bg-white/50'"
              >
                Nemu Kucing Liar
              </button>
          </div>
          <div class="bg-gray-200/80 backdrop-blur-sm p-2 rounded-[25px]">
              <button 
                @click="setActiveReportType('missing')"
                class="min-w-[160px] py-3 px-6 rounded-[20px] font-bold text-lg transition-all duration-300"
                :class="activeReportType === 'missing' ? 'bg-[#E9B92F] text-white shadow-md scale-105' : 'bg-transparent text-gray-600 hover:bg-white/50'"
              >
                Nemu Kucing Hilang
              </button>
          </div>
          <div class="bg-gray-200/80 backdrop-blur-sm p-2 rounded-[25px]">
              <button 
                @click="setActiveReportType('my_lost')"
                class="min-w-[160px] py-3 px-6 rounded-[20px] font-bold text-lg transition-all duration-300 border-2 border-transparent"
                :class="activeReportType === 'my_lost' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-red-500 hover:border-red-200'"
              >
                Kucing Saya Hilang!
              </button>
          </div>
        </div>

        <div class="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl relative z-20">
          
          <LoginOverlay 
              :isLoggedIn="isLoggedInProp" 
              :message="activeReportType === 'my_lost' ? 'Login untuk memposting info kehilangan.' : 'Kamu perlu login dulu sebelum melaporkan kucing.'" 
              buttonText="Login Sekarang" 
              loginRoute="/login"
          />

          <form v-if="activeReportType !== 'my_lost'" @submit.prevent="submitDiscoveryReport" class="space-y-8">
            
<div v-if="activeReportType === 'missing'" class="relative">
              <label for="ownerName" class="block text-xl font-bold text-[#1F1F1F] mb-4">
                Cari Data Kucing Hilang
                <span class="text-sm font-normal text-gray-500 ml-2">*Ketik nama kucing atau pemilik</span>
              </label>
              
              <div class="relative">
                  <input 
                    type="text" 
                    id="ownerName"
                    v-model="searchQuery"
                    @input="handleSearchInput" 
                    @focus="isDropdownOpen = true"
                    @blur="handleBlur"
                    placeholder="Cari: 'Mochi' atau 'Andi'..."
                    autocomplete="off"
                    class="w-full p-5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] text-lg"
                  >
                  <div class="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                      <i v-if="isSearching" class="fas fa-spinner fa-spin"></i>
                      <i v-else class="fas fa-search"></i>
                  </div>
              </div>

              <transition name="fade">
                  <ul v-if="isDropdownOpen && searchResults.length > 0" class="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-xl max-h-60 overflow-y-auto border border-gray-100">
                      <li 
                          v-for="item in searchResults" 
                          :key="item.id"
                          @mousedown.prevent="selectLostCat(item)"
                          class="p-4 hover:bg-[#EBCD5E]/10 cursor-pointer transition-colors border-b border-gray-50 flex items-center gap-3"
                      >
                          <img :src="item.photo" class="w-10 h-10 rounded-full object-cover bg-gray-200">
                          
                          <div class="flex flex-col">
                              <span class="font-bold text-[#1F1F1F]">{{ item.cat_name }}</span>
                              <span class="text-xs text-gray-500">Pemilik: {{ item.owner_name }}</span>
                          </div>
                      </li>
                  </ul>
                  <div v-else-if="isDropdownOpen && searchQuery.length > 2 && !isSearching" class="absolute z-50 w-full bg-white mt-2 rounded-2xl shadow-xl p-4 text-gray-500 text-center">
                      Data tidak ditemukan.
                  </div>
              </transition>
            </div>

            <div>
              <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Lokasi Ditemukan</label>
              <div class="flex gap-4 flex-col md:flex-row">
                <div 
                  @click="openMapModal"
                  class="w-full md:w-40 h-36 flex-none bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer"
                >
                  <img src="../assets/img/maps.png" class="w-full h-full object-cover opacity-80">

                  <div class="absolute inset-0 flex items-center justify-center">
                    <i class="
                      fas fa-map-marker-alt 
                      text-3xl 
                      text-blue-500 
                      drop-shadow-md
                      transition-all duration-300
                      hover:scale-110
                      hover:text-blue-600
                    "></i>
                  </div>
                </div>


                <textarea 
                  v-model="reportForm.location" 
                  required 
                  rows="4" 
                  placeholder="Klik peta di samping untuk set lokasi otomatis, atau ketik manual..."
                  class="flex-grow p-5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-lg resize-none"
                ></textarea>
              </div>
            </div>

            <div>
              <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Deskripsi Kondisi</label>
              <textarea v-model="reportForm.description" required rows="3" placeholder="Jelaskan ciri-ciri, kondisi, dll..." class="w-full p-5 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-lg resize-none"></textarea>
            </div>

            <div>
              <label class="block text-xl font-bold text-[#1F1F1F] mb-4">Foto Bukti</label>
              <div @click="triggerFileInput" class="bg-gray-100 rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#EBCD5E] transition">
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange">
                <i class="fas fa-camera text-3xl text-gray-400 mb-2"></i>
                <p class="text-gray-500" v-if="!reportForm.file">Klik untuk ambil/upload foto</p>
                <p class="text-[#3A5F50] font-bold" v-else>File: {{ reportForm.file.name }}</p>
              </div>
            </div>

            <div class="pt-4 text-center">
              <button type="submit" class="bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-16 rounded-full shadow-lg transition-transform hover:-translate-y-1 active:scale-95 w-full md:w-auto">
                Kirim Laporan
              </button>
            </div>
          </form>


          <form v-else @submit.prevent="submitLostCatAd" class="space-y-6">
            <div class="bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 text-sm mb-6 flex gap-3">
                <i class="fas fa-info-circle mt-1"></i>
                <p>Data ini akan dipublikasikan di halaman "Daftar Kucing Hilang" agar komunitas bisa bantu mencari.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Nama Kucing</label>
                    <input type="text" v-model="lostCatForm.name" required class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Misal: Mochi">
                </div>
                <div>
                    <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Umur (Bulan)</label>
                    <input type="number" v-model="lostCatForm.age" required class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Contoh: 12">
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Ras</label>
                    <input type="text" v-model="lostCatForm.breed" class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Domestik/Persia/dll">
                </div>
                <div>
                    <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Warna Dominan</label>
                    <input type="text" v-model="lostCatForm.color" required class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="Oren/Hitam Putih">
                </div>
            </div>

            <div>
                <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Ciri-ciri Khusus</label>
                <textarea v-model="lostCatForm.description" required rows="3" class="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none" placeholder="Contoh: Pakai kalung merah, ekor bengkok..."></textarea>
            </div>

            <div>
                <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Lokasi Terakhir Dilihat</label>
                    <div class="flex gap-4 flex-col md:flex-row">
                                        <div 
                      @click="openMapModal"
                      class="w-full md:w-40 h-36 flex-none bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer"
                    >
                      <img src="../assets/img/maps.png" class="w-full h-full object-cover opacity-80">

                      <div class="absolute inset-0 flex items-center justify-center">
                        <i class="
                          fas fa-map-marker-alt 
                          text-3xl 
                          text-blue-500 
                          drop-shadow-md
                          transition-all duration-300
                          hover:scale-110
                          hover:text-blue-600
                        "></i>
                      </div>
                    </div>
                    <textarea v-model="lostCatForm.last_seen_address" required rows="2" class="flex-grow p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none resize-none" placeholder="Klik peta di samping untuk set lokasi otomatis, atau ketik manual..."></textarea>
                </div>
            </div>

            <div>
                <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Imbalan (Opsional)</label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">Rp</span>
                    <input type="number" v-model="lostCatForm.reward_amount" class="w-full p-4 pl-12 bg-gray-100 rounded-xl focus:ring-2 focus:ring-red-400 outline-none" placeholder="0">
                </div>
            </div>

            <div>
              <label class="block text-lg font-bold text-[#1F1F1F] mb-2">Foto Kucing</label>
              <div
                  @click="triggerFileInput"
                  class="bg-gray-100 rounded-2xl p-8 text-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#EBCD5E] transition"
                >
                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept="image/*"
                    @change="handleLostCatFile"
                  >

                  <i class="fas fa-camera text-3xl text-gray-400 mb-2"></i>

                  <p class="text-gray-500" v-if="!reportForm.file">
                    Klik untuk ambil/upload foto
                  </p>

                  <p class="text-[#3A5F50] font-bold" v-else>
                    File: {{ reportForm.file.name }}
                  </p>
                </div>
            </div>

            <div class="pt-4">
                <button type="submit" class="w-full bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-full shadow-lg transition-transform hover:-translate-y-1 active:scale-95">
                    Pasang Iklan Kehilangan
                </button>
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
              <p class="text-gray-600 mb-3 text-sm">Klik pada peta untuk memilih titik lokasi.</p>
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
import { useRouter } from 'vue-router';
import apiClient from '@/api/http';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LoginOverlay from '../components/LoginOverlay.vue';
import ReportCard from '../components/ReportCardItem.vue';

const router = useRouter();
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const props = defineProps({ isLoggedInProp: Boolean });

// --- STATE ---
const activeReportType = ref('stray'); // 'stray', 'missing', 'my_lost'
const fileInput = ref(null);

// State Form Penemuan (Existing)
const reportForm = reactive({
    ownerName: '',
    location: '',
    description: '',
    file: null,
    lat: null, 
    long: null
});

// State Form Kehilangan (NEW)
const lostCatForm = reactive({
    name: '',
    age: '',
    breed: '',
    color: '',
    description: '',
    last_seen_address: '',
    last_seen_lat: null,
    last_seen_long: null,
    reward_amount: '',
    file: null
});

// State Peta & Autocomplete
const showMapModal = ref(false);
const isLoadingMap = ref(false);
let map = null;
let marker = null;
const tempLocation = reactive({ address: '', lat: null, lng: null });

const searchQuery = ref('');
const isDropdownOpen = ref(false);
const isSearching = ref(false);
const searchResults = ref([]); // Array hasil pencarian dari API
let searchTimeout = null;
// const filteredOwners = computed(() => dummyOwners.value.filter(o => o.name.toLowerCase().includes(searchQuery.value.toLowerCase())));

// --- METHODS ---

// Autocomplete Logic
// function selectOwner(owner) { searchQuery.value = owner.name; reportForm.ownerName = owner.name; isDropdownOpen.value = false; }
function handleSearchInput() {
    isDropdownOpen.value = true;
    if (searchTimeout) clearTimeout(searchTimeout);

    if (searchQuery.value.length < 2) {
        searchResults.value = [];
        return;
    }

    isSearching.value = true;
    // Tunggu 500ms setelah user berhenti mengetik baru request ke API
    searchTimeout = setTimeout(async () => {
        try {
            const response = await apiClient.get(`/lost-cats/search?q=${searchQuery.value}`);
            searchResults.value = response.data;
        } catch (error) {
            console.error("Gagal mencari kucing:", error);
        } finally {
            isSearching.value = false;
        }
    }, 500);
}

// 2. Saat item dipilih
function selectLostCat(item) {
    // Set teks input: "Mochi - Andi"
    searchQuery.value = `${item.cat_name} - ${item.owner_name}`; 
    
    // Simpan data penting ke form
    reportForm.ownerName = item.owner_name; 
    reportForm.lostCatId = item.id; // PENTING: Simpan ID ini untuk dikirim ke backend nanti
    
    isDropdownOpen.value = false;
}

function handleBlur() { 
    setTimeout(() => { isDropdownOpen.value = false; }, 200); 
}

function setActiveReportType(type) {
    activeReportType.value = type;
}
// File Handling
function triggerFileInput() { fileInput.value.click(); }
function handleFileChange(event) { const file = event.target.files[0]; if (file) reportForm.file = file; }
function handleLostCatFile(event) { const file = event.target.files[0]; if (file) lostCatForm.file = file; }

// Map Logic
async function openMapModal() {
    showMapModal.value = true;
    isLoadingMap.value = true;
    await nextTick();
    if (!map) {
        map = L.map('mapContainer').setView([-6.9175, 107.6191], 13); 
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);
            tempLocation.lat = lat;
            tempLocation.lng = lng;
            tempLocation.address = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        });
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16);
            if (marker) map.removeLayer(marker);
            marker = L.marker([latitude, longitude]).addTo(map);
            tempLocation.lat = latitude;
            tempLocation.lng = longitude;
            tempLocation.address = `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            isLoadingMap.value = false;
        }, () => { isLoadingMap.value = false; });
    } else { isLoadingMap.value = false; }
}

function confirmLocation() {
    if (activeReportType.value === 'my_lost') {
        lostCatForm.last_seen_address = tempLocation.address;
        lostCatForm.last_seen_lat = tempLocation.lat;
        lostCatForm.last_seen_long = tempLocation.lng;
    } else {
        reportForm.location = tempLocation.address;
        reportForm.lat = tempLocation.lat;
        reportForm.long = tempLocation.lng;
    }
    closeMapModal();
}

function closeMapModal() {
    showMapModal.value = false;
    if (map) { map.remove(); map = null; marker = null; }
}

async function submitDiscoveryReport() {
    if (!reportForm.file) { alert('Mohon sertakan foto bukti.'); return; }
    // Di sini nanti kirim reportForm.lostCatId juga ke backend
    alert('Laporan Penemuan Berhasil Dikirim (Simulasi)\nCat ID: ' + (reportForm.lostCatId || 'N/A'));
}

async function submitLostCatAd() {
    if (!lostCatForm.name || !lostCatForm.age || !lostCatForm.file) {
        alert('Mohon lengkapi data wajib (Nama, Umur, Foto).');
        return;
    }
    try {
        const formData = new FormData();
        formData.append('name', lostCatForm.name);
        formData.append('age', lostCatForm.age);
        formData.append('breed', lostCatForm.breed);
        formData.append('color', lostCatForm.color);
        formData.append('description', lostCatForm.description);
        formData.append('last_seen_address', lostCatForm.last_seen_address);
        if (lostCatForm.last_seen_lat) formData.append('last_seen_lat', lostCatForm.last_seen_lat);
        if (lostCatForm.last_seen_long) formData.append('last_seen_long', lostCatForm.last_seen_long);
        if (lostCatForm.reward_amount) formData.append('reward_amount', lostCatForm.reward_amount);
        formData.append('photo', lostCatForm.file);

        await apiClient.post('/lost-cats', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Iklan Kehilangan Berhasil Diposting!');
        router.push('/'); 
    } catch (error) {
        console.error(error);
        alert('Gagal memposting iklan: ' + (error.response?.data?.error || error.message));
    }
}

const mockShelterReports = ref([
    { id: 1, type: 'stray', date: '2025/11/20 10:00', location: 'Bandung', description: 'Kucing liar sakit', reporter: { name: 'Budi', profilePic: '' } }
]);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>