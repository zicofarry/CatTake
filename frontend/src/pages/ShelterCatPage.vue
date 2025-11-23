<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http';
import { jwtDecode } from 'jwt-decode';

// --- STATE ---
const cats = ref([]);
const isLoading = ref(true);
const shelterName = ref('');
const showAddModal = ref(false);
const isSubmitting = ref(false);
const imagePreview = ref(null);

// Form Data
const form = ref({
  name: '',
  breed: '',
  age: '',
  gender: '',
  health_status: '',
  description: '',
  photo: null
});

// Opsi Dropdown (Value harus huruf kecil semua sesuai SQL check constraint)
const genderOptions = [
  { label: 'Jantan (Male)', value: 'male' },
  { label: 'Betina (Female)', value: 'female' }
];
const healthOptions = [
  { label: 'Sehat', value: 'healthy' },
  { label: 'Vaksin', value: 'vaccinated' },
  { label: 'Sakit', value: 'sick' },
  { label: 'Steril', value: 'sterilized' }
];

// --- HELPERS ---
function resolveImageUrl(path) {
    if (!path) return '/img/cat-placeholder.png';
    // Cek apakah path sudah URL lengkap atau path relatif
    if (path.startsWith('http')) return path; 
    // Sesuaikan URL base server kamu
    return `http://localhost:3000/uploads/${path}`; 
}

// Ambil ID Shelter dari Token
function getShelterId() {
    const token = localStorage.getItem('userToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            shelterName.value = decoded.username || 'Shelter';
            return decoded.id;
        } catch (error) { console.error("Token Error:", error); }
    }
    return null;
}

// --- LOGIC UTAMA ---
async function fetchMyCats() {
    const shelterId = getShelterId();
    if (!shelterId) return;

    try {
        isLoading.value = true;
        const response = await apiClient.get(`/cats/shelter/${shelterId}`);
        cats.value = response.data;
    } catch (error) {
        console.error("Gagal ambil data:", error);
    } finally {
        isLoading.value = false;
    }
}

// --- MODAL ---
function openModal() {
    // Reset form
    form.value = { name: '', breed: '', age: '', gender: '', health_status: '', description: '', photo: null };
    imagePreview.value = null;
    showAddModal.value = true; 
}

function closeModal() {
    showAddModal.value = false;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.photo = file;
        imagePreview.value = URL.createObjectURL(file);
    }
}

