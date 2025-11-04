<template>
    <article class="post-card">
        <div class="post-header">
            <!-- Path gambar profile diambil dari prop -->
            <img :src="post.profilePic" :alt="'Profile ' + post.author" class="post-profile-pic">
            <div>
                <strong>{{ post.group }}</strong>
                <span>{{ post.author }} · {{ post.time }}</span>
            </div>
            <!-- Menggunakan ikon Font Awesome untuk menu titik tiga -->
            <i class="fas fa-ellipsis-v post-menu-icon" @click.stop="toggleMenu"></i>
        </div>
        <div class="post-body">
            <strong>{{ post.title }}</strong>
            <p>{{ post.contentSnippet }}</p>
            <a href="#">Lihat selengkapnya</a>
            <!-- Path gambar postingan diambil dari prop -->
            <img :src="post.postImage" :alt="post.title" class="post-image">
        </div>
        <div class="post-footer">
            <div class="footer-icon" @click="toggleLike">
                <!-- Menggunakan Font Awesome untuk Like/Unlike -->
                <i :class="['fas', 'fa-heart', { 'liked': isLiked }]" :style="{ color: isLiked ? '#E74C3C' : '#555' }"></i>
                <span>{{ formattedLikes }}</span>
            </div>
            <div class="footer-icon">
                <i class="far fa-comment-alt"></i>
                <span>{{ post.comments }}</span>
            </div>
        </div>
    </article>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue';

const props = defineProps({
    post: {
        type: Object,
        required: true,
        default: () => ({ 
            id: 0, 
            group: 'Anonim', 
            author: 'Guest', 
            time: '0j', 
            title: 'No Title', 
            contentSnippet: 'No Content', 
            postImage: '', 
            profilePic: '',
            likes: 0, 
            comments: 0 
        })
    }
});

// State reaktif untuk toggle like
const isLiked = ref(false);
const currentLikes = ref(props.post.likes);

// Computed property untuk memformat angka (misal: 2158 -> 2.158)
const formattedLikes = computed(() => {
    return currentLikes.value.toLocaleString('id-ID');
});

function toggleLike() {
    isLiked.value = !isLiked.value;
    // Tambahkan atau kurangi jumlah like
    if (isLiked.value) {
        currentLikes.value++;
    } else {
        currentLikes.value--;
    }
}

function toggleMenu() {
    alert(`Menu untuk postingan: ${props.post.title}`);
    // Logika menampilkan pop-up menu
}
</script>

<style scoped>
/* CSS dari community.css yang spesifik untuk post-card */
.post-card {
    background-color: var(--bg-light);
    color: var(--text-dark);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.post-header {
    display: flex;
    align-items: center;
    gap: 12px;
}
.post-profile-pic {
    width: 45px;
    height: 45px;
    border-radius: 50%;
}
.post-header div { flex-grow: 1; }
.post-header strong { display: block; font-size: 16px; }
.post-header span { font-size: 14px; color: #888; }

.post-menu-icon {
    font-size: 1.2rem;
    color: #888;
    cursor: pointer;
    padding: 5px; /* Tambahan padding untuk target klik yang lebih besar */
}

.post-body { margin-top: 15px; }
.post-body strong { font-size: 20px; font-weight: 600; }
.post-body p { margin-top: 5px; }
.post-body a { color: var(--accent); font-weight: 600; display: block; margin-top: 5px; }
.post-image {
    width: 100%;
    border-radius: 12px;
    margin-top: 15px;
    object-fit: cover;
}

.post-footer {
    display: flex;
    gap: 20px;
    margin-top: 15px;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
}
.footer-icon {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #555;
    cursor: pointer;
    transition: color 0.2s;
}
/* Style untuk ikon Like */
.footer-icon i.fa-heart {
    color: #ddd; /* Warna default */
    transition: color 0.2s;
}
.footer-icon i.fa-heart.liked {
    color: #E74C3C !important; /* Warna merah saat di-like */
}

/* Mengganti ikon gambar dengan Font Awesome */
.footer-icon i.fa-comment-alt {
    font-size: 1.2rem;
}
</style>
