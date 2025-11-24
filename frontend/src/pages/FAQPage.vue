<template>
<main
  class="min-h-screen flex flex-col items-center justify-center pt-24 md:pt-40 pb-16 px-4"
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
import { ref, onMounted } from "vue";
import AccordionItem from "../components/AccordionItem.vue";
import apiClient from "@/api/http";

const faqItems = ref([]);
const isLoading = ref(true);

// Fungsi mengambil data dari Backend
const fetchFaqs = async () => {
  try {
    const response = await apiClient.get('/faq'); // Request ke http://localhost:3000/api/v1/faq
    
    faqItems.value = response.data.data.map(item => {
      // Cek apakah string 'answer' mengandung karakter baris baru (\n)
      const hasNewLine = item.answer.includes('\n');

      // Jika ada enter, kita pecah jadi array. 
      // Kita juga pakai .trim() untuk hapus spasi kosong di awal/akhir baris
      const listItems = hasNewLine 
        ? item.answer.split('\n').filter(line => line.trim() !== '') 
        : [];

      return {
        question: item.question,
        answer: item.answer,      // Teks asli (untuk yang bukan list)
        answerLines: listItems,   // Array baris (untuk yang list)
        open: false,
        isList: hasNewLine        // Otomatis TRUE jika ada enter, FALSE jika tidak
      };
    });
    
  } catch (error) {
    console.error("Gagal mengambil data FAQ:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchFaqs();
});
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
