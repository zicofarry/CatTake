<template>
  <div v-if="!isLoggedIn" class="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col justify-center items-center rounded-3xl z-10">
    <p class="text-center text-gray-700 mb-6 font-medium">{{ message }}</p>
    <button 
      @click="goToLogin"
      class="bg-[#E8C32A] hover:bg-amber-500 text-gray-900 font-bold py-3 px-7 rounded-full border-none cursor-pointer shadow-md"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  isLoggedIn: { type: Boolean, default: false },
  message: { type: String, default: 'Kamu perlu login dulu sebelum donasi.' },
  buttonText: { type: String, default: 'Login Sekarang' },
  loginRoute: { type: String, default: '/login' }
});

const router = useRouter();
const isLoggedIn = ref(props.isLoggedIn);

watch(() => props.isLoggedIn, (newVal) => {
  isLoggedIn.value = newVal;
});

function goToLogin() {
  router.push(props.loginRoute);
}
</script>

<style scoped>
</style>
