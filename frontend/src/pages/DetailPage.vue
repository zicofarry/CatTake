<template>
    <main class="min-h-screen bg-gray-100 py-10 md:pt-16" style="background: linear-gradient(180deg, #E8EAE3 0%, #A9C2B7 100%);">
        
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-10">
                <router-link to="/" class="flex items-center text-lg font-semibold text-gray-800 no-underline hover:text-green-700 transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Beranda
                </router-link>
                <button @click="handleSignOut" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center shadow-md transition duration-200">
                    Sign Out
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6-4v4" />
                    </svg>
                </button>
            </div>

            <div class="flex flex-col md:flex-row gap-8">
                
                <div class="flex justify-center md:flex-none">
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-48 h-48 rounded-full shadow-xl p-2 bg-white flex items-center justify-center relative">
                            
                            <img 
                                :src="userData.photo" 
                                alt="Profile" 
                                class="w-full h-full object-cover rounded-full cursor-pointer"
                                @click="togglePhotoDropdown"  >

                            <input 
                                type="file" 
                                id="photo-upload" 
                                accept="image/png, image/jpeg" 
                                @change="handleFileUpload" 
                                class="hidden"
                            >
                            
                            <button @click="handleChoosePhoto" class="absolute bottom-4 right-4 bg-gray-700 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition flex items-center justify-center">
                                <i class="fas fa-camera text-sm"></i>
                            </button>

                            <div v-if="isPhotoDropdownOpen" @click.stop class="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-50 text-left">
                                <button @click="handleViewPhoto" class="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 transition">
                                    <i class="fas fa-user-circle w-5 text-lg"></i>
                                    Lihat Foto Profil
                                </button>
                                <button @click="handleChoosePhoto" class="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 transition">
                                    <i class="fas fa-image w-5 text-lg"></i>
                                    Pilih Foto Profil
                                </button>
                            </div>
                            
                            <div v-if="isPhotoDropdownOpen" @click="togglePhotoDropdown" class="fixed inset-0 z-40"></div>

                        </div>
                        
                    </div>
                </div>
                <div class="flex flex-col gap-4 w-full md:flex-grow">
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800">
                        <input v-if="activeEditField === 'name'" type="text" v-model="formState.name" class="w-full focus:outline-none focus:ring-0">
                        <span v-else :class="{ 'text-gray-800': formState.name, 'text-gray-500': !formState.name }">{{ displayPlaceholder(formState.name, 'Isi nama lengkap anda...') }}</span>
                        <button v-if="activeEditField !== 'name'" @click="toggleEditMode('name')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                        <button v-else @click="handleSaveProfile('name')" :disabled="isLoading" class="text-green-600 font-bold text-sm ml-4 disabled:opacity-50">
                            {{ isLoading ? 'Menyimpan...' : 'SIMPAN' }}
                        </button>
                    </div>

                    <div class="flex flex-row gap-4">
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <select v-if="activeEditField === 'gender'" v-model="formState.gender" class="w-full focus:outline-none focus:ring-0 text-base">
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                                <option value="" disabled>Pilih Jenis Kelamin</option>
                            </select>
                            <span v-else :class="{ 'text-gray-800': formState.gender, 'text-gray-500': !formState.gender }                              ">{{ displayPlaceholder(formState.gender, 'Pilih jenis kelamin...') }}</span>
                            <button v-if="activeEditField !== 'gender'" @click="toggleEditMode('gender')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                            <button v-else @click="handleSaveProfile('gender')" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
                        </div>
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <input v-if="activeEditField === 'birthDate'" type="date" v-model="formState.birthDate" class="w-full focus:outline-none focus:ring-0">
                            <span v-else :class="{ 'text-gray-800': formState.birthDate, 'text-gray-500': !formState.birthDate }">{{ displayPlaceholder(formState.birthDate, 'Isi tanggal lahir..') }}</span>
                            <button v-if="activeEditField !== 'birthDate'" @click="toggleEditMode('birthDate')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                            <button v-else @click="handleSaveProfile('birthDate')" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
                        </div>
                    </div>
                    
                    
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800">
                        <textarea v-if="activeEditField === 'profileDescription'" v-model="formState.profileDescription" class="w-full focus:outline-none focus:ring-0 h-16"></textarea>
                        <span v-else :class="{ 'text-gray-800': formState.profileDescription, 'text-gray-500': !formState.profileDescription }">{{ displayPlaceholder(formState.profileDescription, 'Tulis bio singkat tentang dirimu...') }}</span>
                        <button v-if="activeEditField !== 'profileDescription'" @click="toggleEditMode('profileDescription')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                        <button v-else @click="handleSaveProfile('profileDescription')" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
                    </div>
                </div>
            </div>

            <div class="mt-12 flex flex-col md:flex-row gap-8">
                
                <section class="bg-white p-6 rounded-2xl shadow-xl md:w-1/2">
                    <h2 class="text-2xl font-bold mb-6 text-gray-800">Quest</h2>
                    <div v-for="(quest, index) in quests" :key="index" class="mb-4">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-semibold">{{ quest.name }}</span>
                            <span class="text-yellow-500 flex items-center">
                                {{ quest.points }} <i class="fas fa-star ml-1 text-sm"></i>
                            </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-green-700 h-2.5 rounded-full" :style="{ width: `${(quest.progress / quest.target) * 100}%` }"></div>
                        </div>
                    </div>
                </section>

                <section class="bg-white p-6 rounded-2xl shadow-xl md:w-1/2">
                    <h2 class="text-2xl font-bold mb-6 text-gray-800">Achievement</h2>
                    <div v-for="(achievement, index) in achievements" :key="index" class="mb-4">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-semibold">{{ achievement.name }}</span>
                            <span class="text-amber-500 flex items-center">
                                {{ achievement.points }} <i class="fas fa-trophy ml-1 text-sm"></i>
                            </span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, computed, watchEffect, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router'; 
