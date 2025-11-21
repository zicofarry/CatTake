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
                            
                            <span v-else :class="{ 'text-gray-800': formState.gender, 'text-gray-500': !formState.gender }">
                                {{ 
                                    formState.gender === 'male' ? 'Laki-laki' : 
                                    (formState.gender === 'female' ? 'Perempuan' : 'Pilih jenis kelamin...') 
                                }}
                            </span>

                            <button v-if="activeEditField !== 'gender'" @click="toggleEditMode('gender')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                            <button v-else @click="handleSaveProfile('gender')" class="text-green-600 font-bold text-sm ml-4">SIMPAN</button>
                        </div>

                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <input v-if="activeEditField === 'birthDate'" type="date" v-model="formState.birthDate" class="w-full focus:outline-none focus:ring-0">
                            
                            <span v-else :class="{ 'text-gray-800': userData.birthDateDisplay, 'text-gray-500': !userData.birthDateDisplay }">
                                {{ userData.birthDateDisplay || 'Isi tanggal lahir..' }}
                            </span>
                            
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
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router'; 
import apiClient from '@/api/http'; 

const router = useRouter(); 
const emit = defineEmits(['update-login-status', 'user-logged-in']);

const props = defineProps({
    profileData: { type: Object, default: () => ({}) },
    isLoggedInProp: { type: Boolean, default: false } 
});

const activeEditField = ref(null);
const isPhotoDropdownOpen = ref(false); 
const isLoading = ref(false);

// --- Helper Functions ---
const displayPlaceholder = (value, defaultText) => {
    return (value && value !== 'null' && value !== '') ? value : defaultText;
};

// --- Data untuk Tampilan (Computed) ---
const userData = computed(() => {
    const data = props.profileData || {};
    
    // FIX 1: Format Tanggal Tampilan (30 Januari 2000)
    // Gunakan { month: 'long' } untuk nama bulan lengkap
    const birthDateDisplay = data.birth_date 
        ? new Date(data.birth_date).toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }) 
        : null;

    return {
        photo: data.photo || '/img/NULL.JPG',
        birthDateDisplay: birthDateDisplay
    };
});

// --- Form State ---
const formState = ref({
    name: '',
    birthDate: '', 
    gender: '', 
    profileDescription: '',
});

// --- Watch untuk Sinkronisasi Data ---
watch(
    () => props.profileData, 
    (newData) => {
        if (newData && newData.id) {
            formState.value.name = newData.name || '';
            
            // FIX 2: Parsing Tanggal untuk Input Form (Menghindari Bug Off-by-1)
            // Jangan pakai toISOString() karena akan mengonversi ke UTC (bisa jadi H-1)
            // Gunakan komponen tanggal lokal
            if (newData.birth_date) {
                const d = new Date(newData.birth_date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
                const day = String(d.getDate()).padStart(2, '0');
                
                formState.value.birthDate = `${year}-${month}-${day}`;
            } else {
                formState.value.birthDate = '';
            }

            formState.value.gender = newData.gender || '';
            formState.value.profileDescription = newData.bio || '';
        }
    },
    { immediate: true, deep: true }
);

const quests = computed(() => props.profileData?.quests || []);
const achievements = computed(() => props.profileData?.achievements || []);

// --- Fungsi Interaksi ---
function toggleEditMode(field) {
    activeEditField.value = (activeEditField.value === field) ? null : field;
}

function togglePhotoDropdown() {
    isPhotoDropdownOpen.value = !isPhotoDropdownOpen.value;
}

function handleChoosePhoto() {
    isPhotoDropdownOpen.value = false;
    document.getElementById('photo-upload').click(); 
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        alert("Fitur upload foto butuh endpoint khusus.");
    }
}

async function handleSaveProfile(fieldToSave) {
    if (!props.profileData || !props.profileData.id) {
        alert("Gagal: Data profil belum siap.");
        return;
    }
    
    isLoading.value = true;
    const userId = props.profileData.id;
    
    const payload = {
        full_name: formState.value.name,
        birth_date: formState.value.birthDate,
        gender: formState.value.gender,
        bio: formState.value.profileDescription,
        role: props.profileData.role || 'individu', 
    };

    try {
        await apiClient.patch(`/users/profile/${userId}`, payload); 
        
        alert('Data berhasil disimpan!');
        activeEditField.value = null;
        
        // Refresh halaman agar data baru langsung terlihat dari DB
        window.location.reload(); 

    } catch (error) {
        console.error("Gagal menyimpan profil:", error);
        alert('Gagal menyimpan perubahan. Cek koneksi atau login ulang.');
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
</style>