import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css'; 
import vue3GoogleLogin from 'vue3-google-login';

const app = createApp(App);

// Pastikan Vue Router digunakan sebelum app di-mount
app.use(router); 
app.use(vue3GoogleLogin, {
  clientId: '899392310680-d4566vlejmbdu2ltobbj1sbliu2tq4gr.apps.googleusercontent.com' // Samakan dengan Backend
});

// Mount aplikasi ke elemen #app
app.mount('#app');