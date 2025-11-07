<template>
  <main class="bg-[#1A3A34] text-white min-h-screen py-8 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="main-content flex-auto md:w-2/3">
        <h1 class="text-4xl font-bold">Komunitas</h1>
        <p class="text-gray-400 mb-5">
          Tempat berbagi cerita dan menolong kucing bersama
        </p>
      </div>

      <!-- Search Bar (Mobile) -->
      <div class="search-bar-mobile md:hidden mb-5">
        <div class="bg-white rounded-full p-3 shadow-md flex items-center gap-2">
          <img
            src="../assets/img/Search.png"
            alt="Search"
            class="w-5 h-5 opacity-60 ml-2"
          />
          <input
            type="text"
            placeholder="Cari di komunitas"
            v-model="searchQuery"
            class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Tab Navigasi (Mobile) -->
      <div class="flex md:hidden gap-6 border-b border-gray-700 mb-5">
        <button
          @click="activeTab = 'untukAnda'"
          :class="[
            'py-2',
            activeTab === 'untukAnda'
              ? 'border-b-2 border-white font-semibold'
              : 'text-gray-400',
          ]"
        >
          Untuk Anda
        </button>
        <button
          @click="activeTab = 'sorotan'"
          :class="[
            'py-2',
            activeTab === 'sorotan'
              ? 'border-b-2 border-white font-semibold'
              : 'text-gray-400',
          ]"
        >
          Sorotan Komunitas
        </button>
      </div>

      <!-- Konten Utama -->
      <div class="flex flex-col gap-8 md:flex-row md:gap-8">
        <!-- Postingan (Untuk Anda) -->
        <div
          class="main-content flex-auto md:w-2/3 md:block"
          :class="activeTab === 'untukAnda' ? 'block' : 'hidden'"
        >
          <div class="flex flex-col gap-5">
            <PostCard
              v-for="post in filteredPosts"
              :key="post.id"
              :postData="post"
            />
          </div>
        </div>

        <!-- Sidebar (Sorotan Komunitas) -->
        <aside
          class="flex-col gap-6 md:w-1/3 md:flex"
          :class="activeTab === 'sorotan' ? 'flex' : 'hidden'"
        >
          <!-- Search Bar (Desktop) -->
          <div class="search-bar-desktop hidden md:flex">
            <div
              class="bg-white rounded-full p-3 shadow-md flex items-center gap-2 w-full"
            >
              <img
                src="../assets/img/Search.png"
                alt="Search"
                class="w-5 h-5 opacity-60 ml-2"
              />
              <input
                type="text"
                placeholder="Cari di komunitas"
                v-model="searchQuery"
                class="border-none outline-none w-full bg-transparent font-sans text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Event Mendatang -->
          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
                <h3 class="text-lg font-semibold mb-4 text-gray-900">Event Mendatang</h3>
                <div class="flex items-center gap-3 mb-4">
                    <img src="../assets/img/calendar.png" alt="Kalender" class="w-8 h-8 object-contain" />
                    <div>
                <strong class="block text-base">Sterilisasi Gratis</strong>
                <span class="text-sm text-gray-900">15 Oktober 2025</span>
              </div>
            </div>

            <div class="flex items-center gap-3 mb-4">
              <img
                src="../assets/img/time.png"
                alt="Waktu"
                class="w-8 h-8 object-contain"
              />
              <div>
                <strong class="block text-base">Pukul 09:00 WIB</strong>
              </div>
            </div>

            <div class="flex items-center gap-3 mb-4">
              <img
                src="../assets/img/location.png"
                alt="Lokasi"
                class="w-8 h-8 object-contain"
              />
              <div>
                <strong class="block text-base">Klinik CatCare</strong>
              </div>
            </div>
          </section>

          <!-- Sobat Paws Teraktif -->
          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              Sobat Paws Teraktif
            </h3>
            <div
              v-for="member in activeMembers"
              :key="member.name"
              class="flex items-center gap-3 mb-2"
            >
              <img
                :src="member.profilePic"
                :alt="member.name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <span>{{ member.name }}</span>
            </div>
          </section>

          <!-- Postingan Populer -->
          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">
              Postingan Populer
            </h3>
            <div
              v-for="popular in popularPosts"
              :key="popular.title"
              class="flex items-center gap-3 mb-4"
            >
              <img
                :src="popular.image"
                :alt="popular.title"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <span>{{ popular.title }}</span>
            </div>
          </section>

          <!-- Fakta Kucing -->
          <section class="bg-white text-gray-800 rounded-xl p-5 shadow-lg">
            <h3 class="text-lg font-semibold mb-4 text-gray-900">Fakta Kucing</h3>

            <div class="flex items-center gap-3">
              <img
                :src="catFact.image"
                alt="Fakta Kucing"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <p class="text-sm">{{ catFact.fact }}</p>
            </div>

            <div class="text-right mt-4">
              <router-link
                to="/fakta"
                class="inline-block bg-[#78C89F] text-gray-800 font-bold text-sm py-2 px-4 rounded-lg hover:bg-[#6abf95] transition-colors"
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
import { ref, computed } from "vue";
import PostCard from "../components/PostCard.vue";
import { allPosts } from "../data/posts.js";

// Data utama
const allPostsData = ref(allPosts);
const searchQuery = ref("");

// Tab navigasi
const activeTab = ref("untukAnda");

// Data sidebar
const activeMembers = ref([
  { name: "Anas", profilePic: "/img/profileAnas.png" },
  { name: "Azmi", profilePic: "/img/profileAzmi.png" },
]);

const popularPosts = ref([
  { title: "Tips membuat raw food untuk kucing", image: "/img/postinganPopuler1.png" },
  { title: "Oyen sembuh setelah di sterilisasi", image: "/img/postinganPopuler2.png" },
]);

const catFact = ref({
  fact: "Kucing tidur 12–16 jam sehari",
  image: "/img/logoFaktaKucing.png",
});

// Filter pencarian
const filteredPosts = computed(() => {
  if (!searchQuery.value) return allPostsData.value;

  const query = searchQuery.value.toLowerCase().trim();
  return allPostsData.value.filter((post) =>
    [post.title, post.excerpt, post.community, post.author].some((field) =>
      field.toLowerCase().includes(query)
    )
  );
});
</script>

<style scoped>
/* Kosongkan, styling menggunakan Tailwind */
</style>