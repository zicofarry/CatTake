<script setup>
import { ref, computed } from 'vue';
import apiClient from '@/api/http';
import { useRouter } from 'vue-router';

const props = defineProps({
  postData: Object,
  currentUserId: Number
});

const emit = defineEmits(['refresh']);
const router = useRouter();

// State Lokal
const isLiked = ref(props.postData.isLiked || false);
const likeCount = ref(props.postData.likes || 0);
const isExpanded = ref(false); // [BARU] State untuk expand teks

// State Menu & Edit
const showMenu = ref(false);
const isEditing = ref(false);
const editForm = ref({ title: '', content: '' });

const isOwner = computed(() => props.currentUserId && props.postData.authorId && props.currentUserId === props.postData.authorId);
const currentLikesDisplay = computed(() => likeCount.value.toLocaleString('id-ID'));

// Helper Text Limit
const shouldShowReadMore = computed(() => {
    return props.postData.description && props.postData.description.length > 150;
});

const displayDescription = computed(() => {
    if (isExpanded.value || !shouldShowReadMore.value) {
        return props.postData.description;
    }
    return props.postData.description.substring(0, 150) + '...';
});

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
// [BARU] Navigasi ke Detail
function goToDetail() {
    router.push(`/post/${props.postData.id}`);
}

// [BARU] Toggle Teks (Stop Propagation agar tidak masuk ke detail)
function toggleExpand(event) {
    // event.stopPropagation() tidak perlu jika pakai @click.stop di template
    isExpanded.value = !isExpanded.value;
}

async function toggleLike() {
  const oldIsLiked = isLiked.value;
  const oldCount = likeCount.value;
  
  if (isLiked.value) { isLiked.value = false; likeCount.value--; } 
  else { isLiked.value = true; likeCount.value++; }

  try {
    await apiClient.post(`/community/posts/${props.postData.id}/like`);
  } catch (error) {
    isLiked.value = oldIsLiked;
    likeCount.value = oldCount;
    if (error.response?.status === 401) alert("Silakan login untuk menyukai postingan.");
  }
}

function toggleMenu() { showMenu.value = !showMenu.value; }

async function deletePost() {
    if(!confirm("Yakin ingin menghapus postingan ini?")) return;
    try {
        await apiClient.delete(`/community/posts/${props.postData.id}`);
        emit('refresh');
    } catch (error) { alert("Gagal menghapus postingan."); }
}

function startEdit() {
    editForm.value.title = props.postData.title;
    editForm.value.content = props.postData.description;
    isEditing.value = true;
    showMenu.value = false;
}

async function saveEdit() {
    try {
        await apiClient.put(`/community/posts/${props.postData.id}`, editForm.value);
        isEditing.value = false;
        emit('refresh');
    } catch (error) { alert("Gagal mengupdate postingan."); }
}
</script>

<template>
  <article class="bg-white text-gray-800 rounded-xl p-5 shadow-md font-sans relative group transition-all hover:shadow-lg border border-gray-100">
      
      <div class="flex items-center gap-3 relative z-20">
          <img :src="resolveImageUrl(postData.profileImg)" class="w-11 h-11 rounded-full object-cover border border-gray-100" @error="$event.target.src = '/img/NULL.JPG'" />
          <div class="flex-grow">
              <strong class="block text-base">{{ postData.author }} <i v-if="postData.isVerified" class="fas fa-check-circle text-blue-500 text-xs" title="Verified Account"></i></strong>
              <span class="text-sm text-gray-500">@{{ postData.username }} · {{ postData.time }}</span>
          </div>
          
          <div v-if="isOwner" class="relative">
              <button @click.stop="toggleMenu" class="p-2 hover:bg-gray-100 rounded-full transition">
                  <img src="../assets/img/titik3.png" alt="menu" class="h-5 w-5 opacity-60" />
              </button>
              <div v-if="showMenu" class="absolute right-0 top-8 w-40 bg-white shadow-xl rounded-lg z-50 border border-gray-100 overflow-hidden flex flex-col">
                  <div @click.stop="showMenu = false" class="fixed inset-0 z-40 cursor-default"></div>
                  <button @click.stop="startEdit" class="text-left px-4 py-3 text-sm hover:bg-gray-50 relative z-50 flex items-center gap-2"><i class="fas fa-pen text-gray-400"></i> Edit</button>
                  <button @click.stop="deletePost" class="text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 relative z-50 flex items-center gap-2"><i class="fas fa-trash"></i> Hapus</button>
              </div>
          </div>
      </div>
      
      <div v-if="isEditing" class="mt-4 space-y-3 relative z-20">
          <input v-model="editForm.title" class="w-full p-2 border rounded-lg font-bold" placeholder="Judul">
          <textarea v-model="editForm.content" rows="3" class="w-full p-2 border rounded-lg" placeholder="Isi postingan"></textarea>
          <div class="flex justify-end gap-2">
              <button @click="isEditing = false" class="text-sm text-gray-500 font-bold px-3 py-1">Batal</button>
              <button @click="saveEdit" class="text-sm bg-[#3A5F50] text-white px-4 py-1 rounded-full font-bold">Simpan</button>
          </div>
      </div>

      <div v-else class="mt-4 cursor-pointer group/content" @click="goToDetail">
          <strong class="text-xl font-semibold block mb-1 group-hover/content:text-[#3A5F50] transition-colors">{{ postData.title }}</strong>
          
          <p class="mt-1 text-gray-700 whitespace-pre-line text-sm md:text-base">
            {{ displayDescription }}
          </p>

          <button 
            v-if="shouldShowReadMore"
            @click.stop="toggleExpand"
            class="text-[#78C89F] font-bold text-sm mt-1 hover:underline focus:outline-none"
          >
            {{ isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya' }}
          </button>

          <img 
            v-if="postData.postImg" 
            :src="resolveImageUrl(postData.postImg)" 
            :alt="postData.title" 
            class="w-full rounded-lg mt-4 object-cover max-h-[400px] bg-gray-50 border border-gray-100" 
            @error="$event.target.style.display='none'"
          />
      </div>

      <div class="flex gap-5 mt-4 border-t border-gray-100 pt-4 relative z-20">
          <div @click.stop="toggleLike" :class="{ 'text-[#FF5757]': isLiked, 'text-gray-600': !isLiked }" class="flex items-center gap-2 cursor-pointer transition-colors select-none hover:bg-gray-50 px-2 py-1 rounded-lg -ml-2">
              <i class="fas fa-heart text-lg" :class="isLiked ? 'text-[#FF5757]' : 'text-gray-400'"></i>
              <span>{{ currentLikesDisplay }}</span>
          </div>
          <button @click.stop="goToDetail" class="flex items-center gap-2 text-gray-600 cursor-pointer no-underline hover:text-gray-800 hover:bg-gray-50 px-2 py-1 rounded-lg">
              <i class="fas fa-comment text-lg text-gray-400"></i>
              <span>{{ postData.comments || 0 }}</span>
          </button>
      </div>
  </article>
</template>