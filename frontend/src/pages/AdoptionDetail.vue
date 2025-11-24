<template>
  <main class="min-h-screen bg-[#3A5F50] py-12 relative overflow-hidden font-sans">
    <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div class="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
      <div class="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
    </div>

    <div class="fixed top-6 left-4 md:top-8 md:left-8 z-[999]">
        <router-link 
          to="/adopsi" 
          class="inline-flex items-center gap-2 bg-[#2D4A45]/80 backdrop-blur-md text-white font-bold py-2.5 px-6 rounded-full shadow-2xl transition-all duration-300 hover:bg-[#2D4A45] hover:-translate-x-1 no-underline border border-white/20"
        >
            <i class="fas fa-arrow-left"></i>
            <span>Kembali</span>
        </router-link>
    </div>

    <div class="max-w-5xl mx-auto px-6 relative z-10 pt-10">
      
      <section class="flex flex-col md:flex-row items-center md:items-stretch gap-6 mb-12">
        
        <div class="bg-white p-3 rounded-[35px] shadow-xl flex-none w-full md:w-[280px] h-[280px] flex justify-center items-center">
           <img 
            :src="resolveImageUrl(cat.photo)" 
            :alt="cat.name || 'Kucing'" 
            class="w-full h-full object-cover rounded-[28px]"
           >
        </div>

        <div class="bg-white rounded-[35px] p-8 flex flex-col justify-center flex-grow w-full shadow-xl min-h-[280px]">
          <div class="space-y-3 text-[#1F1F1F]">
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Nama:</span><span>{{ cat.name }}</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Umur:</span><span>{{ cat.age }} Bulan</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Jenis Kelamin:</span><span>{{ cat.gender === 'male' ? 'Jantan' : 'Betina' }}</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Ras:</span><span>{{ cat.breed || 'Domestik' }}</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Deskripsi:</span><span>{{ cat.description ? cat.description : '-' }}</span>
             </div>
          </div>
        </div>
      </section>
      
      <div class="text-center mb-16">
        <a href="#form-adopsi" class="inline-block bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-12 rounded-full shadow-[0_6px_20px_rgba(235,205,94,0.5)] transition-transform hover:-translate-y-1 active:scale-95 no-underline">
          Adopsi Sekarang!
        </a>
      </div>

      <section id="form-adopsi" class="pb-20">
        <div class="bg-white p-6 md:p-10 rounded-[50px] shadow-2xl">
          <form @submit.prevent="submitAdoption">
            
            <div class="mb-6">
                <div 
                  @click="toggleAccordion('data')"
                  class="w-full flex justify-between items-center bg-gray-200 p-5 font-bold text-lg text-[#1F1F1F] cursor-pointer transition-all hover:bg-gray-300"
                  :class="accordionState.data ? 'rounded-t-2xl' : 'rounded-2xl'"
                >
                    Verifikasi Data Pengadopsi
                    <i class="fas transition-transform duration-300" :class="accordionState.data ? 'fa-caret-up' : 'fa-caret-down'"></i>
                </div>

                <div v-show="accordionState.data" class="bg-gray-200 px-6 pb-8 rounded-b-2xl">
                    <div class="space-y-4 pt-2">
                        <input type="text" v-model="adoptionForm.name" placeholder="Nama Pengadopsi" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="text" v-model="adoptionForm.nik" placeholder="NIK" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="tel" v-model="adoptionForm.phone" placeholder="Nomor Handphone" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="email" v-model="adoptionForm.email" placeholder="Email" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="text" v-model="adoptionForm.job" placeholder="Pekerjaan" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <textarea v-model="adoptionForm.address" placeholder="Alamat" required rows="3" class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm resize-none"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="mb-10">
                 <div 
                    @click="toggleAccordion('photo')"
                    class="w-full flex justify-between items-center bg-gray-200 p-5 font-bold text-lg text-[#1F1F1F] cursor-pointer transition-all hover:bg-gray-300"
                    :class="accordionState.photo ? 'rounded-t-2xl' : 'rounded-2xl'"
                >
                    Foto Identitas (KTP/SIM)
                    <i class="fas transition-transform duration-300" :class="accordionState.photo ? 'fa-caret-up' : 'fa-caret-down'"></i>
                </div>

                <div v-show="accordionState.photo" class="bg-gray-200 px-6 pb-8 rounded-b-2xl">
                    <input 
                        type="file" 
                        ref="identityInput" 
                        class="hidden" 
                        accept="image/*"
                        @change="handleIdentityChange"
                    >
                    <div 
                        @click="identityInput.click()"
                        class="mt-4 bg-white border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer transition hover:border-[#EBCD5E] hover:bg-gray-50 group"
                    >
                        <i class="fas fa-id-card text-4xl text-gray-400 mb-3 group-hover:text-[#EBCD5E]"></i>
                        <p class="text-lg text-gray-600 font-medium">
                            {{ identityFileName || 'Klik untuk memilih foto ' }}
                        </p>
                        <p class="text-sm text-gray-400 mt-1">(Format: JPG, PNG. Maks 10MB)</p>
                    </div>
                </div>
            </div>

            <div class="mb-10">
                 <div 
                    @click="toggleAccordion('statement')"
                    class="w-full flex justify-between items-center bg-gray-200 p-5 font-bold text-lg text-[#1F1F1F] cursor-pointer transition-all hover:bg-gray-300"
                    :class="accordionState.statement ? 'rounded-t-2xl' : 'rounded-2xl'"
                >
                    Surat Pernyataan Adopsi
                    <i class="fas transition-transform duration-300" :class="accordionState.statement ? 'fa-caret-up' : 'fa-caret-down'"></i>
                </div>

                <div v-show="accordionState.statement" class="bg-gray-200 px-6 pb-8 rounded-b-2xl">
                    <input 
                        type="file" 
                        ref="statementInput" 
                        class="hidden" 
                        accept=".pdf"
                        @change="handleStatementChange"
                    >
                    <div 
                        @click="$refs.statementInput.click()"
                        class="mt-4 bg-white border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer transition hover:border-[#EBCD5E] group"
                    >
                        <i class="fas fa-file-contract text-4xl text-gray-400 mb-3 group-hover:text-[#EBCD5E]"></i>
                        <p class="text-lg text-gray-600 font-medium">
                            {{ statementFileName || 'Klik untuk upload Surat Pernyataan' }}
                        </p>
                        <p class="text-sm text-gray-400 mt-1">(Format: PDF. Maks 10MB)</p>

                    </div>
                </div>
            </div>

            <div class="text-center">
                <button type="submit" class="inline-block bg-[#EBCD5E] hover:bg-[#e0c355] text-white text-xl font-bold py-4 px-20 rounded-full shadow-[0_6px_20px_rgba(235,205,94,0.4)] transition-transform hover:-translate-y-1 active:scale-95 border-none cursor-pointer">
                    Selesai
                </button>
            </div>

          </form>
        </div>
      </section>

    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Tambahkan useRouter
