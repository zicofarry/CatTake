<template>
  <div class="accordion-item" :class="{ 'is-open': isOpen }">
    <button class="accordion-header" @click="toggleAccordion">
      {{ header }}
      <i 
        class="chevron-icon fas" 
        :class="[isOpen ? 'fa-chevron-up' : 'fa-chevron-down']"
      ></i>
    </button>
    
    <div v-show="isOpen" class="accordion-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

// Definisikan Props yang akan diterima
const props = defineProps({
  // Judul/Pertanyaan yang akan ditampilkan di header
  header: {
    type: String,
    required: true
  },
  // Opsi: Jika ingin mengontrol status buka/tutup dari luar
  modelValue: {
    type: Boolean,
    default: false
  }
});

// State internal untuk mengontrol status buka/tutup
const isOpen = ref(props.modelValue);

// Fungsi untuk mengubah status buka/tutup
const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};

// Opsional: Sinkronisasi status internal dengan prop eksternal
watch(() => props.modelValue, (newValue) => {
    isOpen.value = newValue;
});
</script>

<style scoped>
/* Pindahkan CSS dari faq.css dan adoptdetail.css yang relevan untuk satu item accordion */

.accordion-item {
    background-color: var(--light-gray, #f2f2f2);
    border-radius: 12px;
    margin-bottom: 1rem;
    overflow: hidden;
}

.accordion-header {
    width: 100%;
    background: transparent;
    border: none;
    padding: 1rem 1.25rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.3s;
}

.accordion-header:hover {
    background-color: #e6e6e6;
}

/* Menggantikan SVG dengan Font Awesome icon di sini */
.chevron-icon {
    transition: transform 0.3s ease;
    font-size: 0.9rem;
}

.accordion-content {
    padding: 0 1.25rem 1rem 1.25rem;
    color: var(--body-text, #555);
    line-height: 1.6;
    /* Tambahan: Transisi agar konten tidak muncul tiba-tiba */
    transition: all 0.3s ease-out;
}

/* Style khusus untuk Form Accordion di Detail Adopsi */
.accordion-item.form-style {
    background: var(--white);
    border: 1px solid #ddd;
}
.accordion-item.form-style .accordion-header {
    background: #f0f2f5; 
    border-radius: 10px;
    margin-bottom: 5px;
}
</style>
