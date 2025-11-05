<template>
  <div class="max-w-6xl mx-auto px-6 lg:px-8">
    <section class="py-20 lg:py-32">
      <div class="flex flex-col-reverse gap-5 items-center justify-between lg:flex-row lg:gap-12">
        <div class="lg:w-1/2">
          <img src="../assets/img/Ellipse.png" alt="Ilustrasi kucing donasi" class="w-full rounded-xl block">
        </div>
        <div class="lg:w-1/2 text-center lg:text-left">
          <h1 class="text-4xl lg:text-5xl font-extrabold text-green-700 mb-4 leading-tight">Satu Donasi, Seribu Harapan.</h1>
          <p class="mb-6 text-gray-700 leading-relaxed">Bersama mendukung langkah kecil mereka, dari jalanan penuh bahaya menuju tempat yang aman, sehat, dan dicintai.</p>
          <a class="inline-block bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-full font-semibold transition duration-200" href="#formDonasi">Donasi Sekarang</a>
        </div>
      </div>
    </section>

    <section id="formDonasi" class="bg-green-700 text-white pt-36 pb-40 -mt-60 lg:-mt-60">
      <div class="max-w-4xl mx-auto bg-white text-gray-800 rounded-3xl p-8 md:p-16 shadow-2xl">
        <h2 class="text-3xl font-semibold text-center mb-8 text-gray-900">Form Donasi</h2>

        <form @submit.prevent="submitDonation" class="flex flex-col gap-5">
          <div>
            <label for="shelter" class="font-semibold mb-1 block text-gray-700">Shelter Tujuan</label>
            <select id="shelter" v-model="form.shelter" required
                    class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-base">
              <option value="" disabled>-- Pilih Shelter --</option>
              <option value="cathouse">CatHouse</option>
              <option value="pawcare">PawCare</option>
              <option value="meowhaven">Meow Haven</option>
            </select>
          </div>

          <div>
            <label for="metode" class="font-semibold mb-1 block text-gray-700">Metode Pembayaran</label>
            <select id="metode" v-model="form.method" required
                    class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-base">
              <option value="" disabled>-- Pilih Metode --</option>
              <option value="qris">QRIS</option>
              <option value="bri">Transfer BRI - 123456789 a/n CatTake Shelter</option>
            </select>
          </div>

          <div>
            <label for="buktiTf" class="font-semibold mb-1 block text-gray-700">Upload Bukti Transfer</label>
            <input 
                id="buktiTf" 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                required 
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p v-if="fileName" class="mt-1 text-sm text-gray-600">File terpilih: {{ fileName }}</p>
          </div>

          <button class="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-7 rounded-full border-none cursor-pointer block mt-7 mx-auto shadow-md"
            type="submit"
            style="box-shadow: 0 6px 18px rgba(0,0,0,0.08);"
          >
            Selesai
          </button>
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
    } else {
        alert('Mohon lengkapi semua field donasi.');
    }
}
</script>

<style scoped>
/* CSS Lama Dihapus */
</style>