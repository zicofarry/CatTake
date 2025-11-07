<template>
  <div id="app">
    <AppHeader 
      :userRole="userRole" 
      @update-login-status="handleUpdateLoginStatus" 
    /> 
    
    <router-view @user-logged-in="handleUserLogin"></router-view>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';

// State Utama: guest, user, atau shelter. Default diambil dari localStorage.
const userRole = ref(localStorage.getItem('userRole') || 'guest'); 

// Fungsi yang dipanggil dari LoginPage/SignupPage saat login berhasil
function handleUserLogin(role) {
    if (role === 'user' || role === 'shelter') {
        userRole.value = role;
        localStorage.setItem('userRole', role); // Simpan status di localStorage
    }
}

// Fungsi yang dipanggil dari AppHeader saat Sign Out
function handleUpdateLoginStatus(status) {
    if (status === false) {
        userRole.value = 'guest';
        localStorage.removeItem('userRole');
    }
}

// Cek status saat aplikasi dimuat pertama kali
onMounted(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
        userRole.value = storedRole;
    }
});
</script>

<style>
/* Gaya yang benar-benar global, jika ada, ditaruh di sini atau di base.css */
</style>