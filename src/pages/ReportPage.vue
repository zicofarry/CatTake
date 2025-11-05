<template>
  <div class="min-h-screen bg-gray-100">
    <main>
      <div class="text-center pt-8 pb-4">
        <h1 class="text-5xl font-bold text-gray-800">Lapor Kucing!</h1>
      </div>

      <ReportTypeButtons v-model="reportType" />

      <section class="p-4 md:p-8">
        <form 
          id="report-form" 
          @submit.prevent="submitReport"
          class="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-3xl mx-auto"
        >
          
          <div class="mb-6" v-if="reportType === 'lost'">
            <label for="owner-name" class="block font-semibold mb-2">Nama Pemilik</label>
            <input type="text" id="owner-name" name="owner-name" placeholder="Masukkan nama Anda"
                   class="w-full p-4 border-none bg-gray-100 rounded-xl font-sans text-base">
          </div>
          
          <div class="mb-6">
            <label for="location" class="block font-semibold mb-2">Lokasi</label>
            <div class="flex items-center bg-gray-100 rounded-xl">
              <div class="p-4 bg-gray-300 rounded-l-xl">
                <i class="fas fa-map-marker-alt text-gray-700"></i>
              </div>
              <input type="text" id="location" name="location" placeholder="Masukkan lokasi atau alamat"
                     class="flex-grow p-4 border-none bg-transparent rounded-r-xl font-sans text-base">
            </div>
          </div>

          <div class="mb-6">
            <label for="description" class="block font-semibold mb-2">Deskripsi</label>
            <textarea id="description" name="description" rows="4" placeholder="Ciri-ciri kucing, kondisi, dll."
                      class="w-full p-4 border-none bg-gray-100 rounded-xl font-sans text-base"></textarea>
          </div>

          <div class="mb-6">
            <label for="photo" class="block font-semibold mb-2">Foto</label>
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-100">
              <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
              <p class="mt-2 mb-1 font-semibold">Drag & Drop file di sini</p>
              <span class="text-gray-500 mb-4 block">atau</span>
              <label for="file-input" class="inline-block border border-green-800 text-green-800 py-2 px-4 rounded-lg cursor-pointer hover:bg-green-100 transition duration-200">Pilih File</label>
              <input type="file" id="file-input" hidden multiple>
            </div>
          </div>

          <button type="submit" 
            class="w-full p-4 text-xl font-bold bg-yellow-500 hover:bg-yellow-600 text-gray-800 border-none rounded-xl cursor-pointer mt-4 shadow-md transition duration-200"
          >
            Selesai
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ReportTypeButtons from '../components/ReportTypeButtons.vue';

const reportType = ref('stray'); 

function submitReport() {
  alert(`Laporan ${reportType.value === 'stray' ? 'Kucing Liar' : 'Kucing Hilang'} berhasil diajukan!`);
}
</script>

<style scoped>
/* CSS Lama Dihapus */
</style>