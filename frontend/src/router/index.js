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
import LostCatListPage from '../pages/LostCatListPage.vue' // <-- Update Import
import TrackingPage from '../pages/TrackingPage.vue'
import DriverPage from '../pages/DriverPage.vue'
import ShelterDriverPage from '../pages/ShelterDriverPage.vue'
import ShelterCatPage from '../pages/ShelterCatPage.vue';
import ShelterProfilePage from '../pages/ShelterProfilePage.vue';
import AdminDashboard from '../pages/AdminDashboard.vue'

const router = createRouter({
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
    { path: '/shelter/profile', name: 'ShelterProfile', component: ShelterProfilePage, meta: { requiresAuth: true, role: 'shelter' } },
    
    // [UPDATE] Gunakan komponen LostCatListPage
    { path: '/lost-cats', name: 'KucingHilang', component: LostCatListPage }, 
    
    { path: '/track', name: 'Track', component: TrackingPage }, 
    { path: '/driver/tasks', name: 'DriverTask', component: DriverPage, meta: { requiresAuth: true, role: 'driver' } },
    { path: '/driver/tracking/:id', name: 'DriverTrackingDetail', component: TrackingPage, meta: { requiresAuth: true, role: 'driver' } },
    { path: '/shelter/driver', name: 'ShelterDriver', component: ShelterDriverPage },
    { path: '/shelter/cats', name: 'ShelterCats', component: ShelterCatPage, meta: { requiresAuth: true, role: 'shelter' } },
    { path: '/driver', redirect: '/driver/tasks' },
    {
        path: '/admin/dashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: 'admin' } // Tandai butuh role admin
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('userToken');
  const userRole = localStorage.getItem('userRole'); 

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.role && to.meta.role !== userRole) {
    alert("Anda tidak punya akses ke halaman ini!");
    next('/'); 
  } else {
    next();
  }
});

export default router;