<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-20 px-4 font-sans">
    
    <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
            <router-link to="/" class="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition text-gray-600">
                <i class="fas fa-arrow-left"></i>
            </router-link>
            <h1 class="text-3xl font-bold text-gray-800">Edit Profil Shelter</h1>
        </div>

        <div class="bg-white rounded-[30px] shadow-xl overflow-hidden border border-gray-100">
            <form @submit.prevent="submitProfile" class="p-8 md:p-10 space-y-8">
                
                <div>
                    <h3 class="text-xl font-bold text-[#3A5F50] mb-4 flex items-center gap-2">
                        <i class="fas fa-home"></i> Identitas Shelter
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Nama Shelter</label>
                            <input v-model="form.shelter_name" type="text" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Jenis Organisasi</label>
                            <select v-model="form.organization_type" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none">
                                <option value="Komunitas">Komunitas</option>
                                <option value="Yayasan">Yayasan</option>
                                <option value="Pribadi">Pribadi</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Tanggal Berdiri</label>
                            <input v-model="form.established_date" type="date" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Bio Singkat</label>
                            <textarea v-model="form.bio" rows="1" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <hr class="border-gray-100">

                <div>
                    <h3 class="text-xl font-bold text-[#3A5F50] mb-4 flex items-center gap-2">
                        <i class="fas fa-address-book"></i> Kontak & Donasi
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Nomor Kontak (WA)</label>
                            <input v-model="form.contact_phone" type="tel" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Nomor Rekening (Donasi)</label>
                            <input v-model="form.donation_account_number" type="text" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none" placeholder="Bank - No. Rekening">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-bold text-gray-500 mb-2">QRIS Code (Gambar)</label>
                            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <div v-if="qrPreview" class="w-24 h-24 border rounded-lg overflow-hidden bg-white flex-shrink-0 shadow-sm">
                                    <img :src="qrPreview" class="w-full h-full object-contain">
                                </div>
                                <div class="flex-grow">
                                    <input type="file" @change="handleQrUpload" accept="image/*" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EBCD5E] file:text-white hover:file:bg-[#dcb945] cursor-pointer">
                                    <p class="text-xs text-gray-400 mt-2">Format: JPG/PNG. Digunakan untuk fitur donasi.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="border-gray-100">

                <div>
                    <h3 class="text-xl font-bold text-[#3A5F50] mb-4 flex items-center gap-2">
                        <i class="fas fa-user-shield"></i> Legalitas & Penanggung Jawab
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">Nama Penanggung Jawab</label>
                            <input v-model="form.pj_name" type="text" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-500 mb-2">NIK Penanggung Jawab</label>
                            <input v-model="form.pj_nik" type="text" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none">
                        </div>
                        
                        <div class="md:col-span-2">
                            <label class="block text-sm font-bold text-gray-500 mb-2">Dokumen Legalitas (PDF/Gambar)</label>
                            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <i class="fas fa-file-contract text-3xl text-gray-300"></i>
                                <div class="flex-grow">
                                    <input type="file" @change="handleLegalUpload" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer">
                                    <p v-if="existingLegal" class="text-xs text-green-600 mt-2 font-semibold">
                                        <i class="fas fa-check-circle"></i> Dokumen tersimpan: {{ existingLegal }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="border-gray-100">

                <div>
                    <h3 class="text-xl font-bold text-[#3A5F50] mb-4 flex items-center gap-2">
                        <i class="fas fa-map-marked-alt"></i> Lokasi Shelter
                    </h3>
                    
                    <div class="flex flex-col md:flex-row gap-4">
                        <div 
                            @click="openMapModal"
                            class="w-full md:w-1/3 h-48 bg-gray-200 rounded-2xl overflow-hidden relative cursor-pointer group border-2 border-transparent hover:border-[#EBCD5E] transition-all shadow-sm"
                        >
                            <div class="w-full h-full flex items-center justify-center bg-gray-300">
                                <i class="fas fa-map-pin text-4xl text-red-500 drop-shadow-md"></i>
                            </div>
                            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                <span class="bg-white px-4 py-2 rounded-full text-sm font-bold shadow-md text-gray-700 group-hover:text-[#EBCD5E]">
                                    <i class="fas fa-edit mr-1"></i> Ganti Lokasi
                                </span>
                            </div>
                        </div>

                        <div class="flex-grow space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-400 mb-1">Koordinat</label>
                                <div class="flex gap-2">
                                    <span class="bg-gray-100 px-3 py-2 rounded-lg font-mono text-sm text-gray-600 border border-gray-200">Lat: {{ form.latitude || '-' }}</span>
                                    <span class="bg-gray-100 px-3 py-2 rounded-lg font-mono text-sm text-gray-600 border border-gray-200">Long: {{ form.longitude || '-' }}</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-400 mb-1">Alamat (Otomatis dari Peta)</label>
                                <textarea v-model="form.address" readonly class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none h-24 focus:outline-none text-gray-600"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-6">
                    <button 
                        type="submit" 
                        :disabled="isSubmitting"
                        class="w-full bg-[#EBCD5E] hover:bg-[#dcb945] text-white font-bold text-xl py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Menyimpan...</span>
                        <span v-else>Simpan Perubahan</span>
                    </button>
                </div>

            </form>
        </div>
    </div>

    <teleport to="body">
        <div v-if="showMapModal" class="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div class="bg-white w-full max-w-3xl h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in-up">
            <div class="bg-[#3A5F50] p-4 flex justify-between items-center text-white shadow-md z-10">
              <h3 class="text-xl font-bold">Pilih Lokasi Shelter</h3>
              <button @click="closeMapModal" class="text-white hover:text-red-300 transition"><i class="fas fa-times text-2xl"></i></button>
            </div>
            <div id="mapContainerShelter" class="flex-grow w-full relative bg-gray-100 z-0"></div>
            <div class="p-6 bg-white text-center border-t border-gray-100 z-10">
              <p class="text-gray-600 mb-4 text-sm font-medium bg-gray-50 py-2 px-4 rounded-lg inline-block border border-gray-200">
                <i class="fas fa-info-circle text-[#EBCD5E] mr-1"></i> {{ tempLocation.address || 'Klik peta untuk menandai lokasi.' }}
              </p>
              <button @click="confirmLocation" class="bg-[#EBCD5E] text-white font-bold py-3 px-12 rounded-full hover:bg-[#dcb945] transition shadow-lg active:scale-95">
                Pilih Lokasi Ini
              </button>
            </div>
          </div>
        </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/http';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();
const isSubmitting = ref(false);
const showMapModal = ref(false);
const qrPreview = ref(null);
const existingLegal = ref('');

const form = reactive({
    shelter_name: '',
    organization_type: 'Komunitas',
    established_date: '',
    bio: '',
    contact_phone: '',
    donation_account_number: '',
    pj_name: '',
    pj_nik: '',
    latitude: null,
    longitude: null,
    address: '',
    qr_img: null,
    legal_certificate: null
});

let map = null;
let marker = null;
const tempLocation = reactive({ address: '', lat: null, lng: null });

function resolveImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/public/')) {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const baseServerUrl = baseApiUrl.replace('/api/v1', '');
        return `${baseServerUrl}${path}`;
    }
    return path;
}

