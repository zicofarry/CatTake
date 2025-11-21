import { createRouter, createWebHistory } from 'vue-router'

// Import semua komponen halaman
import HomePage from '../pages/HomePage.vue'
import ReportPage from '../pages/ReportPage.vue'
import AdoptPage from '../pages/AdoptPage.vue'
import AdoptionDetail from '../pages/AdoptionDetail.vue' 
import FAQPage from '../pages/FAQPage.vue'
import DonationPage from '../pages/DonationPage.vue'
import LoginPage from '../pages/LoginPage.vue' 
import SignupPage from '../pages/SignupPage.vue' 
import CommunityPage from '../pages/CommunityPage.vue'
import DetailPage from '../pages/DetailPage.vue'
import PostDetailPage from '../pages/PostDetailPage.vue'
import FaktaKucingPage from '../pages/FaktaKucingPage.vue'
import TrackingPage from '../pages/TrackingPage.vue'
import DriverPage from '../pages/DriverPage.vue'

const router = createRouter({
  // Menggunakan history mode untuk URL yang bersih (tanpa #)
  history: createWebHistory(), 
  
  routes: [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/lapor', name: 'Lapor', component: ReportPage },
    { path: '/adopsi', name: 'Adopsi', component: AdoptPage },
    { path: '/adopsi/:id', name: 'AdopsiDetail', component: AdoptionDetail }, 
    { path: '/faq', name: 'FAQ', component: FAQPage },
    { path: '/komunitas', name: 'Komunitas', component: CommunityPage }, 
    { path: '/donasi', name: 'Donasi', component: DonationPage },
    { path: '/login', name: 'Login', component: LoginPage }, 
    { path: '/signup', name: 'Signup', component: SignupPage }, 
    { path: '/profile', name: 'Profile', component: DetailPage }, 
    { path: '/post/:id', name: 'Post', component: PostDetailPage }, 
    { path: '/fakta', name: 'Fakta', component: FaktaKucingPage }, 
    { path: '/track', name: 'Track', component: TrackingPage }, 
    { path: '/driver', name: 'Driver', component: DriverPage }
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