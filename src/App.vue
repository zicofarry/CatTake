<template>
  <div id="app">
    <AppHeader :isLoggedInProp="isUserLoggedIn" @update-login-status="isUserLoggedIn = $event" /> 
    
    <router-view @user-logged-in="handleUserLogin"></router-view>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
// ... import komponen lain jika ada

const isUserLoggedIn = ref(false); // DEFAULT: BEFORE LOGIN

function handleUserLogin() {
    isUserLoggedIn.value = true;
    // Logika navigasi ke /beranda setelah login bisa ditambahkan di sini jika perlu
}
</script>

<style>
/* Gaya yang benar-benar global, jika ada, ditaruh di sini atau di base.css */
</style>