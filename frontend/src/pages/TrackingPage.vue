<template>
  <div class="min-h-screen bg-[#3A5F50] font-sans overflow-x-hidden pt-6 pb-10 md:pb-20 flex flex-col justify-center items-center relative px-0 md:px-4 gap-4">

    <div class="fixed top-6 left-4 md:top-8 md:left-8 z-[999]">
         <router-link 
            to="/lapor" 
           class="inline-flex items-center gap-2 bg-[#2D4A45]/80 backdrop-blur-md text-white font-bold py-2.5 px-6 rounded-full shadow-2xl transition-all duration-300 hover:bg-[#2D4A45] hover:-translate-x-1 no-underline border border-white/20"
        >
            <i class="fas fa-arrow-left"></i>
            <span>Kembali</span>
        </router-link>
    </div>
    <div v-if="isLoading" class="absolute inset-0 z-50 flex items-center justify-center bg-[#3A5F50]">
        <div class="text-center text-white">
            <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
            <p>Memuat data pelacakan...</p>
        </div>
    </div>

    <div v-show="!isLoading" class="bg-white w-full max-w-[1200px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row h-auto lg:min-h-[800px] rounded-t-[30px] lg:rounded-none mt-0 lg:mt-0 transition-all duration-300">
      
      <div class="w-full lg:w-[45%] p-5 md:p-10 flex flex-col gap-6 overflow-y-visible lg:overflow-y-auto lg:max-h-[900px] custom-scrollbar z-10 bg-white relative -mt-8 lg:mt-0 rounded-t-[30px] lg:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:shadow-none">
        
        <div class="bg-gray-100 rounded-[30px] p-6 md:p-8 shadow-sm">
           <div class="flex items-center gap-3 mb-6">
              <i class="fas fa-route text-2xl text-[#1F1F1F]"></i>
              <h2 class="text-xl md:text-2xl font-bold text-[#1F1F1F]">Status: {{ trackingStatusText }}</h2>
           </div>

           <div class="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 text-sm md:text-base">
              <div class="flex flex-col">
                 <span class="text-gray-500 mb-1">Tracking ID:</span>
                 <span class="font-bold text-[#1F1F1F] text-base md:text-lg break-all">{{ trackingData.id }}</span>
              </div>
              <div class="flex flex-col items-end">
                 <span class="text-gray-500 mb-1">Status:</span>
                 <span 
                    class="px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-sm capitalize"
                    :class="getStatusClass(trackingData.status)"
                 >
                    {{ formatStatus(trackingData.status) }}
                 </span>
              </div>
              <div class="flex flex-col col-span-2 border-t border-gray-200 pt-4 mt-2">
                 <div class="flex justify-between mb-2">
                    <span class="text-gray-500">Lokasi Jemput:</span>
                    <span class="font-bold text-right truncate w-1/2">{{ trackingData.alamat }}</span>
                 </div>
                 <div class="flex justify-between">
                    <span class="text-gray-500">Tujuan Shelter:</span>
                    <span class="font-bold text-right">{{ trackingData.tujuan }}</span>
                 </div>
              </div>
           </div>

           <div class="relative px-1 md:px-2 mt-6 mb-2">
              <div class="absolute top-[22px] left-0 w-full h-1.5 bg-gray-300 rounded-full -z-0"></div>
              <div 
                  class="absolute top-[22px] left-0 h-1.5 bg-[#EBCD5E] rounded-full transition-all duration-700 z-0"
                  :style="{ width: progressPercent + '%' }"
              ></div>

              <div class="flex justify-between relative z-10">
                  <div class="flex flex-col items-center gap-2 w-1/3">
                      <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white bg-[#EBCD5E]">
                          <i class="fas fa-check"></i>
                      </div>
                      <span class="text-[10px] font-bold text-center mt-1">Ditugaskan</span>
                  </div>
                  <div class="flex flex-col items-center gap-2 w-1/3">
                      <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors" :class="currentStep >= 2 ? 'bg-[#EBCD5E] text-white' : 'bg-gray-300 text-white'">
                          <i class="fas fa-cat"></i>
                      </div>
                      <span class="text-[10px] font-bold text-center mt-1">Dijemput</span>
                  </div>
                  <div class="flex flex-col items-center gap-2 w-1/3">
                      <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors" :class="currentStep >= 3 ? 'bg-[#EBCD5E] text-white' : 'bg-gray-300 text-white'">
                          <i class="fas fa-home"></i>
                      </div>
                      <span class="text-[10px] font-bold text-center mt-1">Selesai</span>
                  </div>
              </div>
           </div>

           <div v-if="userRole === 'driver' && currentStep < 3" class="mt-8 pt-6 border-t border-gray-200">
               <h3 class="font-bold text-lg mb-3">Aksi Driver</h3>
               <button 
                 v-if="trackingData.status === 'assigned'"
                 @click="openActionModal('in_transit')"
                 class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                 <i class="fas fa-camera"></i> Upload Bukti Penjemputan
               </button>
               <button 
                 v-else-if="trackingData.status === 'in_transit'"
                 @click="openActionModal('completed')"
                 class="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                 <i class="fas fa-check-circle"></i> Konfirmasi Sampai Shelter
               </button>
           </div>
           
           <div v-if="trackingData.bukti?.pickup || trackingData.bukti?.dropoff" class="mt-6 flex gap-4 overflow-x-auto pb-2">
               <div v-if="trackingData.bukti.pickup" class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-300 relative group cursor-pointer" @click="previewImage(trackingData.bukti.pickup)">
                   <img :src="resolveImageUrl(trackingData.bukti.pickup)" class="w-full h-full object-cover">
                   <span class="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] w-full text-center py-1">Bukti Jemput</span>
               </div>
               <div v-if="trackingData.bukti.dropoff" class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-300 relative group cursor-pointer" @click="previewImage(trackingData.bukti.dropoff)">
                   <img :src="resolveImageUrl(trackingData.bukti.dropoff)" class="w-full h-full object-cover">
                   <span class="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] w-full text-center py-1">Bukti Selesai</span>
               </div>
           </div>

        </div>

        <div class="bg-gray-100 rounded-[30px] p-4 md:p-5 flex items-center gap-4 shadow-sm">
           
           <img 
             :src="resolveImageUrl(contactInfo.foto)" 
             class="w-14 h-14 rounded-full bg-gray-300 object-cover border-2 border-white shadow-sm flex-shrink-0"
             @error="$event.target.src = '/img/profile_default.svg'"
           >
           
           <div class="flex-grow min-w-0">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ contactInfo.roleLabel }}</span>
              
              <h3 class="font-bold text-lg md:text-xl text-[#1F1F1F] truncate">{{ contactInfo.nama }}</h3>
              
              <p class="text-xs text-gray-500 truncate">{{ contactInfo.subInfo }}</p>
           </div>
           
           <div v-if="userRole !== 'shelter' && contactInfo.nama && contactInfo.nama !== 'Menunggu Driver...'" class="flex gap-3 flex-shrink-0">
              <button 
                @click="handleRealCall(contactInfo.phone)" 
                class="w-12 h-12 md:w-14 md:h-14 bg-[#4E7C68] hover:bg-[#3b6150] rounded-[18px] flex items-center justify-center transition shadow-sm group"
              >
                  <i class="fas fa-phone text-white group-hover:scale-110 transition-transform"></i>
              </button>
              
              <button 
                @click="openChat" 
                class="w-12 h-12 md:w-14 md:h-14 bg-[#4E7C68] hover:bg-[#3b6150] rounded-[18px] flex items-center justify-center transition shadow-sm group text-white"
              >
                  <i class="fas fa-comment-alt text-white group-hover:scale-110 transition-transform"></i>
              </button>
           </div>
        </div>

        <div class="bg-gray-100 rounded-[30px] p-6 shadow-sm flex-grow">
           <h3 class="font-bold text-lg text-[#1F1F1F] mb-4">Detail Laporan</h3>
           <div class="space-y-3">
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Jenis</span><p class="font-semibold text-sm text-[#1F1F1F] capitalize">{{ trackingData.laporan.jenis === 'stray' ? 'Laporan penemuan kucing liar': trackingData.laporan.jenis === 'missing'? 'Laporan penemuan kucing hilang': trackingData.laporan.jenis}}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Pemilik/Pelapor</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.pemilik }}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Lokasi</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.lokasi }}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Deskripsi</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.deskripsi }}</p></div>
              
              <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 h-50">
                 <span class="text-xs text-gray-500 font-medium ml-2">Foto:</span>
                 <div class="h-42 flex-grow rounded-lg overflow-hidden relative group cursor-pointer" @click="previewImage(trackingData.laporan.foto)">
                    <img :src="resolveImageUrl(trackingData.laporan.foto)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute bottom-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                        <i class="fas fa-expand-alt text-xs"></i>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <div 
        :class="[
          isMapExpanded ? 'fixed inset-0 z-[9999] rounded-none h-full w-full' : 'w-full lg:w-[55%] relative rounded-b-none rounded-t-[30px] lg:rounded-r-[40px] lg:rounded-l-none overflow-hidden h-[400px] lg:h-auto lg:min-h-full z-0'
        ]"
        class="bg-gray-200 transition-all duration-300"
      >
         <div id="trackingMap" class="w-full h-full absolute inset-0 z-0"></div>
         
         <button 
            @click="toggleMapExpand"
            class="absolute bg-white rounded-full p-3 shadow-xl pointer-events-auto z-50 hover:bg-gray-100 active:scale-95 transition text-[#1F1F1F]"
            :class="isMapExpanded ? 'bottom-8 right-6' : 'bottom-6 right-6'"
         >
             <i class="fas" :class="isMapExpanded ? 'fa-compress-arrows-alt' : 'fa-expand-arrows-alt'"></i>
         </button>
      </div>

    </div>

    <teleport to="body">
        <div v-if="showPhotoModal" class="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4 cursor-zoom-out" @click="showPhotoModal = false">
            <img :src="selectedPhotoUrl" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl cursor-default" @click.stop>
            <button class="absolute top-6 right-6 text-white text-4xl hover:text-gray-300">&times;</button>
        </div>
    </teleport>

    <teleport to="body">
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-up shadow-2xl">
                <h3 class="text-xl font-bold mb-4 text-gray-800">{{ nextActionTitle }}</h3>
                <div @click="$refs.proofInput.click()" class="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition mb-6">
                    <img v-if="proofPreview" :src="proofPreview" class="h-full w-full object-contain rounded-lg">
                    <div v-else class="text-center text-gray-400">
                        <i class="fas fa-camera text-3xl mb-2"></i>
                        <p class="text-sm">Klik untuk ambil foto</p>
                    </div>
                </div>
                <input type="file" ref="proofInput" class="hidden" accept="image/*" @change="handleProofFile">
                <div class="flex gap-3">
                    <button @click="showUploadModal = false" class="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-600">Batal</button>
                    <button @click="submitStatusUpdate" :disabled="!proofFile || isSubmitting" class="flex-1 py-3 rounded-xl bg-[#EBCD5E] text-white font-bold shadow-md disabled:opacity-50">
                        {{ isSubmitting ? 'Mengirim...' : 'Konfirmasi' }}
                    </button>
                </div>
            </div>
        </div>
    </teleport>

    <teleport to="body">
        <div v-if="showChatModal" class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-md h-[600px] rounded-[30px] flex flex-col overflow-hidden shadow-2xl animate-up relative">
                
                <div class="bg-[#3A5F50] p-4 px-6 flex items-center gap-4 text-white shadow-md z-10">
                    <button @click="showChatModal = false" class="hover:bg-white/20 p-2 rounded-full transition"><i class="fas fa-arrow-left"></i></button>
                    
                    <div class="w-10 h-10 rounded-full bg-[#EBCD5E] flex items-center justify-center text-[#3A5F50] font-bold text-xl border-2 border-white overflow-hidden">
                        <img 
                            v-if="contactInfo.foto" 
                            :src="resolveImageUrl(contactInfo.foto)" 
                            class="w-full h-full object-cover"
                            @error="$event.target.style.display='none'"
                        >
                        <span v-else>{{ contactInfo.nama?.charAt(0) || 'U' }}</span>
                    </div>

                    <div class="flex-grow flex flex-col">
                        <span class="font-bold text-lg ml-2">{{ contactInfo.nama }}</span>
                        <span class="text-[10px] ml-2 opacity-80 uppercase tracking-wider">{{ contactInfo.roleLabel }}</span>
                    </div>

                    <button @click="fetchChatMessages" class="hover:bg-white/20 p-2 rounded-full"><i class="fas fa-sync-alt"></i></button>
                </div>

                <div ref="chatContainerRef" class="flex-grow bg-gray-100 p-4 space-y-6 overflow-y-auto relative scroll-smooth">
                    
                    <div v-if="chatMessages.length === 0" class="flex justify-center items-center h-full">
                        <span class="text-gray-400 text-sm">Belum ada pesan.</span>
                    </div>

                    <div v-for="(msg, index) in chatMessages" :key="msg.id" 
                         class="flex group w-full" 
                         :class="isMyMessage(msg.sender_id) ? 'justify-end' : 'justify-start'">
                        
                        <div class="relative max-w-[80%]">
                            <div 
                              class="p-3 px-4 rounded-2xl shadow-sm text-sm leading-relaxed"
                              :class="isMyMessage(msg.sender_id) ? 'bg-[#EBCD5E] text-[#1F1F1F] rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'"
                            >
                               {{ msg.message }}
                               
                               <span class="block text-[10px] opacity-60 mt-1 text-right font-mono">
                                   {{ formatTime(msg.created_at) }}
                               </span>
                            </div>

                            <button 
                               v-if="isMyMessage(msg.sender_id)"
                               @click="deleteMessage(msg.id)" 
                               class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-20 cursor-pointer" 
                               title="Hapus Pesan"
                            >
                               ✕
                            </button>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-white border-t flex gap-3 items-center">
                    <input v-model="chatInput" @keyup.enter="sendMessage" type="text" placeholder="Ketik pesan..." class="flex-grow bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-[#3A5F50] text-sm">
                    <button @click="sendMessage" class="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#128C7E] transition"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    </teleport>

    <teleport to="body">
        <div v-if="showCallModal" class="fixed inset-0 bg-[#1F1F1F]/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div class="flex flex-col items-center text-white w-full max-w-sm animate-up">
                
                <div class="w-32 h-32 rounded-full bg-[#EBCD5E] flex items-center justify-center text-[#3A5F50] font-bold text-6xl border-4 border-[#3A5F50] shadow-2xl mb-6 animate-pulse overflow-hidden">
                    <img 
                        v-if="contactInfo.foto" 
                        :src="resolveImageUrl(contactInfo.foto)" 
                        class="w-full h-full object-cover"
                    >
                    <span v-else>{{ contactInfo.nama?.charAt(0) || 'U' }}</span>
                </div>

                <h2 class="text-2xl font-bold mb-1 tracking-wide text-center">{{ contactInfo.nama }}</h2>
                <p class="text-sm text-[#EBCD5E] mb-8 tracking-wider font-bold uppercase">{{ contactInfo.roleLabel }}</p>
                
                <div class="flex items-center gap-8">
                    <button @click="showCallModal = false; openChat()" class="w-16 h-16 bg-[#3A3A3A] rounded-full flex items-center justify-center text-2xl hover:bg-[#505050] transition"><i class="fas fa-comment-alt"></i></button>
                    <button @click="showCallModal = false" class="w-20 h-20 bg-[#FF3B30] rounded-full flex items-center justify-center text-3xl hover:bg-red-600 transition shadow-lg transform hover:scale-105"><i class="fas fa-phone-slash"></i></button>
                    <button @click="handleCall(contactInfo.phone)" class="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-2xl hover:bg-green-600 transition"><i class="fas fa-phone"></i></button>
                </div>
            </div>
        </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api/http';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- ICONS ---
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });

