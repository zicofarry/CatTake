<template>
    <main class="bg-[#1A3A34] text-white min-h-screen py-8 font-sans">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div class="flex flex-col gap-8 md:flex-row md:gap-8">
                
                <div class="main-content flex-auto md:w-2/3">
                    <h1 class="text-4xl font-bold">Komunitas</h1>
                    <p class="text-gray-400 mb-5">Tempat berbagi cerita dan menolong kucing bersama</p>

                    <div class="search-bar-mobile md:hidden mb-5">
                        <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2">
                            <img src="../assets/img/Search.png" alt="Search" class="w-5 h-5 opacity-60 ml-2" />
                            <input type="text" placeholder="Cari di komunitas" v-model="searchQuery"
                                class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400">
                        </div>
                    </div>
                    
                    <div class="flex flex-col gap-5">
                        <PostCard v-for="post in posts" :key="post.id" :postData="post" />
                    </div>
                </div>

                <aside class="flex flex-col gap-6 md:w-1/3">
                    
                    <div class="search-bar-desktop hidden md:flex">
                         <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2 w-full">
                            <img src="../assets/img/Search.png" alt="Search" class="w-5 h-5 opacity-60 ml-2" />
                            <input type="text" placeholder="Cari di komunitas" v-model="searchQuery"
                                class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400">
                        </div>
                    </div>

                    <section class="bg-[#2D4A45] rounded-xl p-5 shadow-lg">
                        <h3 class="text-lg font-semibold mb-4">Event Mendatang</h3>
                        <div class="flex items-center gap-3 mb-4">
                            <img src="../assets/img/calendar.png" alt="Kalender" class="w-8 h-8 object-contain" />
                            <div>
                                <strong class="block text-base">Sterilisasi Gratis</strong>
                                <span class="text-sm text-gray-400">15 Oktober 2025</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 mb-4">
                            <img src="../assets/img/time.png" alt="Waktu" class="w-8 h-8 object-contain" />
                            <div>
                                <strong class="block text-base">Pukul 09:00 WIB</strong>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 mb-4">
                            <img src="../assets/img/location.png" alt="Lokasi" class="w-8 h-8 object-contain" />
                            <div>
                                <strong class="block text-base">Klinik CatCare</strong>
                            </div>
                        </div>
                    </section>

                    <section class="bg-[#2D4A45] rounded-xl p-5 shadow-lg">
                        <h3 class="text-lg font-semibold mb-4">Sobat Paws Teraktif</h3>
                        <div v-for="member in activeMembers" :key="member.name" class="flex items-center gap-3 mb-2">
                            <img :src="member.profilePic" :alt="member.name" class="w-10 h-10 rounded-full object-cover">
                            <span>{{ member.name }}</span>
                        </div>
                    </section>
                    
                    <section class="bg-[#2D4A45] rounded-xl p-5 shadow-lg">
                        <h3 class="text-lg font-semibold mb-4">Postingan Populer</h3>
                        <div v-for="popular in popularPosts" :key="popular.title" class="flex items-center gap-3 mb-4">
                            <img :src="popular.image" :alt="popular.title" class="w-12 h-12 rounded-lg object-cover">
                            <span>{{ popular.title }}</span>
                        </div>
                    </section>

                    <section class="bg-[#2D4A45] rounded-xl p-5 shadow-lg">
                        <h3 class="text-lg font-semibold mb-4">Fakta Kucing</h3>
                        <div class="flex items-center gap-3">
                            <img :src="catFact.image" alt="Fakta Kucing" class="w-12 h-12 rounded-lg object-cover">
                            <p class="text-sm">{{ catFact.fact }}</p>
                        </div>
                        <router-link 
                          to="/fakta" 
                          class="block text-right mt-4 text-[#78C89F] font-semibold text-sm hover:underline">
                          Fakta Lainnya
                        </router-link>
                    </section>

                </aside>
            </div>
        </div>
    </main>
</template>

<script setup>
// INI ADALAH BLOK SCRIPT YANG BENAR (HANYA SATU)
import { ref } from 'vue';
import PostCard from '../components/PostCard.vue';
// Impor data dari file terpisah
import { allPosts } from '../data/posts.js'; 

// Gunakan data yang diimpor
const posts = allPosts;

// Data sidebar (ini bisa kamu hardcode di sini)
const activeMembers = ref([
    { name: 'Anas', profilePic: '/img/profileAnas.png' },
    { name: 'Azmi', profilePic: '/img/profileAzmi.png' },
]);

const popularPosts = ref([
    { title: 'Tips membuat raw food untuk kucing', image: '/img/postinganPopuler1.png' },
    { title: 'Oyen sembuh setelah di sterilisasi', image: '/img/postinganPopuler2.png' },
]);

const catFact = ref({
    fact: 'Kucing tidur 12-16 jam sehari',
    image: '/img/logoFaktaKucing.png'
});

// Data untuk kedua search bar
const searchQuery = ref('');
</script>

<style scoped>
/* Biarkan kosong, kita pakai Tailwind */
</style>