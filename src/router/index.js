import { createRouter, createWebHistory } from 'vue-router'

// Import semua komponen halaman
import HomePage from '../pages/HomePage.vue'
import ReportPage from '../pages/ReportPage.vue'
import AdoptPage from '../pages/AdoptPage.vue'
import AdoptionDetail from '../pages/AdoptionDetail.vue' // Contoh: Pastikan Anda membuat file ini
import FAQPage from '../pages/FAQPage.vue'
import DonationPage from '../pages/DonationPage.vue'
import LoginPage from '../pages/LoginPage.vue' // <-- Komponen Baru
import SignupPage from '../pages/SignupPage.vue' // <-- Komponen Baru
import CommunityPage from '../pages/CommunityPage.vue'
import DetailPage from '../pages/DetailPage.vue'


const router = createRouter({
  // Menggunakan history mode untuk URL yang bersih (tanpa #)
  history: createWebHistory(), 
  
  routes: [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/lapor', name: 'Lapor', component: ReportPage },
    { path: '/adopsi', name: 'Adopsi', component: AdoptPage },
    // Contoh rute dinamis untuk detail adopsi
    { path: '/adopsi/:id', name: 'AdopsiDetail', component: AdoptionDetail }, 
    { path: '/faq', name: 'FAQ', component: FAQPage },
    { path: '/komunitas', name: 'Komunitas', component: CommunityPage }, // <-- Rute Baru
    { path: '/donasi', name: 'Donasi', component: DonationPage },
    { path: '/login', name: 'Login', component: LoginPage }, // <-- Rute Login
    { path: '/signup', name: 'Signup', component: SignupPage }, // <-- Rute Sign Up
    { path: '/profile', name: 'Profile', component: DetailPage }, // <-- Rute Sign Up
  ],

  // Pastikan halaman di-scroll ke atas saat berpindah rute
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router