const courierIcon = L.divIcon({
    html: '<div style="background-color: #EBCD5E; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-motorcycle text-white text-xs"></i></div>',
    className: '', iconSize: [30, 30], iconAnchor: [15, 15]
});

const route = useRoute();
// PERBAIKAN: Gunakan ref agar reaktif & cek saat mounted
const currentUserId = ref(0); 
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');

// --- STATE DATA ---
const isLoading = ref(true);
const trackingData = ref({
    id: '', status: 'assigned',
    alamat: '-', tujuan: '-',
    kurir: { nama: '', shelter: '', foto: '', phone: '' }, 
    laporan: { jenis: '-', pemilik: '-', lokasi: '-', deskripsi: '', foto: '' },
    bukti: {},
    posisi_awal: [0,0], posisi_akhir: [0,0]
});

// --- STATE UI ---
const isMapExpanded = ref(false);
const showPhotoModal = ref(false);
const selectedPhotoUrl = ref('');
const showCallModal = ref(false);
const showUploadModal = ref(false);
const showChatModal = ref(false);

// --- DRIVER & CHAT STATE ---
const proofFile = ref(null);
const proofPreview = ref(null);
const nextStatus = ref('');
const isSubmitting = ref(false);
const chatInput = ref('');
const chatMessages = ref([]);
const chatContainerRef = ref(null);
let chatInterval = null;

