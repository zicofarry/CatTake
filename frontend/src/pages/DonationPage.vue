<template>
  <div v-if="userRole === 'shelter'">
    <div 
      class="min-h-screen flex items-center justify-center"
      style="
        background: radial-gradient(circle at top right, #cfe3d4 10%, oklch(39.3% 0.095 152.535) 80%);
        background-repeat: no-repeat;
        background-attachment: fixed;
      "
    >
      <div class="max-w-4xl w-full mx-auto px-4 pt-12 pb-20">
        <div class="text-center mb-8">
          <h1 class="inline-block text-3xl md:text-4xl font-extrabold text-gray-800 py-3 px-8 bg-white rounded-full shadow-lg">
            Donasi Masuk
          </h1>
        </div>

        <!-- Wrapper Daftar Donasi -->
        <div class="relative bg-white p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden custom-scrollbar max-h-[80vh]">
          <div class="flex flex-col gap-4">
            <DonationItemCard 
              v-for="donation in mockDonations" 
              :key="donation.id" 
              :donation="donation"
            />
          </div>
        </div>
      </div>
    </div>
  </div>


  <div v-else>
    <HeroSection 
      title="Satu Donasi, Seribu Harapan."
      subtitle="Bersama mendukung langkah kecil mereka, dari jalanan penuh bahaya menuju tempat yang aman, sehat, dan dicintai."
      buttonText="Donasi Sekarang"
      mainImg="/img/donasi.png"
      mainAlt="donasi love"
      mainMaxWidth="480px"
      buttonLink="#formDonasi"
    />

    <div>
      <section id="formDonasi" class="bg-gradient-to-b from-[#558a74] to-[#1d2f28] text-white pt-30 pb-30 !mt-20 lg:-mt-60">
        <div class="relative max-w-sm md:max-w-4xl mx-auto bg-white/80 backdrop-blur-md text-gray-800 rounded-3xl p-5 md:p-16 shadow-2xl shadow-[0_10px_30px_rgba(0,0,0,1)] overflow-hidden">
          <LoginOverlay :isLoggedIn="isLoggedInProp" />
          <h2 class="text-3xl font-semibold text-center mb-8 text-gray-900">Form Donasi</h2>

          <form @submit.prevent="submitDonation" class="flex flex-col gap-5">
            <div>
              <label for="shelter" class="font-semibold mb-1 block text-gray-700">Shelter Tujuan</label>
              <select 
                id="shelter" 
                v-model="form.shelter" 
                required
                class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-base"
              >
                <option value="" disabled>-- Pilih Shelter --</option>
                
                <option 
                  v-for="shelter in shelterList" 
                  :key="shelter.id" 
                  :value="shelter.id"
                >
                  {{ shelter.shelter_name }}
                </option>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import HeroSection from '../components/HeroSection.vue';
import LoginOverlay from '../components/LoginOverlay.vue';
import DonationItemCard from '../components/DonationItemCard.vue';
import apiClient from '@/api/http';

const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const shelterList = ref([]);

// --- Mock Data Donasi (Untuk Tampilan Shelter) ---
const mockDonations = ref([
    { id: 1, amount: 1000000, donorName: 'Diana', profilePic: '/img/profileDiana.png', dateTime: '2025/10/02 19.08' },
    { id: 2, amount: 10000000, donorName: 'Azmi', profilePic: '/img/profileAzmi.png', dateTime: '2025/09/30 13.25' },
    { id: 3, amount: 999000, donorName: 'Anas', profilePic: '/img/profileAnas.png', dateTime: '2025/09/29 09.40' },
    { id: 4, amount: 3000000, donorName: 'Nanda', profilePic: '/img/profileNanda.png', dateTime: '2025/09/29 07.00' },
    { id: 5, amount: 800000, donorName: 'Aji', profilePic: '/img/profileAji.png', dateTime: '2025/09/15 11.23' },
    { id: 6, amount: 5000000, donorName: 'Rafa', profilePic: '/img/profileRafa.png', dateTime: '2025/09/12 12.30' },
]);

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

onMounted(async () => {
    try {
        // Panggil endpoint yang baru dibuat
        const response = await apiClient.get('/users/shelters');
        shelterList.value = response.data;
    } catch (error) {
        console.error("Gagal memuat data shelter:", error);
    }
});

async function submitDonation() {
    if (!form.value.shelter || !form.value.method || !form.value.proof) {
        alert('Mohon lengkapi semua field.');
        return;
    }

    // Mapping Nama Shelter ke ID (Karena select option kamu value-nya string nama)
    // Idealnya select option valuenya langsung ID shelter dari database.
    // Contoh dummy mapping sementara:

    const formData = new FormData();
    formData.append('shelter_id', form.value.shelter); 
    formData.append('payment_method', form.value.method);
    formData.append('amount', 150000); // Kamu belum punya input amount di form, perlu ditambah!
    formData.append('is_anonymus', false); // Tambah checkbox anonim di form jika perlu
    formData.append('proof', form.value.proof); // File objek

    try {
        await apiClient.post('/donations', formData, {
            headers: {
                'Content-Type': undefined 
            }
        });
        alert('Donasi berhasil!');
        // --- RESET FORM SEPERTI SEMULA ---
        form.value.shelter = ''; // Reset pilihan shelter ke default
        form.value.method = '';  // Reset metode pembayaran
        form.value.proof = null; // Hapus file dari state
        fileName.value = '';     // Hapus nama file yang tampil

        // Reset elemen input file HTML agar user bisa upload file baru
        const fileInput = document.getElementById('buktiTf');
        if (fileInput) fileInput.value = '';
    } catch (error) {
        console.error(error);
        alert('Gagal mengirim donasi');
    }
}
// function submitDonation() {
//     if (form.value.shelter && form.value.method && form.value.proof) {
//         alert(`Donasi ke ${form.value.shelter} melalui ${form.value.method} berhasil diajukan! Bukti transfer: ${form.value.proof.name}`);
//     } else {
//         alert('Mohon lengkapi semua field donasi.');
//     }
// }
</script>

<style scoped>
</style>