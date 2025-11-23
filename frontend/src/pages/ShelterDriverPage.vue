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
  <div class="min-h-screen bg-gray-50 md:bg-[#3A5F50] font-sans pt-24 pb-20 relative">
    
    <div class="hidden md:flex justify-center mb-8">
        <div class="bg-white py-3 px-16 rounded-full shadow-lg backdrop-blur-sm bg-white/90">
            <h1 class="text-3xl font-bold text-[#1F1F1F]">Kelola Driver</h1>
        </div>
    </div>

    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white w-full min-h-[600px] rounded-[30px] md:rounded-[50px] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        
        <div class="flex justify-between items-center mb-8 relative z-10">
            <h2 class="text-xl md:text-2xl font-bold text-gray-800 md:hidden">Daftar Driver</h2>
            <button 
                @click="openAddModal"
                class="bg-[#EBCD5E] hover:bg-[#dcb945] text-white md:text-lg font-bold py-3 px-6 md:px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 active:scale-95"
            >
               <i class="fas fa-plus"></i> <span class="hidden md:inline">Tambahkan Driver</span><span class="md:hidden">Tambah</span>
            </button>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-gray-400">
            <i class="fas fa-circle-notch fa-spin text-4xl mb-3 text-[#3A5F50]"></i>
            <p>Memuat data driver...</p>
        </div>

        <div v-else-if="drivers.length === 0" class="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-id-card text-3xl text-gray-300"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-700">Belum ada driver</h3>
            <p class="text-gray-400 text-sm">Tambahkan driver untuk membantu penjemputan kucing.</p>
        </div>

        <div v-else class="space-y-4 pr-1 md:pr-2 max-h-[500px] overflow-y-auto custom-scrollbar relative z-10">
            <div 
              v-for="(driver, index) in drivers" 
              :key="driver.id"
              class="group bg-gray-50 hover:bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-md"
            >
                <div 
                  @click="toggleDriver(driver.id)"
                  class="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                    <div class="flex items-center gap-4">
                        <div 
                          class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner overflow-hidden border-2 border-white"
                          :class="!driver.photo ? getAvatarColor(index) : ''"
                        >
                           <img v-if="driver.photo" :src="resolvePhotoUrl(driver.photo)" class="w-full h-full object-cover">
                           <span v-else>{{ driver.name.charAt(0).toUpperCase() }}</span>
                        </div>

                        <div>
                            <h3 class="font-bold text-lg md:text-xl text-[#1F1F1F] group-hover:text-[#3A5F50] transition-colors">
                                {{ driver.name }}
                            </h3>
                            <p class="text-xs text-gray-500">@{{ driver.username }}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 transition-all" :class="{ 'rotate-180': expandedDriverId === driver.id }">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                </div>

                <div v-show="expandedDriverId === driver.id" class="px-4 md:px-6 pb-6 pt-0">
                    <hr class="border-gray-200 mb-4 opacity-50">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                                <div class="font-medium text-gray-700">{{ driver.email }}</div>
                            </div>
                            <div>
                                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor HP</label>
                                <div class="font-medium text-gray-700">{{ driver.phone || '-' }}</div>
                            </div>
                            
                            <div class="pt-4 flex gap-3">
                                <button @click.stop="openEditModal(driver)" class="flex-1 bg-[#3A5F50] text-white py-2.5 rounded-xl font-bold text-sm shadow-md">Edit</button>
                                <button @click.stop="deleteDriver(driver.id)" class="flex-1 bg-white border border-red-200 text-red-500 py-2.5 rounded-xl font-bold text-sm shadow-sm">Hapus</button>
                            </div>
                        </div>

                        <div>
                            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">SIM</label>
                            <div class="bg-gray-200 rounded-xl overflow-hidden h-48 flex items-center justify-center relative group/img">
                                <img v-if="resolveSimUrl(driver.sim)" :src="resolveSimUrl(driver.sim)" class="w-full h-full object-cover">
                                <span v-else class="text-xs text-gray-500">Tidak ada SIM</span>
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
        <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
            
            <div class="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
                <h3 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Edit Driver' : 'Tambah Driver' }}</h3>
                <button @click="closeModal"><i class="fas fa-times text-gray-400 hover:text-red-500"></i></button>
            </div>

            <div class="p-8 overflow-y-auto custom-scrollbar">
                <form @submit.prevent="submitDriver" class="space-y-5">
                    
                    <div class="flex justify-center mb-4">
                        <div class="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group cursor-pointer">
                            <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover">
                            <div v-else class="text-center text-gray-400 text-xs">
                                <i class="fas fa-camera text-lg mb-1"></i><br>Foto
                            </div>
                            <input type="file" accept="image/*" @change="handlePhotoUpload" class="absolute inset-0 opacity-0 cursor-pointer">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-bold text-gray-600">Nama Lengkap</label>
                            <input v-model="form.name" type="text" class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-[#EBCD5E] outline-none" required>
                        </div>
                        <div>
                            <label class="text-sm font-bold text-gray-600">Username</label>
                            <input v-model="form.username" type="text" class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-[#EBCD5E] outline-none" required>
                        </div>
                    </div>

                    <div>
                        <label class="text-sm font-bold text-gray-600">Email</label>
                        <input v-model="form.email" type="email" class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-[#EBCD5E] outline-none" required>
                    </div>

                    <div v-if="!isEditing">
                        <label class="text-sm font-bold text-gray-600">Password</label>
                        <input v-model="form.password" type="password" class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-[#EBCD5E] outline-none" required>
                    </div>

                    <div>
                        <label class="text-sm font-bold text-gray-600">No. Telepon</label>
                        <input v-model="form.phone" type="tel" class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-[#EBCD5E] outline-none">
                    </div>

                    <div>
                        <label class="text-sm font-bold text-gray-600 mb-2 block">Foto SIM</label>
                        <div class="flex items-center gap-4 border p-3 rounded-xl bg-gray-50">
                            <div class="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                <img v-if="simPreview" :src="simPreview" class="w-full h-full object-cover">
                            </div>
                            <input type="file" accept="image/*" @change="handleSimUpload" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-[#EBCD5E] file:text-white cursor-pointer">
                        </div>
                    </div>

                    <button type="submit" :disabled="isSubmitting" class="w-full bg-[#EBCD5E] hover:bg-[#dcb945] text-white font-bold py-3 rounded-xl shadow-md">
                        {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 20px; }
</style>