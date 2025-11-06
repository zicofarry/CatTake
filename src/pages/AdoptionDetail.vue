<template>
  <main class="min-h-screen bg-[#3A5F50] py-12 relative overflow-hidden font-sans">
    <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div class="absolute top-[10%] -left-[10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
      <div class="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-5xl mx-auto px-6 relative z-10">
      
      <section class="flex flex-col md:flex-row items-center md:items-stretch gap-6 mb-12">
        
        <div class="bg-white p-3 rounded-[35px] shadow-xl flex-none w-full md:w-[280px] h-[280px] flex justify-center items-center">
           <img 
            :src="cat.image ? `/assets/img/${cat.image}` : ''" 
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
               <span class="font-bold">Umur:</span><span>{{ cat.age }}</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Jenis Kelamin:</span><span>{{ cat.gender === 'male' ? 'Laki-laki' : 'Betina' }}</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Ras:</span><span>{{ cat.breed || 'Domestik' }}</span>
             </div>
             <div class="grid grid-cols-[140px_1fr] gap-2 text-lg md:text-xl">
               <span class="font-bold">Karakteristik:</span><span>{{ cat.characteristics ? cat.characteristics.join(', ') : '-' }}</span>
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
                        <input type="text" placeholder="Nama Pengadopsi" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="text" placeholder="NIK" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="tel" placeholder="Nomor Handphone" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="email" placeholder="Email" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <input type="text" placeholder="Pekerjaan" required class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm">
                        <textarea placeholder="Alamat" required rows="3" class="w-full p-4 rounded-xl border-none focus:ring-2 focus:ring-[#EBCD5E] outline-none text-[#1F1F1F] placeholder-gray-500 text-lg bg-white shadow-sm resize-none"></textarea>
                    </div>
                </div>
            </div>
            
            <div class="mb-10">
                 <div 
                    @click="toggleAccordion('photo')"
                    class="w-full flex justify-between items-center bg-gray-200 p-5 font-bold text-lg text-[#1F1F1F] cursor-pointer transition-all hover:bg-gray-300"
                    :class="accordionState.photo ? 'rounded-t-2xl' : 'rounded-2xl'"
                >
                    Foto KTP/SIM/Passport
                    <i class="fas transition-transform duration-300" :class="accordionState.photo ? 'fa-caret-up' : 'fa-caret-down'"></i>
                </div>

                <div v-show="accordionState.photo" class="bg-gray-200 px-6 pb-8 rounded-b-2xl">
                    <input 
                        type="file" 
                        ref="fileInput" 
                        class="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                        @change="handleFileChange"
                    >
                    <div 
                        @click="triggerFileInput"
                        class="mt-4 bg-white border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer transition hover:border-[#EBCD5E] hover:bg-gray-50 group"
                    >
                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3 group-hover:text-[#EBCD5E] transition"></i>
                        <p class="text-lg text-gray-600 font-medium">
                            {{ selectedFileName || 'Klik untuk memilih foto ' }}
                        </p>
                        <p class="text-sm text-gray-400 mt-1">(Format: JPG, PNG. Maks 10MB)</p>
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
import { useRoute } from 'vue-router';

// DATA DUMMY KUCING
const cats = [
    { id: 1, name: 'Oyen', age: '6 Bulan', gender: 'male', breed: 'American Shorthair', characteristics: ['Agresif', 'Playful'], image: 'oyencat.png' },
    { id: 2, name: 'Abul', age: '5 Bulan', gender: 'male', breed: 'Domestik', characteristics: ['Manja', 'Pemalu'], image: 'minicat.png' },
    { id: 3, name: 'Simba', age: '2 Tahun', gender: 'male', breed: 'Maine Coon', characteristics: ['Gagah', 'Setia'], image: 'bradercat.png' },
    { id: 4, name: 'Mueza', age: '8 Bulan', gender: 'female', breed: 'Persia', characteristics: ['Manis', 'Lembut'], image: 'mochacat.png' },
    { id: 5, name: 'Kitty', age: '3 Tahun', gender: 'female', breed: 'Anggora', characteristics: ['Tenang', 'Penyayang'], image: 'kucing-5.png' },
];

const route = useRoute();
const cat = ref({});

// STATE ACCORDION
const accordionState = reactive({
    data: true,  // Default terbuka
    photo: false // Default tertutup
});

// STATE UPLOAD
const fileInput = ref(null);
const selectedFileName = ref('');

onMounted(() => {
    const catId = Number(route.params.id);
    cat.value = cats.find(c => c.id === catId) || cats[0];
});

function toggleAccordion(section) {
    accordionState[section] = !accordionState[section];
}

function triggerFileInput() {
    fileInput.value.click();
}

function handleFileChange(event) {
    const file = event.target.files[0];
    selectedFileName.value = file ? file.name : '';
}

function submitAdoption() {
    alert(`Formulir adopsi untuk ${cat.value.name} berhasil dikirim!`);
}
</script>

<style scoped>
</style>