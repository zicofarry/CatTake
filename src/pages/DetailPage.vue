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
                    <div class="w-48 h-48 rounded-full shadow-xl p-2 bg-white flex items-center justify-center">
                        <img src="../assets/img/diana.png" alt="Profile Diana" class="w-full h-full object-cover rounded-full">
                    </div>
                </div>

                <div class="flex flex-col gap-4 w-full md:flex-grow">
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800">
                        <span>{{ userData.name }}</span>
                        <i class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm"></i>
                    </div>

                    <div class="hidden md:flex gap-4">
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <span>{{ userData.birthDate }}</span>
                            <i class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm"></i>
                        </div>
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <span>{{ userData.gender }}</span>
                            <i class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm"></i>
                        </div>
                    </div>
                    
                    <div class="flex md:hidden gap-4">
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <span>{{ userData.gender }}</span>
                            <i class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm"></i>
                        </div>
                        <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800 flex-1">
                            <span>{{ userData.birthDate }}</span>
                            <i class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm"></i>
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-xl shadow-md flex justify-between items-center text-lg font-semibold text-gray-800">
                        <span>{{ userData.favoriteCat }}</span>
                        <i class="fas fa-pencil-alt text-gray-500 cursor-pointer text-sm"></i>
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
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter(); 
const emit = defineEmits(['update-login-status']);

// Mock Data
const userData = ref({
    name: 'Diana',
    birthDate: '29-01-2006',
    gender: 'Perempuan',
    favoriteCat: 'Kucing favorit aku siberian.'
});

const quests = ref([
    { name: 'Warga Forum', points: 2, progress: 2, target: 5 },
    { name: '1 Tahun Bersama', points: 15, progress: 1, target: 1 }, // Anggap sudah selesai 1/1
    { name: 'Donasi 1 juta', points: 15, progress: 500000, target: 1000000 },
    { name: 'Donatur Sejati', points: 25, progress: 0, target: 1 }, // Tambahan untuk desktop
]);

const achievements = ref([
    { name: 'Donasi 100 ribu', points: 5 },
]);


function handleSignOut() {
    emit('update-login-status', false); // Emit ke App.vue
    router.push('/login');
    alert('Anda telah keluar.');
}
</script>

<style scoped>
/* Hapus semua CSS lama */
/* Latar belakang menggunakan style inline dan utility class Tailwind */
</style>
