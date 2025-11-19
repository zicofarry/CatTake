<template>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
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
                    <div class="w-48 h-48 rounded-full shadow-xl p-2 bg-white flex items-center justify-center relative">
                        <img :src="userData.photo" alt="Profile" class="w-full h-full object-cover rounded-full">

                        <input 
                            v-if="isEditMode" 
                            type="file" 
                            id="photo-upload" 
                            accept="image/png, image/jpeg" 
                            @change="handleFileUpload" 
                            class="hidden"
                        >
                        <label 
                            v-if="isEditMode" 
                            for="photo-upload" 
                            class="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition duration-300"
                        >
                            <i class="fas fa-camera text-white text-3xl"></i>
                        </label>
                    </div>
                </div>
                <div class="flex flex-col gap-4 w-full md:flex-grow">
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800">
                        <input v-if="isEditMode" type="text" v-model="formState.name" class="w-full focus:outline-none focus:ring-0">
                        <span v-else>{{ userData.name }}</span>
                        <button v-if="!isEditMode" @click="toggleEditMode" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                        <button v-else @click="handleSaveProfile" :disabled="isLoading" class="text-green-600 font-bold text-sm ml-4 disabled:opacity-50">
                            {{ isLoading ? 'Menyimpan...' : 'SIMPAN' }}
                        </button>
                    </div>

                    <div class="hidden md:flex gap-4">
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <input v-if="isEditMode" type="date" v-model="formState.birthDate" class="w-full focus:outline-none focus:ring-0">
                            <span v-else>{{ userData.birthDate }}</span>
                            <i v-if="!isEditMode" @click="toggleEditMode" class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm ml-4"></i>
                            <button v-else @click="handleSaveProfile" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
                        </div>
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <select v-if="isEditMode" v-model="formState.gender" class="w-full focus:outline-none focus:ring-0 text-base">
                                <option value="male">Laki-laki</option>
                                <option value="female">Perempuan</option>
                                <option value="" disabled>Pilih Gender</option>
                            </select>
                            <span v-else>{{ userData.gender }}</span>
                            <i v-if="!isEditMode" @click="toggleEditMode" class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm ml-4"></i>
                            <button v-else @click="handleSaveProfile" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800">
                        <textarea v-if="isEditMode" v-model="formState.profileDescription" class="w-full focus:outline-none focus:ring-0 h-16"></textarea>
                        <span v-else>{{ userData.profileDescription }}</span>
                        <i v-if="!isEditMode" @click="toggleEditMode" class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm ml-4"></i>
                        <button v-else @click="handleSaveProfile" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
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
import apiClient from '@/api/http'; // Asumsi untuk menyimpan data

const router = useRouter(); 
const emit = defineEmits([
    'update-login-status',
    'user-logged-in'
]);

// 1. Terima Props dari App.vue
const props = defineProps({
    profileData: { type: Object, default: () => null },
    isLoggedInProp: { type: Boolean, default: false }
});

// 2. State Edit
const isEditMode = ref(false);
const isLoading = ref(false);

