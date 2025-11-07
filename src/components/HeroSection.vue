<template>
<<<<<<< Updated upstream
  <section class="py-20 lg:py-32">
    <div class="flex flex-col-reverse gap-5 items-center justify-between lg:flex-row lg:gap-12 mt-20">

=======
  <section class="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-5 md:pb-48 mt-12 md:mt-0">
    <div class="flex flex-col md:flex-row items-center gap-8 md:gap-16">
>>>>>>> Stashed changes
      <!-- Gambar Hero -->
      <div class="lg:w-1/2 relative flex justify-center items-center -mt-10 md:mt-0 mb-12 md:mb-0">
        <img 
          :src="ellipseImg" 
          :alt="ellipseAlt" 
<<<<<<< Updated upstream
          class="absolute top-[65%] left-[50%] w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] transform -translate-x-1/2 -translate-y-1/2"
=======
           class="absolute top-1/2 left-1/2 w-[80%] sm:w-[100%] md:w-[110%] lg:w-[120%] max-w-[500px] transform -translate-x-1/2 -translate-y-1/2 object-contain z-0"
          style="filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));"
>>>>>>> Stashed changes
        >
        <img 
          :src="mainImg" 
          :alt="mainAlt" 
<<<<<<< Updated upstream
          class="absolute top-[65%] left-[50%] w-[180px] sm:w-[220px] md:w-[300px] lg:w-[350px] transform -translate-x-[50%] -translate-y-[27%]"
=======
          class="relative z-10 w-[60%] sm:w-[80%] md:w-[90%] lg:w-[100%] max-w-[350px] md:max-w-[480px] lg:max-w-[550px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
          :style="{ maxWidth: mainMaxWidth }"
>>>>>>> Stashed changes
        >
      </div>

      <!-- Teks Hero -->
      <div class="lg:w-1/2 text-center lg:text-left">
        <h1 :class="titleClass">{{ title }}</h1>
        <p :class="subtitleClass">{{ subtitle }}</p>
<<<<<<< Updated upstream
        <a :href="buttonLink" :class="buttonClass">{{ buttonText }}</a>
=======
        <div class="pt-2 md:pt-6">
          <a
            :href="buttonLink"
            :class="['bg-[#EBCD5E] hover:bg-[#e0c355] text-white font-bold text-lg px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(235,205,94,1)] transition-all hover:-translate-y-1 active:scale-95 inline-block', buttonClass]"
          >
            {{ buttonText }}
          </a>  
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  // Teks
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonLink: { type: String, default: '' },

  // Gambar
  ellipseImg: { type: String, default: '../assets/img/Ellipse.png' },
  ellipseAlt: { type: String, default: 'ellipse' },
  mainImg: { type: String, default: '../assets/img/donasi.png' },
  mainAlt: { type: String, default: 'donasi love' },

  // Styling opsional
  titleClass: { type: String, default: 'text-4xl lg:text-5xl font-extrabold text-green-700 mb-4 leading-tight' },
  subtitleClass: { type: String, default: 'mb-6 text-gray-700 leading-relaxed' },
  buttonClass: { type: String, default: 'inline-block bg-[#E8C32A] hover:bg-amber-500 text-white py-3 px-8 rounded-full font-semibold transition duration-200' }
});
</script>
