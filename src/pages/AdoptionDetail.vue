<template>
    <main class="detail-page-main">
        <div class="content-wrapper">
            
            <section class="cat-detail-header">
                <div class="cat-photo-container">
                    <img :src="cat.photoUrl" :alt="'Foto ' + cat.name">
                </div>
                <div class="cat-info-card">
                    <p><strong>Nama:</strong> {{ cat.name }}</p>
                    <p><strong>Umur:</strong> {{ cat.age }}</p>
                    <p><strong>Jenis Kelamin:</strong> {{ cat.gender }}</p>
                    <p><strong>Ras:</strong> {{ cat.breed }}</p>
                    <p><strong>Karakteristik:</strong> {{ cat.character }}</p>
                    <p><strong>Lokasi:</strong> {{ cat.location }}</p>
                </div>
            </section>
            
            <div class="adopt-button-container">
                <a href="#form-adopsi" class="btn btn-adopt-now">Adopsi Sekarang!</a>
            </div>

            <section class="adoption-form-section" id="form-adopsi">
                <form class="adoption-form" @submit.prevent="submitAdoption">
                    
                    <AccordionItem 
                        header="Verifikasi Data Pengadopsi" 
                        class="form-style" 
                        :model-value="true" 
                    >
                        <div class="form-content-padding">
                            <input type="text" placeholder="Nama Pengadopsi" required>
                            <input type="text" placeholder="NIK" required>
                            <input type="tel" placeholder="Nomor Handphone" required>
                            <input type="email" placeholder="Email" required>
                            <input type="text" placeholder="Pekerjaan" required>
                            <textarea placeholder="Alamat" rows="3" required></textarea>
                        </div>
                    </AccordionItem>
                    
                    <AccordionItem 
                        header="Foto KTP/SIM/Passport" 
                        class="form-style" 
                        :model-value="false"
                    >
                        <div class="form-content-padding file-upload-group">
                            <input type="file" id="file-upload" hidden @change="handleFileUpload">
                            <label for="file-upload" class="file-upload-label">
                                Pilih File <span class="file-name-display">{{ fileName || '(Belum ada file)' }}</span>
                            </label>
                        </div>
                    </AccordionItem>

                    <button type="submit" class="btn btn-submit">Selesai</button>
                </form>
            </section>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AccordionItem from '../components/AccordionItem.vue';

// Menggantikan data kucing statis (ini idealnya diambil dari API)
const mockCatData = [
    { id: 1, name: 'Oyen', age: '6 Bulan', gender: 'Jantan', breed: 'American Shorthair', character: 'Agresif, playful', photoUrl: '/assets/img/oyencat.png', location: 'Jakarta Selatan' },
    // ... Tambahkan data kucing lainnya
];

const route = useRoute();
const fileName = ref('');
const cat = ref({}); // State untuk menampung data kucing yang dilihat

// Cari data kucing berdasarkan ID dari URL
onMounted(() => {
    // ID diambil dari rute: /adopsi/:id
    const catId = parseInt(route.params.id); 
    const foundCat = mockCatData.find(c => c.id === catId);

    if (foundCat) {
        cat.value = foundCat;
    } else {
        // Fallback jika ID tidak ditemukan
        cat.value = mockCatData[0]; // Tampilkan kucing pertama sebagai default
    }
});

function handleFileUpload(event) {
    fileName.value = event.target.files[0] ? event.target.files[0].name : '';
}

function submitAdoption() {
    alert(`Formulir adopsi untuk ${cat.value.name} dikirim!`);
    // Lakukan proses pengiriman data ke server
}
</script>

<style scoped>
/* Pindahkan CSS dari adoptdetail.css ke sini */

/* --- Gaya Konten Utama --- */
.detail-page-main {
    padding-top: 20px;
    background-color: #f5f5f5; /* Latar belakang cerah */
}

.content-wrapper {
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
}
.cat-detail-header {
    display: flex;
    align-items: stretch;
    gap: 30px;
    margin-bottom: 40px;
}
.cat-photo-container {
    background-color: #fff;
    padding: 15px;
    border-radius: 30px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    flex-basis: 40%;
}
.cat-photo-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
}
.cat-info-card {
    background-color: #E8EAE3;
    border-radius: 20px;
    padding: 30px;
    flex-basis: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.cat-info-card p { margin: 8px 0; font-size: 18px; color: #333; }
.cat-info-card p strong { font-weight: 700; }

.adopt-button-container { text-align: center; margin-bottom: 40px; }
.btn-adopt-now {
    display: inline-block;
    background-color: #FBC02D;
    color: #333;
    padding: 15px 50px;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    border-radius: 50px;
    box-shadow: 0 5px 15px rgba(251, 192, 45, 0.4);
    transition: transform 0.2s ease;
}
.btn-adopt-now:hover { transform: translateY(-3px); }

/* --- Gaya Form & Accordion --- */
.adoption-form-section {
    padding-bottom: 50px;
}
.adoption-form {
    background: #fff;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    text-align: center;
}

/* Padding internal untuk konten Accordion */
.form-content-padding { 
    padding: 0 5px 20px; 
}
.form-content-padding input, 
.form-content-padding textarea {
    width: 100%;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #ffffff;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    box-sizing: border-box;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.btn-submit {
    display: inline-block;
    width: auto;
    padding: 15px 60px;
    background-color: #FBC02D;
    border: none;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 20px;
}

/* Media Query */
@media (max-width: 992px) {
    .cat-detail-header {
        flex-direction: column;
    }
}
</style>