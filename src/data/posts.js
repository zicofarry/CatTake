// src/data/posts.js
import { ref } from 'vue'

// Kita pindahkan data post ke file terpisah
// Saya tambahkan properti 'description' untuk isi detail postingan
export const allPosts = ref([
    { 
      id: 1, 
      community: 'CatCare Hub', 
      author: 'Repa', 
      time: '2j', 
      title: 'Kenapa Sterilisasi itu Penting?', 
      excerpt: 'Halo semua, aku mau share pengalaman tentang sterilisasi kucing...', 
      // Deskripsi lengkap untuk halaman detail
      description: 'Halo semua, aku mau share pengalaman tentang sterilisasi kucing.\n\nTernyata banyak banget manfaatnya, bukan cuma untuk mengontrol populasi, tapi juga bagus untuk kesehatan si kucing dalam jangka panjang. Kucingku jadi lebih tenang dan gak gampang stres.', 
      profileImg: '/img/profileKomunitas1.png', 
      postImg: '/img/postingan1.png', 
      likes: '2.158', 
      comments: '1.009' 
    },
    { 
      id: 2, 
      community: 'Pawfect Home', 
      author: 'Nana', 
      time: '18j', 
      title: '3 Anak Kucing Butuh Rumah Baru', 
      excerpt: 'Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan...', 
      // Deskripsi lengkap untuk halaman detail
      description: 'Halo Cat Lovers! Aku lagi foster 3 anak kucing manis yang ditemukan di depan rumah.\n\nUsianya sekitar 2 bulan, sudah bisa makan wet food dan pup di pasir. Semuanya sehat dan manja. Butuh rumah baru yang sayang sama mereka. Lokasi di Jakarta Selatan.', 
      profileImg: '/img/profileKomunitas2.png', 
      postImg: '/img/postingan2.png', 
      likes: '1.112', 
      comments: '970' 
    },
    { 
      id: 3, 
      community: 'SavePaws Community', 
      author: 'Rena', 
      time: '3h', 
      title: 'Kucing Terlantar di Depan Minimarket', 
      excerpt: 'Teman-teman, tadi pagi aku lihat seekor kucing betina kurus banget...', 
      // Deskripsi lengkap untuk halaman detail
      description: 'Teman-teman, tadi pagi aku lihat seekor kucing betina kurus banget di depan minimarket deket rumah.\n\nKayaknya habis melahirkan dan kelaparan. Aku udah kasih makan, tapi kasian banget. Ada yang bisa bantu foster atau adopsi? Please bantu share ya.', 
      profileImg: '/img/profileKomunitas3.png', 
      postImg: '/img/postingan3.jpg', 
      likes: '876', 
      comments: '302' 
    },
])