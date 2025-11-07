<template>
  <div class="">
    <HeroSection 
      title="Satu Donasi, Seribu Harapan."
      subtitle="Bersama mendukung langkah kecil mereka, dari jalanan penuh bahaya menuju tempat yang aman, sehat, dan dicintai."
      buttonText="Donasi Sekarang"
      buttonLink="#formDonasi"
    />
  </div>

  <div>

    <section id="formDonasi" class="bg-gradient-to-b from-[#558a74] to-[#1d2f28] text-white pt-30 pb-30 !mt-20 lg:-mt-60">
      <div class="relative max-w-sm md:max-w-4xl mx-auto bg-white/80 backdrop-blur-md text-gray-800 rounded-3xl p-5 md:p-16 shadow-2xl shadow-[0_10px_30px_rgba(0,0,0,1)] overflow-hidden">

        <LoginOverlay :isLoggedIn="isLoggedInProp" />
    
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
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"/>
            <p v-if="fileName" class="mt-1 text-sm text-gray-600">File terpilih: {{ fileName }}</p>
          </div>

          <button class="bg-[#E8C32A] hover:bg-amber-500 text-gray-900 font-bold py-3 px-7 rounded-full border-none cursor-pointer block mt-7 mx-auto shadow-md"
            type="submit"
            style="box-shadow: 0 6px 18px rgba(0,0,0,0.08);">
            Selesai
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HeroSection from '../components/HeroSection.vue';
import LoginOverlay from '../components/LoginOverlay.vue';

const props = defineProps({
  isLoggedInProp: Boolean
});

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
</style>