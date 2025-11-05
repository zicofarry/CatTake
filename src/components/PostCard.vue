<template>
    <article class="bg-white text-gray-800 rounded-2xl p-5 shadow-lg">
        <div class="flex items-center gap-3">
            <img :src="post.profilePic" :alt="'Profile ' + post.author" class="w-11 h-11 rounded-full object-cover">
            <div class="flex-grow">
                <strong class="block text-base">{{ post.group }}</strong>
                <span class="text-sm text-gray-500">{{ post.author }} · {{ post.time }}</span>
            </div>
            <i class="fas fa-ellipsis-v text-xl text-gray-500 cursor-pointer p-1" @click.stop="toggleMenu"></i>
        </div>
        <div class="mt-4">
            <strong class="text-xl font-semibold block">{{ post.title }}</strong>
            <p class="mt-1">{{ post.contentSnippet }}</p>
            <a href="#" class="text-indigo-600 font-semibold block mt-1 hover:underline">Lihat selengkapnya</a>
            <img :src="post.postImage" :alt="post.title" class="w-full rounded-xl mt-4 object-cover">
        </div>
        <div class="flex gap-5 mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2 text-gray-600 cursor-pointer transition duration-200 hover:text-red-500" @click="toggleLike">
                <i 
                    :class="['fas', 'fa-heart', { 'text-red-500': isLiked }]" 
                    :style="{ color: isLiked ? '#E74C3C' : '' }"
                ></i>
                <span>{{ formattedLikes }}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 cursor-pointer transition duration-200 hover:text-indigo-600">
                <i class="far fa-comment-alt text-xl"></i>
                <span>{{ post.comments }}</span>
            </div>
        </div>
    </article>
</template>

<script setup>
import { defineProps, ref, computed } from 'vue';

const props = defineProps({
    post: {
        type: Object,
        required: true,
        default: () => ({ 
            id: 0, 
            group: 'Anonim', 
            author: 'Guest', 
            time: '0j', 
            title: 'No Title', 
            contentSnippet: 'No Content', 
            postImage: '', 
            profilePic: '',
            likes: 0, 
            comments: 0 
        })
    }
});

// State reaktif untuk toggle like
const isLiked = ref(false);
const currentLikes = ref(props.post.likes);

// Computed property untuk memformat angka (misal: 2158 -> 2.158)
const formattedLikes = computed(() => {
    return currentLikes.value.toLocaleString('id-ID');
});

function toggleLike() {
    isLiked.value = !isLiked.value;
    // Tambahkan atau kurangi jumlah like
    if (isLiked.value) {
        currentLikes.value++;
    } else {
        currentLikes.value--;
    }
}

function toggleMenu() {
    alert(`Menu untuk postingan: ${props.post.title}`);
    // Logika menampilkan pop-up menu
}
</script>