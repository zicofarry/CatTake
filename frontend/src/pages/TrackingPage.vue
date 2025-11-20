<template>
  <!-- 
    BACKGROUND HALAMAN: Hijau Gelap
    pt-20 (mobile) md:pt-24 (desktop) agar turun dari navbar
  -->
  <div class="min-h-screen bg-[#3A5F50] font-sans overflow-x-hidden pt-20 md:pt-24 pb-10 md:pb-20 flex justify-center items-start md:items-center relative px-0 md:px-4">
    
    <!-- 
      KARTU PUTIH BESAR (CONTAINER UTAMA)
      Layout Responsive: 
      - Mobile: flex-col-reverse (Peta di Atas, Info di Bawah)
      - Desktop: lg:flex-row (Info Kiri, Peta Kanan)
    -->
    <div class="bg-white w-full max-w-[1200px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row h-auto lg:min-h-[800px] rounded-t-[30px] lg:rounded-none mt-0 lg:mt-0">
      
      <!-- === KOLOM KIRI (INFO & DATA) === -->
      <!-- 
        Styling Mobile Sheet Effect:
        - -mt-8: Agar bagian ini naik sedikit menutupi peta.
        - rounded-t-[30px]: Sudut atas melengkung.
        - z-10: Agar berada di atas peta (saat mode normal).
      -->
      <div class="w-full lg:w-[45%] p-5 md:p-10 flex flex-col gap-6 overflow-y-visible lg:overflow-y-auto lg:max-h-[900px] custom-scrollbar z-10 bg-white relative -mt-8 lg:mt-0 rounded-t-[30px] lg:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:shadow-none">
        
        <!-- 1. SECTION PELACAKAN LANGSUNG -->
        <div class="bg-gray-100 rounded-[30px] p-6 md:p-8 shadow-sm">
           <div class="flex items-center gap-3 mb-6">
              <!-- Icon Header Custom -->
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3C5.51472 3 3.5 5.01472 3.5 7.5C3.5 11 8 15 8 15C8 15 12.5 11 12.5 7.5C12.5 5.01472 10.4853 3 8 3Z" stroke="#1F1F1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8" cy="7.5" r="1.5" fill="#1F1F1F"/>
                <path d="M16 10C13.5147 10 11.5 12.0147 11.5 14.5C11.5 18 16 22 16 22C16 22 20.5 18 20.5 14.5C20.5 12.0147 18.4853 10 16 10Z" stroke="#1F1F1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="16" cy="14.5" r="1.5" fill="#1F1F1F"/>
              </svg>
              <h2 class="text-xl md:text-2xl font-bold text-[#1F1F1F]">Pelacakan Langsung</h2>
           </div>

           <!-- Grid Info -->
           <div class="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 text-sm md:text-base">
              <div class="flex flex-col">
                 <span class="text-gray-500 mb-1">Id:</span>
                 <span class="font-bold text-[#1F1F1F] text-base md:text-lg">{{ trackingData.id }}</span>
              </div>
              <div class="flex flex-col items-end">
                 <span class="text-gray-500 mb-1">Status:</span>
                 <span class="bg-[#EBCD5E] text-[#1F1F1F] px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-sm">
                    {{ trackingStatus.text }}
                 </span>
              </div>
              <div class="flex flex-col">
                 <span class="text-gray-500 mb-1">Alamat:</span>
                 <span class="font-bold text-[#1F1F1F] text-base md:text-lg truncate max-w-[120px] md:max-w-none">{{ trackingData.alamat }}</span>
              </div>
              <div class="flex flex-col items-end">
                 <span class="text-gray-500 mb-1">Tujuan:</span>
                 <span class="font-bold text-[#1F1F1F] text-base md:text-lg">{{ trackingData.tujuan }}</span>
              </div>
           </div>

           <!-- Stepper Progress -->
           <div class="relative px-1 md:px-2 mt-6 mb-2">
              <!-- Background Line -->
              <div class="absolute top-[22px] left-0 w-full h-1.5 bg-gray-300 rounded-full -z-0"></div>
              <!-- Active Line -->
              <div 
                  class="absolute top-[22px] left-0 h-1.5 bg-[#EBCD5E] rounded-full transition-all duration-700 z-0"
                  :style="{ width: trackingStatus.progress + '%' }"
              ></div>

              <div class="flex justify-between relative z-10">
                  <!-- Step 1 -->
                  <div class="flex flex-col items-center gap-2 w-1/3">
                      <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#EBCD5E] border-4 border-white shadow-md flex items-center justify-center text-white relative">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                          <div class="absolute -bottom-1 -right-1 bg-[#EBCD5E] rounded-full border-2 border-white p-[1px]"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                      </div>
                      <span class="text-[9px] md:text-[11px] font-bold text-[#1F1F1F] text-center mt-1 leading-tight">Laporan diterima</span>
                  </div>
                  <!-- Step 2 -->
                  <div class="flex flex-col items-center gap-2 w-1/3">
                      <div 
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors duration-500"
                          :class="trackingStatus.id >= 2 ? 'bg-[#EBCD5E] text-white' : 'bg-gray-300 text-white'"
                      >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                      </div>
                      <span class="text-[9px] md:text-[11px] font-bold text-[#1F1F1F] text-center mt-1 leading-tight">Dalam Perjalanan</span>
                  </div>
                  <!-- Step 3 -->
                  <div class="flex flex-col items-center gap-2 w-1/3">
                      <div 
                          class="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors duration-500"
                          :class="trackingStatus.id === 3 ? 'bg-[#EBCD5E]' : 'bg-white'"
                      >
                          <svg v-if="trackingStatus.id === 3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span class="text-[9px] md:text-[11px] font-bold text-[#1F1F1F] text-center mt-1 leading-tight">Selesai</span>
                  </div>
              </div>
           </div>
        </div>

        <!-- 2. SECTION KURIR -->
        <div class="bg-gray-100 rounded-[30px] p-4 md:p-5 flex items-center gap-4 shadow-sm">
           <img :src="trackingData.kurir.foto" alt="Kurir" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0">
           <div class="flex-grow min-w-0">
              <h3 class="font-bold text-lg md:text-xl text-[#1F1F1F] truncate">{{ trackingData.kurir.nama }}</h3>
              <p class="text-xs text-gray-500 truncate">{{ trackingData.kurir.shelter }}</p>
           </div>
           <div class="flex gap-3 flex-shrink-0">
              <!-- Tombol Telpon -->
              <button @click="showCallModal = true" class="w-12 h-12 md:w-14 md:h-14 bg-[#4E7C68] hover:bg-[#3b6150] rounded-[18px] flex items-center justify-center transition shadow-sm group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>
              <!-- Tombol Chat -->
              <button @click="showChatModal = true" class="w-12 h-12 md:w-14 md:h-14 bg-[#4E7C68] hover:bg-[#3b6150] rounded-[18px] flex items-center justify-center transition shadow-sm group">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
           </div>
        </div>

        <!-- 3. SECTION LAPORAN KAMU -->
        <div class="bg-gray-100 rounded-[30px] p-6 shadow-sm flex-grow">
           <h3 class="font-bold text-lg text-[#1F1F1F] mb-4">Laporan Kamu:</h3>
           <div class="space-y-3">
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Jenis Laporan</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.jenis }}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Nama Pemilik</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.pemilik }}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Lokasi</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.lokasi }}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100"><span class="text-[10px] text-gray-400 block uppercase tracking-wider mb-0.5">Deskripsi</span><p class="font-semibold text-sm text-[#1F1F1F]">{{ trackingData.laporan.deskripsi }}</p></div>
              
              <!-- Foto dengan Zoom -->
              <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <span class="text-xs text-gray-500 font-medium ml-2">Foto:</span>
                 <div 
                    class="h-16 flex-grow rounded-lg overflow-hidden relative group cursor-pointer"
                    @click="showPhotoModal = true"
                 >
                    <img :src="trackingData.laporan.foto" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <!-- Icon Expand -->
                    <div class="absolute bottom-1 right-1 bg-white/90 rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-white transition">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <!-- === KOLOM KANAN (PETA) === -->
      <!-- 
         Responsive Map:
         - Mobile: h-[400px] agar terlihat jelas di atas.
         - Desktop: h-auto (mengisi sisa tinggi container).
         - Full Screen Logic: jika isMapExpanded = true, jadi fixed inset-0.
      -->
      <div 
        :class="[
          isMapExpanded ? 'fixed inset-0 z-[9999] rounded-none h-full w-full' : 'w-full lg:w-[55%] relative rounded-b-none rounded-t-[30px] lg:rounded-r-[40px] lg:rounded-l-none overflow-hidden h-[400px] lg:h-auto lg:min-h-full z-0'
        ]"
        class="bg-gray-50 transition-all duration-300"
      >
         <!-- Container untuk Leaflet Map -->
         <div id="trackingMapContainer" class="w-full h-full absolute inset-0 z-0"></div>
         
         <!-- Overlay gradient (hanya jika tidak full screen) -->
         <div v-if="!isMapExpanded" class="absolute inset-0 pointer-events-none shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)]"></div>
         
         <!-- Tombol Expand Map -->
         <!-- Posisi: bottom-20 di mobile agar tidak tertutup sheet info, bottom-6 di desktop/expanded -->
         <button 
            @click="toggleMapExpand"
            class="absolute right-6 bg-white rounded-full p-3 shadow-xl pointer-events-auto z-50 hover:bg-gray-100 active:scale-95 transition"
            :class="isMapExpanded ? 'bottom-8' : 'bottom-20 lg:bottom-6 lg:right-6'"
         >
             <!-- Icon Shrink -->
             <svg v-if="isMapExpanded" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F1F1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
             <!-- Icon Expand -->
             <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
         </button>
      </div>

    </div>

    <!-- =================== MODALS =================== -->

    <!-- 1. MODAL FOTO (Zoom) -->
    <teleport to="body">
        <div v-if="showPhotoModal" class="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" @click="showPhotoModal = false">
            <img :src="trackingData.laporan.foto" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl" @click.stop>
            <button class="absolute top-6 right-6 text-white text-4xl hover:text-gray-300">&times;</button>
        </div>
    </teleport>

    <!-- 2. MODAL CHAT -->
    <teleport to="body">
        <div v-if="showChatModal" class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-md h-[600px] rounded-[30px] flex flex-col overflow-hidden shadow-2xl animate-up relative">
                <!-- Header Chat -->
                <div class="bg-[#3A5F50] p-4 px-6 flex items-center gap-4 text-white shadow-md relative z-10">
                    <button @click="showChatModal = false" class="hover:bg-white/20 p-2 rounded-full transition">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div class="w-10 h-10 rounded-full bg-[#EBCD5E] flex items-center justify-center text-[#3A5F50] font-bold text-xl border-2 border-white">
                        {{ trackingData.kurir.nama.charAt(0) }}
                    </div>
                    <div class="flex-grow flex items-center justify-between">
                         <span class="font-bold text-lg ml-3">{{ trackingData.kurir.nama }}</span>
                         <button @click="clearAllChat" class="text-xs bg-red-500/80 hover:bg-red-500 px-3 py-1 rounded-full transition shadow-sm">Hapus Chat</button>
                    </div>
                </div>

                <!-- Isi Chat -->
                <div ref="chatContainerRef" class="flex-grow bg-gray-100 p-4 space-y-6 overflow-y-auto relative scroll-smooth">
                    <div v-if="chatMessages.length === 0" class="flex justify-center items-center h-full">
                        <span class="text-gray-400 text-sm">Belum ada pesan.</span>
                    </div>
                    <div v-for="(msg, index) in chatMessages" :key="index" class="flex group relative" :class="msg.isMe ? 'justify-end' : 'justify-start'">
                        <div 
                          class="p-4 rounded-2xl shadow-sm max-w-[80%] text-sm leading-relaxed relative"
                          :class="msg.isMe ? 'bg-[#EBCD5E] text-[#1F1F1F] rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'"
                        >
                           {{ msg.text }}
                           <button @click="deleteMessage(index)" class="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600" title="Hapus">✕</button>
                        </div>
                    </div>
                </div>

                <!-- Footer Input -->
                <div class="p-4 bg-white border-t flex gap-3 items-center">
                    <input 
                      v-model="chatInput" 
                      @keyup.enter="sendMessage"
                      type="text" 
                      placeholder="Ketik pesan..." 
                      class="flex-grow bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-[#3A5F50] text-sm"
                    >
                    <button 
                      @click="sendMessage"
                      class="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#128C7E] transition flex-shrink-0"
                    >
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1 relative top-[1px] left-[-1px]">
                         <line x1="22" y1="2" x2="11" y2="13"></line>
                         <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                       </svg>
                    </button>
                </div>
            </div>
        </div>
    </teleport>

    <!-- 3. MODAL CALL -->
    <teleport to="body">
        <div v-if="showCallModal" class="fixed inset-0 bg-[#1F1F1F]/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div class="flex flex-col items-center text-white w-full max-w-sm">
                <div class="w-32 h-32 rounded-full bg-[#EBCD5E] flex items-center justify-center text-[#3A5F50] font-bold text-6xl border-4 border-[#3A5F50] shadow-2xl mb-6 animate-pulse">
                    {{ trackingData.kurir.nama.charAt(0) }}
                </div>
                <h2 class="text-2xl font-bold mb-2 tracking-wide">{{ trackingData.kurir.nama }}</h2>
                <p class="text-sm text-gray-300 mb-16 tracking-wider">Memanggil...</p>
                <div class="flex items-center gap-8">
                    <button class="w-16 h-16 bg-[#3A3A3A] rounded-full flex items-center justify-center text-2xl hover:bg-[#505050] transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg></button>
                    <button @click="showCallModal = false" class="w-20 h-20 bg-[#FF3B30] rounded-full flex items-center justify-center text-3xl hover:bg-red-600 transition shadow-lg transform hover:scale-105"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/></svg></button>
                    <button class="w-16 h-16 bg-[#3A3A3A] rounded-full flex items-center justify-center text-2xl hover:bg-[#505050] transition"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></button>
                </div>
            </div>
        </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// DATA SIMULASI
