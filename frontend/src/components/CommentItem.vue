<template>
  <div class="animate-fade-in">
    
    <div class="flex gap-3 mb-3 relative group/item">
      
      <img 
        :src="resolveImageUrl(comment.profileImg)" 
        class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-200 shrink-0 bg-white z-10 relative" 
      />

      <div class="flex-grow min-w-0 relative">
        <div class="bg-gray-50 p-3 md:p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 relative group-hover/item:shadow-md transition-shadow">
          
          <div class="flex justify-between items-start mb-1">
            <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 text-sm md:text-base">{{ comment.user }}</span>
                <span class="text-xs text-gray-400">{{ comment.time }}</span>
            </div>
            
            <div v-if="isOwner" class="relative">
                <button @click="toggleMenu" class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
                    <i class="fas fa-ellipsis-v text-xs"></i>
                </button>
                
                <div v-if="isMenuOpen" class="absolute right-0 top-full mt-1 w-32 bg-white shadow-xl rounded-lg py-1 z-50 border border-gray-100 overflow-hidden">
                    <button @click="enableEditMode" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <i class="fas fa-pen text-xs"></i> Edit
                    </button>
                    <button @click="confirmDelete" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <i class="fas fa-trash text-xs"></i> Hapus
                    </button>
                </div>
                
                <div v-if="isMenuOpen" @click="isMenuOpen = false" class="fixed inset-0 z-40 cursor-default"></div>
            </div>
          </div>
          
          <p v-if="!isEditing" class="text-gray-700 text-sm md:text-base leading-relaxed break-words">
            <span v-if="depth >= 2 && parentName" class="text-[#638870] font-bold mr-1">
              @{{ parentName }}
            </span>
            {{ comment.text }}
          </p>

          <div v-else class="mt-2">
             <textarea 
                v-model="editText" 
                class="w-full p-2 border border-[#638870] rounded-lg text-sm focus:outline-none bg-white"
                rows="2"
             ></textarea>
             <div class="flex justify-end gap-2 mt-2">
                <button @click="cancelEdit" class="text-xs font-bold text-gray-500 hover:text-gray-700">Batal</button>
                <button @click="saveEdit" class="text-xs font-bold text-white bg-[#638870] px-3 py-1 rounded-full hover:bg-[#4e6e59]">Simpan</button>
             </div>
          </div>

        </div>

        <div v-if="!isEditing" class="flex items-center gap-4 mt-1 ml-2">
          <button 
            @click="toggleReply" 
            class="text-xs font-bold text-[#638870] hover:text-[#3A5F50] transition-colors flex items-center gap-1"
          >
            <i class="fas fa-reply"></i> Balas
          </button>
        </div>

        <div v-if="isReplying" class="mt-3 flex gap-2 animate-fade-in">
          <input 
            v-model="replyText" 
            type="text" 
            :placeholder="`Balas ${comment.user}...`" 
            class="flex-grow bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#638870] focus:ring-1 focus:ring-[#638870]"
            @keyup.enter="submitReply"
          />
          <button 
            @click="submitReply" 
            :disabled="isSubmitting"
            class="bg-[#638870] text-white rounded-full px-4 py-2 text-sm font-bold hover:bg-[#4e6e59] disabled:opacity-50 transition-colors"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>

    <div 
      v-if="comment.replies && comment.replies.length > 0" 
      :class="depth < 1 ? 'pl-10 md:pl-12 ml-4 md:ml-5 border-l-2 border-gray-200 space-y-3' : 'space-y-3'"
    >
      <CommentItem 
        v-for="reply in comment.replies" 
        :key="reply.id" 
        :comment="reply" 
        :root-comment-id="rootCommentId || comment.id" 
        :depth="depth + 1" 
        :parent-name="comment.user"
        :current-user-id="currentUserId"
        @reply-submitted="$emit('reply-submitted')"
        @comment-deleted="$emit('comment-deleted')"
        @comment-updated="$emit('comment-updated')"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import apiClient from '@/api/http';

const props = defineProps({
  comment: Object,
  rootCommentId: Number,
  depth: { type: Number, default: 0 },
  parentName: { type: String, default: null },
  currentUserId: { type: Number, default: null } // ID User yang sedang login
});

const emit = defineEmits(['reply-submitted', 'comment-deleted', 'comment-updated']);

// State Reply
const isReplying = ref(false);
const replyText = ref('');
const isSubmitting = ref(false);

// State Menu & Edit
const isMenuOpen = ref(false);
const isEditing = ref(false);
const editText = ref('');

// Computed: Cek apakah user ini pemilik komentar
const isOwner = computed(() => {
    return props.currentUserId === props.comment.userId;
});

// --- METHODS ---

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

function toggleReply() {
  isReplying.value = !isReplying.value;
}

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}

// EDIT LOGIC
function enableEditMode() {
    isMenuOpen.value = false;
    editText.value = props.comment.text;
    isEditing.value = true;
}

function cancelEdit() {
    isEditing.value = false;
}

async function saveEdit() {
    if (!editText.value.trim()) return;
    try {
        // Cek apakah ini Komentar Utama atau Reply
        // Jika punya 'comment_id' berarti Reply, jika tidak berarti Komentar Utama
        const isReply = !!props.comment.comment_id;
        const endpoint = isReply ? `/community/replies/${props.comment.id}` : `/community/comments/${props.comment.id}`;
        
        await apiClient.put(endpoint, { content: editText.value });
        
        isEditing.value = false;
        emit('comment-updated');
    } catch (error) {
        alert('Gagal mengupdate komentar.');
        console.error(error);
    }
}

// DELETE LOGIC
async function confirmDelete() {
    isMenuOpen.value = false;
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini? Semua balasan di bawahnya juga akan terhapus.')) return;

    try {
        const isReply = !!props.comment.comment_id;
        const endpoint = isReply ? `/community/replies/${props.comment.id}` : `/community/comments/${props.comment.id}`;
        
        await apiClient.delete(endpoint);
        emit('comment-deleted');
    } catch (error) {
        alert('Gagal menghapus komentar.');
        console.error(error);
    }
}

// REPLY LOGIC
async function submitReply() {
  if (!replyText.value.trim()) return;
  isSubmitting.value = true;

  try {
    let payload = { content: replyText.value };
    let endpointId = props.rootCommentId;

    if (props.comment.comment_id) {
        payload.parentReplyId = props.comment.id; 
        endpointId = props.comment.comment_id;    
    } else {
        payload.parentReplyId = null; 
        endpointId = props.comment.id; 
    }

    await apiClient.post(`/community/comments/${endpointId}/replies`, payload);

    replyText.value = '';
    isReplying.value = false;
    emit('reply-submitted'); 

  } catch (error) {
    console.error(error);
    alert('Gagal membalas. Pastikan Anda sudah login.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>