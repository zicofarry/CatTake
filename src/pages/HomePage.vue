<template>
    <main>
        <div class="max-w-6xl mx-auto flex flex-col items-center text-center py-8 gap-8 md:flex-row md:text-left md:min-h-[70vh] md:gap-8 lg:px-8">
            
            <div class="w-full max-w-lg mb-8 order-1 md:order-2 md:flex-1">
                <div class="relative w-full aspect-square">
                    <img src="/assets/img/Ellipse.png" alt="Latar belakang elips hijau" class="absolute w-full h-full top-0 left-0 object-contain z-10">
                    <img src="/assets/img/kucingtidur.png" alt="Seekor kucing oranye berbaring" class="absolute w-full h-full top-0 left-0 object-contain z-20">
                </div>
            </div>

            <div class="order-2 md:order-1 md:flex-1">
                <h1 class="text-6xl font-bold leading-tight mb-4">Rescue. Snap. Save.</h1>
                <p class="text-xl text-gray-600 mb-8 max-w-lg">Bersama kita bisa menyelamatkan lebih banyak kucing dan memberikan mereka kehidupan yang lebih baik.</p>
                <router-link to="/lapor" class="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold py-3 px-8 rounded-full transition duration-300 shadow-lg">Buat Laporan</router-link>
            </div>
        </div>
    </main>
</template>
