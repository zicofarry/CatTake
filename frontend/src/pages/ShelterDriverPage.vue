<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http';

// --- STATE ---
const drivers = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const editId = ref(null);
const expandedDriverId = ref(null);

// Form Data
const form = ref({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    sim: null,
    photo: null // Foto Profil
});
const simPreview = ref(null);
const photoPreview = ref(null);

// --- HELPERS ---
// URL SIM di folder license
function resolveSimUrl(filename) {
    if (!filename) return null;
    return `http://localhost:3000/public/img/license/${filename}`;
}

// URL Foto Profil di folder profile
function resolvePhotoUrl(filename) {
    if (!filename) return null; // Bisa return default avatar path local
    return `http://localhost:3000/public/img/profile/${filename}`;
}

function getAvatarColor(index) {
    const colors = ['bg-[#60997E]', 'bg-[#4E7C68]', 'bg-[#3A5F50]', 'bg-[#88B09B]', 'bg-[#EBCD5E]'];
    return colors[index % colors.length];
}

function toggleDriver(id) {
    expandedDriverId.value = expandedDriverId.value === id ? null : id;
}

// --- API ACTIONS ---

async function fetchDrivers() {
    try {
        isLoading.value = true;
        const response = await apiClient.get('/drivers');
        drivers.value = response.data.map(d => ({
            id: d.id,
            name: d.name,
            username: d.username,
            email: d.email,
            phone: d.contact_phone,
            sim: d.sim_photo,
            photo: d.profile_picture,
            is_available: d.is_available
        }));
    } catch (error) {
        console.error("Gagal ambil driver:", error);
    } finally {
        isLoading.value = false;
    }
}

async function deleteDriver(id) {
    if (!confirm("Yakin ingin menghapus driver ini?")) return;
    try {
        await apiClient.delete(`/drivers/${id}`);
        alert("Driver dihapus.");
        fetchDrivers();
    } catch (error) {
        console.error("Gagal hapus:", error);
        alert("Gagal menghapus driver.");
    }
}