// --- MAP & INTERVALS ---
let map = null;
let courierMarker = null;
let routeLine = null;
let locationInterval = null;
let trackingInterval = null;
let lastSentPosition = null;

// --- COMPUTED HELPERS ---
const currentStep = computed(() => {
    if (trackingData.value.status === 'assigned') return 1;
    if (trackingData.value.status === 'in_transit') return 2;
    if (trackingData.value.status === 'completed') return 3;
    return 1;
});
const progressPercent = computed(() => currentStep.value === 1 ? 0 : currentStep.value === 2 ? 50 : 100);
const trackingStatusText = computed(() => {
    switch(trackingData.value.status) {
        case 'assigned': return 'Driver Menuju Lokasi';
        case 'in_transit': return 'Sedang Dijemput';
        case 'completed': return 'Selesai';
        default: return 'Menunggu';
    }
});
const nextActionTitle = computed(() => nextStatus.value === 'in_transit' ? 'Bukti Penjemputan' : 'Bukti Sampai Shelter');

// --- METHODS UTAMA ---
const contactInfo = computed(() => {
    // Jika saya adalah DRIVER, tampilkan info PELAPOR
    if (userRole.value === 'driver') {
        return {
            roleLabel: 'Pelapor',
            nama: trackingData.value.laporan.pemilik,
            subInfo: 'Pemilik Laporan', // atau trackingData.value.laporan.phone
            foto: trackingData.value.laporan.foto_profil, // Foto profil user
            phone: trackingData.value.laporan.phone
        };
    } 
    
    // Jika saya USER/GUEST, tampilkan info DRIVER
    else {
        return {
            roleLabel: 'Driver',
            nama: trackingData.value.kurir.nama || 'Menunggu Driver...',
            subInfo: trackingData.value.kurir.shelter || '...',
            foto: trackingData.value.kurir.foto,
            phone: trackingData.value.kurir.phone
        };
    }
});

