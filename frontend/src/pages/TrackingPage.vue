<template>
  <div class="min-h-screen bg-[#3A5F50] font-sans overflow-x-hidden pt-20 md:pt-24 pb-10 md:pb-20 flex justify-center items-start md:items-center relative px-0 md:px-4">
    
    <div v-if="isLoading" class="flex h-screen items-center justify-center text-white">
        <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl mb-4"></i>
            <p>Memuat data pelacakan...</p>
        </div>
    </div>

    <div v-show="!isLoading" class="bg-white w-full max-w-[1200px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row h-auto lg:min-h-[800px] rounded-t-[30px] lg:rounded-none mt-0 lg:mt-0">
      
      <div class="w-full lg:w-[45%] p-5 md:p-10 flex flex-col gap-6 overflow-y-visible lg:overflow-y-auto lg:max-h-[900px] custom-scrollbar z-10 bg-white relative -mt-8 lg:mt-0 rounded-t-[30px] lg:rounded-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] lg:shadow-none">
        
        <div class="bg-gray-100 rounded-[30px] p-6 md:p-8 shadow-sm">
           <div class="flex items-center gap-3 mb-6">
              <i class="fas fa-route text-2xl text-[#1F1F1F]"></i>
              <h2 class="text-xl md:text-2xl font-bold text-[#1F1F1F]">Status: {{ trackingStatusText }}</h2>
           </div>

           <div class="grid grid-cols-2 gap-y-4 gap-x-2 mb-8 text-sm md:text-base">
              <div class="flex flex-col">
                 <span class="text-gray-500 mb-1">Id:</span>
                 <span class="font-bold text-[#1F1F1F] text-base md:text-lg">{{ trackingData.id }}</span>
              </div>
              <div class="flex flex-col items-end">
                 <span class="text-gray-500 mb-1">Status:</span>
                 <span 
                    class="px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-sm"
                    :class="getStatusClass(trackingData.status)"
                 >
                    {{ trackingData.status }}
                 </span>
              </div>
              <div class="flex flex-col col-span-2 border-t border-gray-200 pt-4 mt-2">
                 <div class="flex justify-between mb-2">
                    <span class="text-gray-500">Dari:</span>
                    <span class="font-bold text-right truncate w-1/2">{{ trackingData.alamat }}</span>
                 </div>
                 <div class="flex justify-between">
                    <span class="text-gray-500">Ke Shelter:</span>
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
                      <span class="text-[10px] font-bold text-center mt-1">Sampai Shelter</span>
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
               <div v-if="trackingData.bukti.pickup" class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-300 relative">
                   <img :src="resolveImageUrl(trackingData.bukti.pickup)" class="w-full h-full object-cover">
                   <span class="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] w-full text-center py-1">Bukti Jemput</span>
               </div>
               <div v-if="trackingData.bukti.dropoff" class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-gray-300 relative">
                   <img :src="resolveImageUrl(trackingData.bukti.dropoff)" class="w-full h-full object-cover">
                   <span class="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] w-full text-center py-1">Bukti Selesai</span>
               </div>
           </div>

        </div>

        <div class="bg-gray-100 rounded-[30px] p-4 md:p-5 flex items-center gap-4 shadow-sm">
           <div class="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <i class="fas fa-user text-2xl text-gray-500"></i>
           </div>
           <div class="flex-grow min-w-0">
              <h3 class="font-bold text-lg md:text-xl text-[#1F1F1F] truncate">{{ trackingData.kurir.nama }}</h3>
              <p class="text-xs text-gray-500 truncate">{{ trackingData.kurir.shelter }}</p>
           </div>
        </div>

        <div class="bg-gray-100 rounded-[30px] p-6 shadow-sm flex-grow">
           <h3 class="font-bold text-lg text-[#1F1F1F] mb-4">Detail Laporan</h3>
           <div class="space-y-3">
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm"><span class="text-[10px] text-gray-400 block uppercase">Pemilik</span><p class="font-semibold">{{ trackingData.laporan.pemilik }}</p></div>
              <div class="bg-white px-4 py-3 rounded-xl shadow-sm"><span class="text-[10px] text-gray-400 block uppercase">Deskripsi</span><p class="font-semibold">{{ trackingData.laporan.deskripsi }}</p></div>
              
              <div class="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                 <span class="text-xs text-gray-500 font-medium ml-2">Foto:</span>
                 <div class="h-16 flex-grow rounded-lg overflow-hidden relative group cursor-pointer" @click="previewImage(trackingData.laporan.foto)">
                    <img :src="resolveImageUrl(trackingData.laporan.foto)" class="w-full h-full object-cover">
                 </div>
              </div>
           </div>
        </div>

      </div>

      <div class="w-full lg:w-[55%] relative rounded-b-none rounded-t-[30px] lg:rounded-r-[40px] lg:rounded-l-none overflow-hidden h-[400px] lg:h-auto lg:min-h-full z-0 bg-gray-200">
         <div id="trackingMap" class="w-full h-full absolute inset-0 z-0"></div>
      </div>

    </div>

    <teleport to="body">
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-sm rounded-3xl p-6 animate-up shadow-2xl">
                <h3 class="text-xl font-bold mb-4 text-gray-800">{{ nextActionTitle }}</h3>
                <p class="text-gray-500 text-sm mb-6">Silakan ambil foto sebagai bukti bahwa tugas ini telah dilakukan.</p>
                
                <div 
                    @click="$refs.proofInput.click()"
                    class="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#EBCD5E] transition mb-6"
                >
                    <img v-if="proofPreview" :src="proofPreview" class="h-full w-full object-contain rounded-lg">
                    <div v-else class="text-center text-gray-400">
                        <i class="fas fa-camera text-3xl mb-2"></i>
                        <p class="text-sm">Klik untuk ambil foto</p>
                    </div>
                </div>
                <input type="file" ref="proofInput" class="hidden" accept="image/*" @change="handleProofFile">

                <div class="flex gap-3">
                    <button @click="showUploadModal = false" class="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100">Batal</button>
                    <button @click="submitStatusUpdate" :disabled="!proofFile || isSubmitting" class="flex-1 py-3 rounded-xl bg-[#EBCD5E] text-white font-bold shadow-md hover:bg-[#dcb945] disabled:opacity-50 disabled:cursor-not-allowed">
                        {{ isSubmitting ? 'Mengirim...' : 'Konfirmasi' }}
                    </button>
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

