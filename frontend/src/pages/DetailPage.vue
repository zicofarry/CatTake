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
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                </button>
            </div>
            
            <div v-if="activeEditField" @click="toggleEditMode(activeEditField)" class="fixed inset-0 z-10 cursor-default"></div>

            <div class="flex flex-col md:flex-row gap-8">
                
                <div class="flex justify-center md:flex-none">
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-48 h-48 rounded-full shadow-xl p-2 bg-white flex items-center justify-center relative">
                            
                            <img 
                                :src="resolveImageUrl(userData.photo)" 
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
                            
                            <div v-if="isPhotoDropdownOpen" @click="togglePhotoDropdown" class="fixed inset-0 z-50"></div>

                        </div>
                        
                    </div>
                </div>
                <div class="flex flex-col gap-4 w-full md:flex-grow">
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 relative z-20">
                        <input v-if="activeEditField === 'name'" type="text" v-model="formState.name" class="w-full focus:outline-none focus:ring-0">
                        <span v-else :class="{ 'text-gray-800': formState.name, 'text-gray-500': !formState.name }">{{ displayPlaceholder(formState.name, 'Isi nama lengkap anda...') }}</span>
                        <button v-if="activeEditField !== 'name'" @click.stop="toggleEditMode('name')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                        <button v-else @click.stop="handleSaveProfile('name')" :disabled="isLoading" class="bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm ml-4 disabled:opacity-50 px-3 py-1 rounded transition-colors active:scale-95">
                            {{ isLoading ? 'Menyimpan...' : 'SIMPAN' }}
                        </button>
                    </div>

                    <div class="flex flex-row gap-4">
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1 relative z-20">
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

                            <button v-if="activeEditField !== 'gender'" @click.stop="toggleEditMode('gender')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                            <button v-else @click.stop="handleSaveProfile('gender')" class="bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm ml-4 disabled:opacity-50 px-3 py-1 rounded transition-colors active:scale-95">SIMPAN</button>
                        </div>

                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1 relative z-20">
                            <input v-if="activeEditField === 'birthDate'" type="date" v-model="formState.birthDate" class="w-full focus:outline-none focus:ring-0">
                            
                            <span v-else :class="{ 'text-gray-800': userData.birthDateDisplay, 'text-gray-500': !userData.birthDateDisplay }">
                                {{ userData.birthDateDisplay || 'Isi tanggal lahir..' }}
                            </span>
                            
                            <button v-if="activeEditField !== 'birthDate'" @click.stop="toggleEditMode('birthDate')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                            <button v-else @click.stop="handleSaveProfile('birthDate')" class="bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm ml-4 disabled:opacity-50 px-3 py-1 rounded transition-colors active:scale-95">SIMPAN</button>
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 relative z-20">
                        <textarea v-if="activeEditField === 'profileDescription'" v-model="formState.profileDescription" class="w-full focus:outline-none focus:ring-0 h-16"></textarea>
                        <span v-else :class="{ 'text-gray-800': formState.profileDescription, 'text-gray-500': !formState.profileDescription }">{{ displayPlaceholder(formState.profileDescription, 'Tulis bio singkat tentang dirimu...') }}</span>
                        <button v-if="activeEditField !== 'profileDescription'" @click.stop="toggleEditMode('profileDescription')" class="text-gray-500 cursor-pointer text-sm ml-4"><i class="fas fa-pencil-alt"></i></button>
                        <button v-else @click.stop="handleSaveProfile('profileDescription')" class="bg-green-100 hover:bg-green-200 text-green-700 font-bold text-sm ml-4 disabled:opacity-50 px-3 py-1 rounded transition-colors active:scale-95">SIMPAN</button>
                    </div>
                </div>
            </div>

            <div class="mt-12 flex flex-col md:flex-row gap-8">
    
    <section class="bg-white p-6 rounded-2xl shadow-xl md:w-1/2">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Quest</h2>
        
        <div class="max-h-[350px] overflow-y-auto custom-scrollbar pr-3">
            <div v-if="quests.length > 0">
                <div v-for="(quest, index) in quests" :key="index" class="mb-4">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-semibold">{{ quest.name }}</span>
                        
                        <div class="flex items-center text-sm ml-2 gap-3">
                            <span class="text-gray-500 text-sm w-24 text-right">
                                {{ parseFloat(quest.progress).toLocaleString('id-ID') }} / {{ parseFloat(quest.target).toLocaleString('id-ID') }}
                            </span>
                            <span class="text-yellow-500 flex items-center font-bold">
                                {{ quest.points }} <i class="fas fa-star ml-1 text-sm"></i>
                            </span>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            class="bg-green-700 h-2.5 rounded-full" 
                            :style="{ width: `${(quest.progress / quest.target) * 100}%` }"
                        ></div>
                    </div>
                </div>
            </div>
            
            <div v-else class="text-center py-4 text-gray-500 italic">
                Semua Quest telah diselesaikan atau belum ada misi yang tersedia.
            </div>
        </div>
    </section>

    <section class="bg-white p-6 rounded-2xl shadow-xl md:w-1/2">
        
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Achievement</h2>
            
            <div v-if="profileData.total_points !== undefined" class="flex items-center text-xl font-extrabold text-[#EBCD5E]">
                {{ Math.floor(profileData.total_points).toLocaleString('id-ID') }}
                <i class="fas fa-trophy ml-2 text-2xl"></i>
                <span class="text-sm font-semibold text-gray-600 ml-1">Poin</span>
            </div>
        </div>
        
        <div class="max-h-[350px] overflow-y-auto custom-scrollbar pr-3">
            <div v-if="achievements.length === 0" class="text-center py-4 text-gray-500 italic">
                Belum ada achievement yang didapatkan.
            </div>
            
            <div v-else v-for="(achievement, index) in achievements" :key="index" class="mb-4 p-3 rounded-xl border"
                :class="achievement.isClaimed ? 'bg-green-100 border-green-200' : 'bg-yellow-50 border-yellow-200'">
                
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold text-gray-800 flex items-center gap-2"
                        :class="achievement.isClaimed ? 'text-green-800' : 'text-orange-600'">
                        <i class="fas fa-medal text-xl text-amber-500"></i>
                        {{ achievement.name }}
                    </span>
                    <span class="text-amber-500 flex items-center font-bold">
                        {{ achievement.points }} <i class="fas fa-trophy ml-1 text-sm"></i>
                    </span>
                </div>
                
                <p class="text-sm text-gray-600 mt-1 mb-3">{{ achievement.description }}</p>
                
                <button 
                    v-if="!achievement.isClaimed"
                    @click="claimReward(achievement.id)"
                    :disabled="isLoading"
                    class="w-full bg-[#EBCD5E] hover:bg-[#dcb945] text-gray-900 py-2 rounded-lg text-sm font-bold shadow-md transition disabled:opacity-50"
                >
                    {{ isLoading ? 'Memproses...' : 'Klaim Poin!' }}
                </button>
                <div v-else class="text-green-700 text-sm font-bold text-center py-1">
                    <i class="fas fa-check"></i> Poin Sudah Diklaim
                </div>
            </div>
        </div>
    </section>