import apiClient from '@/api/http'; // Import API Client

const route = useRoute();
const router = useRouter();
const isSubmitting = ref(false);

// ... (Bagian Data Dummy Kucing biarkan saja untuk tampilan) ...
const cat = ref({
    id: null,
    name: 'Loading...',
    age: '',
    gender: '',
    breed: '',
    characteristics: [],
    photo: '', // Nanti diisi path gambar dari DB
    description: ''
});

// STATE FORM
const adoptionForm = reactive({
    name: '',
    nik: '',
    phone: '',
    email: '',
    job: '',
    address: ''
});

// STATE ACCORDION
const accordionState = reactive({
    data: true,
    identity: false,
    statement: false
});

// STATE FILE
const identityInput = ref(null);
const statementInput = ref(null);
const identityFileName = ref('');
const statementFileName = ref('');
const identityFile = ref(null);
const statementFile = ref(null);

onMounted(async () => {
    const catId = route.params.id;
    try {
        const response = await apiClient.get(`/cats/${catId}`);
        cat.value = response.data;
        
        // Fallback jika gambar kosong/null
        if (!cat.value.photo) {
            cat.value.photo = 'NULL.JPG'; 
        }
    } catch (error) {
        console.error("Gagal mengambil detail kucing:", error);
        alert("Kucing tidak ditemukan!");
        router.push('/'); // Redirect jika error
    }
});

function resolveImageUrl(imageName) {
    if (!imageName) return '/img/NULL.JPG'; // Gambar default local jika null
    if (imageName.startsWith('http')) return imageName; // Jika URL external
    
    // Arahkan ke folder backend public/img/cats
    return `http://localhost:3000/public/img/cats/${imageName}`;
}

function toggleAccordion(section) {
    accordionState[section] = !accordionState[section];
}

// Handle File Changes
function handleIdentityChange(event) {
    const file = event.target.files[0];
    if (file) {
        identityFile.value = file;
        identityFileName.value = file.name;
    }
}

function handleStatementChange(event) {
    const file = event.target.files[0];
    if (file) {
        // Validasi Frontend Tambahan
        if (file.type !== 'application/pdf') {
            alert("File harus berformat PDF!");
            event.target.value = null; // Reset input
            return;
        }
        statementFile.value = file;
        statementFileName.value = file.name;
    }
}

// SUBMIT FUNCTION
async function submitAdoption() {
    if (!identityFile.value || !statementFile.value) {
        alert("Mohon lengkapi kedua dokumen (Foto Identitas & Surat Pernyataan)!");
        return;
    }

    isSubmitting.value = true;

    const formData = new FormData();
    // Data Teks
    formData.append('cat_id', route.params.id);
    formData.append('nik', adoptionForm.nik);
    formData.append('phone', adoptionForm.phone);
    formData.append('email', adoptionForm.email);
    formData.append('job', adoptionForm.job);
    formData.append('address', adoptionForm.address);
    
    // Data File (Perhatikan nama key-nya harus beda)
    formData.append('identity_photo', identityFile.value);   // Key: identity_photo
    formData.append('statement_letter', statementFile.value); // Key: statement_letter

    try {
        await apiClient.post('/adopt/apply', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert(`Pengajuan adopsi berhasil dikirim!`);
        router.push('/'); // Redirect ke home atau halaman status
    } catch (error) {
        console.error(error);
        alert("Gagal mengirim: " + (error.response?.data?.error || error.message));
    } finally {
        isSubmitting.value = false;
    }
}
</script>