function resolveImageUrl(path) {
    if (!path || path.includes('NULL')) return '/img/placeholder.png';
    if (path.startsWith('http')) return path;
    return `http://localhost:3000${path}`;
}
function getStatusClass(status) {
    if (status === 'assigned') return 'bg-blue-100 text-blue-700';
    if (status === 'in_transit') return 'bg-yellow-100 text-yellow-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    return 'bg-gray-100';
}
function formatStatus(status) {
    if (status === 'assigned') return 'Ditugaskan';
    if (status === 'in_transit') return 'Dijemput';
    if (status === 'completed') return 'Selesai';
    return status;
}
function formatTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}
function previewImage(url) {
    selectedPhotoUrl.value = resolveImageUrl(url);
    showPhotoModal.value = true;
}
function toggleMapExpand() {
    isMapExpanded.value = !isMapExpanded.value;
    setTimeout(() => { if (map) map.invalidateSize(); }, 300);
}

// --- FETCHING ---
async function fetchTrackingData() {
    const assignmentId = route.params.id || route.query.id;
    if (!assignmentId) {
        console.error("Tracking ID tidak ditemukan di URL");
        return;
    }
    if (!trackingData.value.id) isLoading.value = true;

    try {
        const response = await apiClient.get(`/rescue/tracking/${assignmentId}`);
        trackingData.value = response.data;
        isLoading.value = false;
        await nextTick();
        if (!map) initMap();
        else updateMapMarkers();
    } catch (error) {
        isLoading.value = false;
        console.error("Gagal load tracking:", error);
    }
}