// Fix icon marker default leaflet yang sering hilang di Vue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icon untuk Kurir (Opsional, biar beda sama titik jemput)
const courierIcon = L.divIcon({
    html: '<div style="background-color: #EBCD5E; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><i class="fas fa-motorcycle text-white text-xs"></i></div>',
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const route = useRoute();
const userRole = computed(() => localStorage.getItem('userRole') || 'guest');

// STATE
const isLoading = ref(true);
const trackingData = ref({
    id: '', status: 'assigned',
    alamat: '', tujuan: '',
    kurir: {}, laporan: {}, bukti: {},
    posisi_awal: [0,0], posisi_akhir: [0,0]
});

// MAP VARIABLES (PENTING: Ditaruh di luar function agar bisa diakses updateLocation)
let map = null;
let courierMarker = null; // Marker khusus Driver
let routeLine = null;

// STATE UNTUK TRACKING REALTIME
let locationInterval = null; // Untuk Driver (Kirim Lokasi)
let trackingInterval = null; // Untuk User/Shelter (Ambil Lokasi)



// DRIVER ACTIONS STATE
const showUploadModal = ref(false);
const proofFile = ref(null);
const proofPreview = ref(null);
const nextStatus = ref('');
const isSubmitting = ref(false);


// --- COMPUTED ---
const currentStep = computed(() => {
    if (trackingData.value.status === 'assigned') return 1;
    if (trackingData.value.status === 'in_transit') return 2;
    if (trackingData.value.status === 'completed') return 3;
    return 1;
});

const progressPercent = computed(() => {
    if (currentStep.value === 1) return 0;
    if (currentStep.value === 2) return 50;
    return 100;
});

const trackingStatusText = computed(() => {
    switch(trackingData.value.status) {
        case 'assigned': return 'Driver Menuju Lokasi';
        case 'in_transit': return 'Sedang Dijemput';
        case 'completed': return 'Selesai / Sampai Shelter';
        default: return 'Menunggu';
    }
});

const nextActionTitle = computed(() => {
    return nextStatus.value === 'in_transit' ? 'Bukti Penjemputan' : 'Bukti Sampai Shelter';
});

// --- METHODS ---

function resolveImageUrl(path) {
    if (!path || path.includes('NULL')) return '/img/placeholder.png';
    if (path.startsWith('http')) return path;
    // Sesuaikan port backend
    return `http://localhost:3000${path}`;
}

function getStatusClass(status) {
    if (status === 'assigned') return 'bg-blue-100 text-blue-700';
    if (status === 'in_transit') return 'bg-yellow-100 text-yellow-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    return 'bg-gray-100';
}

async function fetchTrackingData() {
    const assignmentId = route.query.id;
    if (!assignmentId) return;

    // Jangan destroy map disini, cukup nyalakan loading overlay
    isLoading.value = true;

    try {
        const response = await apiClient.get(`/rescue/tracking/${assignmentId}`);
        trackingData.value = response.data;
        
        // Matikan loading overlay
        isLoading.value = false;

        // Tunggu DOM update, lalu init map jika belum ada
        await nextTick();
        if (!map) {
            initMap();
        } else {
            // Jika map sudah ada (misal refresh data), update marker saja
            updateMapMarkers();
        }

    } catch (error) {
        isLoading.value = false;
        console.error("Gagal load tracking:", error);
    }
}

function initMap() {
    // Pastikan container ada
    const container = document.getElementById('trackingMap');
    if (!container) return;

    // Posisi Awal (Lokasi Kucing)
    const startPos = trackingData.value.posisi_awal;
    
    // Create Map
    map = L.map('trackingMap').setView(startPos, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    updateMapMarkers();
}

function updateMapMarkers() {
    if (!map) return;

    // Bersihkan layer lama jika perlu (opsional)
    // map.eachLayer((layer) => { ... }) 

    const startPos = trackingData.value.posisi_awal;
    const endPos = trackingData.value.posisi_akhir;

    // 1. Marker Kucing (Jemput)
    L.marker(startPos).addTo(map)
      .bindPopup("<b>Lokasi Penjemputan</b><br>Kucing ada di sini")
      .openPopup();

    // 2. Marker Shelter (Tujuan)
    L.marker(endPos).addTo(map)
      .bindPopup("<b>Lokasi Shelter</b><br>Tujuan Akhir");
      
    // 3. Garis Rute (Statis)
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline([startPos, endPos], {color: '#3A5F50', weight: 4, dashArray: '10, 10'}).addTo(map);
    
    // Fit Bounds
    map.fitBounds(L.latLngBounds([startPos, endPos]), { padding: [50, 50] });

    // 4. Inisialisasi Marker Kurir (Awalnya di posisi jemput atau null)
    if (!courierMarker) {
        courierMarker = L.marker(startPos, { icon: courierIcon }).addTo(map).bindPopup("Driver");
    }
}

// --- REALTIME LOGIC ---
// Tambahkan variabel di luar function (di bagian atas script)
let lastSentPosition = null; 

// Fungsi Helper menghitung jarak (Haversine Formula) - dalam meter
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius bumi (km)
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Jarak dalam km
    return d * 1000; // Jarak dalam meter
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

// UPDATE FUNGSI startSendingLocation
function startSendingLocation() {
    if (!navigator.geolocation) return;
    console.log("📍 [Driver] Memulai service lokasi (Smart Mode)...");

    locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                // Update Marker Peta Sendiri (Visual Driver)
                if (courierMarker) {
                    const newLatLng = new L.LatLng(latitude, longitude);
                    courierMarker.setLatLng(newLatLng);
                }

                // --- LOGIKA FILTER JARAK ---
                // Cek apakah sudah pernah kirim lokasi sebelumnya?
                if (lastSentPosition) {
                    const distance = getDistanceFromLatLonInMeters(
                        lastSentPosition.lat, lastSentPosition.long,
                        latitude, longitude
                    );
                    
                    // Jika jarak pergerakan kurang dari 10 meter, JANGAN kirim ke DB
                    if (distance < 10) {
                        console.log(`💤 Driver diam (Jarak: ${Math.round(distance)}m). Skip update DB.`);
                        return; 
                    }
                }
                // ---------------------------

                try {
                    await apiClient.post('/rescue/location', {
                        assignmentId: trackingData.value.db_id,
                        lat: latitude,
                        long: longitude
                    });
                    
                    // Simpan posisi terakhir yang sukses terkirim
                    lastSentPosition = { lat: latitude, long: longitude };
                    
                    console.log(`✅ [Driver] Lokasi Terkirim (Bergerak): ${latitude}, ${longitude}`);
                } catch (e) { console.error("Gagal kirim lokasi", e); }
            },
            (err) => console.error("GPS Error:", err),
            { enableHighAccuracy: true }
        );
    }, 5000);
}