</div>
        </div>
    </main>

    <teleport to="body">
        <div 
            v-if="showPhotoModal" 
            @click="showPhotoModal = false" 
            class="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 backdrop-blur-sm"
        >
            <div @click.stop class="relative max-w-full max-h-full">
                <img 
                    :src="resolveImageUrl(userData.photo)" 
                    alt="Full Profile" 
                    class="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl rounded-lg"
                >
                
                <button 
                    @click="showPhotoModal = false" 
                     class="absolute top-4 right-4 
                            bg-black/50 text-white 
                            w-10 h-10 flex items-center justify-center 
                            rounded-full hover:bg-black/80 transition"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    </teleport>
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

function resolveImageUrl(path) {
    if (!path) return '/img/NULL.JPG';

    // PENTING: Jika URL dimulai dengan http, langsung return (jangan diotak-atik)
    if (path.startsWith('http')) {
        return path;
    }

    // Logika backend lokal
    if (path.startsWith('/public/')) {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const baseServerUrl = baseApiUrl.replace('/api/v1', '');
        return `${baseServerUrl}${path}`;
    }

    return path;
}

const activeEditField = ref(null);
const isPhotoDropdownOpen = ref(false); 
const isLoading = ref(false);
const showPhotoModal = ref(false);

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

// --- Computed Properties Gamifikasi ---
// FIX: Ini yang digunakan di template.
const quests = computed(() => props.profileData?.quests || []);
const achievements = computed(() => props.profileData?.achievements || []);

