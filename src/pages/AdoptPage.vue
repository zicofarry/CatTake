<template>
  <div class="adopt-page-container">
    <main class="container">
      <section class="hero-adopt">
        <div class="hero-content">
          <div class="hero-text">
            <h1>Selamat Datang di Rumah Kucing!</h1>
            <p>Telusuri ribuan kucing yang siap diadopsi dan berikan mereka rumah yang penuh kasih.</p>
          </div>
          <div class="hero-image-container">
            <img src="../assets/img/cathelo.png" alt="Kucing di tengah" class="cat-image">
            <div class="green-blob"></div>
          </div>
        </div>
      </section>

      <section class="filter-bar-wrapper">
        <div class="filter-bar">
          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'all' }"
            @click="setActiveFilter('all')"
          >
            Semua
          </button>

          <button 
            class="filter-btn" 
            :class="{ active: activeFilter === 'favorite' }"
            @click="setActiveFilter('favorite')"
          >
            Favorit ({{ favoriteCatsCount }})
          </button>

          <select 
            class="filter-select"
            :value="genderFilter"
            @change="setGenderFilter($event.target.value)"
          >
            <option value="all">Filter Gender</option>
            <option value="male">Jantan</option>
            <option value="female">Betina</option>
          </select>
        </div>
      </section>

      <section class="cat-list">
        <div v-if="filteredCats.length === 0" class="no-results">
            <p>Tidak ada kucing yang cocok dengan filter Anda.</p>
        </div>

        <CatCard 
          v-for="cat in filteredCats" 
          :key="cat.id" 
          :cat="cat"
          @toggle-favorite="handleToggleFavorite"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CatCard from '../components/CatCard.vue';
// Asumsi AppHeader sudah diimpor dan digunakan di App.vue atau layout

// 1. MOCK DATA (Data Kucing - Menggantikan data statis di HTML)
const catData = ref([
  { id: 1, name: 'Oyen', shelter: 'CatHouse', gender: 'male', age: '1 Tahun', image: 'kucing-1.jpg', isFavorite: false },
  { id: 2, name: 'Bulu', shelter: 'PawCare', gender: 'female', age: '5 Bulan', image: 'kucing-2.jpg', isFavorite: true },
  { id: 3, name: 'Tobby', shelter: 'Meow Haven', gender: 'male', age: '2 Tahun', image: 'kucing-3.jpg', isFavorite: false },
  { id: 4, name: 'Milo', shelter: 'CatHouse', gender: 'male', age: '8 Bulan', image: 'kucing-4.jpg', isFavorite: false },
  { id: 5, name: 'Kitty', shelter: 'PawCare', gender: 'female', age: '3 Tahun', image: 'kucing-5.jpg', isFavorite: false },
]);

// 2. STATE REAKTIF (Untuk Filter)
// activeFilter: 'all', 'favorite', atau 'gender'
const activeFilter = ref('all'); 
// genderFilter: 'all', 'male', atau 'female'
const genderFilter = ref('all');

// 3. METHODS (Fungsi untuk mengubah state)
function setActiveFilter(filter) {
  activeFilter.value = filter;
  // Jika memilih 'all' atau 'favorite', reset dropdown gender
  genderFilter.value = 'all'; 
}

function setGenderFilter(gender) {
    if (gender !== 'all') {
        // Jika gender dipilih, aktifkan filter 'gender' dan nonaktifkan 'all'/'favorite'
        activeFilter.value = 'gender';
        genderFilter.value = gender;
    } else {
        // Jika memilih 'Filter Gender' (all) di dropdown, kembali ke filter 'all'
        setActiveFilter('all');
    }
}

// Fungsi yang dipanggil dari CatCard untuk mengubah status favorit
function handleToggleFavorite(catId) {
  const cat = catData.value.find(c => c.id === catId);
  if (cat) {
    cat.isFavorite = !cat.isFavorite;
  }
}

// 4. COMPUTED PROPERTIES (Logika Filter)
// Menghitung jumlah kucing favorit (untuk tampilan tombol)
const favoriteCatsCount = computed(() => {
  return catData.value.filter(cat => cat.isFavorite).length;
});

// Logika utama filtering yang berjalan setiap kali state berubah
const filteredCats = computed(() => {
  let list = catData.value;

  if (activeFilter.value === 'favorite') {
    // Filter 1: Hanya tampilkan favorit
    list = list.filter(cat => cat.isFavorite);

  } else if (activeFilter.value === 'gender' && genderFilter.value !== 'all') {
    // Filter 2: Hanya tampilkan berdasarkan gender yang dipilih
    list = list.filter(cat => cat.gender === genderFilter.value);
  }

  // Jika activeFilter.value === 'all', list tidak difilter
  return list;
});
</script>

<style scoped>
/* ==================
   Gaya Halaman Adopt (Dipindahkan dari adopt.css)
   ================== */
:root {
    --primary-green: #2D5B4D;
    --light-green: #8FA998;
    --primary-yellow: #E0C048;
    --dark-text: #2c2c2c;
    --body-text: #555;
    --white: #ffffff;
}

.container {
    padding-bottom: 50px; /* Tambahan ruang bawah */
}

/* --- Hero Section --- */
.hero-adopt {
    padding: 40px 0;
    overflow: hidden;
}

.hero-content {
    display: flex;
    flex-direction: column; /* Mobile first: kolom */
    text-align: center;
    align-items: center;
    justify-content: center;
    gap: 30px;
}

.hero-text h1 {
    font-size: 36px;
    font-weight: 700;
    color: var(--primary-green);
    margin-bottom: 10px;
}

.hero-image-container {
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.green-blob {
    position: absolute;
    width: 320px;
    height: 320px;
    background-color: var(--light-green);
    border-radius: 50%;
    z-index: 1;
}

.cat-image {
    position: relative;
    width: 280px;
    height: 280px;
    object-fit: cover;
    border-radius: 50%;
    z-index: 2;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* --- Filter Bar --- */
.filter-bar-wrapper {
    margin: 40px auto;
    padding: 0 15px; /* Sesuaikan dengan padding container */
}

.filter-bar {
    display: flex;
    flex-direction: column; /* Mobile first: kolom */
    gap: 15px;
    background-color: var(--light-gray-bg, #f8f9fa);
    padding: 15px;
    border-radius: 20px;
    max-width: 600px;
    margin: 0 auto;
}

.filter-btn {
    padding: 10px 15px;
    border: 2px solid var(--primary-green);
    background-color: var(--white);
    color: var(--primary-green);
    font-weight: 600;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
}

.filter-btn.active {
    background-color: var(--primary-green);
    color: var(--white);
}

.filter-select {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 15px;
    background-color: var(--white);
    font-size: 1rem;
    cursor: pointer;
}

/* --- Cat List Grid --- */
.cat-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    padding: 0 15px;
}

.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 50px;
    font-size: 1.2rem;
    color: var(--body-text);
}


/* --- Desktop Styles --- */
@media (min-width: 768px) {
    .hero-content {
        flex-direction: row; /* Desktop: baris */
        text-align: left;
    }
    .hero-text {
        flex: 1;
    }
    .hero-image-container {
        flex: 1;
    }

    .filter-bar {
        flex-direction: row;
        justify-content: center;
        max-width: none;
        width: 100%;
    }
    .filter-btn, .filter-select {
        width: auto;
        flex-grow: 1;
    }

    .cat-list {
        padding: 0;
    }
}
</style>
