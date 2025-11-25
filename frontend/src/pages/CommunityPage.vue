<template>
 <main 
    class="bg-[#2c473c] text-white min-h-screen pt-32 pb-20 font-sans bg-fixed bg-center bg-repeat"
    style="background-image: url('/img/background.png'); background-size: 360px;"
>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="main-content flex-auto md:w-2/3">
        <h1 class="text-4xl font-bold">Komunitas</h1>
        <p class="text-gray-400 mb-5">
          Tempat berbagi cerita dan menolong kucing bersama
        </p>
      </div>

      <div class="search-bar-mobile md:hidden mb-5 relative z-30">
        <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2">
          <img src="../assets/img/Search.png" alt="Search" class="w-5 h-5 opacity-60 ml-2" />
          <input
            type="text"
            placeholder="Cari di komunitas..."
            v-model="searchQuery"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400"
          />
        </div>

        <transition name="fade">
            <div v-if="isSearchFocused && searchQuery" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <ul v-if="searchSuggestions.length > 0">
                    <li 
                        v-for="post in searchSuggestions" 
                        :key="post.id" 
                        @click="goToPost(post.id)"
                        class="p-3 px-4 hover:bg-gray-50 border-b border-gray-50 last:border-none cursor-pointer flex items-center gap-3 transition-colors"
                    >
                        <img 
                            :src="resolveImageUrl(post.postImg)" 
                            class="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                            @error="$event.target.src='/img/logoFaktaKucing.png'" 
                        >
                        <div class="flex-grow min-w-0">
                            <p class="text-sm font-bold text-gray-800 line-clamp-1 text-left">{{ post.title }}</p>
                            <p class="text-xs text-gray-500 text-left truncate">Oleh {{ post.author }}</p>
                        </div>
                    </li>
                </ul>
                <div v-else class="p-4 text-center text-gray-500 text-sm">
                    Tidak ada hasil untuk "{{ searchQuery }}"
                </div>
            </div>
        </transition>
      </div>

      <div class="flex md:hidden justify-center gap-6 border-b border-gray-700 mb-5">
        <button
          @click="activeTab = 'untukAnda'"
          :class="['py-2', activeTab === 'untukAnda' ? 'border-b-2 border-white font-semibold' : 'text-gray-400']"
        >
          Untuk Anda
        </button>
        <button
          @click="activeTab = 'sorotan'"
          :class="['py-2', activeTab === 'sorotan' ? 'border-b-2 border-white font-semibold' : 'text-gray-400']"
        >
          Sorotan Komunitas
        </button>
      </div>

      <div class="flex flex-col gap-8 md:flex-row md:gap-8">
        
        <div
          class="main-content flex-auto md:w-2/3 md:block"
          :class="activeTab === 'untukAnda' ? 'block' : 'hidden'"
        >
          <div v-if="isLoading" class="text-center py-10">Memuat postingan...</div>
          <div v-else class="flex flex-col gap-5">
            <PostCard
              v-for="post in filteredPosts"
              :key="post.id"
              :postData="post"
              :current-user-id="currentUserId"
              @refresh="fetchPosts" 
            />
            <div v-if="filteredPosts.length === 0" class="text-gray-400 text-center mt-10">
              {{ searchQuery ? 'Tidak ada postingan yang cocok.' : 'Belum ada postingan.' }}
            </div>
          </div>
        </div>

        <aside
          class="flex-col gap-6 md:w-1/3 md:flex"
          :class="activeTab === 'sorotan' ? 'flex' : 'hidden'"
        >
          <div class="search-bar-desktop hidden md:block relative z-30">
            <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2 w-full">
              <img src="../assets/img/Search.png" alt="Search" class="w-5 h-5 opacity-60 ml-2" />
              <input
                type="text"
                placeholder="Cari topik atau diskusi..."
                v-model="searchQuery"
                @focus="handleSearchFocus"
                @blur="handleSearchBlur"
                class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400"
              />
            </div>

            <transition name="fade">
                <div v-if="isSearchFocused && searchQuery" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <ul v-if="searchSuggestions.length > 0">
                        <li 
                            v-for="post in searchSuggestions" 
                            :key="post.id" 
                            @click="goToPost(post.id)"
                            class="p-3 px-4 hover:bg-gray-50 border-b border-gray-50 last:border-none cursor-pointer flex items-center gap-3 transition-colors"
                        >
                            <img 
                                :src="resolveImageUrl(post.postImg)" 
                                class="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                                @error="$event.target.src='/img/logoFaktaKucing.png'" 
                            >
                            <div class="flex-grow min-w-0">
                                <p class="text-sm font-bold text-gray-800 line-clamp-1 text-left">{{ post.title }}</p>
                                <p class="text-xs text-gray-500 text-left truncate">Oleh {{ post.author }}</p>
                            </div>
                        </li>
                    </ul>
                    <div v-else class="p-4 text-center text-gray-500 text-sm">
                        Tidak ada hasil untuk "{{ searchQuery }}"
                    </div>
                </div>
            </transition>
          </div>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Event Mendatang</h3>
            
            <div v-if="upcomingEvents.length === 0" class="text-sm text-gray-500 italic text-center py-2">
                Belum ada event mendatang.
            </div>

            <div v-for="(event, idx) in upcomingEvents" :key="idx" class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0 last:mb-0">
                <div class="flex items-center gap-3 mb-2">
                  <img src="../assets/img/calendar.png" class="w-6 h-6 object-contain" />
                  <div>
                    <strong class="block text-sm md:text-base text-gray-800">{{ event.title }}</strong>
                    <span class="text-xs text-gray-500">{{ event.date }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 mb-2 pl-1">
                  <img src="../assets/img/time.png" class="w-5 h-5 object-contain opacity-70" />
                  <span class="text-xs md:text-sm font-medium">{{ event.time }}</span>
                </div>
                <div class="flex items-center gap-3 pl-1">
                  <img src="../assets/img/location.png" class="w-5 h-5 object-contain opacity-70" />
                  <span class="text-xs md:text-sm font-medium">{{ event.location }}</span>
                </div>
            </div>
          </section>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Kucing Hilang</h3>
            
            <div v-if="lostCatHighlights.length === 0" class="text-sm text-gray-500 italic text-center py-2">
                Tidak ada laporan kucing hilang saat ini.
            </div>
            
            <div v-for="(cat, idx) in lostCatHighlights" :key="idx" class="flex items-center gap-3 mb-4 last:mb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
              <img 
                :src="resolveImageUrl(cat.image)" 
                :alt="cat.name" 
                class="w-12 h-12 rounded-full object-cover bg-gray-200 border border-gray-200 flex-shrink-0" 
                @error="$event.target.src='/img/kucingtidur.png'"
              />
              <router-link to="/lost-cats" class="text-sm font-medium text-gray-800 hover:text-[#78C89F] transition-colors line-clamp-2 leading-snug">
                  <strong class="text-sm block text-gray-800 font-bold mb-1 line-clamp-1">{{ cat.name }}</strong>
                  <p class="text-xs leading-relaxed text-gray-700">Terakhir terlihat di: {{ cat.address.substring(0, 20) }}...</p>
                  <p v-if="cat.reward > 0" class="text-xs leading-relaxed text-gray-800 mt-1 font-bold">Reward: Rp{{ cat.reward.toLocaleString('id-ID') }}</p>
              </router-link>
            </div>

            <div class="text-right mt-4" v-if="lostCatHighlights.length > 0">
                <router-link
                    to="/lost-cats"
                    class="inline-block bg-[#78C89F] text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-[#5ba880] transition-colors shadow-sm"
                >
                    Cek Lainnya
                </router-link>
            </div>
          </section>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Leaderboard Paws (Poin)</h3>
            
            <div v-if="activeMembersByPoints.length === 0" class="text-sm text-gray-500 italic text-center py-2">
                Belum ada data poin.
            </div>

            <div v-for="(member, index) in activeMembersByPoints" :key="'point-' + member.name" class="flex items-center gap-3 mb-3 last:mb-0">
              <div class="relative">
                  <img :src="resolveImageUrl(member.profilePic)" :alt="member.name" class="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <div v-if="index < 3" class="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-white shadow-sm" 
                       :class="index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-gray-700' : 'bg-orange-300 text-white'">
                      <i class="fas fa-crown"></i>
                  </div>
              </div>
              <div class="flex-grow">
                  <span class="font-bold text-sm block">{{ member.name }}</span>
                  <span class="text-xs text-gray-500 font-bold text-[#3A5F50]">{{ member.score.toLocaleString('id-ID') }} Poin</span>
              </div>
            </div>
          </section>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Sobat Paws Teraktif (Aktivitas)</h3>
            
            <div v-if="activeMembersByActivity.length === 0" class="text-sm text-gray-500 italic text-center py-2">
                Belum ada data aktivitas.
            </div>

            <div v-for="(member, index) in activeMembersByActivity" :key="'activity-' + member.name" class="flex items-center gap-3 mb-3 last:mb-0">
              <div class="relative">
                  <img :src="resolveImageUrl(member.profilePic)" :alt="member.name" class="w-10 h-10 rounded-full object-cover border border-gray-200" />
                  <div v-if="index < 3" class="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-white shadow-sm" 
                       :class="index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-gray-700' : 'bg-orange-300 text-white'">
                      <i class="fas fa-medal"></i>
                  </div>
              </div>
              <div class="flex-grow">
                  <span class="font-bold text-sm block">{{ member.name }}</span>
                  <span class="text-xs text-gray-500">{{ member.score.toLocaleString('id-ID') }} Aktivitas</span>
              </div>
            </div>
          </section>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Postingan Populer</h3>
            
            <div v-if="popularPosts.length === 0" class="text-sm text-gray-500 italic text-center py-2">
              Belum ada data populer.
            </div>
            
            <div v-for="popular in popularPosts" :key="popular.id" class="flex items-center gap-3 mb-4 last:mb-0 hover:bg-gray-50 p-1 rounded-lg transition-colors cursor-pointer">
              <img 
                :src="resolveImageUrl(popular.image)" 
                :alt="popular.title" 
                class="w-12 h-12 rounded-lg object-cover bg-gray-200 border border-gray-200 flex-shrink-0" 
                @error="$event.target.src='/img/postinganPopuler1.png'"
              />
              <router-link :to="'/post/' + popular.id" class="text-sm font-medium text-gray-800 hover:text-[#78C89F] transition-colors line-clamp-2 leading-snug">
                  {{ popular.title }}
              </router-link>
            </div>
          </section>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Fakta Kucing</h3>
            <div class="flex items-start gap-4">
              <img 
                :src="catFact.image" 
                alt="Fakta Kucing" 
                class="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" 
                @error="$event.target.src='/img/logoFaktaKucing.png'"
              />
              <p class="text-sm leading-relaxed text-gray-700">{{ catFact.fact }}</p>
            </div>
            <div class="text-right mt-4">
              <router-link
                to="/fakta"
                class="inline-block bg-[#78C89F] text-white font-bold text-xs py-2 px-4 rounded-full hover:bg-[#5ba880] transition-colors shadow-sm"
              >
                Fakta Lainnya
              </router-link>
            </div>
          </section>
        </aside>
      </div>
    </div>

    <button 
      @click="showCreateModal = true"
      class="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#78C89F] hover:bg-[#5ba880] text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-110 group"
      title="Buat Postingan Baru"
    >
      <i class="fas fa-plus text-2xl md:text-3xl"></i>
    </button>

    <div 
      v-if="showCreateModal" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md px-4 transition-all duration-300"
      @click.self="closeModal"
    >
      <div class="bg-white text-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up transform transition-all border border-white/20">
        
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 class="text-lg font-bold text-gray-700">Buat Postingan Baru</h3>
          <button 
            @click="closeModal" 
            class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6">
          <form @submit.prevent="submitPost" class="space-y-5">
            
            <div class="group">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Judul <span class="text-gray-300 font-normal normal-case"></span></label>
              <input 
                v-model="newPost.title" 
                type="text" 
                class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#78C89F] focus:border-transparent outline-none transition-all"
                placeholder="Berikan judul menarik..." 
              />
            </div>

            <div class="group">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Cerita Kamu</label>
              <textarea 
                v-model="newPost.content" 
                rows="4" 
                class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-[#78C89F] focus:border-transparent outline-none transition-all resize-none"
                placeholder="Ceritakan pengalamanmu atau tanyakan sesuatu..." 
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Foto <span class="text-gray-300 font-normal normal-case">(Opsional)</span></label>
              
              <div v-if="!previewImage" class="flex items-center gap-3">
                <label class="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-500 w-full py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#78C89F] flex flex-col items-center justify-center gap-2 transition-all group">
                  <div class="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i class="fas fa-camera text-[#78C89F]"></i>
                  </div>
                  <span class="text-sm font-medium group-hover:text-[#78C89F]">Klik untuk pilih foto</span>
                  <input type="file" @change="handleFileUpload" class="hidden" accept="image/*" />
                </label>
              </div>
              
              <div v-else class="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <img :src="previewImage" class="w-full h-48 object-cover bg-gray-100" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button type="button" @click="removeImage" class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
                        Hapus Foto
                    </button>
                </div>
                <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md truncate max-w-[200px]">
                    {{ newPost.file?.name }}
                </div>
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-3">
              <button 
                type="button" 
                @click="closeModal" 
                class="px-6 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="bg-[#78C89F] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#5ba880] hover:shadow-[#78C89F]/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin"></i> Mengirim...</span>
                <span v-else>Posting <i class="fas fa-paper-plane ml-1"></i></span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import PostCard from "../components/PostCard.vue";
import apiClient from "@/api/http";
import { jwtDecode } from 'jwt-decode';

const router = useRouter();

// State Utama
const allPostsData = ref([]);
const searchQuery = ref("");
const isLoading = ref(true);
const activeTab = ref("untukAnda");
const currentUserId = ref(null);

// State Dropdown Pencarian
const isSearchFocused = ref(false);

// --- STATE SIDEBAR ---
const upcomingEvents = ref([]);
const popularPosts = ref([]);
const lostCatHighlights = ref([]); // State Data Kucing Hilang
const catFact = ref({ fact: "Memuat fakta...", image: "/img/logoFaktaKucing.png" });
const activeMembersByActivity = ref([]); // Leaderboard Keaktifan
const activeMembersByPoints = ref([]);    // Leaderboard Poin

// --- STATE UNTUK MODAL POST ---
const showCreateModal = ref(false);
const isSubmitting = ref(false);
const newPost = ref({ title: "", content: "", file: null });
const previewImage = ref(null);

// Helper Image URL
function resolveImageUrl(path) {
    // 1. Handle Null/Undefined atau string kosong
    if (!path || path === 'NULL' || path === 'NULL.JPG' || path === 'null') {
        return '/img/NULL.JPG'; // Pastikan file placeholder ini ada di frontend
    }

    // 2. Handle URL Eksternal (misal dari Google Login atau link luar)
    if (path.startsWith('http')) {
        return path;
    }

    // --- BAGIAN PENTING: Ambil URL Server Dinamis ---
    // Ambil dari .env (contoh: "http://localhost:3000/api/v1")
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    // Hapus '/api/v1' karena file statis ada di root, bukan di dalam route API
    const serverUrl = apiBase.replace('/api/v1', ''); 

    // 3. Handle Path Lengkap dari Backend (misal: /public/img/...)
    if (path.startsWith('/public/')) {
        return `${serverUrl}${path}`;
    }

    // 4. Handle Berdasarkan Prefix Nama File (Manual Mapping)
    // Ini berguna jika di database cuma tersimpan nama file "profile-123.jpg"
    
    // Foto Profil (User/Driver/Shelter)
    if (path.startsWith('profile-') || path.startsWith('driver-')) {
        return `${serverUrl}/public/img/profile/${path}`;
    }

    // Foto Kucing Hilang
    if (path.startsWith('lost-')) {
        return `${serverUrl}/public/img/lost_cat/${path}`;
    }
    
    // Foto Laporan Penemuan (Rescue)
    if (path.startsWith('report-')) {
        return `${serverUrl}/public/img/report_cat/${path}`;
    }

    // Foto Kucing Adopsi (Cat) - Tambahan dari analisa file CatController.js
    if (path.startsWith('cat-')) {
        return `${serverUrl}/public/img/cats/${path}`;
    }

    // Foto Bukti Transfer - Tambahan dari DonationController.js
    if (path.startsWith('proof-')) {
        return `${serverUrl}/public/img/proof_payment/${path}`;
    }

    // Foto QRIS Shelter - Tambahan dari ShelterProfilePage
    if (path.startsWith('qr-')) {
        return `${serverUrl}/public/img/qr_img/${path}`;
    }

    // Foto Dokumen Legalitas & KTP - Tambahan untuk dokumen
    if (path.startsWith('ktp-')) {
        return `${serverUrl}/public/img/identity/${path}`;
    }
    
    if (path.startsWith('rescue-')) {
        return `${serverUrl}/public/img/rescue_proof/${path}`;
    }

    if (path.startsWith('sim-')) {
        return `${serverUrl}/public/img/licence/${path}`;
    }

    if (path.startsWith('post-')) {
        return `${serverUrl}/public/img/post/${path}`;
    }

    // 5. Default Fallback (Asumsi aset statis lokal di folder public Frontend)
    // Jika tidak cocok dengan pola di atas, anggap file ada di frontend/public/img/
    return `/img/${path}`;
}

// --- LOGIK PENCARIAN BARU ---
function handleSearchFocus() {
    isSearchFocused.value = true;
}

function handleSearchBlur() {
    // Delay agar klik pada item dropdown sempat tereksekusi
    setTimeout(() => {
        isSearchFocused.value = false;
    }, 200);
}

function goToPost(id) {
    router.push(`/post/${id}`);
    searchQuery.value = ""; // Reset pencarian setelah klik
    isSearchFocused.value = false;
}

// Filter pencarian untuk Dropdown & List
const filteredPosts = computed(() => {
  if (!allPostsData.value) return [];
  if (!searchQuery.value) return allPostsData.value;

  const query = searchQuery.value.toLowerCase().trim();
  return allPostsData.value.filter((post) =>
    [post.title, post.excerpt, post.community, post.author].some((field) =>
      field && field.toLowerCase().includes(query)
    )
  );
});

// Data untuk dropdown autocomplete (misal ambil 5 teratas)
const searchSuggestions = computed(() => {
    if (!searchQuery.value) return [];
    return filteredPosts.value.slice(0, 5);
});

// --- FUNGSI FETCH API ---
async function fetchPosts() {
  try {
    isLoading.value = true;
    const response = await apiClient.get('/community/posts');
    allPostsData.value = response.data; 
  } catch (error) {
    console.error("Gagal mengambil postingan:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- FETCH SIDEBAR ---
async function fetchSidebar() {
  try {
    const response = await apiClient.get('/community/sidebar');
    const data = response.data.data;
    
    upcomingEvents.value = data.events;
    popularPosts.value = data.popular;
    lostCatHighlights.value = data.missing;
    
    // AMBIL KEDUA LIST LEADERBOARD
    activeMembersByActivity.value = data.activeMembersByActivity;
    activeMembersByPoints.value = data.activeMembersByPoints;
    
    if (data.fact) {
      catFact.value = data.fact;
    }
  } catch (error) {
    console.error("Gagal load sidebar:", error);
  }
}

// --- LOGIKA SUBMIT POST ---
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    newPost.value.file = file;
    const reader = new FileReader();
    reader.onload = (e) => { previewImage.value = e.target.result; };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  newPost.value.file = null;
  previewImage.value = null;
}

function closeModal() {
  showCreateModal.value = false;
  newPost.value = { title: "", content: "", file: null };
  previewImage.value = null;
}

async function submitPost() {
  if (!newPost.value.content) return;

  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("content", newPost.value.content);
    if (newPost.value.title) formData.append("title", newPost.value.title);
    if (newPost.value.file) formData.append("file", newPost.value.file);

    // Set Content-Type ke undefined agar browser otomatis mengatur boundary-nya
    await apiClient.post("/community/posts", formData, {
        headers: { "Content-Type": undefined } 
    });

    closeModal();
    fetchPosts(); 
  } catch (error) {
    console.error("Gagal membuat postingan:", error);
    const msg = error.response?.data?.error || "Gagal memposting. Pastikan Anda sudah login.";
    alert(msg);
  } finally {
    isSubmitting.value = false;
  }
}

// Panggil saat komponen dimuat
onMounted(() => {
  const token = localStorage.getItem('userToken');
  if (token) {
      try {
          const decoded = jwtDecode(token);
          currentUserId.value = decoded.id;
      } catch (e) {}
  }
  fetchPosts();
  fetchSidebar();
});
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

/* Transisi Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>