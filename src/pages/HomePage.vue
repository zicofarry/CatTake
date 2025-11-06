<template>
    <main class="min-h-screen">
        <div class="max-w-7xl mx-auto flex flex-col items-center text-center py-12 px-4 sm:px-6 lg:px-8 gap-10 md:flex-row md:text-left md:min-h-[80vh] md:gap-16">
            
            <!-- IMAGE SECTION (Order 1 di Mobile, Order 2 di Desktop) -->
            <div class="w-full max-w-sm mb-8 order-1 md:order-2 md:flex-1 md:max-w-none">
                <div class="relative w-full aspect-square md:h-[450px] md:w-auto">
                    <!-- ELLIPSE BACKGROUND (HIJAU TUA) -->
                    <img src="../assets/img/Ellipse.png" alt="Latar belakang elips hijau" 
                        class="absolute w-[120%] h-[120%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain z-10"
                        style="filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));"
                    >
                    <!-- KUCING DI TENGAH -->
                    <img src="../assets/img/kucingtidur.png" alt="Seekor kucing oranye berbaring" 
                        class="absolute w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain z-20"
                    >
                </div>
            </div>

            <!-- TEXT SECTION (Order 2 di Mobile, Order 1 di Desktop) -->
            <div class="order-2 md:order-1 md:flex-1">
                <h1 class="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-4 text-gray-800">
                    Rescue. Snap. Save.
                </h1>
                <p class="text-base sm:text-xl text-gray-600 mb-8 max-w-lg md:max-w-full">
                    Bersama kita bisa menyelamatkan lebih banyak kucing dan memberikan mereka kehidupan yang lebih baik.
                </p>
                
                <!-- TOMBOL UTAMA (KUNING) -->
                <router-link to="/lapor" 
                    class="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-bold py-3 px-10 sm:py-4 sm:px-12 rounded-full transition duration-300 shadow-xl"
                    style="box-shadow: 0 8px 15px rgba(251, 192, 45, 0.4);"
                >
                    Buat Laporan
                </router-link>
            </div>
        </div>
    </main>
</template>

<script setup>
// Tidak ada logika JS spesifik yang perlu dimigrasi dari index.html
</script>

<style scoped>
/* CSS Lama Dihapus */
</style>