onMounted(async () => {
    const token = localStorage.getItem('userToken');
    if(!token) return router.push('/login');
    
    try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const role = decoded.role;

        if (role !== 'shelter') {
            alert('Akses ditolak: Halaman ini khusus Shelter.');
            return router.push('/');
        }

        const response = await apiClient.get(`/users/profile/${userId}/${role}`);
        const data = response.data;

        form.shelter_name = data.name; 
        form.organization_type = data.organization_type || 'Komunitas';
        
        if (data.established_date) {
            const d = new Date(data.established_date);
            form.established_date = d.toISOString().split('T')[0];
        }

        form.bio = data.bio;
        form.contact_phone = data.contact_phone;
        form.donation_account_number = data.donation_account_number;
        form.pj_name = data.pj_name;
        form.pj_nik = data.pj_nik;
        form.latitude = data.latitude ? parseFloat(data.latitude) : null;
        form.longitude = data.longitude ? parseFloat(data.longitude) : null;
        
        if (data.qr_img) qrPreview.value = resolveImageUrl(`/public/img/qr_img/${data.qr_img}`);
        if (data.legal_certificate) existingLegal.value = data.legal_certificate;

        if (form.latitude && form.longitude) {
            fetchAddress(form.latitude, form.longitude).then(addr => form.address = addr);
        }

    } catch (error) {
        console.error("Gagal load profil:", error);
    }
});

function handleQrUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.qr_img = file;
        qrPreview.value = URL.createObjectURL(file);
    }
}

function handleLegalUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.legal_certificate = file;
    }
}

async function openMapModal() {
    showMapModal.value = true;
    await nextTick();

    const defaultLat = form.latitude || -6.9175;
    const defaultLng = form.longitude || 107.6191;

    if (!map) {
        map = L.map('mapContainerShelter').setView([defaultLat, defaultLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
        const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
        const DefaultIcon = L.icon({ iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });
        L.Marker.prototype.options.icon = DefaultIcon;

        map.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            updateMarker(lat, lng);
        });
        
        if(form.latitude) updateMarker(defaultLat, defaultLng, false);

    } else {
        setTimeout(() => {
            map.invalidateSize();
            map.setView([defaultLat, defaultLng], 15);
            if(form.latitude) updateMarker(defaultLat, defaultLng, false);
        }, 200);
    }
}

async function updateMarker(lat, lng, fetchAddr = true) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    tempLocation.lat = lat;
    tempLocation.lng = lng;
    
    if (fetchAddr) {
        tempLocation.address = "Mencari alamat...";
        const addr = await fetchAddress(lat, lng);
        tempLocation.address = addr;
    }
}

async function fetchAddress(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.display_name || `${lat}, ${lng}`;
    } catch (e) {
        return `Koordinat: ${lat}, ${lng}`;
    }
}

function confirmLocation() {
    if (tempLocation.lat) {
        form.latitude = tempLocation.lat;
        form.longitude = tempLocation.lng;
        form.address = tempLocation.address;
    }
    closeMapModal();
}

function closeMapModal() {
    showMapModal.value = false;
}

async function submitProfile() {
    if (!form.shelter_name) return alert("Nama Shelter wajib diisi!");
    
    isSubmitting.value = true;
    try {
        const token = localStorage.getItem('userToken');
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const formData = new FormData();
        
        Object.keys(form).forEach(key => {
            if (form[key] !== null && key !== 'qr_img' && key !== 'legal_certificate') {
                formData.append(key, form[key]);
            }
        });

        if (form.qr_img instanceof File) formData.append('qr_img', form.qr_img);
        if (form.legal_certificate instanceof File) formData.append('legal_certificate', form.legal_certificate);

        await apiClient.put(`/users/shelter/${userId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert("Profil Shelter berhasil diperbarui!");
        router.push('/'); 

    } catch (error) {
        console.error("Gagal update:", error);
        alert("Gagal menyimpan data: " + (error.response?.data?.error || error.message));
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<style scoped>
.animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { transform: translateY(0); } }
</style>