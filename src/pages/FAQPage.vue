<template>
  <main>
    <div class="faq-container">
      <h1>FAQ?</h1>
      <div class="accordion-wrapper">
        <AccordionItem v-for="(item, index) in faqItems" 
                       :key="index" 
                       :header="item.question"
                       :model-value="item.open"
        >
          <p>{{ item.answer }}</p>
        </AccordionItem>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import AccordionItem from '../components/AccordionItem.vue';

// Data Pertanyaan FAQ (Mock Data)
const faqItems = ref([
  { question: 'Cara merawat kucing yang benar?', answer: 'Pastikan untuk memberikan nutrisi yang seimbang, vaksinasi rutin, dan lingkungan yang aman serta penuh kasih sayang. Ajak bermain minimal 15 menit sehari.', open: false },
  { question: 'Bagaimana cara membuat laporan kucing?', answer: 'Cukup kunjungi halaman Lapor, pilih Kucing Liar atau Hilang, isi detail lokasi dan kondisi, lalu unggah foto untuk diverifikasi tim kami.', open: false },
  { question: 'Bagaimana cara mengadopsi kucing?', answer: 'Telusuri katalog kucing, klik "Rincian" pada kucing pilihan Anda, dan isi formulir Adopsi yang tersedia di halaman detail tersebut.', open: false },
  { question: 'Apa saya perlu membayar biaya adopsi?', answer: 'Kami membebankan biaya adopsi yang bersifat donasi untuk menutupi biaya vaksinasi, steril, dan perawatan pra-adopsi.', open: false },
  { question: 'Bagaimana cara memberikan donasi?', answer: 'Kunjungi halaman Donasi, pilih shelter tujuan, metode transfer, dan unggah bukti transfer Anda.', open: false },
]);
</script>

<style scoped>
/* Pindahkan CSS dari faq.css yang tidak masuk ke AccordionItem.vue */

/* Variabel dari faq.css */
:root {
    --primary-green: #638870;
    --dark-green-bg: #1e3932;
    --white: #ffffff;
}

main {
    padding: 1rem 0;
    /* Menggantikan background radial gradient dari faq.css */
    background: radial-gradient(circle at top right, var(--primary-green), var(--dark-green-bg));
    min-height: calc(100vh - 70px); /* Sesuaikan tinggi agar mengisi layar */
    padding-top: 3rem;
}

.faq-container {
    background-color: var(--white);
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.faq-container h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
}

/* Style untuk wrapper agar bisa di-scroll (dipindahkan dari .accordion) */
.accordion-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 10px;
}
/* Custom Scrollbar (jika diperlukan) */
.accordion-wrapper::-webkit-scrollbar { width: 6px; }
.accordion-wrapper::-webkit-scrollbar-track { background: transparent; }
.accordion-wrapper::-webkit-scrollbar-thumb { background-color: #ccc; border-radius: 20px; }

@media (min-width: 768px) {
    .faq-container {
        padding: 3rem;
    }
    .faq-container h1 {
        font-size: 3rem;
    }
}
</style>
