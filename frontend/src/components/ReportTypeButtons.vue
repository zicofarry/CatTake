<template>
    <section class="flex flex-col gap-4 p-4 items-center md:flex-row md:justify-center md:gap-8 md:pt-20">
        <button 
            id="btn-stray" 
            class="report-btn w-full max-w-sm p-4 text-lg font-semibold border-2 border-yellow-500 bg-transparent text-gray-800 rounded-xl cursor-pointer transition duration-300 shadow-md md:w-48 md:max-w-none" 
            :class="{ 
                'bg-yellow-500 text-gray-800': modelValue === 'stray',
                'hover:bg-yellow-100': modelValue !== 'stray' // Efek hover hanya jika tidak aktif
            }"
            @click="$emit('update:modelValue', 'stray')"
        >
            Kucing Liar
        </button>
        <button 
            id="btn-lost" 
            class="report-btn w-full max-w-sm p-4 text-lg font-semibold border-2 border-yellow-500 bg-transparent text-gray-800 rounded-xl cursor-pointer transition duration-300 shadow-md md:w-48 md:max-w-none" 
            :class="{ 
                'bg-yellow-500 text-gray-800': modelValue === 'lost',
                'hover:bg-yellow-100': modelValue !== 'lost' // Efek hover hanya jika tidak aktif
            }"
            @click="$emit('update:modelValue', 'lost')"
        >
            Kucing Hilang
        </button>
    </section>
</template>

<script setup>
defineProps({
    modelValue: String // Nilai saat ini: 'stray' atau 'lost'
});

defineEmits(['update:modelValue']);
</script>