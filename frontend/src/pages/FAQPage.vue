<template>
<main
  class="min-h-screen flex flex-col items-center justify-center py-16 px-4"
  style="
    background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
    background-repeat: no-repeat;
    background-attachment: fixed;
  "
>

    <div class="bg-white w-11/12 max-w-4xl p-8 md:p-12 rounded-2xl shadow-2xl">
      <h1 class="text-4xl lg:text-5xl font-extrabold mb-8 text-gray-900">FAQ?</h1>

      <!-- Semua item tampil penuh, tidak scroll terpisah -->
      <div class="flex flex-col gap-4">
        <AccordionItem
          v-for="(item, index) in faqItems"
          :key="index"
          :header="item.question"
          :model-value="item.open"
        >
          <ul
            v-if="item.isList"
            class="list-disc list-outside pl-6 space-y-2 text-gray-700 text-base leading-relaxed"
          >
            <li v-for="(line, i) in item.answerLines" :key="i">{{ line }}</li>
          </ul>
          <p
            v-else
            class="text-gray-700 text-base leading-relaxed break-words whitespace-normal"
          >
            {{ item.answer }}
          </p>
        </AccordionItem>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import AccordionItem from "../components/AccordionItem.vue";

const faqItems = ref([
  {
    question: "Cara merawat kucing yang benar?",
    answer:
      "Pastikan untuk memberikan nutrisi yang seimbang, vaksinasi rutin, dan lingkungan yang aman serta penuh kasih sayang. Ajak bermain minimal 15 menit sehari.",
    open: false,
    isList: false,
  },
  {
    question: "Bagaimana cara membuat laporan kucing?",
    answerLines: [
      "Pergi ke laman “Rescue”.",
      "Isi semua data yang dibutuhkan untuk formulir.",
      "Klik “Submit” untuk mengirimkan data kucing.",
    ],
    open: false,
    isList: true,
  },
  {
    question: "Apakah saya perlu membayar biaya adopsi?",
    answer:
      "Kami membebankan biaya adopsi yang bersifat donasi untuk menutupi biaya vaksinasi, steril, dan perawatan pra-adopsi.",
    open: false,
    isList: false,
  },
  {
    question: "Bagaimana cara memberikan donasi untuk mendukung shelter?",
    answer:
      "Kunjungi halaman Donasi, pilih shelter tujuan, metode transfer, dan unggah bukti transfer Anda.",
    open: false,
    isList: false,
  },
  {
    question: "Bagaimana cara mengadopsi kucing?",
    answer:
      'Telusuri katalog kucing, klik "Rincian" pada kucing pilihan Anda, dan isi formulir Adopsi yang tersedia di halaman detail tersebut.',
    open: false,
    isList: false,
  },
]);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #638870;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4a6c55;
}
</style>
