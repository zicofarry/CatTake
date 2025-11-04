<template>
  <router-link :to="`/adopsi/${cat.id}`" class="cat-card-link">
    <div class="cat-card">
      <div class="card-image">
        <img :src="`/assets/img/cats/${cat.image}`" :alt="cat.name">
        <button 
          @click.prevent="toggleFavorite" 
          class="favorite-btn"
          :class="{ 'is-favorite': cat.isFavorite }"
          aria-label="Toggle Favorite"
        >
          <i :class="['fas', cat.isFavorite ? 'fa-heart' : 'fa-heart-open']"></i>
        </button>
      </div>
      <div class="card-info">
        <h3>{{ cat.name }}</h3>
        <p class="shelter-name">Shelter: {{ cat.shelter }}</p>
        <div class="details">
          <span class="detail-item">
            <i class="fas fa-venus-mars"></i> {{ cat.gender === 'male' ? 'Jantan' : 'Betina' }}
          </span>
          <span class="detail-item">
            <i class="fas fa-birthday-cake"></i> {{ cat.age }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// Definisikan Props yang diterima dari AdoptPage.vue
const props = defineProps({
  cat: {
    type: Object,
    required: true
  }
});

// Definisikan Event yang akan dikirim ke AdoptPage.vue
const emit = defineEmits(['toggle-favorite']);

// Fungsi untuk mengirim event saat tombol favorit diklik
function toggleFavorite() {
  // Mengirim ID kucing ke komponen induk untuk mengubah status favorit di data utama
  emit('toggle-favorite', props.cat.id);
}
</script>

<style scoped>
/* Pindahkan CSS dari adopt.css yang spesifik untuk Card Kucing (.cat-card) */

.cat-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    transition: transform 0.3s ease;
}

.cat-card-link:hover {
    transform: translateY(-5px);
}

.cat-card {
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    /* Lebar card akan diatur oleh grid di AdoptPage.vue */
}

.card-image {
    position: relative;
    height: 200px;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.favorite-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: rgba(255, 255, 255, 0.85);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.favorite-btn i {
    font-size: 1.1rem;
    color: #999;
}

/* Menggantikan logika .is-favorite pada tombol */
.favorite-btn.is-favorite i {
    color: #FF6B6B; /* Warna merah untuk favorit */
}
.favorite-btn.is-favorite {
    background-color: #ffe0e0;
}

.card-info {
    padding: 15px;
}

.card-info h3 {
    margin-top: 0;
    font-size: 1.5rem;
    color: var(--dark-text);
}

.shelter-name {
    color: var(--body-text);
    font-size: 0.9rem;
    margin-bottom: 10px;
}

.details {
    display: flex;
    gap: 15px;
    font-size: 0.9rem;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--primary-green);
    font-weight: 600;
}
</style>
