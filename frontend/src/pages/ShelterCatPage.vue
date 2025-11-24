<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http';
import { jwtDecode } from 'jwt-decode';

// --- STATE ---
const activeTab = ref('cats'); // 'cats' (Siap Adopsi) atau 'rescue' (Hasil Rescue)
const cats = ref([]); // Data Kucing Adopsi
const rescuedCats = ref([]); // Data Hasil Rescue
const isLoading = ref(true);
const shelterName = ref('Memuat...');

// Modal States
const showAddModal = ref(false);
const showConvertModal = ref(false);
const isSubmitting = ref(false);
const imagePreview = ref(null);

// State Edit
const isEditing = ref(false);
const editId = ref(null);

// Form Data (Tambah/Edit Kucing)
const form = ref({
  name: '',
  breed: '',
  age: '',
  gender: '',
  health_status: '',
  description: '',
  photo: null
});

// Form Data Convert (Rescue -> Adopsi)
const convertForm = ref({
    reportId: null,
    name: '',
    gender: 'male',
    breed: 'Domestik',
    age: 12,
    description: '',
    photoPath: '' 
});

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
    // 1. Handle Null/Undefined
    if (!path || path === 'NULL' || path === 'null') return '/img/NULL.JPG';

    // 2. Handle URL Eksternal (misal dari Google)
    if (path.startsWith('http')) return path;

    // 3. Handle Path Lengkap dari Backend (Biasanya dari RescueService)
    // Contoh: "/public/img/report_cat/report-123.jpg"
    if (path.startsWith('/public/')) {
        return `http://localhost:3000${path}`;
    }

    // 4. Handle Filename Only (Biasanya dari tabel Cats/Raw DB)
    
    // Kucing Adopsi (cat-...) -> Folder cats
    if (path.startsWith('cat-')) {
        return `http://localhost:3000/public/img/cats/${path}`;
    }

    // Kucing Laporan (report-...) -> Folder report_cat
    if (path.startsWith('report-')) {
        return `http://localhost:3000/public/img/report_cat/${path}`;
    }

    // Kucing Hilang (lost-...) -> Folder lost_cat
    if (path.startsWith('lost-')) {
        return `http://localhost:3000/public/img/lost_cat/${path}`;
    }

    // Default Fallback (Asset Frontend)
    return `/img/${path}`;
}

function getShelterId() {
    const token = localStorage.getItem('userToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            // shelterName.value = decoded.username || 'Shelter';
            return decoded.id;
        } catch (error) { console.error("Token Error:", error); }
    }
    return null;
}

function statusColor(status) {
    if (status === 'available') return 'bg-green-100 text-green-700';
    if (status === 'adopted') return 'bg-gray-100 text-gray-600';
    return 'bg-yellow-100 text-yellow-700';
}

function formatStatus(status) {
    const map = { 'available': 'Tersedia', 'adopted': 'Teradopsi', 'pending': 'Menunggu' };
    return map[status] || status;
}

// --- API ACTIONS ---
async function fetchShelterProfile() {
    const id = getShelterId();
    if (!id) return;
    
    try {
        // Panggil endpoint profile untuk dapetin 'shelter_name'
        const response = await apiClient.get(`/users/profile/${id}/shelter`);
        shelterName.value = response.data.name; 
    } catch (error) {
        console.error("Gagal ambil profil shelter:", error);
        shelterName.value = "Shelter";
    }
}

// 1. Fetch Kucing Siap Adopsi
async function fetchMyCats() {
    const shelterId = getShelterId();
    if (!shelterId) return;
    try {
        const response = await apiClient.get(`/cats/shelter/${shelterId}`);
        cats.value = response.data;
    } catch (error) {
        console.error("Gagal ambil data kucing:", error);
    }
}

// 2. Fetch Kucing Hasil Rescue
async function fetchRescuedCats() {
    try {
        const response = await apiClient.get('/rescue/shelter-history');
        rescuedCats.value = response.data;
    } catch (error) {
        console.error("Gagal ambil data rescue:", error);
    }
}

