<template>
  <section class="py-20 lg:py-32">
    <div class="flex flex-col-reverse gap-5 items-center justify-between lg:flex-row lg:gap-12 mt-20">

      <!-- Gambar Hero -->
      <div class="lg:w-1/2 relative flex justify-center items-center">
        <img 
          :src="ellipseImg" 
          :alt="ellipseAlt" 
          class="absolute top-[65%] left-[50%] w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] transform -translate-x-1/2 -translate-y-1/2"
        >
        <img 
          :src="mainImg" 
          :alt="mainAlt" 
          class="absolute top-[65%] left-[50%] w-[180px] sm:w-[220px] md:w-[300px] lg:w-[350px] transform -translate-x-[50%] -translate-y-[27%]"
        >
      </div>

      <!-- Teks Hero -->
      <div class="lg:w-1/2 text-center lg:text-left">
        <h1 :class="titleClass">{{ title }}</h1>
        <p :class="subtitleClass">{{ subtitle }}</p>
        <a :href="buttonLink" :class="buttonClass">{{ buttonText }}</a>
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
  ellipseImg: { type: String, default: '/public/img/Ellipse.png' },
  ellipseAlt: { type: String, default: 'ellipse' },
  mainImg: { type: String, default: '/public/img/donasi.png' },
  mainAlt: { type: String, default: 'donasi love' },

  // Styling opsional
  titleClass: { type: String, default: 'text-4xl lg:text-5xl font-extrabold text-green-700 mb-4 leading-tight' },
  subtitleClass: { type: String, default: 'mb-6 text-gray-700 leading-relaxed' },
  buttonClass: { type: String, default: 'inline-block bg-[#E8C32A] hover:bg-amber-500 text-white py-3 px-8 rounded-full font-semibold transition duration-200' }
});
</script>
