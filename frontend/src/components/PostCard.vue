<script setup>
import { ref, computed, watch } from 'vue' // Tambah 'watch'
import apiClient from '@/api/http'; // Import API Client

const props = defineProps({
  postData: {
    type: Object,
    required: true
  }
})

// State Lokal
const isLiked = ref(props.postData.isLiked || false);
const likeCount = ref(props.postData.likes || 0);

// Watcher: Jika data dari props berubah (misal setelah fetch ulang), update state lokal
watch(() => props.postData, (newVal) => {
    isLiked.value = newVal.isLiked;
    likeCount.value = newVal.likes;
});

// Tampilan Angka (Ribuan)
const currentLikesDisplay = computed(() => {
  return likeCount.value.toLocaleString('id-ID');
});

function resolveImageUrl(path) {
    if (!path) return '/img/NULL.JPG';
    
    // Jika path dari backend (diawali /public/), tambahkan host backend
    if (path.startsWith('/public/')) {
        const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const baseServerUrl = baseApiUrl.replace('/api/v1', '');
        return `${baseServerUrl}${path}`;
    }
    return path;
}

// Fungsi Like ke API
async function toggleLike() {
  // Simpan state lama untuk rollback jika error
  const oldIsLiked = isLiked.value;
  const oldCount = likeCount.value;

  // Optimistic Update (Ubah tampilan dulu biar responsif)
  if (isLiked.value) {
      isLiked.value = false;
      likeCount.value--;
  } else {
      isLiked.value = true;
      likeCount.value++;
  }

  try {
    // Panggil API
    const response = await apiClient.post(`/community/posts/${props.postData.id}/like`);
    
    // Sinkronisasi data asli dari server (agar akurat)
    const data = response.data.data;
    isLiked.value = data.isLiked;
    likeCount.value = parseInt(data.likesCount);

  } catch (error) {
    console.error("Gagal like:", error);
    // Rollback jika gagal (misal belum login)
    isLiked.value = oldIsLiked;
    likeCount.value = oldCount;
    
    if (error.response?.status === 401) {
        alert("Silakan login untuk menyukai postingan.");
    }
  }
}
</script>

<template>
  <article class="bg-white text-gray-800 rounded-xl p-5 shadow-md font-sans">
      
      <div class="flex items-center gap-3">
          <img 
            :src="resolveImageUrl(postData.profileImg) || '/img/profile_default.png'" 
            :alt="postData.author" 
            class="w-11 h-11 rounded-full object-cover" 
            @error="$event.target.src = '/img/NULL.JPG'"
          />
          <div class="flex-grow">
              <strong class="block text-base">{{ postData.community || 'Komunitas' }}</strong>
              <span class="text-sm text-gray-500">{{ postData.author }} · {{ postData.time }}</span>
          </div>
          <img src="../assets/img/titik3.png" alt="menu" class="h-6 w-6 cursor-pointer" />
      </div>
      
      <div class="mt-4">
          <strong class="text-xl font-semibold block mb-1">{{ postData.title }}</strong>
          
          <p class="mt-1 text-gray-700 whitespace-pre-line">
            {{ postData.description ? postData.description.substring(0, 100) + (postData.description.length > 100 ? '...' : '') : '' }}
          </p>

          <router-link 
            :to="'/post/' + postData.id" 
            class="text-[#78C89F] font-semibold block mt-1 hover:underline">
            Lihat selengkapnya
          </router-link>

          <img 
            v-if="postData.postImg" 
            :src="postData.postImg" 
            :alt="postData.title" 
            class="w-full rounded-lg mt-4 object-cover max-h-[400px]" 
            @error="$event.target.style.display='none'"
          />
      </div>

      <div class="flex gap-5 mt-4 border-t border-gray-100 pt-4">
          
          <div 
            @click="toggleLike" 
            :class="{ 'text-[#FF5757]': isLiked, 'text-gray-600': !isLiked }"
            class="flex items-center gap-2 cursor-pointer transition-colors select-none"
          >
              <i class="fas fa-heart text-lg" :class="isLiked ? 'text-[#FF5757]' : 'text-gray-400'"></i>
              <span>{{ currentLikesDisplay }}</span>
          </div>

          <router-link :to="'/post/' + postData.id" class="flex items-center gap-2 text-gray-600 cursor-pointer no-underline hover:text-gray-800">
              <i class="fas fa-comment text-lg text-gray-400"></i>
              <span>{{ postData.comments || 0 }}</span>
          </router-link>

      </div>
  </article>
</template>