// USER: PANTAU LOKASI
function startTrackingDriver() {
    console.log("👀 [User] Memulai memantau driver...");
    
    trackingInterval = setInterval(async () => {
        try {
            const res = await apiClient.get(`/rescue/location/${trackingData.value.db_id}`);
            if (res.data.status === 'success') {
                const { lat, long } = res.data.data;
                
                console.log(`📍 [User] Update Driver: ${lat}, ${long}`);

                // ANIMASI PERGERAKAN MARKER
                if (courierMarker) {
                    const newLatLng = new L.LatLng(lat, long);
                    courierMarker.setLatLng(newLatLng);
                    // Optional: Pan peta ke driver jika mau
                    // map.panTo(newLatLng);
                }
            }
        } catch (e) { console.error("Gagal ambil lokasi driver", e); }
    }, 5000);
}

// --- DRIVER LOGIC ---
function openActionModal(statusTarget) {
    nextStatus.value = statusTarget;
    proofFile.value = null;
    proofPreview.value = null;
    showUploadModal.value = true;
}

function handleProofFile(event) {
    const file = event.target.files[0];
    if (file) {
        proofFile.value = file;
        proofPreview.value = URL.createObjectURL(file);
    }
}

async function submitStatusUpdate() {
    if (!proofFile.value) return;
    isSubmitting.value = true;

    try {
        const formData = new FormData();
        formData.append('assignmentId', trackingData.value.db_id); // ID asli DB
        formData.append('status', nextStatus.value);
        formData.append('photo', proofFile.value);

        await apiClient.post('/rescue/update-status', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Status berhasil diperbarui!');
        showUploadModal.value = false;
        fetchTrackingData(); // Refresh data

    } catch (error) {
        console.error(error);
        alert('Gagal update status: ' + (error.response?.data?.error || error.message));
    } finally {
        isSubmitting.value = false;
    }
}

function previewImage(url) {
    window.open(resolveImageUrl(url), '_blank');
}

onMounted(async () => {
    await fetchTrackingData();
    
    // Cek Role untuk Realtime
    if (trackingData.value.status === 'in_transit' || trackingData.value.status === 'assigned') {
        if (userRole.value === 'driver') {
            startSendingLocation();
        } else {
            startTrackingDriver();
        }
    }
});

onUnmounted(() => {
    if (map) { map.remove(); map = null; } // Cleanup map saat keluar halaman
    if (locationInterval) clearInterval(locationInterval);
    if (trackingInterval) clearInterval(trackingInterval);
});
</script>

<style scoped>
/* Reuse styles */
</style>