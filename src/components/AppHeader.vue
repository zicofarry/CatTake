<template>
  <header>
    <div class="container">
      <div class="logo">
        <router-link to="/">
            <img src="/assets/img/cattake.png" alt="CatTake Logo" class="logo-desktop-img">
        </router-link>
      </div>

      <nav class="desktop-nav">
        <ul>
          <li><router-link to="/" :class="{ active: activePage === 'Beranda' }">Beranda</router-link></li>
          <li><router-link to="/lapor" :class="{ active: activePage === 'Lapor' }">Lapor</router-link></li>
          <li><router-link to="/adopsi" :class="{ active: activePage === 'Adopsi' }">Adopsi</router-link></li>
          <li><router-link to="/faq" :class="{ active: activePage === 'FAQ' }">FAQ</router-link></li>
          <li><router-link to="/komunitas" :class="{ active: activePage === 'Komunitas' }">Komunitas</router-link></li>
          <li><router-link to="/donasi" :class="{ active: activePage === 'Donasi' }">Donasi</router-link></li>
        </ul>
      </nav>
      
      <div class="menu-toggle">
          <div class="hamburger-icon" @click="toggleMobileMenu">
              <span></span>
              <span></span>
              <span></span>
          </div>
          <span class="beranda-mobile">{{ activePage }}</span>
      </div>

      <div v-if="isLoggedIn" class="user-profile">
          <img src="/assets/img/diana.png" alt="Avatar Diana">
          <span>Diana</span>
      </div>
      <router-link v-else to="/login" class="btn btn-secondary">Signup/Login</router-link>

    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router'; // Digunakan untuk mengetahui rute saat ini

// 1. STATE (Data Reaktif)
const route = useRoute();
const isMobileMenuOpen = ref(false);
const isLoggedIn = ref(true); // Ganti ke false saat login belum diimplementasikan

// 2. COMPUTED PROPERTY (Menentukan halaman aktif)
const activePage = computed(() => {
  // Logic untuk menentukan nama halaman aktif berdasarkan rute
  switch (route.path) {
    case '/': return 'Beranda';
    case '/lapor': return 'Lapor';
    case '/adopsi': return 'Adopsi';
    case '/faq': return 'FAQ';
    case '/donasi': return 'Donasi';
    case '/komunitas': return 'Komunitas';
    default: return 'CatTake';
  }
});

// 3. METHODS (Fungsi)
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  // TODO: Tambahkan logika untuk menampilkan/menyembunyikan sidebar mobile
}
</script>

<style scoped>
/* ==================
   Header & Navigation (Dipindahkan dari style.css & faq.css)
   ================== */
header {
    padding: 1rem 0;
    /* Tambahkan background spesifik jika diperlukan, atau biarkan transparan */
    background: var(--white); 
}

header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 1.5rem;
}

/* Sembunyikan logo teks dan tampilkan gambar di desktop */
@media (min-width: 768px) {
    .logo-desktop-img {
        height: 70px; /* Dari style.css */
    }
}


/* --- Navigasi Mobile --- */
.menu-toggle {
    display: flex;
    align-items: center;
    gap: 1rem;
    /* Tampilkan di mobile */
}

.beranda-mobile {
    font-weight: 600;
    font-size: 1.25rem;
}

.hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
}

.hamburger-icon span {
    display: block;
    width: 25px;
    height: 3px;
    background-color: var(--dark-text);
    border-radius: 3px;
}

/* --- User Profile (Dari faq.css) --- */
.user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background-color: var(--primary-green);
    color: var(--white);
    padding: 0.4rem 0.5rem 0.4rem 0.5rem;
    border-radius: 50px;
    font-weight: 600;
}
.user-profile img {
    height: 35px;
    width: 35px;
    border-radius: 50%;
    object-fit: cover;
}

/* --- Navigasi Desktop --- */
.desktop-nav {
    display: none; /* Sembunyikan di mobile */
}

@media (min-width: 768px) {
    /* Tampilkan di Desktop */
    .menu-toggle {
        display: none; 
    }
    .desktop-nav {
        display: flex;
        background-color: var(--primary-green);
        border-radius: 25px; /* Digunakan dari style.css var */
        padding: 0.5rem;
    }
    .desktop-nav ul {
        display: flex;
        list-style: none;
        gap: 1.5rem;
        align-items: center;
        padding: 0 1rem;
    }
    .desktop-nav a {
        color: var(--white);
        text-decoration: none;
        font-weight: 400;
        font-size: 1rem;
        /* Tambahan untuk router link */
        padding: 0.25rem 0.5rem; 
        border-radius: 15px;
    }
    .desktop-nav a.active {
        color: var(--primary-yellow);
        font-weight: 600;
        /* Jika ingin ada highlight background */
        /* background-color: rgba(255, 255, 255, 0.2); */
    }
}

</style>
