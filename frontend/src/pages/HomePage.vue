<template>
    <main>
        <HeroSection 
            :title="heroContent.title"
            :subtitle="heroContent.subtitle"
            :buttonText="heroContent.buttonText"
            :buttonLink="heroContent.buttonLink"
            
            
            mainImg="/img/kucingtidur.png"
            mainAlt="kucingtidur"
            
            />
    </main>
</template>

<script setup>
    import { computed } from 'vue';
    import HeroSection from '../components/HeroSection.vue';

    // Mendapatkan peran pengguna (Role) dari localStorage
    const userRole = computed(() => localStorage.getItem('userRole') || 'guest');

    // Menentukan konten HeroSection berdasarkan Role
    const heroContent = computed(() => {
        const baseContent = {
            title: 'Rescue. Snap. Save.',
            subtitle: 'Bersama kita bisa menyelamatkan lebih banyak kucing dan memberikan mereka kehidupan yang lebih baik.'
        };

        if (userRole.value === 'shelter') {
            // Konten untuk Shelter
            return {
                ...baseContent,
                buttonText: 'Cek Laporan Masuk',
                buttonLink: '/lapor' // Arahkan ke halaman Lapor untuk melihat laporan
            };
        } else {
            // Konten untuk User Biasa dan Guest
            const targetLink = userRole.value === 'guest' ? '/login' : '/lapor';
            
            return {
                ...baseContent,
                buttonText: 'Buat Laporan',
                buttonLink: targetLink // Guest ke Login, User ke Lapor
            };
        }
    });
</script>