const trackingData = reactive({
    id: '#TRK123456',
    alamat: 'Cimahi',
    tujuan: 'Gerlong',
    kurir: { nama: 'Adit', shelter: 'Kurir - Shelter tigakosongenem', foto: 'https://placehold.co/100x100/EBCD5E/3A5F50?text=A', posisi: [-6.873, 107.592] },
    laporan: { jenis: 'Laporan Kucing Hilang', pemilik: 'Anas cedua', lokasi: 'JL.Geger Asih No.2 Kec.Sukasari', deskripsi: 'Aku nemu kucing warna abu belang punya anas yang hilang gara gara kabur kemarin', foto: 'https://placehold.co/600x400/E0E0E0/707070?text=Foto+Kucing' },
    destinasiPosisi: [-6.880, 107.590]
});

const trackingStatus = ref({ id: 2, text: 'In Transit', progress: 50 });
const showChatModal = ref(false);
const showCallModal = ref(false);
const showPhotoModal = ref(false);
const isMapExpanded = ref(false);

let map = null;
let courierMarker = null;
let simulationInterval = null;

// DATA CHAT
const chatInput = ref('');
const chatMessages = ref([{ text: 'Halo kak, saya sedang menuju lokasi ya.', isMe: false }, { text: 'Oke mas, hati-hati di jalan.', isMe: true }]);
const chatContainerRef = ref(null);