// 3. Data Reaktif (digunakan untuk Form/Tampilan)
const userData = computed(() => {
    const data = props.profileData || {};
    // Menampilkan format Indonesia untuk Gender
    const genderDisplay = data.gender === 'male' ? 'Laki-laki' : (data.gender === 'female' ? 'Perempuan' : 'N/A');
    
    // Formatter Tanggal (Tampilan)
    const birthDateDisplay = data.birth_date ? new Date(data.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Tanggal Lahir';
    
    return {
        name: data.name || 'NAMA LENGKAP',
        birthDate: birthDateDisplay, 
        gender: genderDisplay,
        email: data.email || 'email@contoh.com',
        // Menggunakan foto dari backend, fallback ke path lokal default
        photo: data.photo || '/img/NULL.JPG',
        profileDescription: data.bio || 'Tulis bio singkat tentang dirimu...',
    };
});

// 4. Data Form (untuk input yang bisa diubah)
const formState = ref({
    name: '',
    birthDate: '', // Format ISO date YYYY-MM-DD
    gender: '', // Format mentah male/female
    profileDescription: '',
    uploadedFile: null, // Untuk menampung file baru
});

// 5. Watcher untuk mengisi formState saat data profil diterima
watchEffect(() => {
    if (props.profileData) {
        // Mengisi formState dengan nilai mentah/formatted untuk input
        formState.value.name = props.profileData.name || '';
        // Format ISO date (wajib untuk <input type="date">)
        formState.value.birthDate = props.profileData.birth_date ? new Date(props.profileData.birth_date).toISOString().substring(0, 10) : '';
        formState.value.gender = props.profileData.gender || '';
        formState.value.profileDescription = props.profileData.bio || '';
    }
});

// 6. Computed Quests & Achievements (Mengambil data dari prop)
const quests = computed(() => props.profileData?.quests || []);
const achievements = computed(() => props.profileData?.achievements || []);


function toggleEditMode() {
    isEditMode.value = !isEditMode.value;
    
    // Logika Reset: Jika user keluar dari Edit Mode TANPA Save
    if (!isEditMode.value && props.profileData) {
        // Reset formState kembali ke nilai props saat ini
        formState.value.name = props.profileData.name || '';
        formState.value.birthDate = props.profileData.birth_date ? new Date(props.profileData.birth_date).toISOString().substring(0, 10) : '';
        formState.value.gender = props.profileData.gender || '';
        formState.value.profileDescription = props.profileData.bio || '';
        formState.value.uploadedFile = null; // Hapus file yang dipilih
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        formState.value.uploadedFile = file;
        // Opsional: Tampilkan preview gambar
        const reader = new FileReader();
        reader.onload = (e) => {
            // Update photo di userData secara sementara untuk preview
            userData.value.photo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function handleSaveProfile() {
    if (!props.profileData || !props.profileData.id) {
        alert("Gagal menyimpan: Data profil atau ID pengguna tidak ditemukan. Mohon coba lagi.");
        isLoading.value = false;
        // PENTING: Matikan edit mode agar pengguna bisa coba refresh atau sign out
        isEditMode.value = false; 
        return; 
    }
    
    // Logika ini sekarang aman karena Anda sudah cek di atas
    const userId = props.profileData.id;
    isLoading.value = true;

    // 1. Persiapan Payload (Sudah Anda siapkan)
    const formData = new FormData();
    const textPayload = {
        full_name: formState.value.name,
        birth_date: formState.value.birthDate,
        gender: formState.value.gender,
        bio: formState.value.profileDescription,
        role: props.userRole, // Kirim role untuk backend tahu tabel mana yang diupdate
    };
    
    // 2. Tentukan Payload Akhir (JSON vs FormData)
    let finalPayload;
    let axiosConfig = {};

    if (formState.value.uploadedFile) {
        // Jika ada file: Gunakan FormData
        Object.keys(textPayload).forEach(key => formData.append(key, textPayload[key]));
        formData.append('profile_picture', formState.value.uploadedFile);
        finalPayload = formData;
        axiosConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
    } else {
        // Jika tidak ada file: Gunakan JSON
        finalPayload = textPayload;
        // Content-Type: application/json sudah menjadi default Axios, tidak perlu di set ulang
    }


    try {
        // 🛑 AKTIFKAN API CALL DI SINI
        await apiClient.patch(`/users/profile/${userId}`, finalPayload, axiosConfig); 

        // [Jika ada refresh data, panggil di sini, misalnya: emit('refresh-profile-data')]

        alert('Profil berhasil diperbarui!');
        isEditMode.value = false;

    } catch (error) {
        alert('Gagal menyimpan profil. Cek koneksi server atau format data.');
        console.error("Save profile error:", error);
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