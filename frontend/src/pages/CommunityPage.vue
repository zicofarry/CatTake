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

      <div class="search-bar-mobile md:hidden mb-5">
        <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2">
          <img src="../assets/img/Search.png" alt="Search" class="w-5 h-5 opacity-60 ml-2" />
          <input
            type="text"
            placeholder="Cari di komunitas"
            v-model="searchQuery"
            class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
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
            />
            <div v-if="filteredPosts.length === 0" class="text-gray-400 text-center mt-10">
              Belum ada postingan.
            </div>
          </div>
        </div>

        <aside
          class="flex-col gap-6 md:w-1/3 md:flex"
          :class="activeTab === 'sorotan' ? 'flex' : 'hidden'"
        >
          <div class="search-bar-desktop hidden md:flex">
            <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2 w-full">
              <img src="../assets/img/Search.png" alt="Search" class="w-5 h-5 opacity-60 ml-2" />
              <input
                type="text"
                placeholder="Cari di komunitas"
                v-model="searchQuery"
                class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
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
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Sobat Paws Teraktif</h3>
            <div v-for="member in activeMembers" :key="member.name" class="flex items-center gap-3 mb-3 last:mb-0">
              <img :src="member.profilePic" :alt="member.name" class="w-10 h-10 rounded-full object-cover border border-gray-200" />
              <span class="font-medium">{{ member.name }}</span>
            </div>
          </section>

          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Postingan Populer</h3>
            
            <div v-if="popularPosts.length === 0" class="text-sm text-gray-500 italic text-center py-2">
              Belum ada data populer.
            </div>
            
            <div v-for="popular in popularPosts" :key="popular.id" class="flex items-center gap-3 mb-4 last:mb-0 hover:bg-gray-50 p-1 rounded-lg transition-colors cursor-pointer">
              <img 
                :src="popular.image" 
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
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import PostCard from "../components/PostCard.vue";
import apiClient from "@/api/http";

// State Utama
const allPostsData = ref([]);
const searchQuery = ref("");
const isLoading = ref(true);
const activeTab = ref("untukAnda");

// --- STATE SIDEBAR (BARU) ---
const upcomingEvents = ref([]);
const popularPosts = ref([]);
const catFact = ref({ fact: "Memuat fakta...", image: "/img/logoFaktaKucing.png" });
const activeMembers = ref([
  { name: "Anas", profilePic: "/img/profileAnas.png" },
  { name: "Azmi", profilePic: "/img/profileAzmi.png" },
]);

// --- FUNGSI FETCH API ---
async function fetchPosts() {
  try {
    isLoading.value = true;
    const response = await apiClient.get('/community/posts'); // Panggil API Backend
    allPostsData.value = response.data; // Simpan data ke state
  } catch (error) {
    console.error("Gagal mengambil postingan:", error);
  } finally {
    isLoading.value = false;
  }
}

// --- FETCH DATA SIDEBAR (BARU) ---
async function fetchSidebar() {
  try {
    const response = await apiClient.get('/community/sidebar');
    const data = response.data.data;
    
    upcomingEvents.value = data.events;
    popularPosts.value = data.popular;
    if (data.fact) {
      catFact.value = data.fact;
    }
  } catch (error) {
    console.error("Gagal load sidebar:", error);
  }
}

// Panggil saat komponen dimuat
onMounted(() => {
  fetchPosts();
  fetchSidebar();
});

// Filter pencarian
const filteredPosts = computed(() => {
  // Jika data belum ada, kembalikan array kosong
  if (!allPostsData.value) return [];
  
  if (!searchQuery.value) return allPostsData.value;

  const query = searchQuery.value.toLowerCase().trim();
  return allPostsData.value.filter((post) =>
    [post.title, post.excerpt, post.community, post.author].some((field) =>
      field && field.toLowerCase().includes(query)
    )
  );
});
</script>

<style scoped>
/* Styling menggunakan Tailwind */
</style>