// 3. Kembalikan ke Pemilik (Khusus Kucing Hilang)
async function returnToOwner(lostCatId) {
    if(!confirm("Konfirmasi kucing sudah dikembalikan ke pemilik?")) return;
    try {
        await apiClient.post('/rescue/return-owner', { lostCatId });
        alert("Status diperbarui: Sudah dikembalikan ke pemilik.");
        fetchRescuedCats(); // Refresh list rescue
    } catch (e) { 
        alert("Gagal update status"); 
    }
}

// 4. Pindah ke Adopsi (Khusus Kucing Liar)
async function submitConvert() {
    try {
        isSubmitting.value = true;
        await apiClient.post('/rescue/move-adoption', convertForm.value);
        alert("Kucing berhasil dipindahkan ke daftar adopsi!");
        
        showConvertModal.value = false;
        
        // Refresh kedua data
        await Promise.all([fetchRescuedCats(), fetchMyCats()]);
        activeTab.value = 'cats'; // Pindah otomatis ke tab adopsi
    } catch (e) {
        alert("Gagal memindahkan data.");
    } finally {
        isSubmitting.value = false;
    }
}

// 5. Submit Tambah/Edit Kucing Manual
async function submitCat() {
    if (!form.value.name || !form.value.gender) {
        alert("Nama dan Gender wajib diisi!");
        return;
    }
    if (!isEditing.value && !form.value.photo) {
        alert("Foto wajib diisi untuk data baru!");
        return;
    }

    const currentShelterId = getShelterId();
    if (!currentShelterId) return;

    try {
        isSubmitting.value = true;
        const formData = new FormData();
        
        formData.append('shelter_id', currentShelterId);
        formData.append('name', form.value.name);
        formData.append('gender', form.value.gender);
        if (!isEditing.value) formData.append('adoption_status', 'available');

        formData.append('breed', form.value.breed || '');
        formData.append('age', form.value.age || 0);     
        formData.append('health_status', form.value.health_status || 'healthy');
        formData.append('description', form.value.description || '');
        
        if (form.value.photo) formData.append('photo', form.value.photo);

        if (isEditing.value) {
            await apiClient.put(`/cats/${editId.value}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Data kucing diperbarui.');
        } else {
            await apiClient.post('/cats', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Kucing berhasil ditambahkan.');
        }

        closeModal();
        fetchMyCats(); 

    } catch (error) {
        console.error("Error Submit:", error);
        alert("Gagal menyimpan data.");
    } finally {
        isSubmitting.value = false;
    }
}

async function deleteCat(id) {
    if (!confirm("Hapus data kucing ini?")) return;
    try {
        await apiClient.delete(`/cats/${id}`);
        fetchMyCats();
    } catch (error) {
        console.error("Gagal hapus:", error);
    }
}

// --- MODAL HANDLERS ---
function openAddModal() {
    isEditing.value = false;
    editId.value = null;
    form.value = { name: '', breed: '', age: '', gender: '', health_status: '', description: '', photo: null };
    imagePreview.value = null;
    showAddModal.value = true; 
}

function openEditModal(cat) {
    isEditing.value = true;
    editId.value = cat.id;
    form.value = { ...cat, photo: null };
    // Sesuaikan path image agar preview muncul
    imagePreview.value = resolveImageUrl(cat.photo || cat.image); 
    showAddModal.value = true;
}

function openConvertModal(item) {
    // Bersihkan path foto agar backend bisa memproses nama filenya saja
    // Asumsi path di DB: /public/img/report_cat/namafile.jpg
    const cleanPhotoPath = item.photo.split('/').pop(); 

    convertForm.value = {
        reportId: item.report_id,
        name: 'Kucing Rescue',
        gender: 'male',
        breed: 'Domestik',
        age: 12,
        description: item.description,
        photoPath: cleanPhotoPath
    };
    showConvertModal.value = true;
}

function closeModal() { showAddModal.value = false; }

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.photo = file;
        imagePreview.value = URL.createObjectURL(file);
    }
}

// --- LIFECYCLE ---
onMounted(async () => {
    getShelterId();
    isLoading.value = true;
    // Load kedua data secara paralel agar loading state akurat
    await Promise.all([fetchMyCats(), fetchRescuedCats(), fetchShelterProfile()]);
    isLoading.value = false;
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
    <div class="max-w-6xl mx-auto pt-24 md:pt-24 pb-20">
        
        <div class="mb-8">
            <div class="flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20 mb-6 gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-white drop-shadow-md">Manajemen Kucing</h1>
                    <p class="text-gray-100 font-medium mt-1">Shelter: {{ shelterName }}</p>
                </div>
                
                <div class="flex bg-black/20 p-1 rounded-full">
                    <button 
                        @click="activeTab = 'cats'" 
                        :class="activeTab === 'cats' ? 'bg-[#EBCD5E] text-black shadow-md' : 'text-white hover:bg-white/10'" 
                        class="px-6 py-2 rounded-full font-bold transition-all text-sm md:text-base"
                    >
                        Siap Adopsi
                    </button>
                    <button 
                        @click="activeTab = 'rescue'" 
                        :class="activeTab === 'rescue' ? 'bg-[#EBCD5E] text-black shadow-md' : 'text-white hover:bg-white/10'" 
                        class="px-6 py-2 rounded-full font-bold transition-all text-sm md:text-base"
                    >
                        Hasil Rescue
                    </button>
                </div>
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-20 text-white">
            <i class="fas fa-spinner fa-spin text-4xl mb-3"></i>
            <p>Memuat data...</p>
        </div>

        <div v-else-if="activeTab === 'cats'" class="animate-fade-in">
             <div class="text-right mb-6">
                <button @click="openAddModal" class="bg-[#E8C32A] hover:bg-amber-500 text-gray-900 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all inline-flex active:scale-95 ml-auto">
                    <i class="fas fa-plus"></i> Tambah Manual
                </button>
             </div>

             <div v-if="cats.length === 0" class="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl">
                <p class="text-gray-500 font-bold">Belum ada kucing yang siap diadopsi.</p>
             </div>

             <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="cat in cats" :key="cat.id" class="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group relative transform hover:-translate-y-1">
                    
                    <div class="h-56 overflow-hidden relative">
                        <img :src="resolveImageUrl(cat.photo || cat.image)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                            <button @click="openEditModal(cat)" class="flex-1 bg-gray-50 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold transition-colors">Edit</button>
                            <button @click="deleteCat(cat.id)" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-bold transition-colors">Hapus</button>
                        </div>
                    </div>
                </div>
             </div>
        </div>

        <div v-else-if="activeTab === 'rescue'" class="animate-fade-in">
            <div v-if="rescuedCats.length === 0" class="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl">
                <i class="fas fa-history text-4xl mb-3 text-gray-400"></i>
                <p class="text-gray-500 font-bold">Belum ada riwayat rescue yang selesai.</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-4">
                <div v-for="item in rescuedCats" :key="item.assignment_id" class="bg-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-center">
                    
                    <img :src="resolveImageUrl(item.photo)" class="w-full md:w-40 h-40 object-cover rounded-xl bg-gray-200 flex-shrink-0 border border-gray-100">
                    
                    <div class="flex-grow w-full">
                        <div class="flex justify-between mb-2 items-start">
                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase" 
                                :class="item.report_type === 'missing' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'">
                                {{ item.report_type === 'missing' ? 'Kucing Hilang' : 'Kucing Liar' }}
                            </span>
                            <span class="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                <i class="fas fa-calendar-check"></i> Selesai: {{ new Date(item.completion_time).toLocaleDateString() }}
                            </span>
                        </div>
                        
                        <h3 class="text-xl font-bold text-gray-800 mb-1">{{ item.display_name }}</h3>
                        <p class="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <i class="fas fa-map-marker-alt text-red-400"></i> {{ item.location }}
                        </p>
                        
                        <div v-if="item.report_type === 'missing'" class="p-3 bg-blue-50 rounded-lg text-sm border border-blue-100 mb-2">
                            <p><strong>Pemilik:</strong> {{ item.owner_name }}</p>
                            <div class="flex items-center gap-2 text-gray-600 mb-2">
                                <i class="fas" :class="item.owner_contact.includes('@') ? 'fa-envelope' : 'fa-phone-alt'"></i>
                                <span>{{ item.owner_contact }}</span>
                                
                                <a v-if="!item.owner_contact.includes('@')" 
                                   :href="`https://wa.me/${item.owner_contact.replace(/^0/, '62').replace(/\D/g,'')}`" 
                                   target="_blank"
                                   class="ml-auto text-green-600 hover:text-green-700"
                                   title="Chat WhatsApp">
                                    <i class="fab fa-whatsapp text-lg"></i>
                                </a>
                            </div>
                            <p class="mt-1">Status Database: 
                                <span class="font-bold uppercase" :class="item.lost_cat_status === 'returned' ? 'text-green-600' : 'text-blue-600'">
                                    {{ item.lost_cat_status }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                        <button 
                            v-if="item.report_type === 'missing' && item.lost_cat_status !== 'returned'"
                            @click="returnToOwner(item.lost_cat_id)"
                            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <i class="fas fa-check-circle"></i> Sudah Dikembalikan
                        </button>
                        
                        <div v-else-if="item.report_type === 'missing' && item.lost_cat_status === 'returned'" 
                             class="text-green-700 font-bold text-center border border-green-200 px-4 py-3 rounded-xl bg-green-50 text-sm flex items-center justify-center gap-2">
                            <i class="fas fa-handshake"></i> Selesai (Returned)
                        </div>

                        <template v-if="item.report_type === 'stray'">
                            
                            <button 
                                v-if="!item.is_converted"
                                @click="openConvertModal(item)"
                                class="bg-[#3A5F50] hover:bg-[#2c473c] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all text-sm whitespace-nowrap flex items-center justify-center gap-2"
                            >
                                <i class="fas fa-paw"></i> Siap Adopsi
                            </button>

                            <div 
                                v-else 
                                class="text-[#3A5F50] font-bold text-center border border-[#3A5F50]/30 px-4 py-3 rounded-xl bg-green-50 text-sm flex items-center justify-center gap-2"
                            >
                                <i class="fas fa-check-circle"></i> Sudah di Katalog
                            </div>

                        </template>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <div v-if="showConvertModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-800">Persiapkan Kucing untuk Adopsi</h3>
                <p class="text-sm text-gray-500">Lengkapi data profil kucing sebelum masuk katalog.</p>
            </div>
            
            <form @submit.prevent="submitConvert" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Nama Kucing</label>
                    <input v-model="convertForm.name" type="text" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#3A5F50] outline-none transition-all" placeholder="Beri nama..." required>
                </div>
                <div class="flex gap-4">
                    <div class="flex-1">
                        <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Jenis Kelamin</label>
                        <select v-model="convertForm.gender" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none">
                            <option value="male">Jantan</option>
                            <option value="female">Betina</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Umur (Bulan)</label>
                        <input v-model="convertForm.age" type="number" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase text-gray-500 mb-1">Deskripsi</label>
                    <textarea v-model="convertForm.description" rows="3" class="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none resize-none"></textarea>
                </div>

                <div class="flex gap-3 pt-4">
                    <button type="button" @click="showConvertModal = false" class="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
                    <button type="submit" :disabled="isSubmitting" class="flex-1 py-3 rounded-xl bg-[#EBCD5E] text-black font-bold shadow-md hover:bg-[#dcb945] transition-colors flex justify-center items-center gap-2">
                        <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                        <span>Simpan ke Katalog</span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <div v-if="showAddModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all">
        <div class="absolute inset-0" @click="closeModal"></div>
        <div class="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-scale-up z-10 flex flex-col">
            
            <div class="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center z-20 shadow-sm">
                <h2 class="text-2xl font-bold text-gray-800">{{ isEditing ? 'Edit Data Kucing' : 'Tambah Kucing Baru' }}</h2>
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
                            <input v-model="form.name" type="text" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all" required />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Ras / Jenis</label>
                            <input v-model="form.breed" type="text" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all" />
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Umur (Bulan)</label>
                            <input v-model="form.age" type="number" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all" />
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
                        <textarea v-model="form.description" rows="3" class="w-full p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none resize-none transition-all"></textarea>
                    </div>

                    <button 
                        type="submit" 
                        :disabled="isSubmitting" 
                        class="w-full bg-[#E8C32A] hover:bg-amber-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
                    >
                        <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                        <span>{{ isSubmitting ? 'Sedang Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Data Kucing') }}</span>
                    </button>

                </form>
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-scale-up { animation: scaleUp 0.2s ease-out forwards; }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>