// --- SUBMIT DATA (SESUAI SQL) ---
async function submitCat() {
    // 1. Validasi Input Wajib
    if (!form.value.name || !form.value.gender || !form.value.photo) {
        alert("Nama, Gender, dan Foto wajib diisi!");
        return;
    }

    // 2. Validasi Shelter ID (Wajib NOT NULL di SQL)
    const currentShelterId = getShelterId();
    if (!currentShelterId) {
        alert("Error: ID Shelter tidak ditemukan. Silakan login ulang.");
        return;
    }

    try {
        isSubmitting.value = true;
        const formData = new FormData();
        
        // Masukkan Data Sesuai Kolom SQL
        formData.append('shelter_id', currentShelterId); // int
        formData.append('name', form.value.name);        // varchar
        formData.append('gender', form.value.gender);    // varchar (male/female)
        formData.append('adoption_status', 'available'); // varchar (available)
        
        // Data Opsional (Kirim string kosong atau 0 jika tidak diisi, biar ga error di backend)
        formData.append('breed', form.value.breed || '');
        formData.append('age', form.value.age || 0);     
        formData.append('health_status', form.value.health_status || 'healthy');
        formData.append('description', form.value.description || '');
        formData.append('photo', form.value.photo);      // file object

        // Debugging: Cek isi data di Console
        console.log("Mengirim Data:", Object.fromEntries(formData));

        await apiClient.post('/cats', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Sukses! Kucing berhasil ditambahkan.');
        closeModal();
        fetchMyCats(); 

    } catch (error) {
        console.error("Error Submit:", error);
        // Tampilkan pesan error spesifik dari backend jika ada
        const msg = error.response?.data?.message || error.response?.data?.error || "Gagal menambah data.";
        alert(`Gagal: ${msg}`);
    } finally {
        isSubmitting.value = false;
    }
}

// Helper UI
function statusColor(status) {
    if (status === 'available') return 'bg-green-100 text-green-700';
    if (status === 'adopted') return 'bg-gray-100 text-gray-600';
    return 'bg-yellow-100 text-yellow-700';
}

function formatStatus(status) {
    const map = { 'available': 'Tersedia', 'adopted': 'Teradopsi', 'pending': 'Menunggu' };
    return map[status] || status;
}

onMounted(() => {
    fetchMyCats();
});
</script>

<template>
  <div 
    class="min-h-screen p-6 md:p-10 font-sans relative"
    style="
        background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
        background-repeat: no-repeat;
        background-attachment: fixed;
    "
  >
    
    <div class="max-w-6xl mx-auto pb-20">
        
        <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
            <div>
                <h1 class="text-3xl font-extrabold text-white drop-shadow-md">Kucing Shelter</h1>
                <p class="text-gray-100 font-medium mt-1">Kelola daftar kucing di {{ shelterName }}</p>
            </div>

            <button 
                @click="openModal" 
                class="bg-[#E8C32A] hover:bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer"
            >
                <i class="fas fa-plus"></i>
                <span>Tambah Kucing</span>
            </button>
        </div>

        <div v-if="isLoading" class="text-center py-20">
            <i class="fas fa-spinner fa-spin text-4xl text-white drop-shadow-md"></i>
            <p class="text-white mt-2 font-medium">Memuat data kucing...</p>
        </div>

        <div v-else-if="cats.length === 0" class="bg-white/90 backdrop-blur-xl rounded-3xl p-10 text-center shadow-2xl border border-white/50">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-3xl">
                <i class="fas fa-cat"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800">Belum ada kucing</h3>
            <p class="text-gray-600 mb-6">Yuk tambahkan kucing pertamamu agar bisa dilihat calon adopter!</p>
            <button @click="openModal" class="text-[#558a74] font-bold hover:underline cursor-pointer text-lg">Tambah Sekarang</button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="cat in cats" :key="cat.id" class="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group relative transform hover:-translate-y-1">
                
                <div class="h-56 overflow-hidden relative">
                    <img :src="resolveImageUrl(cat.photo)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div class="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm bg-white/90" :class="statusColor(cat.adoption_status)">
                        {{ formatStatus(cat.adoption_status) }}
                    </div>
                </div>
                
                <div class="p-5">
                    <div class="flex justify-between items-start mb-2">
                        <h2 class="text-xl font-bold text-gray-800 truncate pr-2">{{ cat.name }}</h2>
                        <i v-if="cat.gender === 'male'" class="fas fa-mars text-blue-500 text-xl" title="Jantan"></i>
                        <i v-else class="fas fa-venus text-pink-500 text-xl" title="Betina"></i>
                    </div>
                    <p class="text-sm text-gray-500 mb-4 font-medium">{{ cat.breed }} • {{ cat.age }} Bulan</p>
                    
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-md text-xs font-semibold">
                            <i class="fas fa-heartbeat mr-1"></i> {{ cat.health_status }}
                        </span>
                    </div>

                    <hr class="border-gray-100 mb-4"/>
                    
                    <div class="flex gap-3">
                        <button class="flex-1 bg-gray-50 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors">Edit</button>
                        <button class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-bold transition-colors">Hapus</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all">
        
        <div class="absolute inset-0" @click="closeModal"></div>

        <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-scale-up z-10 flex flex-col">
            
            <div class="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center z-20 shadow-sm">
                <h2 class="text-2xl font-bold text-gray-800">Tambah Kucing Baru</h2>
                <button @click="closeModal" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer">
                    <i class="fas fa-times text-lg"></i>
                </button>
            </div>

            <div class="p-8">
                <form @submit.prevent="submitCat" class="flex flex-col gap-6">
                    
                    <div class="flex justify-center mb-2">
                        <div class="relative w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-[#558a74] transition-all overflow-hidden group shadow-inner">
                            <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" />
                            <div v-else class="text-center p-4 text-gray-400 group-hover:text-[#558a74] transition-colors">
                                <i class="fas fa-camera text-4xl mb-2"></i>
                                <p class="text-sm font-bold">Klik untuk Upload Foto</p>
                                <p class="text-xs mt-1 opacity-70">Max 5MB</p>
                            </div>
                            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="handleFileUpload" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nama Kucing</label>
                            <input v-model="form.name" type="text" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all" placeholder="Nama" required />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Ras / Jenis</label>
                            <input v-model="form.breed" type="text" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all" placeholder="Contoh: Domestik" />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Umur (Bulan)</label>
                            <input v-model="form.age" type="number" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all" placeholder="0" />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Jenis Kelamin</label>
                            <div class="relative">
                                <select v-model="form.gender" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none appearance-none" required>
                                    <option value="" disabled>Pilih Gender...</option>
                                    <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                                <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status Kesehatan</label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label v-for="opt in healthOptions" :key="opt.value" class="cursor-pointer relative group">
                                <input type="radio" v-model="form.health_status" :value="opt.value" class="peer sr-only" />
                                <div class="py-3 px-2 rounded-xl border border-gray-200 text-center text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 peer-checked:bg-[#2c473c] peer-checked:text-white peer-checked:border-[#2c473c] peer-checked:shadow-md transition-all">
                                    {{ opt.label }}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Deskripsi</label>
                        <textarea v-model="form.description" rows="3" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none resize-none transition-all" placeholder="Ceritakan tentang kucing ini..."></textarea>
                    </div>

                    <button 
                        type="submit" 
                        :disabled="isSubmitting" 
                        class="w-full bg-[#E8C32A] hover:bg-amber-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
                    >
                        <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                        <span>{{ isSubmitting ? 'Sedang Menyimpan...' : 'Simpan Data Kucing' }}</span>
                    </button>

                </form>
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
.animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>