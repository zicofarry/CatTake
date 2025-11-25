<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed, watch } from 'vue'
import apiClient from '@/api/http';
import { jwtDecode } from 'jwt-decode'; 
import CommentItem from '@/components/CommentItem.vue';

const route = useRoute()
const router = useRouter()
const postId = route.params.id

const post = ref(null)
const comments = ref([])
const newComment = ref('')
const isLoading = ref(true)

// State Like & User Image
const isLiked = ref(false);
const likeCount = ref(0);
const currentUserImg = ref(null); // [BARU] State foto user login

const currentUserId = computed(() => {
    const token = localStorage.getItem('userToken');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.id;
    } catch (e) { return null; }
});

// [Master] Helper Image URL Lengkap
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

// [BARU] Ambil Foto Profil User Login
async function fetchCurrentUser() {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const userRole = decoded.role;

        const response = await apiClient.get(`/users/profile/${userId}/${userRole}`);
        
        // [PERBAIKAN] Gunakan properti 'photo' sesuai respon backend
        currentUserImg.value = response.data.photo; 
        
    } catch (error) {
        console.error("Gagal ambil profil user:", error);
    }
}

async function fetchPostDetail() {
  try {
    const response = await apiClient.get(`/community/posts/${postId}`);
    post.value = response.data;
    comments.value = response.data.commentData || [];
    
    isLiked.value = response.data.isLiked;
    likeCount.value = response.data.likes;
  } catch (error) {
    console.error("Gagal mengambil detail post:", error);
  } finally {
    isLoading.value = false;
  }
}

async function toggleLike() {
  const oldIsLiked = isLiked.value;
  const oldCount = likeCount.value;

  if (isLiked.value) {
      isLiked.value = false;
      likeCount.value--;
  } else {
      isLiked.value = true;
      likeCount.value++;
  }

  try {
    await apiClient.post(`/community/posts/${postId}/like`);
  } catch (error) {
    isLiked.value = oldIsLiked;
    likeCount.value = oldCount;
    if (error.response?.status === 401) alert("Silakan login untuk menyukai postingan.");
  }
}

async function addComment() {
  if (newComment.value.trim() === '') return;
  try {
    await apiClient.post(`/community/posts/${postId}/comments`, {
        content: newComment.value
    });
    newComment.value = ''; 
    await fetchPostDetail(); 
  } catch (error) {
    if (error.response?.status === 401) router.push('/login');
    else alert(error.response?.data?.error || "Gagal kirim komentar");
  }
}

function handleActionSuccess() {
    fetchPostDetail(); 
}

onMounted(() => {
  isLoading.value = true;
  fetchPostDetail();
  fetchCurrentUser(); // [BARU] Panggil fungsi ambil foto user
})
</script>

<template>
  <div class="bg-[#2c473c] min-h-screen p-5 md:p-10 font-sans"
    style="background-image: url('/img/background.png'); background-size: 360px;">
    
    <div class="fixed top-6 left-4 md:top-8 md:left-8 z-[999]">
        <router-link 
          to="/komunitas" 
          class="inline-flex items-center gap-2 bg-[#2D4A45]/80 backdrop-blur-md text-white font-bold py-2.5 px-6 rounded-full shadow-2xl transition-all duration-300 hover:bg-[#2D4A45] hover:-translate-x-1 no-underline border border-white/20"
        >
            <i class="fas fa-arrow-left"></i>
            <span>Kembali</span>
        </router-link>
    </div>

    <div v-if="post" class="max-w-3xl mx-auto mt-16 md:mt-0">
      
      <div class="bg-white text-gray-800 rounded-2xl p-6 md:p-8 shadow-xl mb-8 border border-gray-100">
        <div class="flex items-center gap-3 mb-5">
            <img :src="resolveImageUrl(post.profileImg)" class="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm" @error="$event.target.src = '/img/NULL.JPG'" />
            <div class="flex-grow">
                <strong class="block text-lg text-gray-900 leading-tight">{{ post.author }}</strong>
                <span class="text-sm text-gray-500 font-medium">@{{ post.username }} · {{ post.time }}</span>
            </div>
        </div>

        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">{{ post.title }}</h1>
        <!-- <div class="h-42 flex-grow rounded-lg overflow-hidden relative group cursor-pointer" @click="previewImage(trackingData.laporan.foto)">
                    <img :src="resolveImageUrl(trackingData.laporan.foto)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute bottom-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                        <i class="fas fa-expand-alt text-xs"></i>
                    </div>
                 </div> -->
        <img 
            v-if="post.postImg" 
            :src="resolveImageUrl(post.postImg)" 
            class="w-full rounded-xl mb-6 object-cover max-h-[500px] shadow-md bg-gray-50" 
            @error="$event.target.style.display='none'" 
        />
        
        <p class="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{{ post.description }}</p>
        
        <div class="flex items-center gap-6 mt-6 pt-4 border-t border-gray-100 text-gray-500 font-medium select-none">
            <div 
                @click="toggleLike" 
                class="flex items-center gap-2 cursor-pointer transition-colors hover:text-gray-700"
                :class="isLiked ? 'text-red-500' : 'text-gray-500'"
            >
                <i class="fas fa-heart" :class="isLiked ? 'text-red-500' : 'text-gray-400'"></i> 
                <span>{{ likeCount }} Suka</span>
            </div>

            <div class="flex items-center gap-2">
                <i class="fas fa-comment text-blue-500"></i> 
                <span>{{ post.comments }} Komentar</span>
            </div>
        </div>
      </div>

      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-lg backdrop-blur-sm">
        <h2 class="text-2xl font-bold mb-6 text-[#2c473c] flex items-center gap-2 border-b border-[#2c473c]/20 pb-4">
            <i class="fas fa-comments"></i> Komentar ({{ post.comments }})
        </h2>
        
        <div class="flex gap-3 mb-10">
          <img :src="resolveImageUrl(currentUserImg)" class="w-10 h-10 rounded-full object-cover border border-gray-200 hidden md:block" @error="$event.target.src = '/img/NULL.JPG'">
          
          <div class="flex-grow relative">
             <input 
                v-model="newComment"
                type="text" 
                placeholder="Tulis komentar..."
                class="w-full bg-white text-gray-800 rounded-full pl-5 pr-14 py-3 outline-none shadow-sm focus:ring-2 focus:ring-[#638870] border border-gray-200 transition-all"
                @keyup.enter="addComment"
             />
             <button 
                @click="addComment" 
                class="absolute right-1.5 top-1.5 bg-[#EBCD5E] text-gray-900 w-10 h-10 rounded-full hover:bg-[#deb841] transition shadow-sm flex items-center justify-center"
             >
                <i class="fas fa-paper-plane"></i>
             </button>
          </div>
        </div>

        <div class="flex flex-col gap-6">
            <CommentItem 
                v-for="comment in comments" 
                :key="comment.id" 
                :comment="comment"
                :root-comment-id="comment.id"
                :current-user-id="currentUserId" 
                @reply-submitted="handleActionSuccess"
                @comment-deleted="handleActionSuccess"
                @comment-updated="handleActionSuccess"
            />
            
            <div v-if="comments.length === 0" class="text-center py-10 text-gray-500 italic">
                Belum ada komentar. Jadilah yang pertama!
            </div>
        </div>
      </div>

    </div>
    
    <div v-else-if="isLoading" class="flex h-[50vh] items-center justify-center">
        <div class="flex flex-col items-center gap-4">
            <i class="fas fa-paw fa-spin text-[#EBCD5E] text-5xl"></i>
            <span class="text-white font-bold animate-pulse">Memuat...</span>
        </div>
    </div>

  </div>
</template>