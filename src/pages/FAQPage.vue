<template>
  <main class="bg-gray-800 min-h-screen pt-12" style="background: radial-gradient(circle at top right, #638870, #1e3932);">
    <div class="bg-white w-11/12 max-w-4xl mx-auto p-6 md:p-12 rounded-2xl shadow-xl">
      <h1 class="text-4xl lg:text-5xl font-bold mb-8 text-gray-800">FAQ?</h1>
      <div class="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-2">
        <AccordionItem v-for="(item, index) in faqItems" 
                       :key="index" 
                       :header="item.question"
                       :model-value="item.open"
        >
          <p class="text-gray-700">{{ item.answer }}</p>
        </AccordionItem>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import AccordionItem from '../components/AccordionItem.vue';

// ... (Logika JS Anda tetap sama) ...
const faqItems = ref([
  { question: 'Cara merawat kucing yang benar?', answer: 'Pastikan untuk memberikan nutrisi yang seimbang, vaksinasi rutin, dan lingkungan yang aman serta penuh kasih sayang. Ajak bermain minimal 15 menit sehari.', open: false },
  { question: 'Bagaimana cara membuat laporan kucing?', answer: 'Cukup kunjungi halaman Lapor, pilih Kucing Liar atau Hilang, isi detail lokasi dan kondisi, lalu unggah foto untuk diverifikasi tim kami.', open: false },
  { question: 'Bagaimana cara mengadopsi kucing?', answer: 'Telusuri katalog kucing, klik "Rincian" pada kucing pilihan Anda, dan isi formulir Adopsi yang tersedia di halaman detail tersebut.', open: false },
  { question: 'Apa saya perlu membayar biaya adopsi?', answer: 'Kami membebankan biaya adopsi yang bersifat donasi untuk menutupi biaya vaksinasi, steril, dan perawatan pra-adopsi.', open: false },
  { question: 'Bagaimana cara memberikan donasi?', answer: 'Kunjungi halaman Donasi, pilih shelter tujuan, metode transfer, dan unggah bukti transfer Anda.', open: false },
]);
</script>

<style scoped>
/* Hapus semua CSS kecuali latar belakang radial yang rumit */
/* Latar belakang radial dipertahankan sebagai inline style untuk hasil visual yang sama */
/* Hapus semua selektor lainnya */

/* Aturan scrollbar diabaikan karena memerlukan vendor prefix kustom */
</style>