import apiClient from '@/api/http'; 

const router = useRouter(); 
const emit = defineEmits([
    'update-login-status',
    'user-logged-in'
]);

// 1. Terima Props dari App.vue
const props = defineProps({
    profileData: { type: Object, default: () => ({}) }, // Default object kosong
    isLoggedInProp: { type: Boolean, default: false } 
});
console.log("DEBUG 1: Props diterima di DetailPage:", props.profileData);
// 2. State Edit & Dropdown
const activeEditField = ref(null); // String nama field yg diedit
const isPhotoDropdownOpen = ref(false); 
const isLoading = ref(false);

// Helper Tampilan Placeholder
const displayPlaceholder = (value, defaultText) => {
    if (value && value !== 'null' && value !== '') {
        return value;
    }
    return defaultText; 
};

// 3. Data Reaktif (Computed Property untuk Tampilan Statis)
const userData = computed(() => {
    const data = props.profileData || {};
    const genderDisplay = data.gender === 'male' ? 'Laki-laki' : (data.gender === 'female' ? 'Perempuan' : null);
    
    // Formatter Tanggal (Tampilan)
    const birthDateDisplay = data.birth_date 
        ? new Date(data.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
        : null;
    
    
    return {
        name: data.name || '', // Gunakan string kosong agar placeholder bekerja
        birthDate: birthDateDisplay, 
        gender: genderDisplay,
        email: data.email || '',
        photo: data.photo || '/img/NULL.JPG',
        profileDescription: data.bio || '',
    };
});

// 4. Data Form (untuk input yang bisa diubah)
const formState = ref({
    name: '',
    birthDate: '', 
    gender: '', 
    profileDescription: '',
    uploadedFile: null, 
});

// 5. Watcher untuk sinkronisasi data API ke Form
watchEffect(() => {
    if (props.profileData && props.profileData.id) { 
        
        console.log("DEBUG 2: Nilai ID sebelum disalin:", props.profileData.id); // HARUS ADA NILAI
        
        // --- Semua penyalinan dijamin aman di bawah sini ---
        formState.value.name = props.profileData.name || '';
        formState.value.birthDate = props.profileData.birth_date ? new Date(props.profileData.birth_date).toISOString().substring(0, 10) : '';
        formState.value.gender = props.profileData.gender || '';
        formState.value.profileDescription = props.profileData.bio || '';
        
        console.log("DEBUG 3: Nilai FormState Name setelah disalin:", formState.value.name);
    } else {
        // Ini adalah case untuk null atau objek kosong awal ({})
        console.log("DEBUG: Data profil masih kosong atau ID tidak ditemukan.");
    }
});

// 6. Quests & Achievements
const quests = computed(() => props.profileData?.quests || []);
const achievements = computed(() => props.profileData?.achievements || []);

// --- FUNGSI INTERAKSI ---

function toggleEditMode(field) {
    if (activeEditField.value === field) {
        activeEditField.value = null; // Tutup jika diklik lagi
    } else {
        activeEditField.value = field; // Buka field tertentu
    }
}

function togglePhotoDropdown() {
    isPhotoDropdownOpen.value = !isPhotoDropdownOpen.value;
}

function handleChoosePhoto() {
    isPhotoDropdownOpen.value = false;
    document.getElementById('photo-upload').click(); 
}

function handleViewPhoto() {
    isPhotoDropdownOpen.value = false;
    alert('Fitur Lihat Foto belum diimplementasikan (bisa pakai Modal).');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        formState.value.uploadedFile = file;
        // Preview gambar
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update tampilan foto sementara
            // Note: Kita update userData.value.photo ini hanya virtual di computed, 
            // idealnya punya local state untuk preview. Tapi utk simpel:
            const imgPreview = document.querySelector('.w-48 img');
            if(imgPreview) imgPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // Auto-save foto (opsional) atau tunggu tombol simpan khusus?
        // Di sini kita asumsikan user harus klik tombol SIMPAN khusus foto atau 
        // kita bisa langsung panggil handleSaveProfile('photo') jika mau auto-upload.
    }
}

async function handleSaveProfile(fieldToSave) {
    if (!props.profileData || !props.profileData.id) {
        alert("Gagal: Data profil belum siap.");
        isLoading.value = false;
        activeEditField.value = null;
        return;
    }
    
    isLoading.value = true;
    const userId = props.profileData.id;
    
    // Siapkan Payload
    const payload = {
        full_name: formState.value.name,
        birth_date: formState.value.birthDate,
        gender: formState.value.gender,
        bio: formState.value.profileDescription,
        role: 'individu', // Hardcode atau props.userRole
    };

    // Logic pengiriman (JSON vs FormData) - Sederhana: Kirim JSON karena edit per atribut teks
    // Kecuali jika fieldToSave == 'photo' (implementasi terpisah)
    
    try {
        console.log("Mengirim update:", payload);
        // await apiClient.patch(`/users/profile/${userId}`, payload); 
        
        alert('Berhasil disimpan!');
        activeEditField.value = null; // Tutup edit mode
        
        // Emit event refresh jika perlu
        // emit('refresh-data'); 

    } catch (error) {
        alert('Gagal menyimpan.');
        console.error(error);
    } finally {
        isLoading.value = false;
    }
}

function handleSignOut() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    emit('update-login-status', false); 
    router.push('/login');
}
</script>

<style scoped>
/* Hapus semua CSS lama */
/* Latar belakang menggunakan style inline dan utility class Tailwind */
</style>