// --- MAP ---
function initMap() {
    const container = document.getElementById('trackingMap');
    if (!container) return;
    const startPos = trackingData.value.posisi_awal;
    map = L.map('trackingMap').setView(startPos, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    updateMapMarkers();
}
function updateMapMarkers() {
    if (!map) return;
    const startPos = trackingData.value.posisi_awal;
    const endPos = trackingData.value.posisi_akhir;
    L.marker(startPos).addTo(map).bindPopup("<b>Lokasi Jemput</b>").openPopup();
    L.marker(endPos).addTo(map).bindPopup("<b>Shelter</b>");
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline([startPos, endPos], {color: '#3A5F50', weight: 4, dashArray: '10, 10'}).addTo(map);
    map.fitBounds(L.latLngBounds([startPos, endPos]), { padding: [50, 50] });
    if (!courierMarker) courierMarker = L.marker(startPos, { icon: courierIcon }).addTo(map).bindPopup("Driver");
}

// --- REALTIME ---
function startSendingLocation() {
    if (!navigator.geolocation) return;
    locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            if (courierMarker) courierMarker.setLatLng([latitude, longitude]);
            try {
                await apiClient.post('/rescue/location', { assignmentId: trackingData.value.db_id, lat: latitude, long: longitude });
            } catch (e) {}
        }, () => {}, { enableHighAccuracy: true });
    }, 5000);
}
function startTrackingDriver() {
    trackingInterval = setInterval(async () => {
        try {
            const res = await apiClient.get(`/rescue/location/${trackingData.value.db_id}`);
            if (res.data.status === 'success' && courierMarker) {
                courierMarker.setLatLng([res.data.data.lat, res.data.data.long]);
            }
        } catch (e) {}
    }, 5000);
}

