<template>
    <main>
        <div class="hero-container">
            <div class="hero-text">
                <h1>Rescue. Snap. Save.</h1>
                <p>Bersama kita bisa menyelamatkan lebih banyak kucing dan memberikan mereka kehidupan yang lebih baik.</p>
                <router-link to="/lapor" class="btn btn-primary">Buat Laporan</router-link>
            </div>
            
            <div class="hero-image">
                <div class="image-stack">
                    <img src="/assets/img/Ellipse.png" alt="Latar belakang elips hijau" class="ellipse-bg">
                    <img src="/assets/img/kucingtidur.png" alt="Seekor kucing oranye berbaring" class="cat-image">
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
// Tidak ada logika JS spesifik yang perlu dimigrasi dari index.html
</script>

<style scoped>
/* Pindahkan CSS dari style.css yang spesifik untuk Hero Section */

.hero-container {
    /* Disesuaikan dari style.css */
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;

    /* Mobile First */
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 0;
}

.hero-image {
    order: 1; /* Pindah gambar ke atas (Mobile) */
    width: 100%;
    max-width: 500px;
    margin-bottom: 2rem;
}

.hero-text {
    order: 2; /* Pindah teks ke bawah (Mobile) */
}

.hero-text h1 {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
}

.hero-text p {
    font-size: 1.1rem;
    color: var(--body-text);
    margin-bottom: 2rem;
    max-width: 500px;
}

/* --- Image Stack Styles (Dari style.css) --- */
.image-stack {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1; 
}

.image-stack img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: contain;
}

.ellipse-bg { z-index: 1; }
.cat-image { z-index: 2; }


/* --- Desktop Styles --- */
@media (min-width: 768px) {
    .hero-container {
        flex-direction: row; /* Desktop: baris */
        text-align: left;
        align-items: center;
        min-height: 70vh;
        gap: 2rem;
    }

    .hero-image {
        order: 2; /* Pindah gambar ke kanan */
        flex: 1;
    }

    .hero-text {
        order: 1; /* Pindah teks ke kiri */
        flex: 1;
    }
}
</style>
