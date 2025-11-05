<template>
  <div 
    class="rounded-xl mb-4 overflow-hidden bg-gray-100 transition-all duration-300" 
    :class="{ 'border border-gray-300 bg-white': isOpen && formStyle }"
  >
    <button 
      class="w-full bg-transparent border-none p-4 font-sans text-base font-semibold text-left flex justify-between items-center cursor-pointer transition duration-300 hover:bg-gray-200"
      :class="{ 'bg-gray-200 rounded-b-none mb-1': isOpen && formStyle }"
      @click="toggleAccordion"
    >
      {{ header }}
      <i 
        class="chevron-icon fas text-sm transition duration-300" 
        :class="[isOpen ? 'fa-chevron-up' : 'fa-chevron-down']"
      ></i>
    </button>
    
    <div v-show="isOpen" class="px-5 pb-4 text-gray-600 leading-relaxed transition-all duration-300 ease-out">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  header: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  // Tambahkan prop untuk style khusus form
  formStyle: {
      type: Boolean,
      default: false
  }
});

const isOpen = ref(props.modelValue);

const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};

watch(() => props.modelValue, (newValue) => {
    isOpen.value = newValue;
});
</script>