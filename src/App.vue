<template>
  <div id="app">
    <AppHeader /> 
    
    <router-view></router-view>

    </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
// Pastikan semua gaya global (base.css) diimpor di main.js atau di App.vue
</script>

<style>
/* Gaya yang benar-benar global, jika ada, ditaruh di sini atau di base.css */
</style>