async function submitDriver() {
    // Validasi Simpel
    if (!form.value.name || !form.value.email || !form.value.username) {
        alert("Nama, Username, dan Email wajib diisi!");
        return;
    }
    if (!isEditing.value && !form.value.password) {
        alert("Password wajib diisi untuk driver baru!");
        return;
    }

    try {
        isSubmitting.value = true;
        const formData = new FormData();
        
        formData.append('name', form.value.name);
        formData.append('username', form.value.username);
        formData.append('email', form.value.email);
        formData.append('phone', form.value.phone);
        
        if (!isEditing.value) {
            formData.append('password', form.value.password);
        }
        
        // Handle File Uploads
        if (form.value.sim) formData.append('sim', form.value.sim);
        if (form.value.photo) formData.append('photo', form.value.photo);

        if (isEditing.value) {
            await apiClient.put(`/drivers/${editId.value}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Data driver berhasil diperbarui.");
        } else {
            await apiClient.post('/drivers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Driver baru berhasil ditambahkan.");
        }

        closeModal();
        fetchDrivers();

    } catch (error) {
        console.error("Error submit:", error);
        const msg = error.response?.data?.message || "Terjadi kesalahan.";
        alert("Gagal: " + msg);
    } finally {
        isSubmitting.value = false;
    }
}

// --- MODAL ---
function openAddModal() {
    isEditing.value = false;
    editId.value = null;
    form.value = { name: '', username: '', email: '', password: '', phone: '', sim: null, photo: null };
    simPreview.value = null;
    photoPreview.value = null;
    showModal.value = true;
}

function openEditModal(driver) {
    isEditing.value = true;
    editId.value = driver.id;
    form.value = {
        name: driver.name,
        username: driver.username,
        email: driver.email,
        phone: driver.phone,
        password: '',
        sim: null,
        photo: null
    };
    simPreview.value = resolveSimUrl(driver.sim);
    photoPreview.value = resolvePhotoUrl(driver.photo);
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
}

// Handle Upload SIM
function handleSimUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.sim = file;
        simPreview.value = URL.createObjectURL(file);
    }
}

// Handle Upload Profile
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.photo = file;
        photoPreview.value = URL.createObjectURL(file);
    }
}

onMounted(() => {
    fetchDrivers();
});
</script>

<template>
  <div class="min-h-screen font-sans overflow-x-hidden pt-20 pb-32 relative"
    style="
        background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
        background-repeat: no-repeat;
        background-attachment: fixed;
    ">
    
    <div class="text-center mb-8 pt-10 md:pt-15 space-y-6">
        <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-white drop-shadow-md py-3 px-8">
            Kelola Driver
        </h1>
    </div>

    <div class="max-w-4xl mx-auto px-4">
      
      <div class="bg-white/90 backdrop-blur-sm w-full min-h-[600px] rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-2xl relative overflow-hidden border border-white/50">
        
        <div class="flex justify-between items-center mb-8 relative z-10">
            <h2 class="text-xl md:text-2xl font-bold text-gray-800 md:hidden">Daftar Driver</h2>
            
            <button 
                @click="openAddModal"
                class="bg-[#EBCD5E] hover:bg-[#dcb945] text-white md:text-lg font-bold py-3 px-6 md:px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 active:scale-95 ml-auto"
            >
               <i class="fas fa-plus"></i> <span class="hidden md:inline">Tambahkan Driver</span><span class="md:hidden">Tambah</span>
            </button>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-400">
            <i class="fas fa-circle-notch fa-spin text-4xl mb-3 text-[#3A5F50]"></i>
            <p>Memuat data driver...</p>
        </div>

        <div v-else-if="drivers.length === 0" class="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-id-card text-3xl text-gray-400"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-700">Belum ada driver</h3>
            <p class="text-gray-500 text-sm">Tambahkan driver untuk membantu penjemputan kucing.</p>
        </div>

        <div v-else class="space-y-4 pr-1 md:pr-2 max-h-[500px] overflow-y-auto custom-scrollbar relative z-10">
            <div 
              v-for="(driver, index) in drivers" 
              :key="driver.id"
              class="group bg-white hover:bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-[#EBCD5E] shadow-sm hover:shadow-md"
            >
                <div 
                  @click="toggleDriver(driver.id)"
                  class="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                    <div class="flex items-center gap-4">
                        <div 
                          class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md overflow-hidden border-2 border-white"
                          :class="!driver.photo ? getAvatarColor(index) : ''"
                        >
                           <img v-if="driver.photo" :src="resolvePhotoUrl(driver.photo)" class="w-full h-full object-cover">
                           <span v-else>{{ driver.name.charAt(0).toUpperCase() }}</span>
                        </div>

                        <div>
                            <h3 class="font-bold text-lg md:text-xl text-gray-800 group-hover:text-[#3A5F50] transition-colors">
                                {{ driver.name }}
                            </h3>
                            <p class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md inline-block mt-1">@{{ driver.username }}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm text-gray-400 transition-all group-hover:bg-white group-hover:text-[#EBCD5E]" :class="{ 'rotate-180 bg-[#EBCD5E] text-white': expandedDriverId === driver.id }">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                </div>

                <div v-show="expandedDriverId === driver.id" class="px-4 md:px-6 pb-6 pt-0 bg-gray-50/50">
                    <hr class="border-gray-200 mb-4 opacity-50">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                                <div class="font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-100">{{ driver.email }}</div>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor HP</label>
                                <div class="font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-100">{{ driver.phone || '-' }}</div>
                            </div>
                            
                            <div class="pt-4 flex gap-3">
                                <button @click.stop="openEditModal(driver)" class="flex-1 bg-[#3A5F50] hover:bg-[#2c473c] text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors">Edit Data</button>
                                <button @click.stop="deleteDriver(driver.id)" class="flex-1 bg-white border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors">Hapus Driver</button>
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Foto SIM</label>
                            <div class="bg-gray-200 rounded-xl overflow-hidden h-48 flex items-center justify-center relative group/img border-2 border-dashed border-gray-300 bg-white">
                                <img v-if="resolveSimUrl(driver.sim)" :src="resolveSimUrl(driver.sim)" class="w-full h-full object-contain">
                                <span v-else class="text-xs text-gray-400 flex flex-col items-center">
                                    <i class="fas fa-image text-2xl mb-1"></i>
                                    Tidak ada SIM
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
        <div class="bg-white w-full max-w-lg rounded-[30px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            
            <div class="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
                <h3 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Edit Driver' : 'Tambah Driver Baru' }}</h3>
                <button @click="closeModal" class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"><i class="fas fa-times"></i></button>
            </div>

            <div class="p-8 overflow-y-auto custom-scrollbar bg-white">
                <form @submit.prevent="submitDriver" class="space-y-5">
                    
                    <div class="flex justify-center mb-4">
                        <div class="relative w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#EBCD5E] transition-colors">
                            <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover">
                            <div v-else class="text-center text-gray-400 text-xs group-hover:text-[#EBCD5E]">
                                <i class="fas fa-camera text-lg mb-1"></i><br>Foto
                            </div>
                            <input type="file" accept="image/*" @change="handlePhotoUpload" class="absolute inset-0 opacity-0 cursor-pointer">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Lengkap</label>
                            <input v-model="form.name" type="text" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none transition-all" placeholder="Budi Santoso" required>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Username</label>
                            <input v-model="form.username" type="text" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none transition-all" placeholder="budidriver" required>
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Email</label>
                        <input v-model="form.email" type="email" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none transition-all" placeholder="email@contoh.com" required>
                    </div>

                    <div v-if="!isEditing">
                        <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
                        <input v-model="form.password" type="password" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none transition-all" placeholder="******" required>
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">No. Telepon</label>
                        <input v-model="form.phone" type="tel" class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EBCD5E] outline-none transition-all" placeholder="0812...">
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase mb-2 block">Upload Foto SIM</label>
                        <div class="flex items-center gap-4 border border-dashed border-gray-300 p-3 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                            <div class="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                <img v-if="simPreview" :src="simPreview" class="w-full h-full object-cover">
                            </div>
                            <input type="file" accept="image/*" @change="handleSimUpload" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-[#EBCD5E] file:text-white cursor-pointer">
                        </div>
                    </div>

                    <button type="submit" :disabled="isSubmitting" class="w-full bg-[#3A5F50] hover:bg-[#2c473c] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-95 mt-4">
                        {{ isSubmitting ? 'Menyimpan Data...' : 'Simpan Driver' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }

/* Animasi Modal */
.animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>