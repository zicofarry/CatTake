<template>
  <section class="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-40 md:pb-48">
    <div class="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16">

      <!-- Gambar Hero -->
      <div class="lg:w-1/2 relative flex justify-center items-center">
        <img 
          :src="ellipseImg" 
          :alt="ellipseAlt" 
           class="absolute w-[120%] h-[120%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain z-10"
          style="filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));"
        >
        <img 
          :src="mainImg" 
          :alt="mainAlt" 
          class="relative z-10 max-w-[340px] md:max-w-[480px] lg:max-w-[550px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
          :style="{ maxWidth: mainMaxWidth }"
        >
      </div>

      <!-- Teks Hero -->
      <div class="lg:w-1/2 text-center lg:text-left space-y-6 lg:space-y-8 -mt-10 lg:-mt-20">
        <h1 :class="titleClass">{{ title }}</h1>
        <p :class="subtitleClass">{{ subtitle }}</p>
        <div class="pt-6">
          <a
            :href="buttonLink"
            :class="['bg-[#EBCD5E] hover:bg-[#e0c355] text-white font-bold text-lg px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(235,205,94,1)] transition-all hover:-translate-y-1 active:scale-95 inline-block', buttonClass]"
          >
            {{ buttonText }}
          </a>  
        </div>
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
  ellipseImg: { type: String, default: '/img/Ellipse.png' },
  ellipseAlt: { type: String, default: 'ellipse' },
  mainImg: { type: String, default: '' },
  mainAlt: { type: String, default: 'unknown' },
  mainMaxWidth: { type: String, default: '600px' },

  // Styling opsional
  titleClass: {
    type: String,
    default:
      'text-5xl md:text-6xl lg:text-[4rem] font-serif font-bold text-[#1F1F1F] leading-[1.1] tracking-tight',
  },
  subtitleClass: {
    type: String,
    default:
      'text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed font-medium mb-6',
  },
  buttonClass: {
    type: String,
    default:
      'bg-[#EBCD5E] hover:bg-[#e0c355] text-white font-bold text-lg px-10 py-4 rounded-full shadow-[0_10px_20px_-10px_rgba(235,205,94,1)] transition-all hover:-translate-y-1 active:scale-95',
  },
});
</script>