// --- DRIVER ACTIONS ---
function openActionModal(statusTarget) {
    nextStatus.value = statusTarget; proofFile.value = null; proofPreview.value = null; showUploadModal.value = true;
}
function handleProofFile(event) {
    const file = event.target.files[0];
    if (file) { proofFile.value = file; proofPreview.value = URL.createObjectURL(file); }
}
async function submitStatusUpdate() {
    if (!proofFile.value) return;
    isSubmitting.value = true;
    try {
        const formData = new FormData();
        formData.append('assignmentId', trackingData.value.db_id);
        formData.append('status', nextStatus.value);
        formData.append('photo', proofFile.value);
        await apiClient.post('/rescue/update-status', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        showUploadModal.value = false;
        fetchTrackingData();
    } catch (e) { alert('Gagal update'); } 
    finally { isSubmitting.value = false; }
}

// --- CHAT & CALL (PERBAIKAN UTAMA) ---

function openChat() {
    showChatModal.value = true;
    fetchChatMessages();
    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(fetchChatMessages, 3000);
}

async function fetchChatMessages() {
    try {
        const id = trackingData.value.id;
        const res = await apiClient.get(`/rescue/chat/${id}`);
        chatMessages.value = res.data;
        
        // Auto scroll ke bawah
        nextTick(() => { 
            if(chatContainerRef.value) chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight; 
        });
    } catch (e) { console.error("Chat Error", e); }
}

async function sendMessage() {
    if (!chatInput.value.trim()) return;
    try {
        await apiClient.post('/rescue/chat', { trackingId: trackingData.value.id, message: chatInput.value });
        chatInput.value = '';
        fetchChatMessages();
    } catch (e) { alert("Gagal kirim"); }
}

// LOGIKA PENENTU POSISI CHAT
function isMyMessage(senderId) {
    // Debugging: Cek di Console Browser
    // console.log(`Cek: Sender ${senderId} vs MyID ${currentUserId.value}`);
    
    return parseInt(senderId) === currentUserId.value;
}

// LOGIKA HAPUS
async function deleteMessage(messageId) {
    if (!confirm("Hapus pesan ini?")) return;
    try {
        await apiClient.delete(`/rescue/chat/${messageId}`);
        chatMessages.value = chatMessages.value.filter(msg => msg.id !== messageId);
    } catch (error) {
        alert("Gagal hapus: " + (error.response?.data?.error || "Error"));
    }
}

function handleRealCall() {
    const phone = trackingData.value.kurir.phone;
    if (phone) window.location.href = `tel:${phone}`;
    else alert("Nomor telepon tidak tersedia.");
}

// --- LIFECYCLE ---
onMounted(async () => {
    // 1. Ambil ID User dari LocalStorage
    const storedId = localStorage.getItem('userId');
    if (storedId && storedId !== 'undefined') {
        currentUserId.value = parseInt(storedId);
    } else {
        // Jangan warn error, cukup set 0 agar tidak crash, 
        // tapi fitur chat mungkin terbatas (read-only)
        console.warn("User ID tidak ditemukan di LocalStorage! Chat akan error.");
        currentUserId.value = 0; 
    }

    await fetchTrackingData();
    if (['in_transit', 'assigned'].includes(trackingData.value.status)) {
        if (userRole.value === 'driver') startSendingLocation();
        else startTrackingDriver();
    }
});

onUnmounted(() => {
    if (map) map.remove();
    if (locationInterval) clearInterval(locationInterval);
    if (trackingInterval) clearInterval(trackingInterval);
    if (chatInterval) clearInterval(chatInterval);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
.animate-up { animation: up 0.3s ease-out; }
@keyframes up { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>