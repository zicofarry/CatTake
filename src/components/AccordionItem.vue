<template>
  <div 
    class="bg-[#E0E4E1] border border-gray-300 rounded-xl mb-3 overflow-hidden transition-all duration-300"
    :class="{'shadow-lg': isOpen}"
  >
    <button 
      class="w-full bg-transparent border-none p-4 font-sans text-left flex justify-between items-center cursor-pointer transition duration-200"
      @click="toggleAccordion"
    >
      <span class="text-[#1F1F1F] font-semibold text-base md:text-lg">{{ header }}</span>
      
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        class="h-5 w-5 text-gray-700 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }" 
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <div 
      v-show="isOpen" 
      class="pt-0 pb-4 px-4 text-[#333] leading-relaxed transition-all duration-300 ease-out border-t border-gray-200"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  header: String,
  modelValue: Boolean
});

const isOpen = ref(props.modelValue);

const toggleAccordion = () => {
  isOpen.value = !isOpen.value;
};

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue;
});
</script>
