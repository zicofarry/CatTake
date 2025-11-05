<template>
    <main class="bg-gray-100 py-5">
        <div class="max-w-5xl mx-auto px-4 md:px-6 my-10">
            
            <section class="flex flex-col md:flex-row items-stretch gap-8 mb-10">
                <div class="bg-white p-4 rounded-3xl shadow-lg flex-none md:w-2/5">
                    <img :src="cat.photoUrl" :alt="'Foto ' + cat.name" class="w-full h-full object-cover rounded-2xl">
                </div>
                <div class="bg-gray-200 rounded-2xl p-6 md:p-8 flex flex-col justify-center flex-grow md:w-3/5">
                    <p class="my-2 text-lg text-gray-800"><strong>Nama:</strong> {{ cat.name }}</p>
                    <p class="my-2 text-lg text-gray-800"><strong>Umur:</strong> {{ cat.age }}</p>
                    <p class="my-2 text-lg text-gray-800"><strong>Jenis Kelamin:</strong> {{ cat.gender }}</p>
                    <p class="my-2 text-lg text-gray-800"><strong>Ras:</strong> {{ cat.breed }}</p>
                    <p class="my-2 text-lg text-gray-800"><strong>Karakteristik:</strong> {{ cat.character }}</p>
                    <p class="my-2 text-lg text-gray-800"><strong>Lokasi:</strong> {{ cat.location }}</p>
                </div>
            </section>
            
            <div class="text-center mb-10">
                <a href="#form-adopsi" 
                   class="inline-block bg-amber-500 hover:bg-amber-600 text-gray-800 py-4 px-12 text-lg font-bold no-underline rounded-full shadow-lg transition duration-200 hover:translate-y-[-3px]"
                   style="box-shadow: 0 5px 15px rgba(251, 192, 45, 0.4);"
                >
                    Adopsi Sekarang!
                </a>
            </div>

            <section class="pb-12" id="form-adopsi">
                <form class="bg-white p-6 md:p-8 rounded-2xl shadow-xl text-center" @submit.prevent="submitAdoption">
                    
                    <AccordionItem 
                        header="Verifikasi Data Pengadopsi" 
                        :form-style="true" 
                        :model-value="true" 
                    >
                        <div class="p-0 pb-5 md:px-1">
                            <input type="text" placeholder="Nama Pengadopsi" required class="w-full p-4 mb-4 border border-gray-300 rounded-xl bg-white font-sans text-base shadow-sm">
                            <input type="text" placeholder="NIK" required class="w-full p-4 mb-4 border border-gray-300 rounded-xl bg-white font-sans text-base shadow-sm">
                            <input type="tel" placeholder="Nomor Handphone" required class="w-full p-4 mb-4 border border-gray-300 rounded-xl bg-white font-sans text-base shadow-sm">
                            <input type="email" placeholder="Email" required class="w-full p-4 mb-4 border border-gray-300 rounded-xl bg-white font-sans text-base shadow-sm">
                            <input type="text" placeholder="Pekerjaan" required class="w-full p-4 mb-4 border border-gray-300 rounded-xl bg-white font-sans text-base shadow-sm">
                            <textarea placeholder="Alamat" rows="3" required class="w-full p-4 mb-4 border border-gray-300 rounded-xl bg-white font-sans text-base shadow-sm"></textarea>
                        </div>
                    </AccordionItem>
                    
                    <AccordionItem 
                        header="Foto KTP/SIM/Passport" 
                        :form-style="true" 
                        :model-value="false"
                    >
                        <div class="p-0 pb-5 md:px-1">
                            <input type="file" id="file-upload" hidden @change="handleFileUpload">
                            <label for="file-upload" class="flex justify-between items-center w-full p-4 border border-gray-300 rounded-xl bg-gray-100 font-sans text-base shadow-sm cursor-pointer hover:bg-gray-200">
                                Pilih File <span class="text-gray-500">{{ fileName || '(Belum ada file)' }}</span>
                            </label>
                        </div>
                    </AccordionItem>

                    <button type="submit" 
                      class="inline-block w-auto py-4 px-16 bg-amber-500 hover:bg-amber-600 border-none rounded-full text-lg font-bold cursor-pointer mt-5 transition duration-200"
                    >
                        Selesai
                    </button>
                </form>
            </section>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AccordionItem from '../components/AccordionItem.vue';

// ... (Logika JS Anda tetap sama) ...
const mockCatData = [
    { id: 1, name: 'Oyen', age: '6 Bulan', gender: 'Jantan', breed: 'American Shorthair', character: 'Agresif, playful', photoUrl: '/assets/img/oyencat.png', location: 'Jakarta Selatan' },
];

const route = useRoute();
const fileName = ref('');
const cat = ref({}); 

onMounted(() => {
    const catId = parseInt(route.params.id); 
    const foundCat = mockCatData.find(c => c.id === catId);

    if (foundCat) {
        cat.value = foundCat;
    } else {
        cat.value = mockCatData[0];
    }
});

function handleFileUpload(event) {
    fileName.value = event.target.files[0] ? event.target.files[0].name : '';
}

function submitAdoption() {
    alert(`Formulir adopsi untuk ${cat.value.name} dikirim!`);
}
</script>

<style scoped>
/* CSS Lama Dihapus */
</style>