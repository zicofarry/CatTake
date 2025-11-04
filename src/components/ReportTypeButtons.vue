<template>
    <section class="report-type">
        <button 
            id="btn-stray" 
            class="report-btn" 
            :class="{ active: modelValue === 'stray' }"
            @click="$emit('update:modelValue', 'stray')"
        >
            Kucing Liar
        </button>
        <button 
            id="btn-lost" 
            class="report-btn" 
            :class="{ active: modelValue === 'lost' }"
            @click="$emit('update:modelValue', 'lost')"
        >
            Kucing Hilang
        </button>
    </section>
</template>

<script setup>
// Menggunakan konsep v-model agar state tombol bisa dikontrol oleh komponen induk
// Prop 'modelValue' menerima nilai (stray atau lost)
// Event 'update:modelValue' mengirim nilai baru ke induk
defineProps({
    modelValue: String // Nilai saat ini: 'stray' atau 'lost'
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* Pindahkan CSS dari report.css yang spesifik untuk section .report-type */

.report-type {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 3rem 1rem 1rem;
    align-items: center;
}

.report-btn {
    width: 100%;
    max-width: 350px;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: 2px solid var(--primary-yellow);
    background-color: transparent;
    color: var(--text-dark); 
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.report-btn.active {
    background-color: var(--primary-yellow);
    color: var(--text-dark);
}

/* Media Query untuk Desktop */
@media (min-width: 768px) {
    .report-type {
        flex-direction: row;
        justify-content: center;
        gap: 2rem;
        padding-top: 5rem;
    }
    .report-btn {
        width: 200px;
    }
}
</style>
