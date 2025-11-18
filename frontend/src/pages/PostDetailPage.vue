<script setup>
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { allPosts } from '../data/posts.js' // Impor data postingan

const route = useRoute()
const postId = parseInt(route.params.id) 

const post = computed(() => {
  return allPosts.value.find(p => p.id === postId)
})

// --- LOGIKA KOMENTAR (INI YANG BERUBAH) ---

// 1. Hapus 'ref' komentar yang di-hardcode.
// 2. Buat 'ref' komentar baru yang mengambil data dari 'post.value'.
//    Kita pakai '...' (spread operator) untuk membuat salinan, 
//    jadi komentar baru tidak mengubah data asli.
const comments = ref(post.value ? [...post.value.commentData] : [])

const newComment = ref('')

function addComment() {
  if (newComment.value.trim() === '') return
  // 3. 'push' ke 'ref' lokal. Ini sudah benar.
  comments.value.push({
    id: Date.now(),
    user: 'Diana', // Nanti bisa diganti user login
    text: newComment.value
  })
  newComment.value = ''
}
</script>

<template>
  <div class="bg-[#2c473c] min-h-screen p-5 md:p-10 font-sans"

    style="
        background-image: url('/img/background.png');
        background-size: 360px; /* ubah ukuran pola */
    ">
    
    <router-link 
      to="/komunitas" 
      class="inline-block bg-[#2D4A45] text-white font-semibold py-2 px-4 rounded-lg mb-6 hover:bg-[#4a6d68] transition-colors">
      &lt; Kembali
    </router-link>

    <div v-if="post" class="max-w-3xl mx-auto">
      
      <div class="bg-white text-gray-800 rounded-xl p-6 md:p-8 shadow-lg">
        
        <div class="flex items-center gap-3 mb-4">
            <img :src="post.profileImg" :alt="post.author" class="w-11 h-11 rounded-full" />
            <div class="flex-grow">
                <strong class="block text-base text-gray-900">{{ post.community }}</strong>
                <span class="text-sm text-gray-500">{{ post.author }} · {{ post.time }}</span>
            </div>
            <img src="../assets/img/titik3.png" alt="menu" class="h-6 w-6" />
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ post.title }}</h1>
        <img :src="post.postImg" :alt="post.title" class="w-full rounded-lg mt-4" />
        
        <p class="text-gray-700 mt-4 whitespace-pre-line">
          {{ post.description }}
        </p>

      </div>
      <div class="mt-10">
        <h2 class="text-2xl font-semibold mb-4 text-white">Komentar</h2>
        
        <div class="flex gap-3 mb-6">
          <input 
            v-model="newComment"
            type="text" 
            placeholder="Tulis komentar..."
            class="flex-grow bg-white text-gray-800 rounded-full px-5 py-3 outline-none"
          />
          <button @click="addComment" class="bg-[#78C89F] text-gray-800 font-bold px-6 py-3 rounded-full">
            Kirim
          </button>
        </div>

        <div class="flex flex-col gap-4">
            <div v-for="comment in comments" :key="comment.id" class="bg-white p-4 rounded-lg shadow-sm">
                <strong class="text-gray-900">{{ comment.user }}</strong>
                <p class="text-gray-700">{{ comment.text }}</p>
            </div>
        </div>
      </div>

    </div>
    
    <div v-else class="text-center">
      <h1 class="text-4xl font-bold text-white">404</h1>
      <p class="text-gray-400">Postingan tidak ditemukan.</p>
      <router-link 
        to="/komunitas" 
        class="inline-block bg-[#2D4A45] text-white font-semibold py-2 px-4 rounded-lg mt-4 hover:bg-[#4a6d68] transition-colors">
        &lt; Kembali
      </router-link>
    </div>

  </div>
</template>