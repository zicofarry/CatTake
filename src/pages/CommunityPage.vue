<template>
    <main class="bg-gray-800 text-white min-h-screen py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 md:flex-row md:gap-8">
            
            <div class="main-content flex-auto md:w-2/3">
                <h1 class="text-4xl font-bold">Komunitas</h1>
                <p class="text-gray-400 mb-5">Tempat berbagi cerita dan menolong kucing bersama</p>

                <div class="flex flex-col gap-5">
                    <PostCard v-for="post in posts" :key="post.id" :post="post" />
                </div>
            </div>

            <aside class="flex flex-col gap-6 md:w-1/3 md:order-2 order-1">
                
                <div class="bg-white rounded-3xl p-3 shadow-md">
                    <input type="text" placeholder="Cari di komuni..." v-model="searchQuery"
                           class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400">
                </div>

                <section class="bg-gray-700 rounded-xl p-5 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4">Event Mendatang</h3>
                    <div v-for="(event, index) in events" :key="index" class="flex items-center gap-3 mb-4">
                        <i :class="[event.icon, 'w-8 text-xl text-green-400 text-center']"></i>
                        <div>
                            <strong class="block text-base">{{ event.title }}</strong>
                            <span class="text-sm text-gray-400">{{ event.detail }}</span>
                        </div>
                    </div>
                </section>

                <section class="bg-gray-700 rounded-xl p-5 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4">Sobat Paws Teraktif</h3>
                    <div v-for="(member, index) in activeMembers" :key="index" class="flex items-center gap-3 mb-2">
                        <img :src="member.profilePic" :alt="member.name" class="w-10 h-10 rounded-full object-cover">
                        <span>{{ member.name }}</span>
                    </div>
                </section>
                
                <section class="bg-gray-700 rounded-xl p-5 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4">Postingan Populer</h3>
                    <div v-for="(popular, index) in popularPosts" :key="index" class="flex items-center gap-3 mb-4">
                        <img :src="popular.image" :alt="popular.title" class="w-12 h-12 rounded-lg object-cover">
                        <span>{{ popular.title }}</span>
                    </div>
                </section>

                <section class="bg-gray-700 rounded-xl p-5 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4">Fakta Kucing</h3>
                    <div class="flex items-center gap-3">
                        <img :src="catFact.image" alt="Kucing tidur" class="w-12 h-12 rounded-lg object-cover">
                        <p class="text-sm">{{ catFact.fact }}</p>
                    </div>
                    <a href="#" class="block text-right mt-4 text-green-400 font-semibold text-sm hover:underline">Fakta Lainnya</a>
                </section>

            </aside>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue';
import PostCard from '../components/PostCard.vue';

// ... (Logika JS Anda tetap sama) ...
const posts = ref([
    { id: 1, group: 'CatCare Hub', author: 'Repa', time: '2j', title: 'Kenapa Sterilisasi itu Penting?', contentSnippet: 'Halo semua, aku mau share pengalaman tentang sterilisasi kucing...', profilePic: '../assets/img/profile repa.png', postImage: '../assets/img/postingan 1.png', likes: 2158, comments: 1009 },
    { id: 2, group: 'Pawfect Home', author: 'Nana', time: '18j', title: '3 Anak Kucing Butuh Rumah Baru', contentSnippet: 'Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan...', profilePic: '../assets/img/profile nana.png', postImage: '../assets/img/postingan 2.png', likes: 1112, comments: 970 },
]);

const events = ref([
    { title: 'Sterilisasi Gratis', detail: '15 Oktober 2025', icon: 'fas fa-calendar-alt' },
    { title: 'Pukul 09:00 WIB', detail: 'Klinik CatCare', icon: 'fas fa-clock' },
    { title: 'Klinik CatCare', detail: 'Jl. Kucing Bahagia No. 12', icon: 'fas fa-map-marker-alt' },
]);

const activeMembers = ref([
    { name: 'Anas', profilePic: '../assets/img/profile anas.png' },
    { name: 'Azmi', profilePic: '../assets/img/profile azmi.png' },
]);

const popularPosts = ref([
    { title: 'Tips membuat raw food untuk kucing', image: '../assets/img/postingan populer 1.png' },
    { title: 'Oyen sembuh setelah di sterili...', image: '../assets/img/postingan populer 2.png' },
]);

const catFact = ref({
    fact: 'Kucing tidur 12-16 jam sehari',
    image: '../assets/img/kucingtidur.png' 
});

const searchQuery = ref('');
</script>

<style scoped>
/* CSS Lama Dihapus */
</style>