// --- FUNGSI DEBUG BARU: Melacak Prop ProfileData ---
watch(() => props.profileData, (newProfile) => {
    if (newProfile && newProfile.id) {
        // console.log("--- DEBUG FRONTEND (PROFILE DATA RECEIVED) ---");
        // console.log("Profile Name:", newProfile.name);
        // // Pastikan properties quests dan achievements terkirim dengan benar
        // console.log("Raw Quests Received (Length):", newProfile.quests ? newProfile.quests.length : 0);
        // console.log("Raw Achievements Received (Length):", newProfile.achievements ? newProfile.achievements.length : 0);
        
        // // Log the state of the computed properties immediately after prop update
        // console.log("Quests Computed Length (Final check):", quests.value.length);
        
        // if (quests.value.length === 0 && newProfile.quests && newProfile.quests.length > 0) {
        //      console.error("CRITICAL ERROR: Computed property failed to update or data loss.");
        // }
    }

    // --- Sinkronisasi Data Form (Logic lama yang dipindahkan ke sini) ---
    if (newProfile && newProfile.id) {
        formState.value.name = newProfile.name || '';
        if (newProfile.birth_date) {
            const d = new Date(newProfile.birth_date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            formState.value.birthDate = `${year}-${month}-${day}`;
        } else {
            formState.value.birthDate = '';
        }
        formState.value.gender = newProfile.gender || '';
        formState.value.profileDescription = newProfile.bio || '';
    }
    // --- Akhir Sinkronisasi ---
    
}, { immediate: true, deep: true });
// --------------------------------------------------------------------

async function claimReward(questId) {
    if (!props.isLoggedInProp) {
        alert("Silakan login untuk mengklaim poin.");
        return;
    }
    
    // Konfirmasi klaim (opsional)
    if (!confirm(`Klaim poin ${achievements.value.find(a => a.id === questId).points} untuk Achievement ini?`)) return;

    isLoading.value = true;
    try {
        const response = await apiClient.post(`/gamification/claim/${questId}`);
        alert(`Berhasil! Anda mendapatkan ${response.data.data.points} poin. Total poin Anda sekarang: ${response.data.data.totalPoints.toLocaleString('id-ID')}`);
        
        // Perlu refresh data profil untuk update isClaimed status dan total points di header
        window.location.reload(); 

    } catch (error) {
        const msg = error.response?.data?.error || "Gagal mengklaim poin.";
        alert(msg);
        console.error("Claim Error:", error);
    } finally {
        isLoading.value = false;
    }
}

// --- Fungsi Interaksi ---
function toggleEditMode(field) {
    if (activeEditField.value === field) {
        // Jika mengklik tombol saat mode edit aktif, tutup
        activeEditField.value = null;
    } else if (!activeEditField.value) {
        // Jika tidak ada yang aktif, aktifkan mode edit
        activeEditField.value = field;
        isPhotoDropdownOpen.value = false; // [Perbaikan Tambahan: Tutup dropdown foto saat edit dimulai]
    } else {
        // Jika ada mode edit lain yang aktif, tutup yang lama dan aktifkan yang baru
        // Ini memastikan hanya satu yang terbuka pada satu waktu.
        activeEditField.value = field;
    }
}

function togglePhotoDropdown() {
    isPhotoDropdownOpen.value = !isPhotoDropdownOpen.value;
    if (isPhotoDropdownOpen.value) {
        activeEditField.value = null; // [Perbaikan Tambahan: Tutup mode edit saat dropdown foto dibuka]
    }
}

function handleChoosePhoto() {
    isPhotoDropdownOpen.value = false;
    document.getElementById('photo-upload').click(); 
}

function handleViewPhoto() {
    isPhotoDropdownOpen.value = false;
    showPhotoModal.value = true; // Buka modal
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

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Validasi sederhana (optional)
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        alert('Hanya file gambar (JPG/PNG) yang diperbolehkan.');
        return;
    }

    try {
        isLoading.value = true;
        const userId = props.profileData.id;
        const userRole = localStorage.getItem('userRole') || 'individu';

        // 2. Siapkan FormData
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('role', userRole); // Kirim role agar backend tau tabel mana yg diupdate

        // 3. Kirim ke Backend
        // Endpoint: /api/v1/users/profile/:userId/photo
        const response = await apiClient.post(`/users/profile/${userId}/photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // 4. Sukses
        alert('Foto profil berhasil diperbarui!');
        
        // Update tampilan secara lokal tanpa reload (agar responsif)
        // Kita asumsikan backend mengembalikan nama file baru
        if (response.data.photo) {
             // Update path gambar di local state/computed jika memungkinkan, 
             // atau reload halaman untuk gampangnya:
             window.location.reload();
        }

    } catch (error) {
        console.error("Gagal upload foto:", error);
        alert('Gagal mengupload foto. Silakan coba lagi.');
    } finally {
        isLoading.value = false;
        isPhotoDropdownOpen.value = false; // Tutup dropdown
    }
}

function handleSignOut() {
    // Hapus semua token dan ID sesi dari localStorage untuk logout yang bersih
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Memberi tahu komponen induk (App.vue) untuk reset state (tetap dipertahankan)
    emit('update-login-status', false); 
    
    // Melakukan hard redirect ke halaman login.
    // Ini setara dengan logout + refresh, memastikan semua komponen di-reset
    // dan membaca localStorage yang sekarang kosong.
    window.location.href = '/login'; 
}
</script>

<style scoped>
/* Custom Scrollbar Styling */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}
</style>