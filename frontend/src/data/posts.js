// src/data/posts.js
import { ref } from 'vue'

export const allPosts = ref([
    { 
      id: 1, 
      community: 'CatCare Hub', 
      author: 'Repa', 
      time: '2j', 
      title: 'Kenapa Sterilisasi itu Penting?', 
      excerpt: 'Halo semua, aku mau share pengalaman tentang sterilisasi kucing...', 
      description: 'Halo semua, aku mau share pengalaman tentang sterilisasi kucing.\n\nTernyata banyak banget manfaatnya, bukan cuma untuk mengontrol populasi, tapi juga bagus untuk kesehatan si kucing dalam jangka panjang. Kucingku jadi lebih tenang dan gak gampang stres.', 
      // PERBAIKAN: Path ke /public/img/
      profileImg: '/img/profileKomunitas1.png', 
      postImg: '/img/postingan1.png', 
      likes: '2.158', 
      comments: '1.009',
      commentData: [
        { id: 1, user: 'Anas', text: 'Setuju banget, sterilisasi penting!' },
        { id: 2, user: 'Azmi', text: 'Kucingku juga baru disteril minggu lalu.' }
      ]
    },
    { 
      id: 2, 
      community: 'Pawfect Home', 
      author: 'Nana', 
      time: '18j', 
      title: '3 Anak Kucing Butuh Rumah Baru', 
      excerpt: 'Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan...', 
      description: 'Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan di depan rumah.\n\nUsianya sekitar 2 bulan, sudah bisa makan wet food dan pup di pasir. Semuanya sehat dan manja. Butuh rumah baru yang sayang sama mereka. Lokasi di Jakarta Selatan.', 
      // PERBAIKAN: Path ke /public/img/
      profileImg: '/img/profileKomunitas2.png', 
      postImg: '/img/postingan2.png', 
      likes: '1.112', 
      comments: '970',
      commentData: [
        { id: 1, user: 'Rena', text: 'Lucu banget! Semoga cepet dapet rumah ya 🥺' },
        { id: 2, user: 'Anas', text: 'Lokasi Jaksel mananya kak?' }
      ]
    },
    { 
      id: 3, 
      community: 'SavePaws Community', 
      author: 'Rena', 
      time: '3h', 
      title: 'Kucing Terlantar di Depan Minimarket', 
      excerpt: 'Teman-teman, tadi pagi aku lihat seekor kucing betina kurus banget...', 
      description: 'Teman-teman, tadi pagi aku lihat seekor kucing betina kurus banget di depan minimarket deket rumah.\n\nKayaknya habis melahirkan dan kelaparan. Aku udah kasih makan, tapi kasian banget. Ada yang bisa bantu foster atau adopsi? Please bantu share ya.', 
      // PERBAIKAN: Path ke /public/img/
      profileImg: '/img/profileKomunitas3.png', 
      postImg: '/img/postingan3.jpg', 
      likes: '876', 
      comments: '302',
      commentData: [
        { id: 1, user: 'Azmi', text: 'Ya ampun kasian banget 😭 Makasih udah nolongin.' }
      ]
    },
])