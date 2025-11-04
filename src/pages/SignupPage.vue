<template>
  <div class="auth-wrapper">
    <div class="login-box">
      <div class="logo-header">
        <img src="/assets/img/catTakePutih.png" alt="Logo CatTake" class="logo-image">
      </div>
      
      <h2>Sign Up</h2>
      <p class="subtitle">Please enter your details</p>
      
      <form @submit.prevent="handleSignup">
        <div class="input-group">
          <input type="text" v-model="fullName" placeholder="Full Name" required>
        </div>
        <div class="input-group">
          <input type="text" v-model="signupUsername" placeholder="Username" required>
        </div>
        <div class="input-group">
          <input type="password" v-model="signupPassword" placeholder="Password" required>
        </div>
        <div class="input-group">
          <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required>
        </div>
        
        <button type="submit" class="btn btn-auth">Sign Up</button>
      </form>
      
      <div class="separator"><span>or</span></div>
      
      <button class="btn-google">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo">
        Sign Up with Google
      </button>
      
      <div class="auth-link">
        <p>Already have an account? 
          <router-link to="/login">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter(); 
const fullName = ref('');
const signupUsername = ref('');
const signupPassword = ref('');
const confirmPassword = ref('');

function handleSignup() {
  if (signupPassword.value !== confirmPassword.value) {
    alert('Password dan Konfirmasi Password harus sama!');
    return;
  }
  
  alert(`Attempting to sign up user: ${signupUsername.value}`);
  // Jika registrasi sukses, Anda mungkin ingin mengarahkan ke halaman login
  // router.push('/login'); 
}
</script>

<style scoped>
/* ====================================
   Gaya Auth (Dipindahkan dari login.css & signup.css)
   Semua gaya di sini identik dengan LoginPage.vue, kecuali penanganan ikon input
   ==================================== */

/* Container Utama dan Latar Belakang Gelombang */
.auth-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f0f2f5; 
    position: relative;
    padding: 20px;
    z-index: 2; 
}

/* Gelombang Atas (Hijau Tua) */
.auth-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 65%;
    background: #2D5B4D; 
    clip-path: ellipse(80% 60% at 50% 40%);
    z-index: 1; 
}

/* Gelombang Bawah (Hijau Muda/Abu) */
.auth-wrapper::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 65%;
    background: #E8EAE3; 
    clip-path: ellipse(85% 60% at 50% 70%);
    z-index: 0;
}

/* Kotak Form */
.login-box {
    background-color: #ffffff;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
    position: relative;
    z-index: 3; 
}

/* Logo */
.logo-header {
    margin-bottom: 20px;
}
.logo-image {
    width: 250px;
    height: auto;
}

/* Judul */
.login-box h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #333;
}
.login-box .subtitle {
    color: #888;
    margin-bottom: 30px;
}

/* Input Group */
.input-group {
    position: relative;
    margin-bottom: 20px;
}

.input-group input {
    width: 100%;
    padding: 12px 15px; 
    border: 1px solid #ddd;
    border-radius: 10px;
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); 
    /* Input Sign Up TIDAK memiliki ikon, jadi padding normal */
    padding-left: 15px; 
}

/* Tombol Auth */
.btn-auth {
    width: auto;
    padding: 12px 60px;
    background-color: #FBC02D;
    border: none;
    border-radius: 50px;
    color: #ffffff;
    margin-top: 10px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(rgba(251, 192, 45, 0.75)); 
    transition: background-color 0.3s;
}
.btn-auth:hover {
    background-color: #f9a825;
}

/* Separator "or" */
.separator {
    display: flex;
    align-items: center;
    text-align: center;
    color: #aaa;
    margin: 25px 0;
}
.separator::before, .separator::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
    margin: 0 .5em;
}

/* Tombol Google */
.btn-google {
    background-color: #fff;
    color: #555;
    border: 1px solid #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
}
.btn-google img {
    width: 20px;
    height: 20px;
}

/* Link Bawah */
.auth-link {
    margin-top: 25px;
    font-size: 14px;
    color: #555;
}
.auth-link a {
    color: #FBC02D;
    text-decoration: none;
    font-weight: 600;
}
</style>
