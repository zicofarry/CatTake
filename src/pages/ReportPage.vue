<template>
  <div class="report-page-container">
    <!-- <header class="mobile-header">
        <button class="menu-btn"><i class="fas fa-bars"></i></button>
        <span class="page-title">Lapor</span>
        <div class="user-profile">
            <img src="/assets/img/diana.png" alt="Avatar Diana"> 
            <span>Diana</span>
        </div>
    </header> -->

    <main>
      <!-- <section class="hero"> -->
        <div class="hero-content">
          <h1>Lapor Kucing!</h1>
          <!-- <img src="/assets/img/tigakucing.png" alt="Tiga anak kucing" class="hero-cats"> -->
        </div>
      <!-- </section> -->

      <ReportTypeButtons v-model="reportType" />

      <section class="form-container">
        <form id="report-form" @submit.prevent="submitReport">
          
          <div class="form-group owner-name-group" v-if="reportType === 'lost'">
            <label for="owner-name">Nama Pemilik</label>
            <input type="text" id="owner-name" name="owner-name" placeholder="Masukkan nama Anda">
          </div>
          
          <div class="form-group">
            <label for="location">Lokasi</label>
            <div class="location-input">
              <div class="map-icon"><i class="fas fa-map-marker-alt"></i></div>
              <input type="text" id="location" name="location" placeholder="Masukkan lokasi atau alamat">
            </div>
          </div>

          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" name="description" rows="4" placeholder="Ciri-ciri kucing, kondisi, dll."></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Foto</label>
            <div class="file-drop-area">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Drag & Drop file di sini</p>
              <span>atau</span>
              <label for="file-input" class="browse-btn">Pilih File</label>
              <input type="file" id="file-input" hidden multiple>
            </div>
          </div>

          <button type="submit" class="submit-btn">Selesai</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ReportTypeButtons from '../components/ReportTypeButtons.vue';
// Kita asumsikan ikon Font Awesome sudah diimpor secara global

// State Reaktif: Menggantikan logika JavaScript di script.js
// Default: 'stray' (Kucing Liar), yang menyembunyikan field Nama Pemilik
const reportType = ref('stray'); 

function submitReport() {
  alert(`Laporan ${reportType.value === 'stray' ? 'Kucing Liar' : 'Kucing Hilang'} berhasil diajukan!`);
  // Logika submit data ke backend akan ditaruh di sini
}
</script>

<style scoped>
/* Pindahkan semua CSS dari report.css yang belum masuk ke ReportTypeButtons.vue */

/* Variabel dari report.css */
:root {
    --primary-green: #8FA998;
    --primary-yellow: #EAC435;
    --dark-green: #4A6C55;
    --background-grey: #F5F5F5;
    --card-white: #FFFFFF;
    --text-dark: #333333;
    --input-grey: #EFEFEF;
    --border-color: #DDDDDD;
}

/* --- Mobile Header (Sementara) --- */
.mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--primary-green);
    color: var(--text-dark);
}
.mobile-header .menu-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.mobile-header .page-title { font-weight: 600; font-size: 1.2rem; }
.user-profile {
    display: flex; align-items: center; background-color: var(--dark-green);
    color: white; padding: 0.25rem 1rem 0.25rem 0.25rem; border-radius: 20px; font-size: 0.9rem;
}
.user-profile img { width: 30px; height: 30px; border-radius: 50%; margin-right: 0.5rem; }

/* --- Hero Section --- */
.hero {
    background-color: var(--primary-green);
    text-align: center;
    padding: 2rem 1rem 4rem;
    position: relative;
    z-index: 1; /* Penting agar tidak tertutup konten lain */
}
.hero h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #2F4858;
}
.hero-cats {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: 300px;
    z-index: 2; /* Agar di atas hero */
}

/* --- Form Styling --- */
.form-container {
    padding: 1rem;
}

#report-form {
    background-color: var(--card-white);
    padding: 2rem;
    border-radius: 25px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    max-width: 600px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

input[type="text"],
textarea {
    width: 100%;
    padding: 1rem;
    border: none;
    background-color: var(--input-grey);
    border-radius: 15px;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
}

.location-input {
    display: flex;
    align-items: center;
    background-color: var(--input-grey);
    border-radius: 15px;
}
.location-input .map-icon {
    padding: 1rem;
    background-color: #E0E0E0;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
}
.location-input input {
    border-radius: 0 15px 15px 0;
}

.file-drop-area {
    border: 2px dashed var(--border-color);
    border-radius: 15px;
    padding: 2rem;
    text-align: center;
    background-color: var(--input-grey);
}
.file-drop-area i { font-size: 2.5rem; color: #AAAAAA; }
.file-drop-area p { margin: 0.5rem 0; font-weight: 600; }
.file-drop-area span { color: #888888; margin-bottom: 1rem; display: block; }
.browse-btn {
    border: 1px solid var(--dark-green); color: var(--dark-green); padding: 0.5rem 1rem;
    border-radius: 8px; cursor: pointer; display: inline-block;
}

.submit-btn {
    width: 100%; padding: 1rem; font-size: 1.2rem; font-weight: 700;
    background-color: var(--primary-yellow); color: var(--text-dark);
    border: none; border-radius: 15px; cursor: pointer; margin-top: 1rem;
    box-shadow: 0 4px 10px rgba(234, 196, 53, 0.4);
}

/* --- Desktop Styles --- */
@media (min-width: 768px) {
    .mobile-header { display: none; }
    .hero h1 { font-size: 4rem; }
    .hero-cats { width: 100%; max-width: 450px; bottom: -50px; }
    .form-container { padding: 2rem; }
}
</style>
