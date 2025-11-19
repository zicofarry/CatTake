<template>
  <div id="app">
    <AppHeader 
      :userRole="userRole" 
      :profileData="profileData"
      @update-login-status="handleUpdateLoginStatus" 
    /> 
    
    <router-view 
      :isLoggedInProp="isUserLoggedIn" 
      @user-logged-in="handleUserLogin"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AppHeader from './components/AppHeader.vue';
import apiClient from '@/api/http';
import { jwtDecode } from 'jwt-decode';

// State Utama: guest, user, atau shelter. Default diambil dari localStorage.
const userRole = ref(localStorage.getItem('userRole') || 'guest'); 
const profileData = ref(null); // <-- State baru untuk menyimpan data dinamis

const isUserLoggedIn = computed(() => userRole.value !== 'guest');

// Ambil ID Pengguna dari token/localStorage
function getUserId() {
    const token = localStorage.getItem('userToken');
    if (!token) return null;
    
    try {
        const decoded = jwtDecode(token); // Mendekode token
        return decoded.id; // Mengambil ID pengguna dari payload token
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
    // return 5; // <-- Gunakan ID dummy sementara (misal ID 3)
}

async function fetchProfileData() {
    const userId = getUserId();
    const role = userRole.value;

    if (role !== 'guest' && userId) {
        try {
            // Panggil endpoint backend
            const response = await apiClient.get(`/users/profile/${userId}/${role}`); 
            profileData.value = response.data; // Simpan data profil
            // DEBUGGING POINT 1: Apakah data profil diterima?
    console.log("DEBUG A: Profil diterima:", response.data.name, response.data.email); 

    // DEBUGGING POINT 2: Pastikan userRole reaktif tetap benar
    console.log("DEBUG B: userRole (App.vue) setelah fetch:", userRole.value);
        } catch (e) {
            console.error("Failed to fetch profile:", e);
            // Jika gagal, log out pengguna
            handleUpdateLoginStatus(false); 
        }
    }
}

// Fungsi yang dipanggil dari LoginPage/SignupPage saat login berhasil
function handleUserLogin(role) {
    if (['individu', 'shelter', 'admin', 'driver'].includes(role)) {
      userRole.value = role;
      localStorage.setItem('userRole', role); 
      
      fetchProfileData();
    }
}

// Fungsi yang dipanggil dari AppHeader saat Sign Out
function handleUpdateLoginStatus(status) {
    if (status === false) {
        userRole.value = 'guest';
        localStorage.removeItem('userRole');
        profileData.value = null;
    }
}

// Cek status saat aplikasi dimuat pertama kali
onMounted(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
        userRole.value = storedRole;
    }

    fetchProfileData();
});
</script>

<style>
/* Gaya yang benar-benar global, jika ada, ditaruh di sini atau di base.css */
</style>