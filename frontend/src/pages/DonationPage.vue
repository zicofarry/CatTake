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

        <div class="relative bg-white p-6 md:p-8 rounded-3xl shadow-2xl overflow-hidden custom-scrollbar max-h-[80vh]">
          
          <div v-if="donations.length === 0" class="text-center py-10 text-gray-500">
            <i class="fas fa-box-open text-4xl mb-3 opacity-50"></i>
            <p>Belum ada donasi masuk.</p>
          </div>

          <div v-else class="flex flex-col gap-4">
            <DonationItemCard 
              v-for="donation in donations" 
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
        <div class="relative max-w-sm md:max-w-4xl mx-auto bg-white/90 backdrop-blur-xl text-gray-800 rounded-3xl p-8 md:p-16 shadow-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/50">
          <LoginOverlay :isLoggedIn="isLoggedInProp" />
          
          <div class="text-center mb-10">
            <h2 class="text-4xl font-bold text-gray-800 mb-2">Formulir Donasi</h2>
            <p class="text-gray-500">Lengkapi data di bawah untuk menyalurkan kebaikanmu</p>
          </div>

          <form @submit.prevent="submitDonation" class="flex flex-col gap-6 max-w-2xl mx-auto">
            
            <div 
              class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200"
              :class="form.is_anonymus ? 'border-[#558a74] bg-green-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'"
              @click="form.is_anonymus = !form.is_anonymus"
            >
              <div class="relative flex items-center">
                <input 
                  id="anonim" 
                  type="checkbox" 
                  v-model="form.is_anonymus"
                  class="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-[#558a74] checked:bg-[#558a74]"
                />
                <i class="fas fa-check absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xs"></i>
              </div>
              <label for="anonim" class="font-semibold text-gray-700 cursor-pointer select-none flex-1">
                <span class="block text-lg">Sembunyikan Nama Saya</span>
                <span class="text-sm text-gray-500 font-normal">Nama Anda tidak akan ditampilkan di daftar donatur publik (Anonim).</span>
              </label>
            </div>

            <div>
              <label for="shelter" class="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">Shelter Tujuan</label>
              <div class="relative">
                <select 
                  id="shelter" 
                  v-model="form.shelter" 
                  required
                  class="w-full p-4 pr-10 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 text-base focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all appearance-none"
                >
                  <option value="" disabled>-- Pilih Shelter Penerima --</option>
                  <option 
                    v-for="shelter in shelterList" 
                    :key="shelter.id" 
                    :value="shelter.id"
                  >
                    {{ shelter.shelter_name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div>
              <label for="amount" class="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">Jumlah Donasi</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-gray-500 font-bold text-lg">Rp</span>
                </div>
                <input 
                  id="amount" 
                  type="number" 
                  v-model="form.amount" 
                  required
                  min="10000"
                  placeholder="0"
                  class="w-full p-4 pl-12 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 text-lg font-semibold focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all placeholder:font-normal"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1 ml-1">*Minimal donasi Rp 10.000</p>
            </div>

            <div>
              <label for="metode" class="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">Metode Pembayaran</label>
              <div class="relative">
                <select id="metode" v-model="form.method" required
                        class="w-full p-4 pr-10 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 text-base focus:ring-2 focus:ring-[#558a74] focus:border-transparent outline-none transition-all appearance-none">
                  <option value="" disabled>-- Pilih Metode Pembayaran --</option>
                  <option value="qris">QRIS (Scan QR Code)</option>
                  <option value="bri">Transfer Bank BRI</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i class="fas fa-credit-card"></i>
                </div>
              </div>
              <div v-if="form.method === 'bri'" class="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm flex gap-3 items-start animate-fade-in">
                <i class="fas fa-info-circle mt-1"></i>
                <div>
                  <p class="font-bold">Bank BRI</p>
                  <p class="text-lg font-mono my-1">1234-5678-9000</p>
                  <p>a/n CatTake Shelter Foundation</p>
                </div>
              </div>
            </div>

            <div>
              <label for="buktiTf" class="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2 block">Bukti Transfer</label>
              <div class="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-6 text-center group cursor-pointer">
                <input 
                    id="buktiTf" 
                    type="file" 
                    accept="image/*" 
                    @change="handleFileUpload" 
                    required 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div class="flex flex-col items-center justify-center space-y-2 text-gray-500 group-hover:text-[#558a74] transition-colors">
                  <i class="fas fa-cloud-upload-alt text-3xl mb-1"></i>
                  <p v-if="!fileName" class="text-sm font-medium">Klik atau seret file ke sini untuk upload</p>
                  <p v-else class="text-sm font-bold text-[#558a74] bg-green-100 px-3 py-1 rounded-full">{{ fileName }}</p>
                  <p v-if="!fileName" class="text-xs text-gray-400">Format: JPG, PNG (Max. 10MB)</p>
                </div>
              </div>
            </div>

            <button 
              class="w-full bg-gradient-to-r from-[#E8C32A] to-[#f1d04b] hover:to-[#E8C32A] text-gray-900 font-extrabold py-4 px-8 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 mt-4 flex items-center justify-center gap-2 text-lg"
              type="submit"
              style="box-shadow: 0 10px 25px -5px rgba(232, 195, 42, 0.4);"
            >
              <span>Selesaikan Donasi</span>
              <i class="fas fa-arrow-right"></i>
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
import { jwtDecode } from 'jwt-decode';
import apiClient from '@/api/http';

const userRole = computed(() => localStorage.getItem('userRole') || 'guest');
const shelterList = ref([]);
const donations = ref([]);

// --- Mock Data Donasi (Untuk Tampilan Shelter) ---
// const mockDonations = ref([
//     { id: 1, amount: 1000000, donorName: 'Diana', profilePic: '/img/profileDiana.png', dateTime: '2025/10/02 19.08' },
//     { id: 2, amount: 10000000, donorName: 'Azmi', profilePic: '/img/profileAzmi.png', dateTime: '2025/09/30 13.25' },
//     { id: 3, amount: 999000, donorName: 'Anas', profilePic: '/img/profileAnas.png', dateTime: '2025/09/29 09.40' },
//     { id: 4, amount: 3000000, donorName: 'Nanda', profilePic: '/img/profileNanda.png', dateTime: '2025/09/29 07.00' },
//     { id: 5, amount: 800000, donorName: 'Aji', profilePic: '/img/profileAji.png', dateTime: '2025/09/15 11.23' },
//     { id: 6, amount: 5000000, donorName: 'Rafa', profilePic: '/img/profileRafa.png', dateTime: '2025/09/12 12.30' },
// ]);

const props = defineProps({
  isLoggedInProp: Boolean
});

const form = ref({
    shelter: '',
    amount: '', 
    is_anonymus: false,
    method: '',
    proof: null,
});

const fileName = ref('');

// Helper untuk ambil ID User (Shelter ID) dari Token
function getUserId() {
    const token = localStorage.getItem('userToken');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.id;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

// --- LOGIKA SAAT LOAD HALAMAN ---
onMounted(async () => {
    try {
        if (userRole.value === 'shelter') {
            // === JIKA SHELTER: AMBIL DATA DONASI MASUK ===
            const shelterId = getUserId();
            if (shelterId) {
                const response = await apiClient.get(`/donations/shelter/${shelterId}`);
                donations.value = response.data; // Simpan data asli ke state
                console.log("Data Donasi Diterima:", donations.value);
            }
        } else {
            // === JIKA USER/GUEST: AMBIL DAFTAR SHELTER UTK FORM ===
            const response = await apiClient.get('/users/shelters');
            shelterList.value = response.data;
        }
    } catch (error) {
        console.error("Gagal memuat data:", error);
    }
});

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
    // Validasi tambahan untuk amount
    if (!form.value.shelter || !form.value.method || !form.value.proof || !form.value.amount) {
        alert('Mohon lengkapi semua field.');
        return;
    }

    // Mapping Nama Shelter ke ID (Karena select option kamu value-nya string nama)
    // Idealnya select option valuenya langsung ID shelter dari database.
    // Contoh dummy mapping sementara:

    const formData = new FormData();
    formData.append('shelter_id', form.value.shelter); 
    formData.append('payment_method', form.value.method);
    formData.append('amount', form.value.amount); // Menggunakan nilai input form
    formData.append('is_anonymus', form.value.is_anonymus ? 1 : 0); // Menggunakan nilai checkbox (convert ke 1/0)
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
        form.value.amount = '';  // Reset jumlah donasi
        form.value.is_anonymus = false; // Reset checkbox anonim
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
/* Animasi kecil untuk hint BRI */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>