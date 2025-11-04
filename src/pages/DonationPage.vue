<template>
  <div class="wrap-page">
    <section class="hero-donasi">
      <div class="hero-donasi-inner wrap">
        <div class="hero-img">
          <img src="../assets/img/Ellipse.png" alt="Ilustrasi kucing donasi">
        </div>
        <div class="hero-text">
          <h1>Satu Donasi, Seribu Harapan.</h1>
          <p>Bersama mendukung langkah kecil mereka, dari jalanan penuh bahaya menuju tempat yang aman, sehat, dan dicintai.</p>
          <a class="btn-donasi" href="#formDonasi">Donasi Sekarang</a>
        </div>
      </div>
    </section>

    <section id="formDonasi" class="form-section">
      <div class="form-inner wrap">
        <h2>Form Donasi</h2>

        <form @submit.prevent="submitDonation">
          <div>
            <label for="shelter">Shelter Tujuan</label>
            <select id="shelter" v-model="form.shelter" required>
              <option value="" disabled>-- Pilih Shelter --</option>
              <option value="cathouse">CatHouse</option>
              <option value="pawcare">PawCare</option>
              <option value="meowhaven">Meow Haven</option>
            </select>
          </div>

          <div>
            <label for="metode">Metode Pembayaran</label>
            <select id="metode" v-model="form.method" required>
              <option value="" disabled>-- Pilih Metode --</option>
              <option value="qris">QRIS</option>
              <option value="bri">Transfer BRI - 123456789 a/n CatTake Shelter</option>
            </select>
          </div>

          <div>
            <label for="buktiTf">Upload Bukti Transfer</label>
            <input 
                id="buktiTf" 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                required 
            />
            <p v-if="fileName" class="file-status">File terpilih: {{ fileName }}</p>
          </div>

          <button class="submit-btn" type="submit">Selesai</button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({
    shelter: '',
    method: '',
    proof: null,
});

const fileName = ref('');

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        form.value.proof = file;
        fileName.value = file.name;
    } else {
        form.value.proof = null;
        fileName.value = '';
    }
}

function submitDonation() {
    if (form.value.shelter && form.value.method && form.value.proof) {
        alert(`Donasi ke ${form.value.shelter} melalui ${form.value.method} berhasil diajukan! Bukti transfer: ${form.value.proof.name}`);
        // Logika pengiriman data ke backend
    } else {
        alert('Mohon lengkapi semua field donasi.');
    }
}
</script>

<style scoped>
/* Pindahkan CSS dari donasi.css */

:root {
  --green: #578D76;
  --yellow: #E8C32A;
  --page-max-width: 1100px;
}

.wrap-page {
    /* Menggantikan fungsi .wrap di HTML lama, kita gunakan padding di sini */
    max-width: var(--page-max-width);
    margin: 0 auto;
    padding: 0 24px;
}

/* ===== HERO ===== */
.hero-donasi {
    padding: 80px 0 320px; 
}
.hero-donasi-inner {
    display: flex;
    gap: 48px;
    align-items: center;
    justify-content: space-between;
}
.hero-img { width: 44%; min-width: 320px; }
.hero-img img {
  width: 100%;
  border-radius: 12px;
  display: block;
}
.hero-text { width: 50%; }
.hero-text h1 {
  color: var(--green);
  font-size: 40px;
  margin: 0 0 18px 0;
  line-height: 1.05;
}
.hero-text p {
  margin: 0 0 26px 0;
  color: #333;
  line-height: 1.6;
}
.btn-donasi {
  display: inline-block;
  background: var(--yellow);
  color: #fff;
  padding: 12px 26px;
  border-radius: 28px;
  font-weight: 600;
  text-decoration: none;
  transition: background .18s ease;
}
.btn-donasi:hover { background: #cfac24; }

/* ===== FORM SECTION ===== */
.form-section {
  background: var(--green);
  color: #fff;
  padding: 140px 6% 160px;
  margin-top: -240px; /* Tarik ke atas menutupi bagian putih hero */
}

.form-inner {
  max-width: 920px;
  margin: 0 auto;
  background: #fff;
  color: #222;
  border-radius: 24px;
  padding: 60px 60px 70px;
  box-shadow: 0 18px 40px rgba(9,30,66,0.10);
}

.form-inner h2 {
  font-size: 28px;
  text-align: center;
  margin: 0 0 28px 0;
  color: #000;
}

/* ===== FORM ELEMENTS ===== */
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #333;
}
select, input[type="file"] {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  font-size: 15px;
}

.file-status {
    margin-top: 5px;
    font-size: 0.9rem;
    color: #666;
}

.submit-btn {
  background: var(--yellow);
  color: #111;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 28px;
  border: none;
  cursor: pointer;
  display: block;
  margin: 28px auto 0;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 920px) {
    .hero-donasi-inner {
        flex-direction: column-reverse;
        gap: 20px;
    }
    .hero-img, .hero-text { width: 100%; }
    .hero-donasi { padding: 60px 0; }
    .form-section { margin-top: 0; padding: 40px 6% 80px; }
    .form-inner { padding: 40px 30px 50px; }
}
</style>
