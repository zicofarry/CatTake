<template>
    <div 
        class="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        :class="{ 'ring-2 ring-[#EBCD5E]': isOpen }"
    >
        <div 
            @click="toggleDetails"
            class="flex items-center p-4 cursor-pointer bg-white"
        >
            <img 
                :src="resolveImageUrl(donation.profilePic)" 
                :alt="'Foto ' + donation.donorName" 
                class="w-12 h-12 rounded-full object-cover mr-4 shrink-0 bg-gray-200 border border-gray-100"
                @error="handleImageError"
            >
            
            <div class="flex-grow min-w-0">
                <p class="text-sm text-gray-700 leading-tight">
                    <span class="font-bold text-gray-900">{{ donation.donorName }}</span> mendonasikan
                </p>
                <p class="text-lg font-extrabold text-[#3A5F50] mt-0.5">
                    {{ formattedAmount }}
                </p>
                <p class="text-xs text-gray-400 block md:hidden mt-1">{{ donation.dateTime }}</p>
            </div>
            
            <div class="flex items-center md:gap-4 shrink-0 ml-2">
                <p class="text-sm text-gray-400 font-medium hidden md:block">{{ donation.dateTime }}</p>
                
                <div 
                    class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300"
                    :class="{ 'rotate-180 bg-yellow-100 text-yellow-600': isOpen }"
                >
                    <i class="fas fa-chevron-down text-xs"></i>
                </div>
            </div>
        </div>

        <div v-show="isOpen" class="bg-gray-50 border-t border-gray-100 p-5 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="space-y-3 text-sm">
                    <div>
                        <p class="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Metode Pembayaran</p>
                        <p class="font-semibold text-gray-800 capitalize flex items-center gap-2">
                            <i class="fas fa-credit-card text-[#EBCD5E]"></i>
                            {{ donation.paymentMethod === 'bri' ? 'Transfer Bank BRI' : 'QRIS (Scan)' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Status Privasi</p>
                        <span 
                            class="px-2 py-1 rounded text-xs font-bold"
                            :class="donation.donorName === 'Hamba Allah' ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'"
                        >
                            {{ donation.donorName === 'Hamba Allah' ? 'Anonim' : 'Publik' }}
                        </span>
                    </div>
                </div>

                <div>
                    <p class="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">Bukti Transfer</p>
                    
                    <div v-if="donation.proofFile" class="relative group w-fit">
                        <img 
                            :src="resolveProofUrl(donation.proofFile)" 
                            alt="Bukti Transfer" 
                            class="h-32 w-auto object-cover rounded-lg border border-gray-300 shadow-sm cursor-zoom-in hover:brightness-90 transition"
                            @click="viewImage(resolveProofUrl(donation.proofFile))"
                        >
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition">
                            <i class="fas fa-search-plus text-white drop-shadow-md text-2xl"></i>
                        </div>
                    </div>
                    <div v-else class="h-32 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs italic border border-dashed border-gray-300">
                        Tidak ada lampiran
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    donation: {
        type: Object,
        required: true,
        default: () => ({
            id: 0,
            amount: 0,
            donorName: 'Anonim',
            profilePic: null,
            dateTime: '-',
            paymentMethod: '-',
            proofFile: null
        })
    }
});

const isOpen = ref(false);

const formattedAmount = computed(() => {
    return `Rp${props.donation.amount.toLocaleString('id-ID')}`;
});

function toggleDetails() {
    isOpen.value = !isOpen.value;
}

// Resolver URL Foto Profil
function resolveImageUrl(path) {
    if (!path || path === 'NULL.JPG') return '/img/NULL.JPG';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/public/')) return `http://localhost:3000${path}`;
    if (path.startsWith('/img/')) return path;
    return `/img/${path}`;
}

// Resolver URL Bukti Transfer
function resolveProofUrl(filename) {
    if (!filename) return '';
    // Asumsi file disimpan di folder public/img di backend
    // Sesuaikan port jika berbeda
    return `http://localhost:3000/public/img/proof_payment/${filename}`;
}

// Fallback Image
function handleImageError(event) {
    event.target.src = '/img/NULL.JPG';
}

// Fitur Buka Gambar di Tab Baru
function viewImage(url) {
    if (url) window.open(url, '_blank');
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>