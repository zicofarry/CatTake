<template>
  <router-link :to="`/adopsi/${cat.id}`" class="block transition duration-300 hover:translate-y-[-5px] text-inherit no-underline">
    <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div class="relative h-52">
        <img :src="`../assets/img/${cat.image}`" :alt="cat.name" class="w-full h-full object-cover block">
        <button 
          @click.prevent="toggleFavorite" 
          class="absolute top-4 right-4 bg-white bg-opacity-85 border-none w-10 h-10 rounded-full flex justify-center items-center cursor-pointer shadow-md transition duration-200"
          :class="{ 'bg-red-100': cat.isFavorite }"
          aria-label="Toggle Favorite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          <i :class="['fas', cat.isFavorite ? 'fa-heart text-red-500' : 'fa-heart-open text-gray-400 text-lg']"></i>
        </button>

      </div>
      <div class="p-4">
        <h3 class="mt-0 text-2xl text-gray-900">{{ cat.name }}</h3>
        <p class="text-gray-600 text-sm mb-3">Shelter: {{ cat.shelter }}</p>
        <div class="flex gap-4 text-sm">
          <span class="flex items-center gap-1 text-green-600 font-semibold">
            <i class="fas fa-venus-mars"></i> {{ cat.gender === 'male' ? 'Jantan' : 'Betina' }}
          </span>
          <span class="flex items-center gap-1 text-green-600 font-semibold">
            <i class="fas fa-birthday-cake"></i> {{ cat.age }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  cat: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle-favorite']);

function toggleFavorite() {
  emit('toggle-favorite', props.cat.id);
}
</script>