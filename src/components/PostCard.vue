<script setup>
import { ref } from 'vue'

const props = defineProps({
  postData: Object
})

// --- LOGIKA LIKE BARU (BISA DI-TOGGLE) ---
const isLiked = ref(false)
const currentLikes = ref(props.postData.likes) // cth: '2.158'

// 1. Kita simpan jumlah like ASLI sebagai angka
const originalLikeCount = parseInt(props.postData.likes.replace(/\./g, '')) // cth: 2158

// 2. Kita ubah nama fungsi menjadi 'toggleLike'
function likePost() {
  
  // 3. Balik status 'isLiked' (dari false -> true, atau true -> false)
  isLiked.value = !isLiked.value

  if (isLiked.value) {
    // 4. JIKA BARU DI-LIKE:
    // Tambah 1 dari angka ASLI
    const newCount = originalLikeCount + 1
    // Format ulang ke string (cth: '2.159')
    currentLikes.value = newCount.toLocaleString('id-ID')
  } else {
    // 5. JIKA DI-BATALKAN (UNLIKE):
    // Kembalikan ke string ASLI
    currentLikes.value = props.postData.likes
  }
}
// --- AKHIR LOGIKA LIKE ---
</script>

<template>
  <article class="bg-white text-gray-800 rounded-xl p-5 shadow-md font-sans">
      
      <div class="flex items-center gap-3">
          <img :src="postData.profileImg" :alt="postData.author" class="w-11 h-11 rounded-full" />
          <div class="flex-grow">
              <strong class="block text-base">{{ postData.community }}</strong>
              <span class="text-sm text-gray-500">{{ postData.author }} · {{ postData.time }}</span>
          </div>
          <img src="/img/titik3.png" alt="menu" class="h-6 w-6" />
      </div>
      
      <div class="mt-4">
          <strong class="text-xl font-semibold">{{ postData.title }}</strong>
          <p class="mt-1 text-gray-700">{{ postData.excerpt }}</p>

          <router-link 
            :to="'/post/' + postData.id" 
            class="text-[#78C89F] font-semibold block mt-1 hover:underline">
            Lihat selengkapnya
          </router-link>

          <img :src="postData.postImg" :alt="postData.title" class="w-full rounded-lg mt-4" />
      </div>

      <div class="flex gap-5 mt-4 border-t border-gray-100 pt-4">
          
          <div 
            @click="likePost" 
            :class="{ 'text-[#FF5757]': isLiked, 'text-gray-600': !isLiked }"
            class="flex items-center gap-2 cursor-pointer transition-colors"
          >
              <img src="/img/like.png" alt="Like" class="h-5 w-5" />
              <span>{{ currentLikes }}</span>
          </div>

          <router-link :to="'/post/' + postData.id" class="flex items-center gap-2 text-gray-600 cursor-pointer">
              <img src="/img/comment.png" alt="Comment" class="h-5 w-5" />
              <span>{{ postData.comments }}</span>
          </router-link>

      </div>
  </article>
</template>