onMounted(async () => { await nextTick(); initMap(); });
onUnmounted(() => { if (map) map.remove(); if (simulationInterval) clearInterval(simulationInterval); });

function initMap() {
    map = L.map('trackingMapContainer').setView(trackingData.kurir.posisi, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

    const courierIcon = L.divIcon({ html: `<div class="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-4 border-white animate-bounce"><i class="fas fa-car-side text-sm"></i></div>`, className: '', iconSize: [40,40], iconAnchor: [20,20] });
    const destIcon = L.divIcon({ html: `<div class="bg-[#EBCD5E] text-[#3A5F50] w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-4 border-white"><i class="fas fa-map-marker-alt text-lg"></i></div>`, className: '', iconSize: [40,40], iconAnchor: [20,40] });

    courierMarker = L.marker(trackingData.kurir.posisi, { icon: courierIcon }).addTo(map);
    L.marker(trackingData.destinasiPosisi, { icon: destIcon }).addTo(map);

    startSimulation();
}

function toggleMapExpand() {
    isMapExpanded.value = !isMapExpanded.value;
    setTimeout(() => { if (map) map.invalidateSize(); }, 300);
}

function startSimulation() {
    let steps = 0;
    const maxSteps = 20; 
    simulationInterval = setInterval(() => {
        steps++;
        const lat = trackingData.kurir.posisi[0] + (trackingData.destinasiPosisi[0] - trackingData.kurir.posisi[0]) * (steps / maxSteps);
        const lng = trackingData.kurir.posisi[1] + (trackingData.destinasiPosisi[1] - trackingData.kurir.posisi[1]) * (steps / maxSteps);
        courierMarker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
        trackingStatus.value.progress = 50 + (steps / maxSteps) * 50;
        if (steps >= maxSteps) { trackingStatus.value = { id: 3, text: 'Selesai', progress: 100 }; clearInterval(simulationInterval); }
    }, 500);
}

function sendMessage() { if (!chatInput.value.trim()) return; chatMessages.value.push({ text: chatInput.value, isMe: true }); chatInput.value = ''; nextTick(() => { if (chatContainerRef.value) chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight; }); }
function deleteMessage(index) { if (confirm('Hapus pesan ini?')) chatMessages.value.splice(index, 1); }
function clearAllChat() { if (confirm('Hapus semua riwayat chat?')) chatMessages.value = []; }
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #999; }
@keyframes up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.animate-up { animation: up 0.3s ease-out; }
.animate-pulse-slow { animation: pulse 2s infinite; }
#trackingMapContainer { height: 100%; width: 100%; }
</style>