<template>
    <div class="flex items-center p-4 bg-gray-200 rounded-xl shadow-md transition duration-200 hover:shadow-lg">
        
        <img :src="donation.profilePic" :alt="'Foto ' + donation.donorName" class="w-12 h-12 rounded-full object-cover mr-4 shrink-0">
        
        <div class="flex-grow min-w-0">
            <p class="text-sm text-gray-700 leading-tight truncate">
                Donasi <strong class="text-gray-900 font-bold mr-1">{{ formattedAmount }}</strong> dari <strong class="text-gray-900">{{ donation.donorName }}</strong>
            </p>
            <p class="text-xs text-gray-500 block md:hidden">{{ donation.dateTime }} WIB</p>
        </div>
        
        <div class="hidden md:flex items-center md:text-right md:ml-auto shrink-0">
            <p class="text-sm text-gray-500 font-medium whitespace-nowrap mr-3">{{ donation.dateTime }} WIB</p>
            
            <i class="fas fa-check-circle text-green-500 text-lg" title="Terverifikasi"></i>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    donation: {
        type: Object,
        required: true,
        default: () => ({
            id: 0,
            amount: 0,
            donorName: 'Anonim',
            profilePic: '/assets/img/profile_default.png',
            dateTime: '0000/00/00 00.00'
        })
    }
});

const formattedAmount = computed(() => {
    return `Rp${props.donation.amount.toLocaleString('id-ID')}`;
});
</script>

<style scoped>
/* No additional CSS needed (Full Tailwind) */
</style>