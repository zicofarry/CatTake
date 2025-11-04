<template>
    <main class="community-layout-wrapper">
        <div class="container community-container">
            
            <!-- KONTEN UTAMA (FEED) -->
            <div class="main-content">
                <h1>Komunitas</h1>
                <p class="subtitle">Tempat berbagi cerita dan menolong kucing bersama</p>

                <div class="feed">
                    <!-- Iterasi menggunakan komponen PostCard -->
                    <PostCard v-for="post in posts" :key="post.id" :post="post" />
                </div>
            </div>

            <!-- SIDEBAR -->
            <aside class="sidebar">
                
                <div class="search-bar">
                    <input type="text" placeholder="Cari di komuni..." v-model="searchQuery">
                </div>

                <!-- Widget: Event Mendatang -->
                <section class="widget">
                    <h3>Event Mendatang</h3>
                    <div v-for="(event, index) in events" :key="index" class="event-item">
                        <!-- Menggunakan ikon Font Awesome sebagai pengganti gambar statis -->
                        <i :class="event.icon"></i>
                        <div>
                            <strong>{{ event.title }}</strong>
                            <span>{{ event.detail }}</span>
                        </div>
                    </div>
                </section>

                <!-- Widget: Sobat Paws Teraktif -->
                <section class="widget">
                    <h3>Sobat Paws Teraktif</h3>
                    <div v-for="(member, index) in activeMembers" :key="index" class="active-member">
                        <img :src="member.profilePic" :alt="member.name">
                        <span>{{ member.name }}</span>
                    </div>
                </section>
                
                <!-- Widget: Postingan Populer -->
                <section class="widget">
                    <h3>Postingan Populer</h3>
                    <div v-for="(popular, index) in popularPosts" :key="index" class="popular-post">
                        <img :src="popular.image" :alt="popular.title">
                        <span>{{ popular.title }}</span>
                    </div>
                </section>

                <!-- Widget: Fakta Kucing -->
                <section class="widget">
                    <h3>Fakta Kucing</h3>
                    <div class="cat-fact">
                        <img :src="catFact.image" alt="Kucing tidur">
                        <p>{{ catFact.fact }}</p>
                    </div>
                    <a href="#" class="more-facts">Fakta Lainnya</a>
                </section>

            </aside>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue';
import PostCard from '../components/PostCard.vue';
// Font Awesome sudah diasumsikan dimuat secara global di index.html
// import { fas } from '@fortawesome/free-solid-svg-icons'; 

// Data Kucing (Mock Data)
const posts = ref([
    { 
        id: 1, 
        group: 'CatCare Hub', 
        author: 'Repa', 
        time: '2j', 
        title: 'Kenapa Sterilisasi itu Penting?', 
        contentSnippet: 'Halo semua, aku mau share pengalaman tentang sterilisasi kucing...', 
        profilePic: '/assets/img/profile repa.png',
        postImage: '/assets/img/postingan 1.png', 
        likes: 2158, 
        comments: 1009 
    },
    { 
        id: 2, 
        group: 'Pawfect Home', 
        author: 'Nana', 
        time: '18j', 
        title: '3 Anak Kucing Butuh Rumah Baru', 
        contentSnippet: 'Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan...', 
        profilePic: '/assets/img/profile nana.png',
        postImage: '/assets/img/postingan 2.png', 
        likes: 1112, 
        comments: 970 
    },
]);

const events = ref([
    { title: 'Sterilisasi Gratis', detail: '15 Oktober 2025', icon: 'fas fa-calendar-alt' },
    { title: 'Pukul 09:00 WIB', detail: 'Klinik CatCare', icon: 'fas fa-clock' },
    { title: 'Klinik CatCare', detail: 'Jl. Kucing Bahagia No. 12', icon: 'fas fa-map-marker-alt' },
]);

const activeMembers = ref([
    { name: 'Anas', profilePic: '/assets/img/profile anas.png' },
    { name: 'Azmi', profilePic: '/assets/img/profile azmi.png' },
]);

const popularPosts = ref([
    { title: 'Tips membuat raw food untuk kucing', image: '/assets/img/postingan populer 1.png' },
    { title: 'Oyen sembuh setelah di sterili...', image: '/assets/img/postingan populer 2.png' },
]);

const catFact = ref({
    fact: 'Kucing tidur 12-16 jam sehari',
    image: '/assets/img/kucingtidur.png' 
});

const searchQuery = ref('');

// Tambahkan logika computed untuk filtering posts berdasarkan searchQuery jika diperlukan
// const filteredPosts = computed(() => { ... });
</script>

<style scoped>
/* ===== PENGATURAN DASAR (Dipindahkan dari community.css) ===== */
:root {
    --bg-dark: #1A3A34;
    --bg-widget: #2D4A45;
    --bg-light: #FFFFFF;
    --text-light: #FFFFFF;
    --text-dark: #333333;
    --text-secondary: #B0B0B0;
    --accent: #78C89F; 
}

.community-layout-wrapper {
    background-color: var(--bg-dark);
    color: var(--text-light);
    min-height: 100vh;
    padding-top: 20px; /* Tambahan padding agar tidak menempel header */
}

/* ===== LAYOUT KONTEN UTAMA ===== */
.community-container {
    display: flex;
    padding: 20px 40px;
    gap: 30px;
}

.main-content {
    flex: 2; 
}

.sidebar {
    flex: 1; 
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* ===== FEED UTAMA (KIRI) ===== */
.main-content h1 {
    font-size: 36px;
    font-weight: 700;
}

.main-content .subtitle {
    color: var(--text-secondary);
    margin-bottom: 20px;
}

.feed {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* ===== SIDEBAR (KANAN) ===== */
.search-bar {
    background-color: var(--bg-light);
    border-radius: 25px;
    padding: 10px 15px;
}

.search-bar input {
    border: none;
    outline: none;
    width: 100%;
    background-color: transparent;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    color: var(--text-dark);
}
.search-bar input::placeholder {
    color: #aaa;
}


.widget {
    background-color: var(--bg-widget);
    border-radius: 16px;
    padding: 20px;
}

.widget h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
}

/* Widget: Event */
.event-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
}

.event-item i {
    width: 30px; 
    font-size: 1.2rem;
    color: var(--accent);
    text-align: center;
}

.event-item strong {
    display: block;
    font-size: 15px;
}

.event-item span {
    font-size: 13px;
    color: var(--text-secondary);
}

/* Widget: Sobat Paws */
.active-member {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

.active-member img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

/* Widget: Postingan Populer */
.popular-post {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
}

.popular-post img {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
}

/* Widget: Fakta Kucing */
.cat-fact {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cat-fact img {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
}

.more-facts {
    display: block;
    text-align: right;
    margin-top: 15px;
    color: var(--accent);
    font-weight: 600;
    font-size: 14px;
}


/* Media Query Mobile */
@media (max-width: 768px) {
    .community-container {
        flex-direction: column;
        padding: 20px 15px;
    }
    .sidebar {
        order: -1; /* Pindah sidebar ke atas di mobile */
    }
}
</style>
