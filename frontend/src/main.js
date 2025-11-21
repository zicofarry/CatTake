import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Pastikan path ini benar!

// Import CSS global (jika Anda memiliki src/assets/base.css)
// import './assets/base.css'; 
import './style.css'; 

const app = createApp(App);

// Pastikan Vue Router digunakan sebelum app di-mount
app.use(router); 

// Mount aplikasi ke elemen #app
app.mount('#app');